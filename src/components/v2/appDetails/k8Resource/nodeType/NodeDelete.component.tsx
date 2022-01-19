import React, { useEffect, useState } from 'react';
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

function NodeDeleteComponent({ nodeDetails, appDetails }) {
    const { path } = useRouteMatch();
    const history = useHistory();
    const location = useLocation();
    const params = useParams<{ actionName: string; podName: string; nodeType: string; appId: string; envId: string }>();
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

    const { queryParams } = useSearchString();

    function describeNodeWrapper(tab) {
        console.log('describeNodeWrapper', tab);
        queryParams.set('kind', params.podName);
        const newUrl = generatePath(path, { ...params, tab }) + '/' + nodeDetails.name + '/' + tab.toLowerCase();
        // describeNode(nodeDetails.name);
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
            _refetchAppDetailData();
        } catch (err) {
            showError(err);
        }
    }

    // TODO : move it to some common place, so that recreateResource in manifest can also use that common function.
    const _refetchAppDetailData = () => {
        const queryParams = new URLSearchParams(location.search);
        queryParams.append('refetchData', 'true');
        history.replace({
            search: queryParams.toString(),
        })
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
                    title={'Delete Pod'}
                    delete={() => {
                        asyncDeletePod(nodeDetails);
                        setShowDeleteConfirmation(false);
                    }}
                    closeDelete={() => setShowDeleteConfirmation(false)}
                >
                    <DeleteDialog.Description>
                        <p>Are you sure you want to delete this resource?</p>
                    </DeleteDialog.Description>
                </DeleteDialog>
            )}
        </div>
    );
}

export default NodeDeleteComponent;
