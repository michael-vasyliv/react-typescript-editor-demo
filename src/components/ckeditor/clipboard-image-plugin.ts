import { ClipboardPipeline } from '@ckeditor/ckeditor5-clipboard';
import { Editor, Plugin } from '@ckeditor/ckeditor5-core';
import { DomEventData, UpcastWriter } from '@ckeditor/ckeditor5-engine';
import Element from '@ckeditor/ckeditor5-engine/src/model/element';
import { Item } from '@ckeditor/ckeditor5-engine/src/model/item';
import Writer from '@ckeditor/ckeditor5-engine/src/model/writer';
import ViewElement from '@ckeditor/ckeditor5-engine/src/view/element';
import { fetchLocalImage } from '@ckeditor/ckeditor5-image/src/imageupload/utils';
import ImageUtils from '@ckeditor/ckeditor5-image/src/imageutils';
import FileRepository, { FileLoader } from '@ckeditor/ckeditor5-upload/src/filerepository';
import EventInfo from '@ckeditor/ckeditor5-utils/src/eventinfo';

enum UploadStatus {
    Reading = 'reading',
    Uploading = 'uploading',
    Complete = 'complete'
}

interface DataTransferData extends DomEventData {
    content: ViewElement;
}

interface FetchableImage {
    item: ViewElement;
}

const { BASE_URL = null } = process.env;

function getImagesFromChangeItem(editor: Editor, item: any) {
    const imageUtils = editor.plugins.get(ImageUtils);

    return Array.from(editor.model.createRangeOn(item))
        .filter((value) => imageUtils.isImage(value.item as Element))
        .map((value) => value.item);
}

function parseAndSetSrcAttributeOnImage(data: any, image: Element, writer: Writer) {
    let maxWidth = 0;

    const srcAttribute = Object.keys(data)
        .filter((key) => {
            const width = parseInt(key, 10);

            if (!Number.isNaN(width)) {
                maxWidth = Math.max(maxWidth, width);

                return true;
            }
            return false;
        })
        .map((key) => `${data[key]} ${key}w`)
        .join(', ');

    if (srcAttribute !== '') {
        writer.setAttribute('srcset', {
            data: srcAttribute,
            width: maxWidth
        } as any, image);
    }
}

/**
 * @see https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-image/src/imageupload/imageuploadediting.js#L33
 */
export class ClipboardImagePlugin extends Plugin {
    static get requires() {
        return [FileRepository, ClipboardPipeline, ImageUtils];
    }

    static get pluginName() {
        return 'ClipboardImagePlugin';
    }

    private images = new Map<string, Item>();

    private loaders = new Map<string, FileLoader>();

    init() {
        const { editor } = this;
        const doc = editor.model.document;
        const imageUtils = editor.plugins.get(ImageUtils);
        const fileRepository = editor.plugins.get(FileRepository);

        doc.on('change', () => {
            const changes = doc.differ.getChanges({ includeChangesInGraveyard: false }).reverse();

            changes.forEach((entry) => {
                if (entry.type === 'insert' && entry.name !== '$text') {
                    const item = entry.position.nodeAfter;

                    const elements = getImagesFromChangeItem(editor, item);
                    elements.forEach((element) => {
                        const uploadId = element.getAttribute('uploadId') as string;

                        if (!uploadId) {
                            return;
                        }

                        const loader = fileRepository.loaders.get(uploadId);

                        if (!loader) {
                            return;
                        }

                        this.images.set(uploadId, element);
                        this.loaders.set(uploadId, loader);

                        if (loader.status === 'idle') {
                            // If the image was inserted into content and has not been loaded yet, start loading it.
                            this.readAndUpload(loader);
                        }
                    });
                }
            });
        });

        this.on('uploadComplete', (_evt, { imageElement, data }: any) => {
            editor.model.change((writer) => {
                writer.setAttribute('src', data.default, imageElement);
                parseAndSetSrcAttributeOnImage(data, imageElement, writer);
            });
        }, { priority: 'low' });

        /**
         * @description For every image file, a new file loader is created and a placeholder image is
         * inserted into the content. Then, those images are uploaded once they appear in the model.
         */
        this.listenTo(editor.plugins.get(ClipboardPipeline), 'inputTransformation', ((_: EventInfo, { content }: DataTransferData) => {
            const fetchableImages = Array.from<FetchableImage>(editor.editing.view.createRangeIn(content) as any)
                .filter(({ item }) => imageUtils.isInlineImageView(item))
                /** filter out internal images */
                .filter(({ item }) => !item.getAttribute('src')?.match(BASE_URL as string))
                .filter(({ item }) => !item.getAttribute('uploadProcessed'))
                .map(({ item }) => ({ promise: fetchLocalImage(item), element: item }));

            if (!fetchableImages.length) {
                return;
            }

            const writer = new UpcastWriter(editor.editing.view.document);

            fetchableImages.forEach((image) => {
                /** Set attribute marking that the image was processed already. */
                writer.setAttribute('uploadProcessed', 'true', image.element);

                const loader = fileRepository.createLoader(image.promise as any);

                if (loader) {
                    const uploadId = `${loader.id}`;
                    writer.setAttribute('src', '', image.element);
                    writer.setAttribute('uploadId', uploadId, image.element);
                }
            });
        }) as any);
    }

    private readAndUpload(loader: FileLoader) {
        const { editor } = this;
        const { model } = editor;
        const fileRepository = editor.plugins.get(FileRepository);
        const imageUploadElements = this.images;
        const uploadId: string = `${loader.id}`;
        const imageElement = imageUploadElements.get(uploadId) as Item;

        model.enqueueChange('transparent', (writer) => {
            writer.setAttribute('uploadStatus', UploadStatus.Reading, imageElement);
        });

        return loader.read()
            .then(() => {
                model.enqueueChange('transparent', (writer) => {
                    writer.setAttribute('uploadStatus', UploadStatus.Uploading, imageElement);
                });

                return loader.upload();
            })
            .then((data) => {
                model.enqueueChange('transparent', (writer) => {
                    writer.setAttribute('uploadStatus', UploadStatus.Complete, imageElement);

                    this.fire('uploadComplete', { data, imageElement });
                });
            })
            .catch(() => {
                model.enqueueChange('transparent', (writer) => {
                    writer.remove(imageElement);
                });
            })
            .finally(() => {
                model.enqueueChange('transparent', (writer) => {
                    writer.removeAttribute('uploadId', imageElement);
                    writer.removeAttribute('uploadStatus', imageElement);

                    imageUploadElements.delete(uploadId);
                });

                fileRepository.destroyLoader(loader);
            });
    }
}
