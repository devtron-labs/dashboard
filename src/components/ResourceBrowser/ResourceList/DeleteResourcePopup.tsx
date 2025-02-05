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
    Checkbox,
    CHECKBOX_VALUE,
    noop,
    ResourceListPayloadType,
    deleteResource,
    DeleteConfirmationModal,
} from '@devtron-labs/devtron-fe-common-lib'
import { useHistory } from 'react-router-dom'
import { DELETE_MODAL_MESSAGING } from '../Constants'
import { DeleteResourcePopupType } from '../Types'

const DeleteResourcePopup: React.FC<DeleteResourcePopupType> = ({
    clusterId,
    resourceData,
    selectedResource,
    getResourceListData,
    toggleDeleteDialog,
    removeTabByIdentifier,
    showConfirmationModal,
    handleClearBulkSelection,
}) => {
    const { push } = useHistory()
    const [forceDelete, setForceDelete] = useState(false)

    const handleDelete = async (): Promise<void> => {
        const resourceDeletePayload: ResourceListPayloadType = {
            clusterId: Number(clusterId),
            k8sRequest: {
                resourceIdentifier: {
                    groupVersionKind: selectedResource.gvk,
                    namespace: String(resourceData.namespace),
                    name: String(resourceData.name),
                },
                forceDelete,
            },
        }

        await deleteResource(resourceDeletePayload)
        await getResourceListData()
        handleClearBulkSelection()
        if (removeTabByIdentifier) {
            removeTabByIdentifier(
                `${selectedResource?.gvk?.Kind.toLowerCase()}_${resourceData.namespace}/${resourceData.name}`,
            )
                .then((url) => url && push(url))
                .catch(noop)
        }
    }

    const forceDeleteHandler = () => {
        setForceDelete((prevState) => !prevState)
    }

    return (
        <DeleteConfirmationModal
            title={resourceData.name as string}
            component={selectedResource.gvk.Kind}
            subtitle={DELETE_MODAL_MESSAGING.description}
            onDelete={handleDelete}
            showConfirmationModal={showConfirmationModal}
            closeConfirmationModal={toggleDeleteDialog}
            confirmationConfig={{
                identifier: 'delete-resource-pod-input',
                confirmationKeyword: resourceData.name as string,
            }}
            successToastMessage="Resource deleted successfully"
        >
            <Checkbox
                rootClassName="resource-force-delete"
                isChecked={forceDelete}
                value={CHECKBOX_VALUE.CHECKED}
                onChange={forceDeleteHandler}
            >
                {DELETE_MODAL_MESSAGING.checkboxText}
            </Checkbox>
        </DeleteConfirmationModal>
    )
}

export default DeleteResourcePopup
