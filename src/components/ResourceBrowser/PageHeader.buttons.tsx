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
import { NavLink } from 'react-router-dom'
import { Button, ComponentSizeType } from '@devtron-labs/devtron-fe-common-lib'
import { URLS } from '../../config'
import { CreateResource } from './ResourceList/CreateResource'
import { CreateResourceButtonType, CreateResourceType } from './Types'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'

export const CreateResourceButton: React.FC<CreateResourceButtonType> = ({ clusterId, closeModal }) => {
    const [showModal, setShowModal] = useState(false)

    const handleModalOpen = () => setShowModal(true)

    const handleModalClose = () => {
        setShowModal(false)
        closeModal(true)
    }

    return (
        <>
            <Button
                dataTestId="create-resource"
                onClick={handleModalOpen}
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

export const AddClusterButton = (): JSX.Element => (
    <div>
        <NavLink
            className="flex dc__no-decor cta small h-28 pl-8 pr-10 pt-5 pb-5 lh-n fcb-5"
            to={URLS.GLOBAL_CONFIG_CLUSTER}
        >
            <Add data-testid="add_cluster_button" className="icon-dim-16 mr-4 fcb-5 dc__vertical-align-middle" />
            Add cluster
        </NavLink>
        <span className="dc__divider" />
    </div>
)
