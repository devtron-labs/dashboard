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
    showError,
    noop,
    ToastManager,
    ToastVariantType,
    ResourceListPayloadType,
    deleteResource,
    ConfirmationModal,
    ConfirmationModalVariantType,
    ForceDeleteOption,
} from '@devtron-labs/devtron-fe-common-lib'
import { useHistory } from 'react-router-dom'
import { DeleteResourcePopupType } from '../Types'

const DeleteResourcePopup: React.FC<DeleteResourcePopupType> = ({
    clusterId,
    resourceData,
    selectedResource,
    getResourceListData,
    toggleDeleteDialog,
    removeTabByIdentifier,
    handleClearBulkSelection,
}) => {
    const { push } = useHistory()
    const [apiCallInProgress, setApiCallInProgress] = useState(false)
    const [forceDelete, setForceDelete] = useState(false)

    const handleDelete = async (): Promise<void> => {
        try {
            setApiCallInProgress(true)
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
            ToastManager.showToast({
                variant: ToastVariantType.success,
                description: 'Resource deleted successfully',
            })
            await getResourceListData()
            handleClearBulkSelection()
            toggleDeleteDialog()
            if (removeTabByIdentifier) {
                removeTabByIdentifier(
                    `${selectedResource?.gvk?.Kind.toLowerCase()}_${resourceData.namespace}/${resourceData.name}`,
                )
                    .then((url) => url && push(url))
                    .catch(noop)
            }
        } catch (err) {
            showError(err)
        } finally {
            setApiCallInProgress(false)
        }
    }

    return (
        <ConfirmationModal
            title={`Delete ${selectedResource.gvk.Kind} '${resourceData.name}'?`}
            variant={ConfirmationModalVariantType.delete}
            subtitle="Are you sure, you want to delete this resource?"
            handleClose={toggleDeleteDialog}
            confirmationConfig={{
                confirmationKeyword: resourceData.name as string,
                identifier: 'delete-resource-confirmation',
            }}
            buttonConfig={{
                primaryButtonConfig: {
                    onClick: handleDelete,
                    isLoading: apiCallInProgress,
                    text: 'Delete',
                },
                secondaryButtonConfig: {
                    onClick: toggleDeleteDialog,
                    disabled: apiCallInProgress,
                    text: 'Cancel',
                },
            }}
            showConfirmationModal
        >
            <ForceDeleteOption optionsData={forceDelete} setOptionsData={setForceDelete} />
        </ConfirmationModal>
    )
}

export default DeleteResourcePopup
