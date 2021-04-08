import React, { useEffect, useState } from 'react';
import { ReactComponent as Close } from '../../../../assets/icons/ic-close.svg';
import { AppStreamData, AggregatedNodes } from '../../types';
import { Drawer } from '../../../common';

export const AppStatusModal: React.FC<{
    streamData: AppStreamData;
    nodes: AggregatedNodes;
    appName: string;
    environmentName: string;
    status: any;
    close: (...args) => void;
    message: string;
}> = ({ streamData, nodes, status, close, message, appName, environmentName }) => {
    const [nodeStatusMap, setNodeStatusMap] = useState(new Map());
    useEffect(() => {
        const stats = streamData?.result?.application?.status?.operationState?.syncResult?.resources?.reduce(
            (agg, curr) => {
                agg.set(`${curr.kind}/${curr.name}`, curr);
                return agg;
            },
            new Map(),
        );
        setNodeStatusMap(stats);
    }, [streamData]);

    function getNodeMessage(kind, name) {
        if (nodeStatusMap && nodeStatusMap.has(`${kind}/${name}`)) {
            const { status, message } = nodeStatusMap.get(`${kind}/${name}`);
            if (status === 'SyncFailed') return 'Unable to apply changes: ' + message;
        }
        return '';
    }

    return <Drawer position="right" width="1100px" onClose={close}>
        <div className="app-details-status-modal bcn-0" onClick={(e) => e.stopPropagation()}>
            <div className="pl-20 pr-20 pt-12 pb-12 flex flex-align-center flex-justify" style={{ borderBottom: "1px solid #d0d4d9" }}>
                <div>
                    <h2 className="fs-16 lh-1-5 fw-6 m-0">App status detail: {appName} / {environmentName}</h2>
                    <p className={`m-0 text-uppercase app-summary__status-name fs-12 fw-6 f-${status.toLowerCase()}`}>{status.toUpperCase()}</p>
                    {message && <div className="fs-12 fw-5 lh-1-5">{message}</div>}
                </div>
                <button type="button" className="transparent flex icon-dim-24" onClick={close}>
                    <Close className="icon-dim-24" />
                </button>
            </div>

            {status.toLowerCase() !== 'missing' && (
                <table className="mt-7" style={{ borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            <th style={{ width: "36%", borderBottom: "1px solid #edf1f5" }} className="cn-7 pt-20 pb-8 pl-20 pr-20">NAME</th>
                            <th style={{ width: "180px", borderBottom: "1px solid #edf1f5" }} className="cn-7 pt-20 pb-8 pl-20 pr-20">STATUS</th>
                            <th style={{ borderBottom: "1px solid #edf1f5" }} className="cn-7 pt-20 pb-8 pl-20 pr-20">MESSAGE</th>
                        </tr>
                    </thead>
                    <tbody>
                        {nodes &&
                            Object.keys(nodes.nodes)
                                .filter((kind) => kind.toLowerCase() !== 'rollout')
                                .map((kind) =>
                                    Array.from(nodes.nodes[kind] as Map<string, any>).map(([nodeName, nodeDetails]) => (
                                        <tr key={`${nodeDetails.kind}/${nodeDetails.name}`}>
                                            <td valign="top" className="pt-12 pb-12 pl-20 pr-20">
                                                <div className="kind-name">
                                                    <span className="fw-6 cn-9"> {nodeDetails.kind}/</span>
                                                    <span className="ellipsis-left">{nodeDetails.name}</span>
                                                </div>
                                            </td>
                                            <td valign="top"
                                                className={`pt-12 pb-12 pl-20 pr-20 capitalize app-summary__status-name f-${nodeDetails.health && nodeDetails.health.status
                                                    ? nodeDetails.health.status.toLowerCase()
                                                    : ''
                                                    }`}>
                                                {nodeDetails.status
                                                    ? nodeDetails.status
                                                    : nodeDetails.health
                                                        ? nodeDetails.health.status
                                                        : ''}
                                            </td>
                                            <td valign="top" className="pt-12 pb-12 pl-20 pr-20">
                                                <div style={{
                                                    display: 'grid',
                                                    gridAutoColumns: '1fr',
                                                    gridRowGap: '8px',
                                                }}>
                                                    {getNodeMessage(kind, nodeDetails.name) && (
                                                        <div>{getNodeMessage(kind, nodeDetails.name)}</div>
                                                    )}
                                                    {nodeDetails.health && nodeDetails.health.message && (
                                                        <div>{nodeDetails.health.message}</div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                    </tbody>
                </table>
            )}
        </div>
    </Drawer>
};