import { FileLoader, UploadAdapter } from '@ckeditor/ckeditor5-upload/src/filerepository';
import axios, { AxiosRequestConfig, CancelTokenSource } from 'axios';
import { httpClient } from './http-client';

interface UploadedFile {
    id: number;
    url: string;
}

export class AxiosUploadAdapter implements UploadAdapter {
    private loader: FileLoader;

    private cancelToken?: CancelTokenSource;

    constructor(loader: FileLoader) {
        this.loader = loader;
    }

    private onUploadProgress = (data: { total: number, loaded: number }) => {
        this.loader.uploadTotal = data.total;
        this.loader.uploaded = data.loaded;
    };

    async upload(): Promise<Record<string, string>> {
        this.cancelToken = axios.CancelToken.source();
        const config: AxiosRequestConfig = {
            cancelToken: this.cancelToken.token,
            onUploadProgress: this.onUploadProgress
        };

        return this.loader.file
            .then((file) => httpClient.put<UploadedFile>('/file', file, config))
            .then(({ data }) => ({ default: data.url }));
    }

    abort() {
        this.cancelToken?.cancel();
    }
}
