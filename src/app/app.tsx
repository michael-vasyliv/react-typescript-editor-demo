import { CkEditor } from '@components/ckeditor';
import { QuillEditor } from '@components/quill';
import React from 'react';
import './app.css';

export function App() {
    return (
        <main className="main">
            <CkEditor />
            <QuillEditor />
        </main>
    );
}
