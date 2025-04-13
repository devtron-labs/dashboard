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

import { IndexStore, showError, ToastManager, ToastVariantType } from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as Close } from '@Icons/ic-cross.svg'

import { deleteEphemeralUrl } from './nodeDetail.api'
import { DeleteEphemeralButtonType, ParamsType, ResponsePayload } from './nodeDetail.type'

import '../k8resources.scss'

export const DeleteEphemeralButton = ({
    containerName,
    isResourceBrowserView,
    selectedNamespace,
    selectedClusterId,
    selectedPodName,
    switchSelectedContainer,
    setContainers,
    containers,
    isExternal,
}: DeleteEphemeralButtonType) => {
    const params = useParams<ParamsType>()
    const { clusterId, environmentId, namespace, appName, appId, appType, fluxTemplateType } =
        IndexStore.getAppDetails()

    const getPayload = () => {
        const payload: ResponsePayload = {
            namespace: selectedNamespace,
            clusterId: selectedClusterId,
            podName: selectedPodName,
            basicData: {
                containerName,
            },
        }
        return payload
    }

    const deleteEphemeralContainer = async () => {
        try {
            const { result } = await deleteEphemeralUrl({
                requestData: getPayload(),
                clusterId,
                environmentId,
                namespace,
                appName,
                appId,
                appType,
                fluxTemplateType,
                isResourceBrowserView,
                params,
            })

            const updatedContainers = containers.filter((con) => con.name !== result) || []
            switchSelectedContainer(updatedContainers[0].name || '')
            setContainers(updatedContainers)
            ToastManager.showToast({
                variant: ToastVariantType.success,
                description: 'Deleted successfully',
            })
        } catch (error) {
            showError(error)
        }
    }

    return (
        // Not using button component from devtron-fe-common-lib due to icon size visibility issue
        <button
            onClick={deleteEphemeralContainer}
            type="button"
            aria-label="delete-button"
            className="ephemeral-delete-button dc__unset-button-styles"
            disabled={!!isExternal}
            data-testid="ephemeral-delete-button"
        >
            <Close className="icon-dim-16 dc__hover-color-r500--fill" />
        </button>
    )
}
