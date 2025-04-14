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

import { useParams } from 'react-router-dom'
import {
    API_STATUS_CODES,
    BaseURLParams,
    DeleteConfirmationModal,
    ServerError,
    showError,
} from '@devtron-labs/devtron-fe-common-lib'
import { DeleteComponentsName } from '@Config/constantMessaging'
import { DeleteOverrideDialogProps } from './types'
import { deleteOverrideDeploymentTemplate } from './service'

const DeleteOverrideDialog = ({
    environmentConfigId,
    handleReload,
    handleClose,
    handleProtectionError,
    reloadEnvironments,
    isTemplateView,
    environmentName,
}: DeleteOverrideDialogProps) => {
    const { appId, envId } = useParams<BaseURLParams>()

    const handleDelete = async () => {
        await deleteOverrideDeploymentTemplate({
            id: environmentConfigId,
            appId: Number(appId),
            envId: Number(envId),
            isTemplateView,
        })
        handleReload()
    }

    const handleError = (error: ServerError) => {
        showError(error)
        if (error.code === API_STATUS_CODES.LOCKED) {
            handleProtectionError()
            reloadEnvironments()
        }
    }

    return (
        <DeleteConfirmationModal
            title={environmentName}
            component={`${DeleteComponentsName.Override} for environment`}
            subtitle="This action will result in the removal of all overrides, and the original base configurations for this file will be reinstated."
            onDelete={handleDelete}
            successToastMessage="Restored to global"
            closeConfirmationModal={handleClose}
            onError={handleError}
            primaryButtonText="Delete Override"
        />
    )
}

export default DeleteOverrideDialog
