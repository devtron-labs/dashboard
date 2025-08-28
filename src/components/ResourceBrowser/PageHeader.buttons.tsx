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
import { generatePath, Route, useHistory } from 'react-router-dom'

import {
    Button,
    ButtonComponentType,
    ComponentSizeType,
    handleAnalyticsEvent,
    URLS as COMMON_URLS,
    useMainContext,
} from '@devtron-labs/devtron-fe-common-lib'

import CreateCluster from '@Pages/GlobalConfigurations/ClustersAndEnvironments/CreateCluster/CreateCluster.component'
import {
    CreateClusterProps,
    CreateClusterTypeEnum,
} from '@Pages/GlobalConfigurations/ClustersAndEnvironments/CreateCluster/types'
import { UpgradeToEnterpriseDialog } from '@Pages/Shared/UpgradeToEnterprise'

import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import { URLS } from '../../config'
import { CreateResource } from './ResourceList/CreateResource'
import { CreateResourceButtonType, CreateResourceType } from './Types'

export const CreateResourceButton: React.FC<CreateResourceButtonType> = ({ clusterId, closeModal }) => {
    const [showModal, setShowModal] = useState(false)

    const handleCreateResource = () => {
        setShowModal(true)
        handleAnalyticsEvent({
            category: 'RB Create Resource',
            action: 'RB_CREATE_RESOURCE',
        })
    }

    const handleModalClose = (shouldUpdate: boolean) => {
        setShowModal(false)
        closeModal(shouldUpdate)
    }

    return (
        <>
            <Button
                dataTestId="create-resource"
                onClick={handleCreateResource}
                text="Create resource"
                startIcon={<Add />}
                size={ComponentSizeType.small}
            />
            {showModal && <CreateResource closePopup={handleModalClose} clusterId={clusterId} />}
        </>
    )
}

export const renderCreateResourceButton = (clusterId: string, callback: CreateResourceType['closePopup']) => () => (
    <CreateResourceButton closeModal={callback} clusterId={clusterId} />
)

export const NewClusterButton = ({
    handleReloadClusterList,
    clusterCount,
}: Pick<CreateClusterProps, 'handleReloadClusterList'> & { clusterCount: number }) => {
    const { replace } = useHistory()
    const { isSuperAdmin, licenseData } = useMainContext()
    const isFreemium = licenseData?.isFreemium ?? false
    const isClusterAdditionAllowed = !isFreemium || clusterCount < licenseData?.moduleLimits?.maxAllowedClusters

    const [showUpgradeToEnterprise, setShowUpgradeToEnterprise] = useState(false)

    const handleOpenUpgradeDialog = () => {
        setShowUpgradeToEnterprise(true)
    }

    const handleCloseUpgradeDialog = () => {
        setShowUpgradeToEnterprise(false)
    }

    const handleCloseCreateClusterModal = () => {
        replace(COMMON_URLS.INFRASTRUCTURE_MANAGEMENT_RESOURCE_BROWSER)
    }

    return (
        isSuperAdmin && (
            <>
                <div>
                    <Button
                        dataTestId="add_cluster_button"
                        text="New Cluster"
                        size={ComponentSizeType.small}
                        startIcon={<Add />}
                        {...(isClusterAdditionAllowed
                            ? {
                                  component: ButtonComponentType.link,
                                  linkProps: {
                                      to: generatePath(URLS.RESOURCE_BROWSER_CREATE_CLUSTER, {
                                          type: CreateClusterTypeEnum.CONNECT_CLUSTER,
                                      }),
                                  },
                              }
                            : {
                                  component: ButtonComponentType.button,
                                  onClick: handleOpenUpgradeDialog,
                              })}
                    />
                    <span className="dc__divider" />
                </div>

                {isClusterAdditionAllowed && (
                    <Route path={URLS.RESOURCE_BROWSER_CREATE_CLUSTER} exact>
                        <CreateCluster
                            handleReloadClusterList={handleReloadClusterList}
                            handleRedirectOnModalClose={handleCloseCreateClusterModal}
                        />
                    </Route>
                )}

                <UpgradeToEnterpriseDialog open={showUpgradeToEnterprise} handleClose={handleCloseUpgradeDialog} />
            </>
        )
    )
}

export const renderNewClusterButton = (handleReloadClusterList: () => void, clusterCount: number) => () => (
    <NewClusterButton handleReloadClusterList={handleReloadClusterList} clusterCount={clusterCount} />
)
