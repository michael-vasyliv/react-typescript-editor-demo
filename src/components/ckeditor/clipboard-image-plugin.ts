import { ClipboardPipeline } from '@ckeditor/ckeditor5-clipboard';
import { Plugin } from '@ckeditor/ckeditor5-core';
import { DomEventData, UpcastWriter } from '@ckeditor/ckeditor5-engine';
import ViewElement from '@ckeditor/ckeditor5-engine/src/view/element';
import { fetchLocalImage } from '@ckeditor/ckeditor5-image/src/imageupload/utils';
import ImageUtils from '@ckeditor/ckeditor5-image/src/imageutils';
import FileRepository from '@ckeditor/ckeditor5-upload/src/filerepository';
import EventInfo from '@ckeditor/ckeditor5-utils/src/eventinfo';

interface DataTransferData extends DomEventData {
    content: ViewElement;
}

interface FetchableImage {
    item: ViewElement;
}

const { BASE_URL = null } = process.env;

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
         * @example https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-image/src/imageupload/imageuploadediting.js#L142
         * @description For every image file, a new file loader is created and a placeholder image is
         * inserted into the content. Then, those images are uploaded once they appear in the model.
         */
        this.listenTo(
            editor.plugins.get(ClipboardPipeline),
            'inputTransformation',
            ((_: EventInfo, { content }: DataTransferData) => {
                const fetchableImages = Array.from<FetchableImage>(editor.editing.view.createRangeIn(content) as any)
                    .filter(({ item }) => imageUtils.isInlineImageView(item))
                    /** filter out internal images */
                    .filter(({ item }) => !item.getAttribute('src')?.match(BASE_URL as string))
                    .filter(({ item }) => !item.getAttribute('uploadProcessed'))
                    .map(({ item }) => ({ promise: fetchLocalImage(item), item }));

                if (!fetchableImages.length) {
                    return;
                }

                const writer = new UpcastWriter(editor.editing.view.document);

                fetchableImages.forEach((image) => {
                    /** Set attribute marking that the image was processed already. */
                    writer.setAttribute('uploadProcessed', 'true', image.item);

                    const loader = fileRepository.createLoader(image.promise as any);

                    if (loader) {
                        writer.setAttribute('src', '', image.item);
                        writer.setAttribute('uploadId', `${loader.id}`, image.item);
                    }
                });
            }) as any);
    }
}
