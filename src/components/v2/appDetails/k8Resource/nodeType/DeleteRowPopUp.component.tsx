import React, { useEffect, useState } from 'react'
import { useRouteMatch, useParams, generatePath, useHistory, useLocation } from 'react-router';
import { PopupMenu, Pod as PodIcon, Trash, showError, copyToClipboard, not, useSearchString } from '../../../../common';
import dots from '../../../assets/icons/ic-menu-dot.svg';
import { toast } from 'react-toastify';
import { deleteResource } from '../../../../app/service';
import { NodeDetailTabsType, NodeType } from '../../../../app/types';
import './nodeType.scss';
import IndexStore from '../../index.store';

function Menu({ appName, environmentName, nodeDetails, describeNode, appId }) {
    const { path } = useRouteMatch();
    const history = useHistory();
    // const params = useParams();
    const params = useParams<{ actionName: string, podName: string, nodeType: string }>()

    const { queryParams } = useSearchString();

    function describeNodeWrapper(tab) {
        queryParams.set('kind', params.podName);
        const newUrl = generatePath(path, { ...params, tab }) + '?' + queryParams.toString();
        describeNode(nodeDetails.name);
        history.push(newUrl);
    }

    const PodPopup: React.FC<{ appName: string, environmentName: string, name: string, kind: NodeType, group, version, namespace: string, describeNode: (tab?: NodeDetailTabsType) => void, appId: number }> = ({ appName, environmentName, name, kind, version, group, namespace, describeNode, appId }) => {
        const params = useParams<{ appId: string; envId: string }>();
        async function asyncDeletePod(e) {
            let apiParams = {
                appId: appId,
                appName,
                kind: kind,
                group: group,
                env: environmentName,
                envId: +params.envId,
                namespace,
                version: version,
                name,
            };
            try {
                await deleteResource(apiParams);
                toast.success('Deletion initiated successfully.');
            } catch (err) {
                showError(err);
            }
        }

        return <div className="pod-info__popup-container">
            {/* {kind === Nodes.Pod ? <span className="flex pod-info__popup-row"
                onClickCapture={e => describeNode(NodeDetailTabs.EVENTS)}>
                View Events
            </span> : ''}
            {kind === Nodes.Pod ? <span className="flex pod-info__popup-row"
                onClick={e => describeNode(NodeDetailTabs.LOGS)}>
                View Container Logs
            </span> : ''}  */}
            <span className="flex pod-info__popup-row pod-info__popup-row--red cr-5"
                onClick={asyncDeletePod}>
                <span>Delete</span>
                <Trash className="icon-dim-20" />
            </span>

            {/* </span> */}
        </div>
    }

    return (<div style={{ width: '40px' }}>
        <PopupMenu autoClose>
            <PopupMenu.Button isKebab={true}>
                <img src={dots} className="pod-info__dots" />
            </PopupMenu.Button>
            <PopupMenu.Body>
                <PodPopup
                    kind={nodeDetails?.kind}
                    name={nodeDetails.name}
                    version={nodeDetails?.version}
                    group={nodeDetails?.group}
                    namespace={nodeDetails.namespace}
                    describeNode={describeNodeWrapper}
                    appName={appName}
                    environmentName={environmentName}
                    appId={appId}
                />
            </PopupMenu.Body>
        </PopupMenu>
    </div>)
}

export default Menu