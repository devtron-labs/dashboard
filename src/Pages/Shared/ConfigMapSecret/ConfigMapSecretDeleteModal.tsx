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
    DeleteDialog,
    DraftAction,
    showError,
    ToastManager,
    ToastVariantType,
    CMSecretComponentType,
    CM_SECRET_STATE,
} from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '@Components/common'

import { deleteEnvSecret, deleteEnvConfigMap, deleteSecret, deleteConfigMap } from './ConfigMapSecret.service'
import { CM_SECRET_COMPONENT_NAME } from './constants'
import { ConfigMapSecretDeleteModalProps } from './types'

const DeleteModal = importComponentFromFELibrary('DeleteModal')
const DeleteOverrideDraftModal = importComponentFromFELibrary('DeleteOverrideDraftModal')

export const ConfigMapSecretDeleteModal = ({
    appId,
    envId,
    componentType,
    cmSecretStateLabel,
    id,
    configName,
    openDeleteModal,
    draftData,
    closeDeleteModal,
    updateCMSecret,
    handleError,
    isTemplateView,
}: ConfigMapSecretDeleteModalProps) => {
    // STATES
    const [isDeleting, setIsDeleting] = useState(false)

    // CONSTANTS
    const isDeleteOverride = cmSecretStateLabel === CM_SECRET_STATE.OVERRIDDEN
    const isSecret = componentType === CMSecretComponentType.Secret

    // METHODS
    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            if (envId) {
                const deleteEnvConfigMapSecretParams = { id, appId, envId, name: configName }
                await (isSecret ? deleteEnvSecret : deleteEnvConfigMap)(deleteEnvConfigMapSecretParams)

                ToastManager.showToast({
                    variant: ToastVariantType.success,
                    description: isDeleteOverride ? 'Restored to global.' : 'Successfully Deleted',
                })
            } else {
                const deleteConfigMapSecretParams = { id, appId, name: configName, isTemplateView }
                await (isSecret ? deleteSecret : deleteConfigMap)(deleteConfigMapSecretParams)

                ToastManager.showToast({
                    variant: ToastVariantType.success,
                    description: 'Successfully deleted',
                })
            }

            setIsDeleting(false)
            updateCMSecret()
            closeDeleteModal()
        } catch (err) {
            setIsDeleting(false)
            handleError(DraftAction.Delete, err)
            showError(err)
        }
    }

    const prepareDataToDeleteOverrideDraft = () => ({ id })

    // RENDERERS
    const renderProtectedDeleteModal = () => {
        if (isDeleteOverride) {
            return DeleteOverrideDraftModal ? (
                <DeleteOverrideDraftModal
                    appId={+appId}
                    envId={envId ? +envId : -1}
                    resourceType={componentType}
                    resourceName={configName}
                    prepareDataToSave={prepareDataToDeleteOverrideDraft}
                    toggleModal={closeDeleteModal}
                    latestDraft={draftData}
                    reload={updateCMSecret}
                />
            ) : null
        }

        return DeleteModal ? (
            <DeleteModal
                id={id}
                appId={+appId}
                envId={envId ? +envId : -1}
                resourceType={componentType}
                resourceName={configName}
                latestDraft={draftData}
                toggleModal={closeDeleteModal}
                reload={updateCMSecret}
            />
        ) : null
    }

    const renderDeleteModal = () => (
        <DeleteDialog
            title={
                isDeleteOverride
                    ? 'Delete override ?'
                    : `Delete ${CM_SECRET_COMPONENT_NAME[componentType]} '${configName}' ?`
            }
            description={
                isDeleteOverride
                    ? 'This action will result in the removal of all overrides, and the original base configurations for this file will be reinstated.'
                    : `'${configName}' will not be used in future deployments. Are you sure?`
            }
            closeDelete={closeDeleteModal}
            buttonPrimaryText={`Delete ${isDeleteOverride ? 'override' : ''}`}
            delete={handleDelete}
            apiCallInProgress={isDeleting}
        />
    )

    if (!openDeleteModal) {
        return null
    }

    return openDeleteModal === 'protectedDeleteModal' ? renderProtectedDeleteModal() : renderDeleteModal()
}
