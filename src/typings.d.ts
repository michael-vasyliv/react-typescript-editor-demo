/* eslint-disable import/no-duplicates */
declare module '*.svg' {
    import * as React from 'react';

    const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;

    export default ReactComponent;
}

type ExtendProps<T extends (...args: any) => any> = T extends (first: infer P) => any ? P : never;

type Nullable<T> = T | undefined;

declare module '@ckeditor/ckeditor5-react' {
    import { EditorConfig } from '@ckeditor/ckeditor5-core/src/editor/editorconfig';
    import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
    import Event from '@ckeditor/ckeditor5-utils/src/eventinfo';
    import * as React from 'react';

    const CKEditor: React.FunctionComponent<{
        disabled?: boolean;
        editor: typeof ClassicEditor;
        data?: string;
        id?: string;
        config?: EditorConfig;
        onReady?: (editor: ClassicEditor) => void;
        onChange?: (event: Event, editor: ClassicEditor) => void;
        onBlur?: (event: Event, editor: ClassicEditor) => void;
        onFocus?: (event: Event, editor: ClassicEditor) => void;
        onError?: (event: Event, editor: ClassicEditor) => void;
    }>;
    export { CKEditor };
}
