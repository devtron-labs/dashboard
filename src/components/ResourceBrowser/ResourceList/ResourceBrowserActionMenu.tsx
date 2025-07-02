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

import React, { forwardRef, useState } from 'react'

import {
    ActionMenu,
    ActionMenuItemType,
    ActionMenuProps,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    GetResourceScanDetailsPayloadType,
    ModuleNameMap,
    Nodes,
    ResourceBrowserActionMenuEnum,
    ResponseType,
    ScanResultDTO,
    SecurityModal,
    useAsync,
    useMainContext,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as MenuDots } from '@Icons/ic-more-vertical.svg'

import { getShowResourceScanModal, importComponentFromFELibrary } from '../../common'
import { NodeType } from '../../v2/appDetails/appDetails.type'
import { ResourceBrowserActionMenuType } from '../Types'
import DeleteResourcePopup from './DeleteResourcePopup'

const getResourceScanDetails: ({
    name,
    namespace,
    clusterId,
    group,
    version,
    kind,
    appId,
    appType,
    deploymentType,
    isAppDetailView,
}: GetResourceScanDetailsPayloadType) => Promise<ResponseType<ScanResultDTO>> = importComponentFromFELibrary(
    'getResourceScanDetails',
    null,
    'function',
)

const ResourceBrowserActionMenu = forwardRef(
    (
        {
            clusterId,
            resourceData,
            selectedResource,
            getResourceListData,
            handleResourceClick,
            removeTabByIdentifier,
            hideDeleteResource,
            handleClearBulkSelection,
        }: ResourceBrowserActionMenuType,
        forwardedRef: React.Ref<HTMLButtonElement>,
    ) => {
        const { installedModuleMap } = useMainContext()

        const [showDeleteDialog, setShowDeleteDialog] = useState(false)
        const [showVulnerabilityModal, setShowVulnerabilityModal] = useState(false)

        const [resourceScanLoading, resourceScanResponse, resourceScanError] = useAsync(
            () =>
                getResourceScanDetails({
                    name: String(resourceData.name),
                    namespace: String(resourceData.namespace),
                    group: selectedResource?.gvk?.Group,
                    kind: selectedResource?.gvk?.Kind,
                    version: selectedResource?.gvk?.Version,
                    clusterId: +clusterId,
                }),
            [],
            showVulnerabilityModal && !!getResourceScanDetails,
        )

        const toggleDeleteDialog = () => {
            setShowDeleteDialog((prevState) => !prevState)
        }

        const handleShowVulnerabilityModal = () => {
            setShowVulnerabilityModal(true)
        }

        const handleCloseVulnerabilityModal = () => {
            setShowVulnerabilityModal(false)
        }

        const showResourceScanModal = getShowResourceScanModal(
            selectedResource?.gvk?.Kind as NodeType,
            installedModuleMap.current?.[ModuleNameMap.SECURITY_TRIVY],
        )

        const onActionMenuClick: ActionMenuProps<ResourceBrowserActionMenuEnum>['onClick'] = (item) => {
            switch (item.id) {
                case ResourceBrowserActionMenuEnum.manifest:
                case ResourceBrowserActionMenuEnum.events:
                case ResourceBrowserActionMenuEnum.logs:
                case ResourceBrowserActionMenuEnum.terminal:
                    handleResourceClick({
                        currentTarget: {
                            dataset: {
                                ...(resourceData as Record<string, string>),
                                kind: selectedResource.gvk.Kind,
                                group: selectedResource.gvk.Group,
                                tab: item.id,
                            },
                        },
                    })
                    return
                case ResourceBrowserActionMenuEnum.delete:
                    toggleDeleteDialog()
                    return
                case ResourceBrowserActionMenuEnum.vulnerability:
                    handleShowVulnerabilityModal()
                    return
                default:
                    // eslint-disable-next-line no-console
                    console.warn(`No action defined for menu item: ${item.id}`)
            }
        }

        const id = JSON.stringify(resourceData)

        return (
            <>
                <ActionMenu<ResourceBrowserActionMenuEnum>
                    id={id}
                    onClick={onActionMenuClick}
                    position="bottom"
                    options={[
                        {
                            items: [
                                {
                                    id: ResourceBrowserActionMenuEnum.manifest,
                                    label: 'Manifest',
                                    startIcon: { name: 'ic-file-code' },
                                },
                                {
                                    id: ResourceBrowserActionMenuEnum.events,
                                    label: 'Events',
                                    startIcon: { name: 'ic-calendar' },
                                },
                                ...(selectedResource?.gvk?.Kind === Nodes.Pod
                                    ? [
                                          {
                                              id: ResourceBrowserActionMenuEnum.logs,
                                              label: 'Logs',
                                              startIcon: { name: 'ic-logs' },
                                          } as ActionMenuItemType<ResourceBrowserActionMenuEnum>,
                                          {
                                              id: ResourceBrowserActionMenuEnum.terminal,
                                              label: 'Terminal',
                                              startIcon: { name: 'ic-terminal-fill' },
                                          } as ActionMenuItemType<ResourceBrowserActionMenuEnum>,
                                      ]
                                    : []),
                                ...(showResourceScanModal && SecurityModal
                                    ? [
                                          {
                                              id: ResourceBrowserActionMenuEnum.vulnerability,
                                              label: 'Check vulnerabilities',
                                              startIcon: { name: 'ic-bug' },
                                          } as ActionMenuItemType<ResourceBrowserActionMenuEnum>,
                                      ]
                                    : []),
                                ...(!hideDeleteResource
                                    ? [
                                          {
                                              id: ResourceBrowserActionMenuEnum.delete,
                                              label: 'Delete',
                                              type: 'negative',
                                              startIcon: { name: 'ic-delete' },
                                          } as ActionMenuItemType<ResourceBrowserActionMenuEnum>,
                                      ]
                                    : []),
                            ],
                        },
                    ]}
                    buttonProps={{
                        ref: forwardedRef,
                        dataTestId: `node-actions-button-${id}`,
                        icon: <MenuDots className="fcn-7" />,
                        variant: ButtonVariantType.borderLess,
                        ariaLabel: 'Open action menu',
                        style: ButtonStyleType.neutral,
                        size: ComponentSizeType.xxs,
                        showAriaLabelInTippy: false,
                    }}
                />

                {showDeleteDialog && (
                    <DeleteResourcePopup
                        clusterId={clusterId}
                        resourceData={resourceData}
                        selectedResource={selectedResource}
                        getResourceListData={getResourceListData}
                        toggleDeleteDialog={toggleDeleteDialog}
                        removeTabByIdentifier={removeTabByIdentifier}
                        handleClearBulkSelection={handleClearBulkSelection}
                    />
                )}

                {showVulnerabilityModal && !!getResourceScanDetails && (
                    <SecurityModal
                        handleModalClose={handleCloseVulnerabilityModal}
                        isLoading={resourceScanLoading}
                        error={resourceScanError}
                        responseData={resourceScanResponse?.result}
                        hidePolicy
                    />
                )}
            </>
        )
    },
)

export default ResourceBrowserActionMenu
