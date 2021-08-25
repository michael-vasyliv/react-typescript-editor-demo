/* eslint-disable import/no-extraneous-dependencies */
import Autoformat from '@ckeditor/ckeditor5-autoformat/src/autoformat';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
// import EasyImage from '@ckeditor/ckeditor5-easy-image/src/easyimage';
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageInsert from '@ckeditor/ckeditor5-image/src/imageinsert';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import Indent from '@ckeditor/ckeditor5-indent/src/indent';
import Link from '@ckeditor/ckeditor5-link/src/link';
import List from '@ckeditor/ckeditor5-list/src/list';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import Table from '@ckeditor/ckeditor5-table/src/table';
import TableCellProperties from '@ckeditor/ckeditor5-table/src/tablecellproperties';
import TableProperties from '@ckeditor/ckeditor5-table/src/tableproperties';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';
import TextTransformation from '@ckeditor/ckeditor5-typing/src/texttransformation';
import { FileRepository } from '@ckeditor/ckeditor5-upload';
import React from 'react';
import { AxiosUploadPlugin } from './axios-upload-plugin';
import { ClipboardImagePlugin } from './clipboard-image-plugin';

export function CkEditor() {
    return (
        <div>
            <CKEditor
                editor={ClassicEditor}
                config={{
                    onerror: console.log,
                    plugins: [
                        FileRepository,
                        AxiosUploadPlugin,
                        ClipboardImagePlugin,

                        Image,
                        ImageInsert,
                        // EasyImage,
                        ImageStyle,
                        ImageToolbar,

                        Essentials,
                        Autoformat,
                        Bold,
                        Italic,
                        BlockQuote,
                        Heading,

                        Indent,
                        Link,
                        List,
                        Paragraph,

                        PasteFromOffice,
                        Table,
                        TableToolbar,
                        TextTransformation,
                        TableProperties,
                        TableCellProperties
                    ],
                    toolbar: {
                        items: [
                            'heading',
                            '|',
                            'bold',
                            'italic',
                            'link',
                            'bulletedList',
                            'numberedList',
                            '|',
                            'outdent',
                            'indent',
                            '|',
                            'insertImage',
                            'blockQuote',
                            'insertTable',
                            'undo',
                            'redo'
                        ]
                    },
                    image: {
                        toolbar: [
                            'imageStyle:inline',
                            'imageStyle:block',
                            'imageStyle:side',
                            '|',
                            'toggleImageCaption',
                            'imageTextAlternative'
                        ]
                    },
                    table: {
                        contentToolbar: [
                            'tableColumn',
                            'tableRow',
                            'mergeTableCells'
                        ]
                    },
                    // This value must be kept in sync with the language defined in webpack.config.js.
                    language: 'en'
                }}
                data="<p>Hello from the first editor working with the context!</p>"
            />
        </div>
    );
}
