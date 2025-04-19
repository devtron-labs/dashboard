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
import { useParams } from 'react-router-dom'

import {
    ButtonStyleType,
    ButtonVariantType,
    ConfirmationModal,
    ConfirmationModalProps,
    ConfirmationModalVariantType,
    CORDON_NODE_MODAL_MESSAGING,
    cordonNodeCapacity,
    showError,
    ToastManager,
    ToastVariantType,
} from '@devtron-labs/devtron-fe-common-lib'

import { CordonNodeModalType } from '../types'

const CordonNodeModal = ({ name, version, kind, unschedulable, closePopup }: CordonNodeModalType) => {
    const { clusterId } = useParams<{ clusterId: string }>()
    const [apiCallInProgress, setAPICallInProgress] = useState(false)
    // NOTE: if node is unschedulable it means the node is already cordoned
    const isCordonButton = !unschedulable

    const onClose = (): void => {
        closePopup()
    }

    const cordonAPI = async () => {
        try {
            setAPICallInProgress(true)
            const payload = {
                clusterId: Number(clusterId),
                name,
                version,
                kind,
                nodeCordonOptions: {
                    unschedulableDesired: !unschedulable,
                },
            }
            await cordonNodeCapacity(payload)
            ToastManager.showToast({
                variant: ToastVariantType.success,
                description: unschedulable
                    ? CORDON_NODE_MODAL_MESSAGING.uncordoning
                    : CORDON_NODE_MODAL_MESSAGING.cordoning,
            })
            closePopup(true)
        } catch (err) {
            showError(err)
        } finally {
            setAPICallInProgress(false)
        }
    }

    const { CordonIcon, UncordonIcon } = CORDON_NODE_MODAL_MESSAGING

    const getButtonConfig = (): ConfirmationModalProps['buttonConfig'] => {
        const secondaryButtonConfig = {
            dataTestId: 'cancel-button',
            text: CORDON_NODE_MODAL_MESSAGING.cancel,
            variant: ButtonVariantType.secondary,
            disabled: apiCallInProgress,
            onClick: onClose,
        }
        const commonPrimaryButtonConfig = {
            variant: ButtonVariantType.primary,
            isLoading: apiCallInProgress,
            onClick: cordonAPI,
        }

        if (isCordonButton) {
            return {
                primaryButtonConfig: {
                    text: CORDON_NODE_MODAL_MESSAGING.cordon,
                    style: ButtonStyleType.negative,
                    ...commonPrimaryButtonConfig,
                },
                secondaryButtonConfig,
            } as const
        }

        return {
            primaryButtonConfig: {
                text: CORDON_NODE_MODAL_MESSAGING.uncordon,
                style: ButtonStyleType.default,
                ...commonPrimaryButtonConfig,
            },
            secondaryButtonConfig,
        } as const
    }

    return (
        <ConfirmationModal
            variant={ConfirmationModalVariantType.custom}
            Icon={isCordonButton ? <CordonIcon /> : <UncordonIcon />}
            title={`${CORDON_NODE_MODAL_MESSAGING[isCordonButton ? 'cordon' : 'uncordon']} node '${name}'`}
            handleClose={onClose}
            subtitle={
                isCordonButton
                    ? CORDON_NODE_MODAL_MESSAGING.cordonInfoText
                    : CORDON_NODE_MODAL_MESSAGING.uncordonInfoText
            }
            buttonConfig={getButtonConfig()}
        />
    )
}

export default CordonNodeModal
