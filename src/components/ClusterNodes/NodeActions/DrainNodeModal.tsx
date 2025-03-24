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
    ToastVariantType,
    ToastManager,
    drainNodeCapacity,
    DRAIN_NODE_MODAL_MESSAGING,
    NodeDrainRequest,
    ConfirmationModal,
    ButtonStyleType,
    ConfirmationModalVariantType,
    NodeDrainOptions,
} from '@devtron-labs/devtron-fe-common-lib'
import { useParams } from 'react-router-dom'
import { NodeActionModalPropType } from '../types'

const DrainNodeModal = ({ name, version, kind, closePopup }: NodeActionModalPropType) => {
    const { clusterId } = useParams<{ clusterId: string }>()
    const [nodeDrainOptions, setNodeDrainOptions] = useState<NodeDrainRequest['nodeDrainOptions']>({
        gracePeriodSeconds: -1,
        deleteEmptyDirData: false,
        disableEviction: false,
        force: false,
        ignoreAllDaemonSets: false,
    })
    const [apiCallInProgress, setAPICallInProgress] = useState(false)

    const onClose = (): void => {
        closePopup()
    }

    const { DrainIcon } = DRAIN_NODE_MODAL_MESSAGING

    const drainAPI = async () => {
        try {
            setAPICallInProgress(true)
            const payload = {
                clusterId: Number(clusterId),
                name,
                version,
                kind,
                nodeDrainOptions,
            }
            await drainNodeCapacity(payload)
            ToastManager.showToast({
                variant: ToastVariantType.success,
                description: DRAIN_NODE_MODAL_MESSAGING.Actions.draining,
            })
            closePopup(true)
        } catch (err) {
            showError(err)
        } finally {
            setAPICallInProgress(false)
        }
    }

    return (
        <ConfirmationModal
            handleClose={onClose}
            variant={ConfirmationModalVariantType.custom}
            Icon={<DrainIcon className="scr-5" />}
            title={`${DRAIN_NODE_MODAL_MESSAGING.Actions.drain} ‘${name}’ ?`}
            subtitle={DRAIN_NODE_MODAL_MESSAGING.Actions.infoText}
            buttonConfig={{
                primaryButtonConfig: {
                    text: DRAIN_NODE_MODAL_MESSAGING.Actions.drain,
                    onClick: drainAPI,
                    isLoading: apiCallInProgress,
                    style: ButtonStyleType.negative,
                },
                secondaryButtonConfig: {
                    text: DRAIN_NODE_MODAL_MESSAGING.Actions.cancel,
                    onClick: onClose,
                    disabled: apiCallInProgress,
                },
            }}
        >
            <NodeDrainOptions optionsData={nodeDrainOptions} setOptionsData={setNodeDrainOptions} />
        </ConfirmationModal>
    )
}

export default DrainNodeModal
