import React, { useState } from 'react'
import { useRouteMatch, useParams, generatePath, useHistory, useLocation } from 'react-router'
import { useSearchString } from '../../../../common'
import { showError, DeleteDialog, PopupMenu, Checkbox, CHECKBOX_VALUE } from '@devtron-labs/devtron-fe-common-lib'
import dots from '../../../assets/icons/ic-menu-dot.svg'
import { toast } from 'react-toastify'
import { NodeDetailTabs, NodeDetailTabsType } from '../../../../app/types'
import './nodeType.scss'
import { deleteResource } from '../../appDetails.api'
import { AppType, NodeType } from '../../appDetails.type'
import AppDetailsStore from '../../appDetails.store'
import { appendRefetchDataToUrl } from '../../../../util/URLUtil'
import { URLS } from '../../../../../config'
import { ReactComponent as Trash } from '../../../../../assets/icons/ic-delete-interactive.svg'

function NodeDeleteComponent({ nodeDetails, appDetails }) {
    const { path } = useRouteMatch()
    const history = useHistory()
    const location = useLocation()
    const params = useParams<{ actionName: string; podName: string; nodeType: string; appId: string; envId: string }>()
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
    const [apiCallInProgress, setApiCallInProgress] = useState(false)
    const [forceDelete, setForceDelete] = useState(false)
    const { queryParams } = useSearchString()
    const isExternalArgoApp = appDetails?.appType === AppType.EXTERNAL_ARGO_APP

    function describeNodeWrapper(tab) {
        queryParams.set('kind', params.podName)
        const updatedPath = `${path.substring(0, path.indexOf('/k8s-resources/'))}/${
            URLS.APP_DETAILS_K8
        }/${NodeType.Pod.toLowerCase()}/${nodeDetails.name}/${tab.toLowerCase()}`
        history.push(generatePath(updatedPath, { ...params, tab }))
    }

    const PodPopup: React.FC<{
        kind: NodeType
        describeNode: (tab?: NodeDetailTabsType) => void
    }> = ({ kind, describeNode }) => {
        return (
            <div className="pod-info__popup-container">
                {kind === NodeType.Pod ? (
                    <span
                        data-testid="view-events-button"
                        className="flex pod-info__popup-row"
                        onClickCapture={(e) => describeNode(NodeDetailTabs.EVENTS)}
                    >
                        View Events
                    </span>
                ) : (
                    ''
                )}
                {kind === NodeType.Pod ? (
                    <span
                        data-testid="view-logs-button"
                        className="flex pod-info__popup-row"
                        onClick={(e) => describeNode(NodeDetailTabs.LOGS)}
                    >
                        View Container Logs
                    </span>
                ) : (
                    ''
                )}
                {!isExternalArgoApp && <span
                    data-testid="delete-resource-button"
                    className="flex pod-info__popup-row pod-info__popup-row--red cr-5"
                    onClick={(e) => {
                        setShowDeleteConfirmation(true)
                    }}
                >
                    <span>Delete</span>
                    <Trash className="icon-dim-20 scr-5" />
                </span>}
            </div>
        )
    }

    async function asyncDeletePod(nodeDetails) {
        try {
            setApiCallInProgress(true)
            await deleteResource(nodeDetails, appDetails, params.envId, forceDelete)
            setShowDeleteConfirmation(false)
            setForceDelete(false)
            toast.success('Deletion initiated successfully.')
            // AppDetailsStore.markResourceDeleted(nodeDetails?.kind, nodeDetails?.name);
            const _tabs = AppDetailsStore.getAppDetailsTabs()
            const appDetailsTabs = _tabs.filter((_tab) => _tab.name === nodeDetails.name)

            appDetailsTabs.forEach((_tab) => AppDetailsStore.removeAppDetailsTabByIdentifier(_tab.title))
            appendRefetchDataToUrl(history, location)
        } catch (err) {
            showError(err)
        } finally {
            setApiCallInProgress(false)
        }
    }

    const deleteResourceAction = () => {
        asyncDeletePod(nodeDetails)
    }

    const toggleShowDeleteConfirmation = () => {
        setShowDeleteConfirmation(!showDeleteConfirmation)
    }

    const forceDeleteHandler = (e) => {
        setForceDelete(!forceDelete)
    }

    return (
        <div style={{ width: '40px' }}>
            <PopupMenu autoClose>
                <PopupMenu.Button dataTestId="node-resource-dot-button" isKebab={true}>
                    <img src={dots} className="pod-info__dots" />
                </PopupMenu.Button>
                <PopupMenu.Body>
                    <PodPopup kind={nodeDetails?.kind} describeNode={describeNodeWrapper} />
                </PopupMenu.Body>
            </PopupMenu>
            {showDeleteConfirmation && (
                <DeleteDialog
                    title={`Delete ${nodeDetails?.kind} "${nodeDetails?.name}"`}
                    delete={deleteResourceAction}
                    closeDelete={toggleShowDeleteConfirmation}
                    apiCallInProgress={apiCallInProgress}
                >
                    <DeleteDialog.Description>
                        <p className="mb-12">Are you sure, you want to delete this resource?</p>
                        <Checkbox
                            rootClassName="resource-force-delete"
                            isChecked={forceDelete}
                            value={CHECKBOX_VALUE.CHECKED}
                            disabled={apiCallInProgress}
                            onChange={forceDeleteHandler}
                        >
                            Force delete resource
                        </Checkbox>
                    </DeleteDialog.Description>
                </DeleteDialog>
            )}
        </div>
    )
}

export default NodeDeleteComponent
