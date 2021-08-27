import { ClipboardPipeline } from '@ckeditor/ckeditor5-clipboard';
import { Plugin } from '@ckeditor/ckeditor5-core';
import { DomEventData, UpcastWriter } from '@ckeditor/ckeditor5-engine';
import { Item } from '@ckeditor/ckeditor5-engine/src/model/item';
import ViewElement from '@ckeditor/ckeditor5-engine/src/view/element';
import { fetchLocalImage } from '@ckeditor/ckeditor5-image/src/imageupload/utils';
import ImageUtils from '@ckeditor/ckeditor5-image/src/imageutils';
import FileRepository, { FileLoader } from '@ckeditor/ckeditor5-upload/src/filerepository';
import EventInfo from '@ckeditor/ckeditor5-utils/src/eventinfo';
import { UploadStatus } from './upload-status';
import { getImagesFromChangeItem, parseAndSetSrcAttributeOnImage } from './utils';

const { BASE_URL = null } = process.env;

interface UploadCompleted {
    image: Item;
    data: Record<string, string>;
}

interface DataTransferData extends DomEventData {
    content: ViewElement;
}

interface FetchableImage {
    item: ViewElement;
}

/**
 * @description it's simplified version of {@link ImageUploadEditing} with some business logic (upload all images except internal)
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

    init() {
        const { model, plugins, editing } = this.editor;
        const doc = model.document;
        const imageUtils = plugins.get(ImageUtils);
        const fileRepository = plugins.get(FileRepository);

        this.on('uploadComplete', ((_: EventInfo, { image, data }: UploadCompleted) => {
            model.change((writer) => {
                writer.setAttribute('src', data.default, image);
                parseAndSetSrcAttributeOnImage(data, image, writer);
            });
        }) as any, { priority: 'low' });

        doc.on('change', () => {
            const changes = doc.differ.getChanges().reverse();

            changes.forEach((entry) => {
                if (entry.type === 'insert' && entry.name !== '$text') {
                    const item = entry.position.nodeAfter;

                    getImagesFromChangeItem(imageUtils, model, item as Item).forEach((element) => {
                        const uploadId = element.getAttribute('uploadId') as string;

                        if (!uploadId) {
                            return;
                        }

                        const loader = fileRepository.loaders.get(uploadId);

                        if (!loader) {
                            return;
                        }

                        this.images.set(uploadId, element);

                        if (loader.status === 'idle') {
                            /** If the image was inserted into content and has not been loaded yet, start loading it. */
                            this.readAndUpload(loader);
                        }
                    });
                }
            });
        });

        /**
         * @description For every image file, a new file loader is created and a placeholder image is
         * inserted into the content. Then, those images are uploaded once they appear in the model.
         */
        this.listenTo(
            plugins.get(ClipboardPipeline),
            'inputTransformation',
            ((_: EventInfo, { content }: DataTransferData) => {
                const fetchableImages = Array.from<FetchableImage>(editing.view.createRangeIn(content) as any)
                    .filter(({ item }) => imageUtils.isInlineImageView(item))
                    /** filter out internal images */
                    .filter(({ item }) => !item.getAttribute('src')?.match(BASE_URL as string))
                    .filter(({ item }) => !item.getAttribute('uploadProcessed'))
                    .map(({ item }) => ({ promise: fetchLocalImage(item), image: item }));

                if (!fetchableImages.length) {
                    return;
                }

                const writer = new UpcastWriter(editing.view.document);

                fetchableImages.forEach((fetchableImage) => {
                    /** Set attribute marking that the image was processed already. */
                    writer.setAttribute('uploadProcessed', 'true', fetchableImage.image);

                    const loader = fileRepository.createLoader(fetchableImage.promise as any);

                    if (loader) {
                        writer.setAttribute('src', '', fetchableImage.image);
                        writer.setAttribute('uploadId', `${loader.id}`, fetchableImage.image);
                    }
                });
            }) as any);
    }

    private async readAndUpload(loader: FileLoader) {
        const { model, plugins } = this.editor;
        const fileRepository = plugins.get(FileRepository);
        const uploadId = `${loader.id}`;
        const image = this.images.get(uploadId) as Item;

        model.enqueueChange('transparent', (writer) => {
            writer.setAttribute('uploadStatus', UploadStatus.Reading, image);
        });

        try {
            await loader.read();

            model.enqueueChange('transparent', (writer) => {
                writer.setAttribute('uploadStatus', UploadStatus.Uploading, image);
            });

            const data = await loader.upload();

            model.enqueueChange('transparent', (writer) => {
                writer.setAttribute('uploadStatus', UploadStatus.Complete, image);

                this.fire<UploadCompleted>('uploadComplete', { data, image });
            });
        } catch (error) {
            model.enqueueChange('transparent', (writer) => {
                writer.remove(image);
            });
        } finally {
            model.enqueueChange('transparent', (writer) => {
                writer.removeAttribute('uploadId', image);
                writer.removeAttribute('uploadStatus', image);

                this.images.delete(uploadId);
            });

            fileRepository.destroyLoader(loader);
        }
    }
}
