import React, { useEffect, useState, useRef } from 'react';
import { ReactComponent as Close } from '../../../../assets/icons/ic-close.svg';
import { ReactComponent as Error } from '../../../../assets/icons/ic-error-exclamation.svg';
import { AppStreamData, AggregatedNodes } from '../../types';
import { Drawer } from '../../../common';

export const AppStatusModal: React.FC<{
    streamData: AppStreamData;
    nodes: AggregatedNodes;
    appName: string;
    environmentName: string;
    status: any;
    message: string;
    close: (...args) => void;
}> = ({ streamData, nodes, status, close, message, appName, environmentName }) => {

    const [nodeStatusMap, setNodeStatusMap] = useState(new Map());
    const [rows, setRows] = useState([]);

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

    useEffect(() => {
        let allRows = [];
        let arr = Object.values(nodes.nodes).map(nodeMap => { return [...(nodeMap as Map<any, any>).values()] });
        allRows = arr.reduce((acc, array) => {
            acc = acc.concat(array)
            return acc;
        }, [])
        allRows = allRows.filter(node => node.kind.toLowerCase() !== "rollout");
        let knownStatus = ["degraded", "failed", "error", "progressing", "running", "healthy"];
        let failed = allRows.filter(node => node?.status?.toLowerCase() === "failed" || node?.health?.status?.toLowerCase() === "failed"
            || node?.status?.toLowerCase() === "error" || node?.health?.status?.toLowerCase() === "error"
            || node?.status?.toLowerCase() === "degraded" || node?.health?.status?.toLowerCase() === "degraded");
        let progressing = allRows.filter(node => node?.status?.toLowerCase() === "progressing" || node?.health?.status?.toLowerCase() === "progressing");
        let running = allRows.filter(node => node?.status?.toLowerCase() === "running" || node?.health?.status?.toLowerCase() === "running");
        let healthy = allRows.filter(node => node?.status?.toLowerCase() === "healthy" || node?.health?.status?.toLowerCase() === "healthy");
        let unknown = allRows.filter(node => !knownStatus.includes(node?.status?.toLowerCase() || node?.health?.status?.toLowerCase()));
        let sortedRows = failed.concat(progressing, running, healthy, unknown);
        setRows(sortedRows);
    }, [appName]);

    function getNodeMessage(kind, name) {
        if (nodeStatusMap && nodeStatusMap.has(`${kind}/${name}`)) {
            const { status, message } = nodeStatusMap.get(`${kind}/${name}`);
            if (status === 'SyncFailed') return 'Unable to apply changes: ' + message;
        }
        return '';
    }

    return <Drawer position="right" width="1100px" onClose={close}>
        <div className="app-details-status-modal bcn-0" onClick={(e) => e.stopPropagation()}>
            <div className="" style={{ borderBottom: "1px solid #d0d4d9" }}>
                <div className="flex flex-align-center flex-justify" >
                    <div className="">
                        <h2 className="mt-12 mb-0 pl-20 pr-20 fs-16 lh-1-5 fw-6">App status detail: {appName} / {environmentName}</h2>
                        <p className={`m-0 pl-20 pr-20 text-uppercase app-summary__status-name mb-4 fs-12 fw-6 f-${status.toLowerCase()}`}>{status.toUpperCase()}</p>
                        {message && status?.toLowerCase() !== "degraded" && <div className="mb-12 pl-20 pr-20 fs-12 fw-5 lh-1-5">{message}</div>}
                    </div>
                    <button type="button" className="transparent flex icon-dim-24 mr-20" onClick={close}>
                        <Close className="icon-dim-24" />
                    </button>
                </div>
                {message && status?.toLowerCase() === "degraded" && <div className="bcr-1 pl-20 pr-20 pt-12 pb-12 mt-12">
                    <div className={`cn-9 app-status__error-msg`}>
                        <Error className="icon-dim-20" />
                        <p className={`m-0 fs-13 fw-5 lh-1-54`}>
                            <span className="fw-6">Error</span>: {message}
                        </p>
                    </div>
                </div>}
            </div>
            {status.toLowerCase() !== 'missing' && (
                <table className="mt-7 w-100" style={{ borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            <th style={{ width: "36%", borderBottom: "1px solid #edf1f5" }} className="cn-7 pt-20 pb-8 pl-20 pr-20">NAME</th>
                            <th style={{ width: "180px", borderBottom: "1px solid #edf1f5" }} className="cn-7 pt-20 pb-8 pl-20 pr-20">STATUS</th>
                            <th style={{ borderBottom: "1px solid #edf1f5" }} className="cn-7 pt-20 pb-8 pl-20 pr-20">MESSAGE</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((node) => {
                            return <tr key={`${node.kind}/${node.name}`}>
                                <td valign="top" className="pt-12 pb-12 pl-20 pr-20">
                                    <div className="kind-name">
                                        <span className="fw-6 cn-9"> {node.kind}/</span>
                                        <span className="ellipsis-left">{node.name}</span>
                                    </div>
                                </td>
                                <td valign="top"
                                    className={`pt-12 pb-12 pl-20 pr-20 capitalize app-summary__status-name f-${node.health && node.health.status
                                        ? node.health.status.toLowerCase() : ''}`}>
                                    {node.status ? node.status : node.health ? node.health.status : ''}
                                </td>
                                <td valign="top" className="pt-12 pb-12 pl-20 pr-20">
                                    <div style={{
                                        display: 'grid',
                                        gridAutoColumns: '1fr',
                                        gridRowGap: '8px',
                                    }}>
                                        {getNodeMessage(node.kind, node.name) && (
                                            <div>{getNodeMessage(node.kind, node.name)}</div>
                                        )}
                                        {node.health && node.health.message && (
                                            <div>{node.health.message}</div>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        })}
                    </tbody>
                </table>
            )}
        </div>
    </Drawer>
};