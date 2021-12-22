import React, { useMemo } from 'react'
import { Drawer, VisibleModal } from '../../../../common'
import TableUtil from '../../../utils/tableUtils/Table.util'
import { ReactComponent as Close } from '../../../assets/icons/ic-close.svg';
import IndexStore from '../../index.store';
import { AggregatedNodes } from '../../../../app/types';
import { aggregateNodes } from '../../../../app/details/appDetails/utils';

// function getNodeMessage(kind, name) {
//     if (nodeStatusMap && nodeStatusMap.has(`${kind}/${name}`)) {
//         const { status, message } = nodeStatusMap.get(`${kind}/${name}`);
//         if (status === 'SyncFailed') return 'Unable to apply changes: ' + message;
//     }
//     return '';
// }

function AppStatusDetailModal({ message, close, status }) {

    const _appDetails = IndexStore.getAppDetails();

    const nodes: AggregatedNodes = useMemo(() => {
        return aggregateNodes(_appDetails?.resourceTree?.nodes || [], _appDetails?.resourceTree?.podMetadata || []);
    }, [_appDetails]);

    return (
        <Drawer position="right" width="50%" >
                <div className="app-status-detail-modal bcn-0 pt-12">

                    <div className="app-status-detail__header box-shadow pb-12 mb-8">
                        <div className="title flex content-space cn-9 fs-16 fw-6 pl-20 pr-20 ">
                            App status detail
                     <span className="cursor" onClick={close} ><Close className="icon-dim-24" /></span>
                        </div>
                        <div className="flex left">
                            <div className={`subtitle app-summary__status-name fw-6 pl-20 f-${status.toLowerCase()} mr-16`}>{status.toUpperCase()}</div>
                            {/* {message && <div>{message}</div>} */}
                        </div>
                    </div>

                    <div className="app-status-detail__header">
                    <table>
                            <thead>
                                <tr>
                                    {['name', 'status', 'message'].map((n, index) => (
                                        <th key={`header_${index}`}>{n}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {console.log(nodes)}
                                {nodes &&
                                    Object.keys(nodes.nodes)
                                        .filter((kind) => kind.toLowerCase() !== 'rollout')
                                        .map((kind) =>
                                            Array.from(nodes.nodes[kind] as Map<string, any>).map(([nodeName, nodeDetails]) => (
                                                <tr key={`${nodeDetails.kind}/${nodeDetails.name}`}>
                                                    <td valign="top">
                                                        <div className="kind-name">
                                                            <div>{nodeDetails.kind}/</div>
                                                            <div className="ellipsis-left">{nodeDetails.name}</div>
                                                        </div>
                                                    </td>
                                                    <td
                                                        valign="top"
                                                        className={`app-summary__status-name f-${nodeDetails.health && nodeDetails.health.status
                                                            ? nodeDetails.health.status.toLowerCase()
                                                            : ''
                                                            }`}
                                                    >
                                                        {nodeDetails.status
                                                            ? nodeDetails.status
                                                            : nodeDetails.health
                                                                ? nodeDetails.health.status
                                                                : ''}
                                                    </td>
                                                    <td valign="top">
                                                        <div
                                                            style={{
                                                                display: 'grid',
                                                                gridAutoColumns: '1fr',
                                                                gridRowGap: '8px',
                                                            }}
                                                        >
                                                            {/* {getNodeMessage(kind, nodeDetails.name) && (
                                                                <div>{getNodeMessage(kind, nodeDetails.name)}</div>
                                                            )} */}
                                                            {nodeDetails.health && nodeDetails.health.message && (
                                                                <div>{nodeDetails.health.message}</div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )),
                                        )}
                            </tbody>
                        </table>
                    </div>
                </div>
        </Drawer>
    )
}

export default AppStatusDetailModal
