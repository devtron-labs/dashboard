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
    CM_SECRET_STATE,
    CMSecretComponentType,
    DeleteConfirmationModal,
    DraftAction,
    showError,
    ToastManager,
    ToastVariantType,
} from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '@Components/common'
import { DeleteComponentsName } from '@Config/constantMessaging'

import { deleteConfigMap, deleteEnvConfigMap, deleteEnvSecret, deleteSecret } from './ConfigMapSecret.service'
import { CM_SECRET_COMPONENT_NAME, DELETE_OVERRIDE_CONFIG_SUBTITLE } from './constants'
import { ConfigMapSecretDeleteModalProps } from './types'

const DeleteModal = importComponentFromFELibrary('DeleteModal')
const DeleteOverrideDraftModal = importComponentFromFELibrary('DeleteOverrideDraftModal')
const ExpressDeleteDraftModal = importComponentFromFELibrary('ExpressDeleteDraftModal', null, 'function')

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
    isExceptionUser,
}: ConfigMapSecretDeleteModalProps) => {
    // STATES
    const [isExpressDeleting, setIsExpressDeleting] = useState<boolean>(false)

    // CONSTANTS
    const isDeleteOverride = cmSecretStateLabel === CM_SECRET_STATE.OVERRIDDEN
    const isSecret = componentType === CMSecretComponentType.Secret

    // METHODS
    const handleDelete = async (isExpressEdit = false) => {
        if (envId) {
            const deleteEnvConfigMapSecretParams = {
                id,
                appId,
                envId,
                name: configName,
                isTemplateView,
                isExpressEdit,
            }
            await (isSecret ? deleteEnvSecret : deleteEnvConfigMap)(deleteEnvConfigMapSecretParams)
        } else {
            const deleteConfigMapSecretParams = { id, appId, name: configName, isTemplateView, isExpressEdit }
            await (isSecret ? deleteSecret : deleteConfigMap)(deleteConfigMapSecretParams)
        }
        updateCMSecret()
    }

    const handleExpressDelete = async () => {
        setIsExpressDeleting(true)
        try {
            await handleDelete(true)
            ToastManager.showToast({
                variant: ToastVariantType.success,
                description: isDeleteOverride && envId ? 'Restored to global' : 'Successfully Deleted',
            })
            closeDeleteModal()
        } catch (err) {
            showError(err)
        } finally {
            setIsExpressDeleting(false)
        }
    }

    const prepareDataToDeleteOverrideDraft = () => ({ id })

    const onError = (err) => handleError(DraftAction.Delete, err)

    if (!openDeleteModal) {
        return null
    }

    if (openDeleteModal === 'protectedDeleteModal') {
        if (isDeleteOverride) {
            return DeleteOverrideDraftModal ? (
                <DeleteOverrideDraftModal
                    appId={+appId}
                    envId={envId ? +envId : -1}
                    resourceType={componentType}
                    resourceName={configName}
                    prepareDataToSave={prepareDataToDeleteOverrideDraft}
                    handleClose={closeDeleteModal}
                    latestDraft={draftData}
                    reload={updateCMSecret}
                    expressDeleteConfig={{
                        showExpressDelete: isExceptionUser,
                        onClick: handleExpressDelete,
                        isLoading: isExpressDeleting,
                    }}
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
                handleClose={closeDeleteModal}
                reload={updateCMSecret}
                expressDeleteConfig={{
                    showExpressDelete: isExceptionUser,
                    onClick: handleExpressDelete,
                    isLoading: isExpressDeleting,
                }}
            />
        ) : null
    }

    if (openDeleteModal === 'expressDeleteDraft') {
        return ExpressDeleteDraftModal ? (
            <ExpressDeleteDraftModal
                isLoading={isExpressDeleting}
                handleDelete={handleExpressDelete}
                handleClose={closeDeleteModal}
                isOverride={cmSecretStateLabel === CM_SECRET_STATE.OVERRIDDEN}
            />
        ) : null
    }

    return (
        <DeleteConfirmationModal
            title={configName}
            component={isDeleteOverride ? DeleteComponentsName.Override : CM_SECRET_COMPONENT_NAME[componentType]}
            subtitle={
                isDeleteOverride
                    ? DELETE_OVERRIDE_CONFIG_SUBTITLE
                    : `'${configName}' will not be used in future deployments. Are you sure?`
            }
            onDelete={handleDelete}
            successToastMessage={isDeleteOverride && envId ? 'Restored to global' : 'Successfully Deleted'}
            closeConfirmationModal={closeDeleteModal}
            onError={onError}
            primaryButtonText={isDeleteOverride ? 'Delete Override' : 'Delete'}
        />
    )
}
