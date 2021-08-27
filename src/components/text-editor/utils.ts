import { Model } from '@ckeditor/ckeditor5-engine';
import Element from '@ckeditor/ckeditor5-engine/src/model/element';
import { Item } from '@ckeditor/ckeditor5-engine/src/model/item';
import Writer from '@ckeditor/ckeditor5-engine/src/model/writer';
import ImageUtils from '@ckeditor/ckeditor5-image/src/imageutils';

export function getImagesFromChangeItem(imageUtils: ImageUtils, model: Model, item: Item) {
    return Array.from(model.createRangeOn(item))
        .filter((value) => imageUtils.isImage(value.item as Element))
        .map((value) => value.item);
}

export function parseAndSetSrcAttributeOnImage(data: any, image: Item, writer: Writer) {
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
