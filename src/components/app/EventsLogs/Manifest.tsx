import React, { useState, useEffect } from 'react';
import { getNodeStatus } from '../service';
import { Progressing, showError, useAsync, useSearchString } from '../../common';
import { AggregatedNodes } from '../types';
import { NoEvents } from './eventsLogs.util';
import { LiveManifest } from './LiveManifest';
import { DesiredManifest } from './DesiredManifest';
import { CompareManifest } from './CompareManifest';
import { AutoSizer } from 'react-virtualized';
import { ReactComponent as Edit } from '../../../assets/icons/ic-edit.svg';
import { updateManifest } from './eventsLogs.service';
import YamljsParser from 'yaml';
// import MonacoEditor from 'react-monaco-editor';
// import { editor } from 'monaco-editor';

export type ManifesTabType = 'live' | 'desired' | 'compare';

export enum ManifestTab {
    Live = 'live',
    Desired = 'desired',
    Compare = 'compare',
}

export interface ManifestProps {
    nodeName: string;
    appName: string;
    environmentName: string;
    nodes: AggregatedNodes;
}

export const ManifestView: React.FC<ManifestProps> = ({ nodeName, nodes, appName, environmentName }) => {
    const { queryParams, searchParams } = useSearchString()
    const node = searchParams?.kind && nodes.nodes[searchParams.kind].has(nodeName) ? nodes.nodes[searchParams.kind].get(nodeName) : null
    const [loadingManifest, manifestResult, error, reload] = useAsync(() => getNodeStatus({ ...node, appName: `${appName}-${environmentName}` }), [node, searchParams?.kind], !!nodeName && !!node && !!searchParams.kind)
    const [manifest, setManifest] = useState(null)
    const [manifestTab, setManifestTab] = useState<ManifesTabType>(ManifestTab.Live);
    const [isManifestEditMode, setManifestEditMode] = useState(false);

    useEffect(() => {
        if (loadingManifest) return
        if (error) showError(error)
        if (manifestResult?.result?.manifest) {
            try {
                const manifest = JSON.parse(manifestResult?.result?.manifest);
                const manifestYaml = YamljsParser.stringify(manifest, { indent: 2 })
                setManifest(manifestYaml);
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

    async function applyManifestChanges(event) {
        setManifestEditMode(false);
        try {
            await updateManifest(nodeName, '', manifest);

        } catch (error) {

        }
    }

    function handleManifestChange(value: string): void {
        setManifest(value);
        if(isManifestEditMode) {
        }
    }

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
            gridColumn: '1 / span 2'
        }}>
            <div className="flex cn-5 tab-container pt-6 pb-6 pl-20 pr-20" style={{ width: 'max-content' }}>
                <span className={manifestTab === ManifestTab.Live ? "tab transparent active" : "tab transparent"}
                    onClick={(event) => setManifestTab(ManifestTab.Live)}>Live
                </span>
                <span className={manifestTab === ManifestTab.Compare ? "tab transparent active" : "tab transparent"}
                    onClick={(event) => setManifestTab(ManifestTab.Compare)}>Compare
                </span>
                <span className={manifestTab === ManifestTab.Desired ? "tab transparent active" : "tab transparent"}
                    onClick={(event) => setManifestTab(ManifestTab.Desired)}>Desired
                </span>

                {!isManifestEditMode ? <div className={"pl-4 pr-4 fs-12 fw-6 flex bcb-5 cn-0 br-4 cursor"}
                    onClick={(event) => setManifestEditMode(!isManifestEditMode)}>
                    <Edit className={"icon-dim-16 mr-4 scn-0"} />
                    Edit Manifest
                </div> : <div className={"pl-4 pr-4 fs-12 fw-6 flex bcb-5 cn-0 br-4 cursor"}
                    onClick={applyManifestChanges}>
                    <Edit className={"icon-dim-16 mr-4 scn-0"} />
                    Apply Changes
                </div>}
            </div>
            {manifestTab === ManifestTab.Live ? <LiveManifest manifest={manifest} isManifestEditMode={isManifestEditMode} handleManifestChange={handleManifestChange} height={height} width={width} /> : null}
            {manifestTab === ManifestTab.Compare ? <CompareManifest manifest={manifest} height={height} width={width} /> : null}
            {manifestTab === ManifestTab.Desired ? <DesiredManifest manifest={manifest} height={height} width={width} /> : null}
        </div>}
    </AutoSizer>
}