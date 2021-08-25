import { ClipboardPipeline } from '@ckeditor/ckeditor5-clipboard';
import { Plugin } from '@ckeditor/ckeditor5-core';
import { DomEventData, UpcastWriter } from '@ckeditor/ckeditor5-engine';
import ViewElement from '@ckeditor/ckeditor5-engine/src/view/element';
import { fetchLocalImage } from '@ckeditor/ckeditor5-image/src/imageupload/utils';
import ImageUtils from '@ckeditor/ckeditor5-image/src/imageutils';
import { FileRepository } from '@ckeditor/ckeditor5-upload';
import { httpClient } from './http-client';

interface DataTransferData extends DomEventData {
    dataTransfer?: DataTransfer;
    content?: unknown;
}
interface DataTransfer {
    getData: (type: string) => string;
    setData: (value: string) => void;
}

const { BASE_URL = 'http://qwe.com' } = process.env;
const IMAGE_REGEXP = /<img([^>]+)src=['"]((http|https).+?)['"]([\s\S]*?)>/gi;

function getImageMimeType(blob: Blob, src: string) {
    if (blob.type) {
        return blob.type;
    } if (src.match(/data:(image\/\w+);base64/)) {
        return src.match(/data:(image\/\w+);base64/)?.[1].toLowerCase() ?? '';
    }
    // Fallback to 'jpeg' as common extension.
    return 'image/jpeg';
}

export function fileToBase64(file: File) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.addEventListener('load', () => {
            resolve(reader.result);
        });

        reader.addEventListener('error', (err) => {
            reject(err);
        });

        reader.addEventListener('abort', () => {
            reject();
        });

        reader.readAsDataURL(file);
    });
}

export async function urlToFile(url: string) {
    const response = await httpClient.get(url);
    const { data } = response;

    const mimeType = getImageMimeType(data, url);
    const ext = mimeType.replace('image/', '');
    const filename = `image.${ext}`;
    return new File([data], filename, { type: mimeType });
}

export async function urlToBase64(url: string) {
    return urlToFile(url).then(fileToBase64);
}

export class ClipboardImagePlugin extends Plugin {
    static get requires() {
        return [ClipboardPipeline, ImageUtils, FileRepository];
    }

    static get pluginName() {
        return 'ClipboardImagePlugin';
    }

    init() {
        const { editor } = this;
        const imageUtils = editor.plugins.get(ImageUtils);
        const fileRepository = editor.plugins.get(FileRepository);

        /**
         * For every image file, a new file loader is created and a placeholder image is
         * inserted into the content. Then, those images are uploaded once they appear in the model.
         */
        this.listenTo(editor.plugins.get(ClipboardPipeline), 'inputTransformation', (_evt, data: any) => {
            const fetchableImages = Array.from<{ item: ViewElement }>(editor.editing.view.createRangeIn(data.content) as any)
                .filter(({ item }) => imageUtils.isInlineImageView(item))
                /** filter out internal images */
                .filter(({ item }) => !item.getAttribute('src')?.match(BASE_URL))
                .filter(({ item }) => !item.getAttribute('uploadProcessed'))
                .map(({ item }) => ({ promise: fetchLocalImage(item), imageElement: item }));

            if (!fetchableImages.length) {
                return;
            }

            const writer = new UpcastWriter(editor.editing.view.document);

            fetchableImages.forEach((fetchableImage) => {
                /** Set attribute marking that the image was processed already. */
                writer.setAttribute('uploadProcessed', 'true', fetchableImage.imageElement);

                const loader = fileRepository.createLoader(fetchableImage.promise as any);

                if (loader) {
                    writer.setAttribute('src', '', fetchableImage.imageElement);
                    writer.setAttribute('uploadId', `${loader.id}`, fetchableImage.imageElement);
                }
            });
        });

        // this.listenTo(editor.editing.view.document, 'paste', ((evt, data: DataTransferData) => {
        //     const { dataTransfer } = data;
        //     const content: string = dataTransfer?.getData('text/html') ?? '';
        //     const images = content.match(IMAGE_REGEXP) ?? [];
        //     const externalImages = images.filter((image) => !image.match(BASE_URL));
        //     let result = content;

        //     setTimeout(() => {

        //         // editor.execute('uploadImage', { file: images });
        //     }, 400);

        //     Promise.all(externalImages.map((image, index) => new Promise((resolve) => {
        //         /**
        //          * @todo remove
        //          * @summary magic happens here
        //          * @description we take image url from external resource and load and image here,
        //          * then we send this image to SS to save external image and
        //          * then we replace external image url with internal image url.
        //          * */
        //         setTimeout(() => {
        //             const url = image.replace(IMAGE_REGEXP, '$2');
        //             const internalUrl = 'https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png';
        //             result = result.replace(url, internalUrl);

        //             resolve(result);
        //         }, index * 1000);
        //     })))
        //         .then(() => {
        //             console.log('DONE');
        //             // editor.data.set(result);
        //         })
        //         .catch(() => evt.stop());
        // }));
    }
}
