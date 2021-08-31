import { FileLoader } from '@ckeditor/ckeditor5-upload/src/filerepository';
import { AxiosUploadAdapter } from '@components/text-editor';

jest.mock('@components/text-editor/http-client', () => ({
    httpClient: {
        put: jest.fn().mockResolvedValue({ data: { url: 'https://google.com' } })
    }
}));
jest.mock('@ckeditor/ckeditor5-upload/src/filerepository');
jest.mock('@ckeditor/ckeditor5-upload');

describe('AxiosUploadAdapter', () => {
    let adapter: AxiosUploadAdapter;

    it('toBeDefined', async () => {
        const loader = {
            file: Promise.resolve({})
        } as FileLoader;

        adapter = new AxiosUploadAdapter(loader);
        expect(adapter).toBeDefined();
    });
});
