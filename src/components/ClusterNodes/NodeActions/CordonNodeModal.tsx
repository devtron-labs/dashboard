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
    showError,
    Progressing,
    ConfirmationDialog,
    ToastVariantType,
    ToastManager,
    cordonNodeCapacity,
} from '@devtron-labs/devtron-fe-common-lib'
import CordonIcon from '@Icons/ic-medium-pause.svg'
import UncordonIcon from '@Icons/ic-medium-play.svg'
import { CordonNodeModalType } from '../types'
import { CORDON_NODE_MODAL_MESSAGING } from '../constants'

const CordonNodeModal = ({ name, version, kind, unschedulable, closePopup }: CordonNodeModalType) => {
    const { clusterId } = useParams<{ clusterId: string }>()
    const [apiCallInProgress, setAPICallInProgress] = useState(false)

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

    const getButtonText = () => {
        if (apiCallInProgress) {
            return <Progressing />
        }
        return unschedulable ? CORDON_NODE_MODAL_MESSAGING.uncordon : CORDON_NODE_MODAL_MESSAGING.cordon
    }

    return (
        <ConfirmationDialog className="confirmation-dialog__body--w-400">
            {unschedulable ? (
                <>
                    <ConfirmationDialog.Icon src={UncordonIcon} />
                    <ConfirmationDialog.Body title={`${CORDON_NODE_MODAL_MESSAGING.uncordon} ‘${name}’ ?`} />
                    <p className="fs-14 fw-4 lh-20">{CORDON_NODE_MODAL_MESSAGING.uncordonInfoText.lineOne}</p>
                    <br />
                    <p className="fs-14 fw-4 lh-20">{CORDON_NODE_MODAL_MESSAGING.uncordonInfoText.lineTwo}</p>
                </>
            ) : (
                <>
                    <ConfirmationDialog.Icon src={CordonIcon} />
                    <ConfirmationDialog.Body title={`${CORDON_NODE_MODAL_MESSAGING.cordon} ‘${name}’ ?`} />
                    <p className="fs-14 fw-4 lh-20">{CORDON_NODE_MODAL_MESSAGING.cordonInfoText.lineOne}</p>
                    <br />
                    <p className="fs-14 fw-4 lh-20">{CORDON_NODE_MODAL_MESSAGING.cordonInfoText.lineTwo}</p>
                </>
            )}
            <ConfirmationDialog.ButtonGroup>
                <button type="button" className="flex cta cancel h-36" disabled={apiCallInProgress} onClick={onClose}>
                    {CORDON_NODE_MODAL_MESSAGING.cancel}
                </button>
                <button
                    type="button"
                    className={`flex cta ${unschedulable ? '' : 'delete'} h-36`}
                    disabled={apiCallInProgress}
                    onClick={cordonAPI}
                >
                    {getButtonText()}
                </button>
            </ConfirmationDialog.ButtonGroup>
        </ConfirmationDialog>
    )
}

export default CordonNodeModal
