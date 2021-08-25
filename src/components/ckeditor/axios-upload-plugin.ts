import { Plugin } from '@ckeditor/ckeditor5-core';
import { FileRepository } from '@ckeditor/ckeditor5-upload';
import { FileLoader } from '@ckeditor/ckeditor5-upload/src/filerepository';
import { AxiosUploadAdapter } from './axios-upload-adapter';

export class AxiosUploadPlugin extends Plugin {
    static get requires() {
        return [FileRepository];
    }

    static get pluginName() {
        return 'UploadAdapterPlugin';
    }

    init() {
        this.editor.plugins.get(FileRepository).createUploadAdapter = (loader: FileLoader) => new AxiosUploadAdapter(loader);
    }
}
