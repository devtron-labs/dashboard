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
import { useNavigate } from 'react-router-dom'

import {
    ActionMenu,
    ActionMenuItemType,
    ActionMenuProps,
    Badge,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    ContextSwitcher,
    handleAnalyticsEvent,
    Icon,
    RecentlyVisitedOptions,
    ResourceKindType,
    ROUTER_URLS,
    SelectPickerProps,
    ToastManager,
    ToastVariantType,
    useUserPreferences,
} from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '@Components/common'
import { DEFAULT_CLUSTER_ID } from '@Pages/GlobalConfigurations/ClustersAndEnvironments'
import DeleteClusterConfirmationModal from '@Pages/GlobalConfigurations/ClustersAndEnvironments/DeleteClusterConfirmationModal'

import { ResourceBrowserGAEvent } from '../Constants'
import { ClusterSelectorType } from '../Types'
import { ClusterActionMenuOptionIdEnum } from './constants'
import { getClusterSelectOptions } from './utils'

const RBPageHeaderPopup = importComponentFromFELibrary('RBPageHeaderPopup', null, 'function')
const PodSpreadModal = importComponentFromFELibrary('PodSpreadModal', null, 'function')
const HibernationRulesModal = importComponentFromFELibrary('HibernationRulesModal', null, 'function')

const ClusterSelector: React.FC<ClusterSelectorType> = ({
    onChange,
    clusterList,
    clusterId,
    isInstallationStatusView,
    isClusterListLoading,
}) => {
    const navigate = useNavigate()

    const [openDeleteClusterModal, setOpenDeleteClusterModal] = useState(false)
    const [showEditPodSpreadModal, setShowEditPodSpreadModal] = useState(false)
    const [showHibernationRulesModal, setShowHibernationRulesModal] = useState(false)

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

    const onInputChange: SelectPickerProps['onInputChange'] = async (val) => {
        setInputValue(val)
    }

    const handleOpenDeleteModal = () => {
        if (+clusterId === DEFAULT_CLUSTER_ID) {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: 'Default cluster cannot be deleted.',
            })
            return
        }

        setOpenDeleteClusterModal(true)
    }

    const handleCloseDeleteModal = () => {
        setOpenDeleteClusterModal(false)
    }

    const handleOpenPodSpreadModal = () => {
        setShowEditPodSpreadModal(true)
    }

    const handleClosePodSpreadModal = () => {
        setShowEditPodSpreadModal(false)
    }

    const handleOpenHibernationRulesModal = () => {
        setShowHibernationRulesModal(true)
    }

    const handleCloseHibernationRulesModal = () => {
        setShowHibernationRulesModal(false)
    }

    const handleRedirectToClusterList = () => {
        navigate(ROUTER_URLS.RESOURCE_BROWSER.ROOT, {
            replace: true,
        })
    }

    const handleActionMenuClick: ActionMenuProps['onClick'] = (
        item: ActionMenuItemType<ClusterActionMenuOptionIdEnum>,
    ) => {
        if (item.id === ClusterActionMenuOptionIdEnum.DELETE) {
            handleOpenDeleteModal()
        }
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
                resource="Cluster"
            />

            {defaultOption?.isProd && <Badge label="Production" size={ComponentSizeType.xxs} />}

            {RBPageHeaderPopup && isInstallationStatusView ? (
                <RBPageHeaderPopup
                    handleDelete={handleOpenDeleteModal}
                    handleHibernationRules={handleOpenHibernationRulesModal}
                    handlePodSpread={handleOpenPodSpreadModal}
                />
            ) : (
                <ActionMenu<ClusterActionMenuOptionIdEnum>
                    id={`cluster-actions-action-menu-${clusterId}`}
                    onClick={handleActionMenuClick}
                    options={[
                        {
                            items: [
                                {
                                    id: ClusterActionMenuOptionIdEnum.DELETE,
                                    label: 'Delete cluster',
                                    startIcon: { name: 'ic-delete' },
                                    type: 'negative',
                                },
                            ],
                        },
                    ]}
                    buttonProps={{
                        icon: <Icon name="ic-more-vertical" color={null} />,
                        ariaLabel: 'additional-options',
                        dataTestId: 'delete_cluster_button',
                        showAriaLabelInTippy: false,
                        style: ButtonStyleType.neutral,
                        variant: ButtonVariantType.borderLess,
                        size: ComponentSizeType.medium,
                    }}
                />
            )}

            {PodSpreadModal && showEditPodSpreadModal && (
                <PodSpreadModal clusterId={clusterId} handleClose={handleClosePodSpreadModal} />
            )}

            {HibernationRulesModal && showHibernationRulesModal && (
                <HibernationRulesModal clusterId={clusterId} handleClose={handleCloseHibernationRulesModal} />
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
