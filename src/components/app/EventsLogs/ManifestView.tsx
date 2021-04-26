import React, { useState, useEffect } from 'react';
import MonacoEditor from 'react-monaco-editor';
import { editor } from 'monaco-editor';
import { AutoSizer } from 'react-virtualized';
import { getNodeStatus } from '../service';
import { Progressing, showError, useAsync, useSearchString } from '../../common';
import { AggregatedNodes } from '../types';
import YamljsParser from 'yaml';
import { NoEvents } from './eventsLogs.util';

export const ManifestView: React.FC<{ nodeName: string; nodes: AggregatedNodes, appName: string, environmentName: string }> = ({ nodeName, nodes, appName, environmentName }) => {
    const { queryParams, searchParams } = useSearchString()
    const node = searchParams?.kind && nodes.nodes[searchParams.kind].has(nodeName) ? nodes.nodes[searchParams.kind].get(nodeName) : null
    const [loadingManifest, manifestResult, error, reload] = useAsync(() => getNodeStatus({ ...node, appName: `${appName}-${environmentName}` }), [node, searchParams?.kind], !!nodeName && !!node && !!searchParams.kind)
    const [manifest, setManifest] = useState(null)

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

    useEffect(() => {
        if (loadingManifest) return
        if (error) showError(error)
        if (manifestResult?.result?.manifest) {
            try {
                const manifest = JSON.parse(manifestResult?.result?.manifest);
                setManifest(manifest);
            }
            catch (err) {

            }
        }
    }, [loadingManifest, manifestResult, error])

    useEffect(() => {
        return () => {
            setManifest(null)
        }
    }, [nodeName])

    if (!node) {
        return null
    }

    else if (loadingManifest && !manifest) return <div className="flex w-100" style={{ gridColumn: '1 / span 2' }} data-testid="manifest-container">
        <Progressing data-testid="manifest-loader" pageLoader />;
    </div>
    else if (!manifest) return <div style={{ gridColumn: '1 / span 2' }} className="flex">
        <NoEvents title="Manifest not available" />
    </div>

    return <AutoSizer>
        {({ height, width }) => <div style={{
            gridColumn: '1 / span 2',
        }}>
            <MonacoEditor language={'yaml'}
                value={YamljsParser.stringify(manifest, { indent: 2 })}
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
        </div>}
    </AutoSizer>
}