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
    DeleteDialog,
    Checkbox,
    CHECKBOX_VALUE,
    noop,
    ToastManager,
    ToastVariantType,
    ApiQueuingWithBatch,
    usePrompt,
} from '@devtron-labs/devtron-fe-common-lib'
import { Prompt, useHistory } from 'react-router-dom'
import { DEFAULT_ROUTE_PROMPT_MESSAGE } from '@Config/constants'
import { DELETE_MODAL_MESSAGING } from '../Constants'
import { DeleteResourcePopupType, ResourceListPayloadType } from '../Types'
import { deleteResource } from '../ResourceBrowser.service'

const DeleteResourcePopup: React.FC<DeleteResourcePopupType> = ({
    clusterId,
    resourceDatas,
    selectedResource,
    getResourceListData,
    toggleDeleteDialog,
    removeTabByIdentifier,
}) => {
    const { push } = useHistory()
    const [apiCallInProgress, setApiCallInProgress] = useState(false)
    const [forceDelete, setForceDelete] = useState(false)

    usePrompt({
        shouldPrompt: apiCallInProgress,
    })

    const handleDelete = async (): Promise<void> => {
        try {
            setApiCallInProgress(true)
            const calls = resourceDatas.map((resourceData) => {
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

                return () => deleteResource(resourceDeletePayload)
            })
            await ApiQueuingWithBatch(calls, true)
            ToastManager.showToast({
                variant: ToastVariantType.success,
                description: 'Resource deleted successfully',
            })
            if (removeTabByIdentifier) {
                resourceDatas.forEach((resourceData) => {
                    removeTabByIdentifier(
                        `${selectedResource?.gvk?.Kind.toLowerCase()}_${resourceData.namespace}/${resourceData.name}`,
                    )
                        .then((url) => url && push(url))
                        .catch(noop)
                })
            }
            await getResourceListData()
            toggleDeleteDialog()
        } catch (err) {
            showError(err)
        } finally {
            setApiCallInProgress(false)
        }
    }

    const forceDeleteHandler = () => {
        setForceDelete((prevState) => !prevState)
    }

    return (
        <>
            <Prompt when={apiCallInProgress} message={DEFAULT_ROUTE_PROMPT_MESSAGE} />
            <DeleteDialog
                title={
                    resourceDatas.length > 1
                        ? `Delete ${resourceDatas.length} ${selectedResource.gvk.Kind}(s)?`
                        : `Delete ${selectedResource.gvk.Kind} "${resourceDatas[0]?.name}"`
                }
                delete={handleDelete}
                closeDelete={toggleDeleteDialog}
                apiCallInProgress={apiCallInProgress}
            >
                <DeleteDialog.Description>
                    <p className="mb-12">{DELETE_MODAL_MESSAGING.description}</p>
                    <Checkbox
                        rootClassName="resource-force-delete"
                        isChecked={forceDelete}
                        value={CHECKBOX_VALUE.CHECKED}
                        disabled={apiCallInProgress}
                        onChange={forceDeleteHandler}
                    >
                        {DELETE_MODAL_MESSAGING.checkboxText}
                    </Checkbox>
                </DeleteDialog.Description>
            </DeleteDialog>
        </>
    )
}

export default DeleteResourcePopup
