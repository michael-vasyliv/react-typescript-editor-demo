import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import React from 'react';
import { CKEDITOR_CONFIG } from './config';

export function CkEditor() {
    return (
        <div>
            <CKEditor
                editor={ClassicEditor}
                config={CKEDITOR_CONFIG}
                data="<p>Hello from the first editor working with the context!</p>"
            />
        </div>
    );
}
