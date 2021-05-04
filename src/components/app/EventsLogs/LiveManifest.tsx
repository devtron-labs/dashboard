import React from 'react';
import YamljsParser from 'yaml';
import MonacoEditor from 'react-monaco-editor';
import { editor } from 'monaco-editor';

interface LiveManifestProps {
    manifest: string;
    isManifestEditMode: boolean;
    handleManifestChange: (value: string) => void;
    height: number;
    width: number;
}

export const LiveManifest: React.FC<LiveManifestProps> = ({ manifest, isManifestEditMode, handleManifestChange, height, width }) => {

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
                readOnly: !isManifestEditMode,
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
            onChange={(value) => { handleManifestChange(value) }}
            editorDidMount={() => { }}
            height={height - 75}
            width={width}
        />
    </div>
}