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

import { forwardRef, useState } from 'react'
import { generatePath, useHistory, useLocation, useParams } from 'react-router-dom'

import {
    ActionMenu,
    ActionMenuProps,
    Button,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    noop,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as MenuDots } from '@Icons/ic-more-vertical.svg'
import { TaintType } from '@Components/ClusterNodes/types'

import CordonNodeModal from '../../ClusterNodes/NodeActions/CordonNodeModal'
import DeleteNodeModal from '../../ClusterNodes/NodeActions/DeleteNodeModal'
import DrainNodeModal from '../../ClusterNodes/NodeActions/DrainNodeModal'
import EditTaintsModal from '../../ClusterNodes/NodeActions/EditTaintsModal'
import { K8S_EMPTY_GROUP, RESOURCE_BROWSER_ROUTES } from '../Constants'
import { NodeActionsMenuProps } from '../Types'
import { getNodeActions } from './constants'
import { K8sResourceListURLParams } from './types'

// TODO: This should be commoned out with ResourceBrowserActionMenu to have consistent styling
const NodeActionsMenu = forwardRef<HTMLButtonElement, NodeActionsMenuProps>(
    ({ nodeData, getNodeListData, addTab, handleClearBulkSelection }: NodeActionsMenuProps, forwardedRef) => {
        const history = useHistory()
        const { clusterId } = useParams<K8sResourceListURLParams>()
        const location = useLocation()

        const [showCordonNodeDialog, setShowCordonNodeDialog] = useState(false)
        const [showDrainNodeDialog, setShowDrainNodeDialog] = useState(false)
        const [showDeleteNodeDialog, setShowDeleteNodeDialog] = useState(false)
        const [showEditTaintNodeDialog, setShowEditTaintNodeDialog] = useState(false)

        const { name, version, kind } = nodeData as Record<string, string>

        const handleOpenTerminalAction = () => {
            const queryParams = new URLSearchParams(location.search)
            queryParams.set('node', name)
            history.push(`${generatePath(RESOURCE_BROWSER_ROUTES.TERMINAL, { clusterId })}?${queryParams.toString()}`)
        }

        const handleEditYamlAction = () => {
            const _url = `${generatePath(RESOURCE_BROWSER_ROUTES.NODE_DETAIL, { clusterId, name })}?tab=yaml`
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
                        unschedulable={!!nodeData.unschedulable}
                        closePopup={hideCordonNodeModal}
                    />
                )
            }

            if (showDrainNodeDialog) {
                return <DrainNodeModal name={name} version={version} kind={kind} closePopup={hideDrainNodeModal} />
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

            return (
                showDeleteNodeDialog && (
                    <DeleteNodeModal
                        name={name}
                        version={version}
                        kind={kind}
                        closePopup={hideDeleteNodeModal}
                        handleClearBulkSelection={handleClearBulkSelection}
                    />
                )
            )
        }

        const onActionMenuClick: ActionMenuProps['onClick'] = (item) => {
            switch (item.id) {
                case 'terminal':
                    handleOpenTerminalAction()
                    break
                case 'cordon':
                    showCordonNodeModal()
                    break
                case 'uncordon':
                    showCordonNodeModal()
                    break
                case 'drain':
                    showDrainNodeModal()
                    break
                case 'edit-taints':
                    showEditTaintsModal()
                    break
                case 'edit-yaml':
                    handleEditYamlAction()
                    break
                case 'delete':
                    showDeleteNodeModal()
                    break
                default:
                    break
            }
        }

        return (
            <>
                <ActionMenu
                    id={nodeData.name as string}
                    onClick={onActionMenuClick}
                    options={[{ items: getNodeActions(!!nodeData.unschedulable) }]}
                    position="bottom"
                >
                    <Button
                        ref={forwardedRef}
                        dataTestId={`node-actions-button-${nodeData.name}`}
                        icon={<MenuDots className="fcn-7" />}
                        variant={ButtonVariantType.borderLess}
                        ariaLabel="Open action menu"
                        style={ButtonStyleType.neutral}
                        size={ComponentSizeType.xxs}
                        showAriaLabelInTippy={false}
                    />
                </ActionMenu>
                {renderModal()}
            </>
        )
    },
)

export default NodeActionsMenu
