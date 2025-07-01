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
import { useHistory } from 'react-router-dom'

import {
    Badge,
    ComponentSizeType,
    ContextSwitcher,
    handleAnalyticsEvent,
    Icon,
    PopupMenu,
    RecentlyVisitedOptions,
    ResourceKindType,
    SelectPickerProps,
    useUserPreferences,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as MenuDots } from '@Icons/ic-more-vertical.svg'
import { DEFAULT_CLUSTER_ID } from '@Pages/GlobalConfigurations/ClustersAndEnvironments'
import DeleteClusterConfirmationModal from '@Pages/GlobalConfigurations/ClustersAndEnvironments/DeleteClusterConfirmationModal'

import { URLS } from '../../../config'
import { ResourceBrowserGAEvent } from '../Constants'
import { ClusterSelectorType } from '../Types'
import { getClusterSelectOptions } from './utils'

const ClusterSelector: React.FC<ClusterSelectorType> = ({
    onChange,
    clusterList,
    clusterId,
    isInstallationStatusView,
    isClusterListLoading,
}) => {
    const { replace } = useHistory()
    let filteredClusterList = clusterList
    if (window._env_.HIDE_DEFAULT_CLUSTER) {
        filteredClusterList = clusterList.filter((item) => Number(item.value) !== DEFAULT_CLUSTER_ID)
    }

    const defaultOption = filteredClusterList.find((item) =>
        isInstallationStatusView ? String(item.installationId) === clusterId : String(item.value) === clusterId,
    )
    const clusterName = defaultOption?.label

    const handleOnChange = (selected: RecentlyVisitedOptions) => {
        if (selected.value === Number(defaultOption?.value)) {
            return
        }

        handleAnalyticsEvent({
            category: 'Resource Browser',
            action: selected.isRecentlyVisited
                ? ResourceBrowserGAEvent.RB_SWITCH_CLUSTER_RECENTLY_VISITED_CLICKED
                : ResourceBrowserGAEvent.RB_SWITCH_CLUSTER_SEARCHED_ITEM_CLICKED,
        })

        onChange(selected)
    }

    const isAppDataAvailable = !!clusterId

    const { recentlyVisitedResources } = useUserPreferences({
        recentlyVisitedFetchConfig: {
            id: +clusterId,
            name: clusterName,
            resourceKind: ResourceKindType.cluster,
            isDataAvailable: isAppDataAvailable,
        },
    })

    const [inputValue, setInputValue] = useState('')

    const [openDeleteClusterModal, setOpenDeleteClusterModal] = useState(false)

    const onInputChange: SelectPickerProps['onInputChange'] = async (val) => {
        setInputValue(val)
    }

    const handleOpenDeleteModal = () => {
        setOpenDeleteClusterModal(true)
    }

    const handleCloseDeleteModal = () => {
        setOpenDeleteClusterModal(false)
    }

    const handleRedirectToClusterList = () => {
        replace(URLS.RESOURCE_BROWSER)
    }

    return (
        <div className="flexbox dc__align-items-center dc__gap-12">
            <ContextSwitcher
                classNamePrefix="cluster-select-header"
                inputId={`cluster-switcher-${clusterId}`}
                isLoading={isClusterListLoading}
                onChange={handleOnChange}
                value={defaultOption}
                options={getClusterSelectOptions(
                    filteredClusterList,
                    recentlyVisitedResources,
                    isInstallationStatusView,
                )}
                inputValue={inputValue}
                onInputChange={onInputChange}
            />

            {defaultOption?.isProd && <Badge label="Production" size={ComponentSizeType.xxs} />}

            {defaultOption?.value !== String(DEFAULT_CLUSTER_ID) && (
                <PopupMenu autoClose>
                    <PopupMenu.Button rootClassName="flex ml-auto p-4 border__secondary" isKebab>
                        <MenuDots className="icon-dim-16 fcn-7" data-testid="popup-menu-button" />
                    </PopupMenu.Button>

                    <PopupMenu.Body rootClassName="dc__border p-4">
                        <div className="w-150 flexbox-col">
                            <button
                                type="button"
                                className="dc__outline-none flexbox dc__gap-8 dc__transparent dc__hover-n50 px-12 py-6 dc__align-items-center"
                                onClick={handleOpenDeleteModal}
                                data-testid="delete_cluster_button"
                            >
                                <Icon name="ic-delete" color="R500" />
                                <span className="fs-14 lh-1-5 cr-5">Delete</span>
                            </button>
                        </div>
                    </PopupMenu.Body>
                </PopupMenu>
            )}

            {openDeleteClusterModal && (
                <DeleteClusterConfirmationModal
                    clusterName={defaultOption?.label}
                    // NOTE: look inside DeleteClusterConfirmationModal to know why '0' is passed
                    clusterId={defaultOption?.isClusterInCreationPhase ? '0' : defaultOption?.value}
                    handleClose={handleCloseDeleteModal}
                    reload={handleRedirectToClusterList}
                    {...(defaultOption?.isClusterInCreationPhase
                        ? { installationId: clusterId }
                        : { installationId: String(defaultOption?.installationId ?? 0) })}
                />
            )}
        </div>
    )
}

export default ClusterSelector
