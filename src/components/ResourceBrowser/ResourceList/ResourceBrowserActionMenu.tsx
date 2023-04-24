import React, { useState } from 'react'
import { ReactComponent as TerminalIcon } from '../../../assets/icons/ic-terminal-fill.svg'
import { ReactComponent as ManifestIcon } from '../../../assets/icons/ic-file-code.svg'
import { ReactComponent as LogAnalyzerIcon } from '../../../assets/icons/ic-logs.svg'
import { ReactComponent as CalendarIcon } from '../../../assets/icons/ic-calendar.svg'
import { ReactComponent as DeleteIcon } from '../../../assets/icons/ic-delete-interactive.svg'
import { ReactComponent as MenuDots } from '../../../assets/icons/appstatus/ic-menu-dots.svg'
import { showError, DeleteDialog, PopupMenu, Checkbox, CHECKBOX_VALUE } from '@devtron-labs/devtron-fe-common-lib'
import { DELETE_MODAL_MESSAGING, RESOURCE_ACTION_MENU } from '../Constants'
import { ResourceBrowserActionMenuType, ResourceListPayloadType } from '../Types'
import { Nodes } from '../../app/types'
import { deleteResource } from '../ResourceBrowser.service'
import { toast } from 'react-toastify'

export default function ResourceBrowserActionMenu({
    clusterId,
    resourceData,
    selectedResource,
    getResourceListData,
    handleResourceClick,
}: ResourceBrowserActionMenuType) {
    const [apiCallInProgress, setApiCallInProgress] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [forceDelete, setForceDelete] = useState(false)

    const toggleDeleteDialog = () => {
        setShowDeleteDialog((prevState) => !prevState)
    }

    const handleDelete = async (): Promise<void> => {
        try {
            setApiCallInProgress(true)
            const resourceDeletePayload: ResourceListPayloadType = {
                clusterId: Number(clusterId),
                k8sRequest: {
                    resourceIdentifier: {
                        groupVersionKind: selectedResource.gvk,
                        namespace: resourceData.namespace,
                        name: resourceData.name,
                    },
                },
            }

            await deleteResource(resourceDeletePayload)
            toast.success('Resource deleted successfully')
            getResourceListData(true)
        } catch (err) {
            showError(err)
        } finally {
            setApiCallInProgress(false)
        }
    }

    const forceDeleteHandler = (e) => {
        setForceDelete((prevState) => !prevState)
    }

    return (
        <>
            <PopupMenu autoClose>
                <PopupMenu.Button rootClassName="flex ml-auto" isKebab={true}>
                    <MenuDots className="node-actions-menu-icon icon-dim-16" data-testid="popup-menu-button" />
                </PopupMenu.Button>
                <PopupMenu.Body rootClassName="dc__border pt-4 pb-4 w-120">
                    <div className="fs-13 fw-4 lh-20">
                        <span
                            data-name={resourceData.name}
                            data-tab={RESOURCE_ACTION_MENU.manifest}
                            className="flex left h-32 cursor pl-12 pr-12 dc__hover-n50 dc__no-decor"
                            onClick={handleResourceClick}
                            data-testid="manifest-option-link"
                        >
                            <ManifestIcon className="icon-dim-16 mr-8" />
                            <span className="cn-9">{RESOURCE_ACTION_MENU.manifest}</span>
                        </span>
                        <span
                            data-name={resourceData.name}
                            data-tab={RESOURCE_ACTION_MENU.Events}
                            className="flex left h-32 cursor pl-12 pr-12 dc__hover-n50 dc__no-decor"
                            onClick={handleResourceClick}
                            data-testid="events-option-link"
                        >
                            <CalendarIcon className="icon-dim-16 mr-8" />
                            <span className="cn-9">{RESOURCE_ACTION_MENU.Events}</span>
                        </span>
                        {selectedResource?.gvk.Kind === Nodes.Pod && (
                            <>
                                <span
                                    data-name={resourceData.name}
                                    data-tab={RESOURCE_ACTION_MENU.logs}
                                    className="flex left h-32 cursor pl-12 pr-12 dc__hover-n50 dc__no-decor"
                                    onClick={handleResourceClick}
                                    data-testid="logs-option-link"
                                >
                                    <LogAnalyzerIcon className="icon-dim-16 mr-8" />
                                    <span className="cn-9">{RESOURCE_ACTION_MENU.logs}</span>
                                </span>
                                <span
                                    data-name={resourceData.name}
                                    data-tab={RESOURCE_ACTION_MENU.terminal}
                                    className="flex left h-32 cursor pl-12 pr-12 dc__hover-n50 dc__no-decor"
                                    onClick={handleResourceClick}
                                    data-testid="terminal-option-link"
                                >
                                    <TerminalIcon className="icon-dim-16 mr-8" />
                                    <span className="cn-9">{RESOURCE_ACTION_MENU.terminal}</span>
                                </span>
                            </>
                        )}
                        <span
                            className="flex left h-32 cursor pl-12 pr-12 cr-5 dc__hover-n50"
                            onClick={toggleDeleteDialog}
                            data-testid="delete-option-link"
                        >
                            <DeleteIcon className="icon-dim-16 mr-8 scr-5" />
                            {RESOURCE_ACTION_MENU.delete}
                        </span>
                    </div>
                </PopupMenu.Body>
            </PopupMenu>
            {showDeleteDialog && (
                <DeleteDialog
                    title={`Delete ${selectedResource.gvk.Kind} "${resourceData.name}"`}
                    delete={handleDelete}
                    closeDelete={toggleDeleteDialog}
                    apiCallInProgress={apiCallInProgress}
                >
                    <DeleteDialog.Description>
                        <p className="mb-12">{DELETE_MODAL_MESSAGING.description}</p>
                        <Checkbox
                            rootClassName="resource-force-delete"
                            isChecked={forceDelete}
                            value={CHECKBOX_VALUE.CHECKED}
                            disabled={apiCallInProgress}
                            onChange={forceDeleteHandler}
                        >
                            {DELETE_MODAL_MESSAGING.checkboxText}
                        </Checkbox>
                    </DeleteDialog.Description>
                </DeleteDialog>
            )}
        </>
    )
}
