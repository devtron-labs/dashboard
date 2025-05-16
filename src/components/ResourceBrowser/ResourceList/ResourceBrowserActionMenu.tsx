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

import React, { useState } from 'react'

import {
    GetResourceScanDetailsPayloadType,
    ModuleNameMap,
    Nodes,
    PopupMenu,
    ResponseType,
    ScanResultDTO,
    SecurityModal,
    useAsync,
    useMainContext,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as MenuDots } from '@Icons/ic-dot.svg'

import { ReactComponent as CalendarIcon } from '../../../assets/icons/ic-calendar.svg'
import { ReactComponent as DeleteIcon } from '../../../assets/icons/ic-delete-interactive.svg'
import { ReactComponent as ManifestIcon } from '../../../assets/icons/ic-file-code.svg'
import { ReactComponent as LogAnalyzerIcon } from '../../../assets/icons/ic-logs.svg'
import { ReactComponent as TerminalIcon } from '../../../assets/icons/ic-terminal-fill.svg'
import { getShowResourceScanModal, importComponentFromFELibrary } from '../../common'
import { NodeType } from '../../v2/appDetails/appDetails.type'
import { RESOURCE_ACTION_MENU } from '../Constants'
import { ResourceBrowserActionMenuType } from '../Types'
import DeleteResourcePopup from './DeleteResourcePopup'

const OpenSecurityModalButton = importComponentFromFELibrary('OpenSecurityModalButton', null, 'function')
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

const ResourceBrowserActionMenu: React.FC<ResourceBrowserActionMenuType> = ({
    clusterId,
    resourceData,
    selectedResource,
    getResourceListData,
    handleResourceClick,
    removeTabByIdentifier,
    hideDeleteResource,
    handleClearBulkSelection,
}) => {
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

    return (
        <>
            <PopupMenu autoClose>
                <PopupMenu.Button rootClassName="flex ml-auto p-4 dc__no-background" isKebab>
                    <MenuDots className="fcn-7 icon-dim-16" data-testid="popup-menu-button" />
                </PopupMenu.Button>
                <PopupMenu.Body rootClassName="dc__border pt-4 pb-4">
                    <div className="fs-13 fw-4 lh-20 w-120 flexbox-col">
                        <span
                            data-name={resourceData.name}
                            data-tab={RESOURCE_ACTION_MENU.manifest}
                            data-namespace={resourceData.namespace}
                            data-kind={resourceData.kind}
                            className="flex left h-32 cursor pl-12 pr-12 dc__hover-n50 dc__no-decor"
                            onClick={handleResourceClick}
                            data-testid="manifest-option-link"
                        >
                            <ManifestIcon className="icon-dim-16 scn-6 mr-8 dc__no-shrink" />
                            <span className="cn-9">{RESOURCE_ACTION_MENU.manifest}</span>
                        </span>
                        <span
                            data-name={resourceData.name}
                            data-tab={RESOURCE_ACTION_MENU.Events}
                            data-namespace={resourceData.namespace}
                            data-kind={resourceData.kind}
                            className="flex left h-32 cursor pl-12 pr-12 dc__hover-n50 dc__no-decor"
                            onClick={handleResourceClick}
                            data-testid="events-option-link"
                        >
                            <CalendarIcon className="icon-dim-16 mr-8 fcn-6" />
                            <span className="cn-9">{RESOURCE_ACTION_MENU.Events}</span>
                        </span>
                        {selectedResource?.gvk?.Kind === Nodes.Pod && (
                            <>
                                <span
                                    data-name={resourceData.name}
                                    data-tab={RESOURCE_ACTION_MENU.logs}
                                    data-namespace={resourceData.namespace}
                                    data-kind={resourceData.kind}
                                    className="flex left h-32 cursor pl-12 pr-12 dc__hover-n50 dc__no-decor"
                                    onClick={handleResourceClick}
                                    data-testid="logs-option-link"
                                >
                                    <LogAnalyzerIcon className="icon-dim-16 mr-8 fcn-6" />
                                    <span className="cn-9">{RESOURCE_ACTION_MENU.logs}</span>
                                </span>
                                <span
                                    data-name={resourceData.name}
                                    data-tab={RESOURCE_ACTION_MENU.terminal}
                                    data-namespace={resourceData.namespace}
                                    data-kind={resourceData.kind}
                                    className="flex left h-32 cursor pl-12 pr-12 dc__hover-n50 dc__no-decor"
                                    onClick={handleResourceClick}
                                    data-testid="terminal-option-link"
                                >
                                    <TerminalIcon className="icon-dim-16 mr-8 fcn-6" />
                                    <span className="cn-9">{RESOURCE_ACTION_MENU.terminal}</span>
                                </span>
                            </>
                        )}
                        {showResourceScanModal && OpenSecurityModalButton && (
                            <OpenSecurityModalButton handleShowVulnerabilityModal={handleShowVulnerabilityModal} />
                        )}
                        {!hideDeleteResource && (
                            <span
                                className="flex left h-32 cursor pl-12 pr-12 cr-5 dc__hover-n50"
                                onClick={toggleDeleteDialog}
                                data-testid="delete-option-link"
                            >
                                <DeleteIcon className="icon-dim-16 mr-8 scr-5" />
                                {RESOURCE_ACTION_MENU.delete}
                            </span>
                        )}
                    </div>
                </PopupMenu.Body>
            </PopupMenu>
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
}

export default ResourceBrowserActionMenu
