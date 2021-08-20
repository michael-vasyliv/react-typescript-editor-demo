/* eslint-disable import/no-duplicates */
declare module '*.svg' {
    import * as React from 'react';

    const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;

    export default ReactComponent;
}

type ExtendProps<T extends (...args: any) => any> = T extends (first: infer P) => any ? P : never;

type Nullable<T> = T | undefined;

declare module '@ckeditor/ckeditor5-react' {
    export { CKEditor, CKEditorContext };
}

declare module 'quill-better-table' {
    export default QuillBetterTable;
}
