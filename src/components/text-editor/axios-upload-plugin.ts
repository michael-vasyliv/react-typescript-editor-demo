import { Plugin } from '@ckeditor/ckeditor5-core';
import FileRepository, { FileLoader } from '@ckeditor/ckeditor5-upload/src/filerepository';
import { AxiosUploadAdapter } from './axios-upload-adapter';

export class AxiosUploadPlugin extends Plugin {
    static get requires() {
        return [FileRepository];
    }

    static get pluginName() {
        return 'AxiosUploadPlugin';
    }

    init() {
        const fileRepository = this.editor.plugins.get(FileRepository);

        fileRepository.createUploadAdapter = (loader: FileLoader) => new AxiosUploadAdapter(
            loader
        );
    }
}
