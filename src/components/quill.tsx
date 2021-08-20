import Quill from 'quill';
import QuillBetterTable from 'quill-better-table';
import React, { useEffect } from 'react';
import 'react-quill/dist/quill.snow.css';

Quill.register({
    'modules/better-table': QuillBetterTable
}, true);

export function QuillEditor() {
    useEffect(() => {
        const quill = new Quill('#editor', {
            theme: 'snow',
            modules: {
                table: false,
                'better-table': {
                    operationMenu: {
                        items: {
                            unmergeCells: {
                                text: 'Another unmerge cells name'
                            }
                        },
                        color: {
                            colors: ['green', 'red', 'yellow', 'blue', 'white'],
                            text: 'Background Colors:'
                        }
                    }
                },
                keyboard: {
                    bindings: QuillBetterTable.keyboardBindings
                }
            }
        });

        return () => quill.disable();
    }, []);

    return (
        <div>
            <div id="editor" style={{ height: '20rem' }} />
        </div>
    );
}
