import React from 'react';
import YamljsParser from 'yaml';
import MonacoEditor from 'react-monaco-editor';
import { editor } from 'monaco-editor';

interface DesiredManifestProps {
    manifest: string;
    height: number;
    width: number;
}

export const DesiredManifest: React.FC<DesiredManifestProps> = ({ manifest, height, width }) => {

    editor.defineTheme('vs-dark--dt', {
        base: 'vs-dark',
        inherit: true,
        rules: [
            //@ts-ignore
            { background: '#0B0F22' }
        ],
        colors: {
            'editor.background': '#0B0F22',
        }
    });

    return <div>
        <MonacoEditor language={'yaml'}
            value={manifest}
            theme={'vs-dark--dt'}
            options={{
                selectOnLineNumbers: true,
                roundedSelection: false,
                readOnly: true,
                automaticLayout: false,
                scrollBeyondLastLine: false,
                minimap: {
                    enabled: false
                },
                scrollbar: {
                    alwaysConsumeMouseWheel: false,
                    vertical: 'auto'
                }
            }}
            onChange={() => { }}
            editorDidMount={() => { }}
            height={height - 75}
            width={width}
        />
    </div>
}