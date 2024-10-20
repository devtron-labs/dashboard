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
import { useHistory, useRouteMatch } from 'react-router-dom'
import { showError, DeleteDialog, ToastManager, ToastVariantType } from '@devtron-labs/devtron-fe-common-lib'
import { deleteGeneratedAPIToken } from './service'

const DeleteAPITokenModal = ({
    isEditView,
    tokenData,
    reload,
    setDeleteConfirmation,
}: {
    tokenData
    reload: () => void
    setDeleteConfirmation
    isEditView?: boolean
}) => {
    const history = useHistory()
    const match = useRouteMatch()
    const [apiCallInProgress, setApiCallInProgress] = useState(false)

    const deleteToken = async () => {
        setApiCallInProgress(true)

        try {
            const { result } = await deleteGeneratedAPIToken(tokenData.id)

            if (result) {
                ToastManager.showToast({
                    variant: ToastVariantType.success,
                    description: 'Deleted successfully',
                })
                reload()

                if (isEditView) {
                    history.push(`${match.path.split('edit')[0]}list`)
                }
            }
        } catch (error) {
            showError(error)
        } finally {
            setApiCallInProgress(false)
        }
    }

    return (
        <DeleteDialog
            dataTestId="delete-api-token-modal"
            title={`Delete API token '${tokenData.name}'?`}
            delete={deleteToken}
            closeDelete={() => {
                setDeleteConfirmation(false)
            }}
            apiCallInProgress={apiCallInProgress}
        >
            <DeleteDialog.Description>
                {tokenData.description && (
                    <p className="fs-14 cn-7 lh-20 bcn-1 p-16 br-4 dc__break-word">
                        {tokenData.description && <span className="fw-6">Token description:</span>}
                        <br />
                        <span>{tokenData.description}</span>
                    </p>
                )}
                <p className="fs-14 cn-7 lh-20">
                    Any applications or scripts using this token will no longer be able to access the Devtron API.
                </p>
                <p className="fs-14 cn-7 lh-20">
                    You cannot undo this action. Are you sure you want to delete this token?
                </p>
            </DeleteDialog.Description>
        </DeleteDialog>
    )
}

export default DeleteAPITokenModal
