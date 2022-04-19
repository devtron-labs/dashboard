import React, { useState } from 'react';
import { useRouteMatch, useParams, generatePath, useHistory, useLocation } from 'react-router';
import {
    PopupMenu,
    Trash,
    showError,
    useSearchString,
    DeleteDialog,
} from '../../../../common';
import dots from '../../../assets/icons/ic-menu-dot.svg';
import { toast } from 'react-toastify';
import { NodeDetailTabs, NodeDetailTabsType } from '../../../../app/types';
import './nodeType.scss';
import { deleteResource } from '../../appDetails.api';
import { NodeType } from '../../appDetails.type';
import AppDetailsStore from '../../appDetails.store';
import { appendRefetchDataToUrl } from '../../../../util/URLUtil';
import { URLS } from '../../../../../config';

function NodeDeleteComponent({ nodeDetails, appDetails }) {
    const { path } = useRouteMatch();
    const history = useHistory();
    const location = useLocation();
    const params = useParams<{ actionName: string; podName: string; nodeType: string; appId: string; envId: string }>();
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

    const { queryParams } = useSearchString();

    function describeNodeWrapper(tab) {
        queryParams.set('kind', params.podName);
        const updatedPath = `${path.substring(0,path.indexOf('/k8s-resources/'))}/${URLS.APP_DETAILS_K8}/${NodeType.Pod.toLowerCase()}`
        const newUrl = generatePath(updatedPath, { ...params, tab }) + '/' + nodeDetails.name + '/' + tab.toLowerCase();
        history.push(newUrl);
    }

    const PodPopup: React.FC<{
        kind: NodeType;
        describeNode: (tab?: NodeDetailTabsType) => void;
    }> = ({ kind, describeNode }) => {
        return (
            <div className="pod-info__popup-container">
                {kind === NodeType.Pod ? (
                    <span
                        className="flex pod-info__popup-row"
                        onClickCapture={(e) => describeNode(NodeDetailTabs.EVENTS)}
                    >
                        View Events
                    </span>
                ) : (
                    ''
                )}
                {kind === NodeType.Pod ? (
                    <span className="flex pod-info__popup-row" onClick={(e) => describeNode(NodeDetailTabs.LOGS)}>
                        View Container Logs
                    </span>
                ) : (
                    ''
                )}
                <span
                    className="flex pod-info__popup-row pod-info__popup-row--red cr-5"
                    onClick={(e) => {
                        setShowDeleteConfirmation(true);
                    }}
                >
                    <span>Delete</span>
                    <Trash className="icon-dim-20" />
                </span>
            </div>
        );
    };

    async function asyncDeletePod(nodeDetails) {
        console.log(window.location.pathname);

        try {
            await deleteResource(nodeDetails, appDetails, params.envId);
            toast.success('Deletion initiated successfully.');
            // AppDetailsStore.markResourceDeleted(nodeDetails?.kind, nodeDetails?.name);
            const _tabs = AppDetailsStore.getAppDetailsTabs();
            const appDetailsTabs = _tabs.filter((_tab) => _tab.name === nodeDetails.name);

            appDetailsTabs.forEach((_tab) => AppDetailsStore.removeAppDetailsTabByIdentifier(_tab.title));
            appendRefetchDataToUrl(history, location);
        } catch (err) {
            showError(err);
        }
    }

    return (
        <div style={{ width: '40px' }}>
            <PopupMenu autoClose>
                <PopupMenu.Button isKebab={true}>
                    <img src={dots} className="pod-info__dots" />
                </PopupMenu.Button>
                <PopupMenu.Body>
                    <PodPopup kind={nodeDetails?.kind} describeNode={describeNodeWrapper} />
                </PopupMenu.Body>
            </PopupMenu>
            {showDeleteConfirmation && (
                <DeleteDialog
                    title={`Delete ${nodeDetails?.kind} "${nodeDetails?.name}"`}
                    delete={() => {
                        asyncDeletePod(nodeDetails);
                        setShowDeleteConfirmation(false);
                    }}
                    closeDelete={() => setShowDeleteConfirmation(false)}
                >
                    <DeleteDialog.Description>
                        <p>Are you sure, you want to delete this resource?</p>
                    </DeleteDialog.Description>
                </DeleteDialog>
            )}
        </div>
    );
}

export default NodeDeleteComponent;
