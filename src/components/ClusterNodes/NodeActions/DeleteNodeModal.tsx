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

import { useState } from 'react'
import {
    showError,
    DELETE_NODE_MODAL_MESSAGING,
    ToastVariantType,
    ToastManager,
    deleteNodeCapacity,
    ConfirmationModal,
    ConfirmationModalVariantType,
} from '@devtron-labs/devtron-fe-common-lib'
import { useParams } from 'react-router-dom'
import { DeleteNodeModalProps } from '../types'

const DeleteNodeModal = ({ name, version, kind, closePopup, handleClearBulkSelection }: DeleteNodeModalProps) => {
    const { clusterId } = useParams<{ clusterId: string }>()
    const [apiCallInProgress, setAPICallInProgress] = useState(false)

    const onClose = (): void => {
        closePopup()
    }

    const deleteAPI = async () => {
        try {
            setAPICallInProgress(true)
            const payload = {
                clusterId: Number(clusterId),
                name,
                version,
                kind,
            }
            await deleteNodeCapacity(payload)
            ToastManager.showToast({
                variant: ToastVariantType.success,
                description: DELETE_NODE_MODAL_MESSAGING.successInfoToastMessage,
            })
            handleClearBulkSelection()
            closePopup(true)
        } catch (err) {
            showError(err)
        } finally {
            setAPICallInProgress(false)
        }
    }

    return (
        <ConfirmationModal
            variant={ConfirmationModalVariantType.delete}
            title={`Delete node '${name}'?`}
            handleClose={onClose}
            showConfirmationModal
            subtitle={DELETE_NODE_MODAL_MESSAGING.subtitle}
            confirmationConfig={{ confirmationKeyword: name, identifier: 'delete-node-confirmation' }}
            buttonConfig={{
                primaryButtonConfig: {
                    onClick: deleteAPI,
                    isLoading: apiCallInProgress,
                    text: 'Delete node',
                },
                secondaryButtonConfig: {
                    onClick: onClose,
                    disabled: apiCallInProgress,
                    text: 'Cancel',
                },
            }}
        />
    )
}

export default DeleteNodeModal
