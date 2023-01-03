import React, { useState } from 'react'
import { Link, useHistory, useRouteMatch } from 'react-router-dom'
import { ReactComponent as TerminalIcon } from '../../../assets/icons/ic-terminal-fill.svg'
import { ReactComponent as ManifestIcon } from '../../../assets/icons/ic-file-code.svg'
import { ReactComponent as LogAnalyzerIcon } from '../../../assets/icons/ic-logs.svg'
import { ReactComponent as CalendarIcon } from '../../../assets/icons/ic-calendar.svg'
import { ReactComponent as DeleteIcon } from '../../../assets/icons/ic-delete-interactive.svg'
import { ReactComponent as MenuDots } from '../../../assets/icons/appstatus/ic-menu-dots.svg'
import { Checkbox, CHECKBOX_VALUE, DeleteDialog, PopupMenu, showError } from '../../common'
import { RESOURCE_ACTION_MENU } from '../Constants'
import { ResourceBrowserActionMenuType, ResourceListPayloadType } from '../Types'
import { Nodes } from '../../app/types'
import { deleteResource } from '../ResourceBrowser.service'
import { toast } from 'react-toastify'
import { NodeDetailTab } from '../../v2/appDetails/k8Resource/nodeDetail/nodeDetail.type'

export default function ResourceBrowserActionMenu({
    clusterId,
    namespace,
    resourceData,
    selectedResource,
    getResourceListData,
}: ResourceBrowserActionMenuType) {
    const { url } = useRouteMatch()
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
            getResourceListData()
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
                <PopupMenu.Button rootClassName="flex" isKebab={true}>
                    <MenuDots className="node-actions-menu-icon icon-dim-16" />
                </PopupMenu.Button>
                <PopupMenu.Body>
                    <div className="fs-13 fw-4 lh-20 pt-8 pb-8 w-160">
                        <Link
                            to={`${url}/${resourceData.name}/${NodeDetailTab.MANIFEST.toLowerCase()}`}
                            className="flex left h-36 cursor pl-12 pr-12 dc__hover-n50 dc__no-decor"
                        >
                            <ManifestIcon className="icon-dim-16 mr-8" />
                            <span className="cn-9">{RESOURCE_ACTION_MENU.manifest}</span>
                        </Link>
                        <Link
                            to={`${url}/${resourceData.name}/${NodeDetailTab.EVENTS.toLowerCase()}`}
                            className="flex left h-36 cursor pl-12 pr-12 dc__hover-n50 dc__no-decor"
                        >
                            <CalendarIcon className="icon-dim-16 mr-8" />
                            <span className="cn-9">{RESOURCE_ACTION_MENU.Events}</span>
                        </Link>
                        {selectedResource?.gvk.Kind === Nodes.Pod && (
                            <>
                                <Link
                                    to={`${url}/${resourceData.name}/${NodeDetailTab.LOGS.toLowerCase()}`}
                                    className="flex left h-36 cursor pl-12 pr-12 dc__hover-n50 dc__no-decor"
                                >
                                    <LogAnalyzerIcon className="icon-dim-16 mr-8" />
                                    <span className="cn-9">{RESOURCE_ACTION_MENU.logs}</span>
                                </Link>
                                <Link
                                    to={`${url}/${resourceData.name}/${NodeDetailTab.TERMINAL.toLowerCase()}`}
                                    className="flex left h-36 cursor pl-12 pr-12 dc__hover-n50 dc__no-decor"
                                >
                                    <TerminalIcon className="icon-dim-16 mr-8" />
                                    <span className="cn-9">{RESOURCE_ACTION_MENU.terminal}</span>
                                </Link>
                            </>
                        )}
                        <span
                            className="flex left h-36 cursor pl-12 pr-12 cr-5 dc__hover-n50"
                            onClick={toggleDeleteDialog}
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
        </>
    )
}
