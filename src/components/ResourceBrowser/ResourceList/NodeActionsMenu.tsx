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
import { noop, PopupMenu } from '@devtron-labs/devtron-fe-common-lib'
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

    const [showCordonNodeDialog, setShowCordonNodeDialog] = useState(false)
    const [showDrainNodeDialog, setShowDrainNodeDialog] = useState(false)
    const [showDeleteNodeDialog, setShowDeleteNodeDialog] = useState(false)
    const [showEditTaintNodeDialog, setShowEditTaintNodeDialog] = useState(false)

    const { name, version, kind } = nodeData as Record<string, string>

    const handleOpenTerminalAction = () => {
        const queryParams = new URLSearchParams(location.search)
        queryParams.set('node', name)
        history.push(
            `${location.pathname.split('/').slice(0, -2).join('/')}/${AppDetailsTabs.terminal}/${K8S_EMPTY_GROUP}?${queryParams.toString()}`,
        )
    }

    const handleEditYamlAction = () => {
        const _url = `${url.split('/').slice(0, -2).join('/')}/node/${K8S_EMPTY_GROUP}/${nodeData.name}?tab=yaml`
        addTab({ idPrefix: K8S_EMPTY_GROUP, kind: 'node', name, url: _url })
            .then(() => history.push(_url))
            .catch(noop)
    }

    const showCordonNodeModal = (): void => {
        setShowCordonNodeDialog(true)
    }

    const hideCordonNodeModal = (refreshData?: boolean): void => {
        setShowCordonNodeDialog(false)
        if (refreshData) {
            getNodeListData()
        }
    }

    const showDrainNodeModal = (): void => {
        setShowDrainNodeDialog(true)
    }

    const hideDrainNodeModal = (refreshData?: boolean): void => {
        setShowDrainNodeDialog(false)
        if (refreshData) {
            getNodeListData()
        }
    }

    const showDeleteNodeModal = (): void => {
        setShowDeleteNodeDialog(true)
    }

    const hideDeleteNodeModal = (refreshData?: boolean): void => {
        setShowDeleteNodeDialog(false)
        if (refreshData) {
            getNodeListData()
        }
    }

    const showEditTaintsModal = (): void => {
        setShowEditTaintNodeDialog(true)
    }

    const hideEditTaintsModal = (refreshData?: boolean): void => {
        setShowEditTaintNodeDialog(false)
        if (refreshData) {
            getNodeListData()
        }
    }

    const renderModal = () => {
        if (showCordonNodeDialog) {
            return (
                <CordonNodeModal
                    name={name}
                    version={version}
                    kind={kind}
                    // NOTE!: ts was showing error in yarn lint but vscode did not
                    unschedulable={!!nodeData.unschedulable as unknown as boolean}
                    closePopup={hideCordonNodeModal}
                />
            )
        }

        if (showDrainNodeDialog) {
            return <DrainNodeModal name={name} version={version} kind={kind} closePopup={hideDrainNodeModal} />
        }

        if (showDeleteNodeDialog) {
            return <DeleteNodeModal name={name} version={version} kind={kind} closePopup={hideDeleteNodeModal} />
        }

        if (showEditTaintNodeDialog) {
            return (
                <EditTaintsModal
                    name={name}
                    version={version}
                    kind={kind}
                    taints={nodeData.taints as TaintType[]}
                    closePopup={hideEditTaintsModal}
                />
            )
        }

        return null
    }

    const menuListItemButtonClassName = 'flex left h-36 cursor pl-12 pr-12 dc__hover-n50 dc__transparent w-100'

    return (
        <>
            <PopupMenu autoClose>
                <PopupMenu.Button rootClassName="flex ml-auto p-4" isKebab>
                    <MenuDots className="node-actions-menu-icon icon-dim-16" />
                </PopupMenu.Button>
                <PopupMenu.Body rootClassName="dc__border">
                    <div className="fs-13 fw-4 lh-20 pt-8 pb-8 w-160">
                        <button
                            type="button"
                            aria-label="Open the node in terminal"
                            className={menuListItemButtonClassName}
                            onClick={handleOpenTerminalAction}
                        >
                            <TerminalIcon className="icon-dim-16 mr-8" />
                            {CLUSTER_NODE_ACTIONS_LABELS.terminal}
                        </button>
                        <button
                            type="button"
                            aria-label="Cordon the node"
                            className={menuListItemButtonClassName}
                            onClick={showCordonNodeModal}
                        >
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
                        </button>
                        <button
                            type="button"
                            className={menuListItemButtonClassName}
                            onClick={showDrainNodeModal}
                            aria-label="Drain the node"
                        >
                            <DrainIcon className="icon-dim-16 mr-8" />
                            {CLUSTER_NODE_ACTIONS_LABELS.drain}
                        </button>
                        <button
                            type="button"
                            className={menuListItemButtonClassName}
                            aria-label="Edit taints for the node"
                            onClick={showEditTaintsModal}
                        >
                            <EditTaintsIcon className="icon-dim-16 mr-8" />
                            {CLUSTER_NODE_ACTIONS_LABELS.taints}
                        </button>
                        <button
                            type="button"
                            aria-label="Edit the node's yaml"
                            className={menuListItemButtonClassName}
                            onClick={handleEditYamlAction}
                        >
                            <EditFileIcon className="icon-dim-16 mr-8" />
                            {CLUSTER_NODE_ACTIONS_LABELS.yaml}
                        </button>
                        <button
                            type="button"
                            aria-label="Delete the node"
                            className={menuListItemButtonClassName}
                            onClick={showDeleteNodeModal}
                        >
                            <DeleteIcon className="icon-dim-16 mr-8 scr-5" />
                            {CLUSTER_NODE_ACTIONS_LABELS.delete}
                        </button>
                    </div>
                </PopupMenu.Body>
            </PopupMenu>
            {renderModal()}
        </>
    )
}

export default NodeActionsMenu
