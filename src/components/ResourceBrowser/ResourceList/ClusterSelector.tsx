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

import React, { useRef, useState } from 'react'
import { useHistory } from 'react-router-dom'
import ReactSelect, { Props as SelectProps, SelectInstance } from 'react-select'

import {
    APP_SELECTOR_STYLES,
    AppSelectorDropdownIndicator,
    DocLink,
    DocLinkProps,
    Icon,
    PopupMenu,
    ToastManager,
    ToastVariantType,
    ValueContainerWithLoadingShimmer,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as MenuDots } from '@Icons/ic-more-vertical.svg'
import DeleteClusterConfirmationModal from '@Components/cluster/DeleteClusterConfirmationModal'
import { importComponentFromFELibrary } from '@Components/common'

import { URLS } from '../../../config'
import { DEFAULT_CLUSTER_ID } from '../../cluster/cluster.type'
import {
    clusterOverviewNodeText,
    ERROR_SCREEN_LEARN_MORE,
    ERROR_SCREEN_SUBTITLE,
    LEARN_MORE,
    SIDEBAR_KEYS,
} from '../Constants'
import { ClusterOptionType, ClusterSelectorType } from '../Types'

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
    const { replace } = useHistory()

    const [openDeleteClusterModal, setOpenDeleteClusterModal] = useState(false)
    const [showEditPodSpreadModal, setShowEditPodSpreadModal] = useState(false)
    const [showHibernationRulesModal, setShowHibernationRulesModal] = useState(false)

    const selectRef = useRef<SelectInstance>(null)

    let filteredClusterList = clusterList
    if (window._env_.HIDE_DEFAULT_CLUSTER) {
        filteredClusterList = clusterList.filter((item) => Number(item.value) !== DEFAULT_CLUSTER_ID)
    }
    const defaultOption = filteredClusterList.find((item) =>
        isInstallationStatusView ? String(item.installationId) === clusterId : String(item.value) === clusterId,
    )

    const handleOnKeyDown: SelectProps['onKeyDown'] = (event) => {
        if (event.key === 'Escape') {
            selectRef.current?.inputRef.blur()
        }
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
        replace(URLS.RESOURCE_BROWSER)
    }

    const getOptionsValue = (option: ClusterOptionType) =>
        // NOTE: all the options with value equal to that of the selected option will be highlighted
        // therefore, since installed clusters that are in creation phase have value = '0', we need to instead
        // get its value as installationId. Prefixing it with installation- to avoid collision with normal clusters have same value of
        // clusterId as this installationId
        isInstallationStatusView ? `installation-${String(option.installationId)}` : option.value

    return (
        <div className="flexbox dc__align-items-center dc__gap-12">
            <ReactSelect
                classNamePrefix="cluster-select-header"
                options={filteredClusterList}
                isLoading={isClusterListLoading}
                ref={selectRef}
                onChange={onChange}
                getOptionValue={getOptionsValue}
                blurInputOnSelect
                onKeyDown={handleOnKeyDown}
                components={{
                    IndicatorSeparator: null,
                    DropdownIndicator: AppSelectorDropdownIndicator,
                    LoadingIndicator: null,
                    ValueContainer: ValueContainerWithLoadingShimmer,
                }}
                value={defaultOption}
                styles={{
                    ...APP_SELECTOR_STYLES,
                    valueContainer: (base, state) => ({
                        ...APP_SELECTOR_STYLES.valueContainer(base, state),
                        flexWrap: 'nowrap',
                    }),
                }}
            />

            {defaultOption?.isProd && <span className="px-6 py-2 br-4 bcb-1 cb-7 fs-12 lh-16 fw-5">Production</span>}

            {RBPageHeaderPopup && !isInstallationStatusView ? (
                <RBPageHeaderPopup
                    handleDelete={handleOpenDeleteModal}
                    handleHibernationRules={handleOpenHibernationRulesModal}
                    handlePodSpread={handleOpenPodSpreadModal}
                />
            ) : (
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

export const unauthorizedInfoText = (nodeType?: string) => {
    const emptyStateData = {
        text: ERROR_SCREEN_SUBTITLE,
        link: 'K8S_RESOURCES_PERMISSIONS' as DocLinkProps['docLinkKey'],
        linkText: ERROR_SCREEN_LEARN_MORE,
    }

    if (nodeType === SIDEBAR_KEYS.overviewGVK.Kind.toLowerCase()) {
        emptyStateData.text = clusterOverviewNodeText(true)
        emptyStateData.link = 'GLOBAL_CONFIG_PERMISSION'
        emptyStateData.linkText = LEARN_MORE
    } else if (nodeType === SIDEBAR_KEYS.nodeGVK.Kind.toLowerCase()) {
        emptyStateData.text = clusterOverviewNodeText(false)
        emptyStateData.link = 'GLOBAL_CONFIG_PERMISSION'
        emptyStateData.linkText = LEARN_MORE
    }

    return (
        <>
            {emptyStateData.text}&nbsp;
            <DocLink
                dataTestId="rb-permission-error-documentation"
                docLinkKey={emptyStateData.link}
                text={emptyStateData.linkText}
                fontWeight="normal"
            />
        </>
    )
}
