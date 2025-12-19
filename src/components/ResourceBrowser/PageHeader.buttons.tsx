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

import { Button, ComponentSizeType, handleAnalyticsEvent, useMainContext } from '@devtron-labs/devtron-fe-common-lib'

import { CreateClusterProps } from '@Pages/GlobalConfigurations/ClustersAndEnvironments/CreateCluster/types'
import { AddClusterButton } from '@Pages/Shared/AddEditCluster'

import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
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
    const { isSuperAdmin } = useMainContext()

    return (
        !!isSuperAdmin && (
            <div>
                <AddClusterButton clusterCount={clusterCount} handleReloadClusterList={handleReloadClusterList} />
                <span className="dc__divider" />
            </div>
        )
    )
}

export const renderNewClusterButton = (handleReloadClusterList: () => void, clusterCount: number) => () => (
    <NewClusterButton handleReloadClusterList={handleReloadClusterList} clusterCount={clusterCount} />
)
