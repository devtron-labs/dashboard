/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useState } from 'react'
import { useHistory, useLocation, useRouteMatch } from 'react-router-dom'
import {
    noop,
    PopupMenu,
    TOAST_ACCESS_DENIED,
    ToastManager,
    ToastVariantType,
    useMainContext,
} from '@devtron-labs/devtron-fe-common-lib'
import { AppDetailsTabs } from '@Components/v2/appDetails/appDetails.store'
import { TaintType } from '@Components/ClusterNodes/types'
import { ReactComponent as TerminalIcon } from '../../../assets/icons/ic-terminal-fill.svg'
import { ReactComponent as CordonIcon } from '../../../assets/icons/ic-cordon.svg'
import { ReactComponent as UncordonIcon } from '../../../assets/icons/ic-play-medium.svg'
import { ReactComponent as DrainIcon } from '../../../assets/icons/ic-clean-brush.svg'
import { ReactComponent as EditTaintsIcon } from '../../../assets/icons/ic-spraycan.svg'
import { ReactComponent as EditFileIcon } from '../../../assets/icons/ic-edit-lines.svg'
import { ReactComponent as DeleteIcon } from '../../../assets/icons/ic-delete-interactive.svg'
import { ReactComponent as MenuDots } from '../../../assets/icons/appstatus/ic-menu-dots.svg'
import { NodeActionsMenuProps } from '../Types'
import CordonNodeModal from '../../ClusterNodes/NodeActions/CordonNodeModal'
import DrainNodeModal from '../../ClusterNodes/NodeActions/DrainNodeModal'
import DeleteNodeModal from '../../ClusterNodes/NodeActions/DeleteNodeModal'
import { CLUSTER_NODE_ACTIONS_LABELS } from '../../ClusterNodes/constants'
import EditTaintsModal from '../../ClusterNodes/NodeActions/EditTaintsModal'
import { K8S_EMPTY_GROUP } from '../Constants'

// TODO: This should be commoned out with ResourceBrowserActionMenu to have consistent styling
const NodeActionsMenu = ({ nodeData, getNodeListData, addTab }: NodeActionsMenuProps) => {
    const history = useHistory()
    const { url } = useRouteMatch()
    const location = useLocation()

    const [showCordonNodeDialog, setCordonNodeDialog] = useState(false)
    const [showDrainNodeDialog, setDrainNodeDialog] = useState(false)
    const [showDeleteNodeDialog, setDeleteNodeDialog] = useState(false)
    const [showEditTaintNodeDialog, setEditTaintNodeDialog] = useState(false)

    const { name, version, kind } = nodeData as Record<string, string>

    const { isSuperAdmin } = useMainContext()

    const isAuthorized = (): boolean => {
        if (!isSuperAdmin) {
            ToastManager.showToast({
                variant: ToastVariantType.notAuthorized,
                description: TOAST_ACCESS_DENIED.SUBTITLE,
            })
            return false
        }
        return true
    }

    const handleOpenTerminalAction = () => {
        if (isAuthorized()) {
            const queryParams = new URLSearchParams(location.search)
            queryParams.set('node', name)
            const url = location.pathname
            history.push(
                `${url.split('/').slice(0, -2).join('/')}/${AppDetailsTabs.terminal}/${K8S_EMPTY_GROUP}?${queryParams.toString()}`,
            )
        }
    }

    const handleEditYamlAction = () => {
        if (isAuthorized()) {
            const _url = `${url.split('/').slice(0, -2).join('/')}/node/${K8S_EMPTY_GROUP}/${nodeData.name}?tab=yaml`
            addTab(K8S_EMPTY_GROUP, 'node', name, _url)
                .then(() => history.push(_url))
                .catch(noop)
        }
    }

    const showCordonNodeModal = (): void => {
        if (isAuthorized()) {
            setCordonNodeDialog(true)
        }
    }

    const hideCordonNodeModal = (refreshData?: boolean): void => {
        setCordonNodeDialog(false)
        if (refreshData) {
            getNodeListData()
        }
    }

    const showDrainNodeModal = (): void => {
        if (isAuthorized()) {
            setDrainNodeDialog(true)
        }
    }

    const hideDrainNodeModal = (refreshData?: boolean): void => {
        setDrainNodeDialog(false)
        if (refreshData) {
            getNodeListData()
        }
    }

    const showDeleteNodeModal = (): void => {
        if (isAuthorized()) {
            setDeleteNodeDialog(true)
        }
    }

    const hideDeleteNodeModal = (refreshData?: boolean): void => {
        setDeleteNodeDialog(false)
        if (refreshData) {
            getNodeListData()
        }
    }

    const showEditTaintsModal = (): void => {
        if (isAuthorized()) {
            setEditTaintNodeDialog(true)
        }
    }

    const hideEditTaintsModal = (refreshData?: boolean): void => {
        setEditTaintNodeDialog(false)
        if (refreshData) {
            getNodeListData()
        }
    }

    return (
        <>
            <PopupMenu autoClose>
                <PopupMenu.Button rootClassName="flex ml-auto p-4" isKebab>
                    <MenuDots className="node-actions-menu-icon icon-dim-16" />
                </PopupMenu.Button>
                <PopupMenu.Body>
                    <div className="fs-13 fw-4 lh-20 pt-8 pb-8 w-160">
                        <span
                            className="flex left h-36 cursor pl-12 pr-12 dc__hover-n50"
                            onClick={handleOpenTerminalAction}
                        >
                            <TerminalIcon className="icon-dim-16 mr-8" />
                            {CLUSTER_NODE_ACTIONS_LABELS.terminal}
                        </span>
                        <span className="flex left h-36 cursor pl-12 pr-12 dc__hover-n50" onClick={showCordonNodeModal}>
                            {nodeData.unschedulable ? (
                                <>
                                    <UncordonIcon className="icon-dim-16 mr-8 scn-7 dc__stroke-width-4" />
                                    {CLUSTER_NODE_ACTIONS_LABELS.uncordon}
                                </>
                            ) : (
                                <>
                                    <CordonIcon className="icon-dim-16 mr-8" />
                                    {CLUSTER_NODE_ACTIONS_LABELS.cordon}
                                </>
                            )}
                        </span>
                        <span className="flex left h-36 cursor pl-12 pr-12 dc__hover-n50" onClick={showDrainNodeModal}>
                            <DrainIcon className="icon-dim-16 mr-8" />
                            {CLUSTER_NODE_ACTIONS_LABELS.drain}
                        </span>
                        <span className="flex left h-36 cursor pl-12 pr-12 dc__hover-n50" onClick={showEditTaintsModal}>
                            <EditTaintsIcon className="icon-dim-16 mr-8" />
                            {CLUSTER_NODE_ACTIONS_LABELS.taints}
                        </span>
                        <span
                            className="flex left h-36 cursor pl-12 pr-12 dc__hover-n50"
                            onClick={handleEditYamlAction}
                        >
                            <EditFileIcon className="icon-dim-16 mr-8" />
                            {CLUSTER_NODE_ACTIONS_LABELS.yaml}
                        </span>
                        <span
                            className="flex left h-36 cursor pl-12 pr-12 cr-5 dc__hover-n50"
                            onClick={showDeleteNodeModal}
                        >
                            <DeleteIcon className="icon-dim-16 mr-8 scr-5" />
                            {CLUSTER_NODE_ACTIONS_LABELS.delete}
                        </span>
                    </div>
                </PopupMenu.Body>
            </PopupMenu>
            {showCordonNodeDialog && (
                <CordonNodeModal
                    name={name}
                    version={version}
                    kind={kind}
                    unschedulable={nodeData.unschedulable as boolean}
                    closePopup={hideCordonNodeModal}
                />
            )}
            {showDrainNodeDialog && (
                <DrainNodeModal name={name} version={version} kind={kind} closePopup={hideDrainNodeModal} />
            )}
            {showDeleteNodeDialog && (
                <DeleteNodeModal name={name} version={version} kind={kind} closePopup={hideDeleteNodeModal} />
            )}
            {showEditTaintNodeDialog && (
                <EditTaintsModal
                    name={name}
                    version={version}
                    kind={kind}
                    taints={nodeData.taints as TaintType[]}
                    closePopup={hideEditTaintsModal}
                />
            )}
        </>
    )
}

export default NodeActionsMenu
