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

import { useHistory, useRouteMatch } from 'react-router-dom'

import { DeleteConfirmationModal } from '@devtron-labs/devtron-fe-common-lib'

import { DeleteComponentsName } from '@Config/constantMessaging'

import { DeleteAPITokenModalProps } from './apiToken.type'
import { deleteGeneratedAPIToken } from './service'

const DeleteAPITokenModal = ({ isEditView, tokenData, reload, setDeleteConfirmation }: DeleteAPITokenModalProps) => {
    const match = useRouteMatch()
    const history = useHistory()

    const onDelete = async () => {
        await deleteGeneratedAPIToken(tokenData.id.toString())
        reload()
        if (isEditView) {
            history.push(`${match.path.split('edit')[0]}list`)
        }
    }

    const renderDescriptionContent = () => (
        <>
            {tokenData.description && (
                <p className="fs-14 cn-7 lh-20 bcn-1 p-16 br-4 dc__break-word m-0">
                    {tokenData.description && <span className="fw-6">Token description:</span>}
                    <br />
                    <span>{tokenData.description}</span>
                </p>
            )}

            <p className="fs-14 cn-7 lh-20 m-0">
                Any applications or scripts using this token will no longer be able to access the Devtron API.
            </p>
            <p className="fs-14 cn-7 lh-20 m-0">
                You cannot undo this action. Are you sure you want to delete this token?
            </p>
        </>
    )

    const closeDeleteConfirmationModal = () => setDeleteConfirmation(false)

    return (
        <DeleteConfirmationModal
            title={tokenData.name}
            subtitle={renderDescriptionContent()}
            component={DeleteComponentsName.API_TOKEN}
            onDelete={onDelete}
            closeConfirmationModal={closeDeleteConfirmationModal}
        />
    )
}

export default DeleteAPITokenModal
