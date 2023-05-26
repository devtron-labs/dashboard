import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { showError, Progressing, ConfirmationDialog } from '@devtron-labs/devtron-fe-common-lib'
import CordonIcon from '../../../assets/icons/ic-cordon-medium.svg'
import UncordonIcon from '../../../assets/icons/ic-play-medium.svg'
import { CordonNodeModalType } from '../types'
import { toast } from 'react-toastify'
import { cordonNodeCapacity } from '../clusterNodes.service'
import { CORDON_NODE_MODAL_MESSAGING } from '../constants'

export default function CordonNodeModal({ name, version, kind, unschedulable, closePopup }: CordonNodeModalType) {
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
                name: name,
                version: version,
                kind: kind,
                nodeCordonOptions: {
                    unschedulableDesired: !unschedulable,
                },
            }
            await cordonNodeCapacity(payload)
            toast.success(
                unschedulable
                    ? CORDON_NODE_MODAL_MESSAGING.uncordoning
                    : CORDON_NODE_MODAL_MESSAGING.cordoning,
            )
            closePopup(true)
        } catch (err) {
            showError(err)
        } finally {
            setAPICallInProgress(false)
        }
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
                <button
                    type="button"
                    className="flex cta cancel h-36"
                    disabled={apiCallInProgress}
                    onClick={onClose}
                >
                    {CORDON_NODE_MODAL_MESSAGING.cancel}
                </button>
                <button
                    type="button"
                    className={`flex cta ${unschedulable ? '' : 'delete'} h-36`}
                    disabled={apiCallInProgress}
                    onClick={cordonAPI}
                >
                    {apiCallInProgress ? (
                        <Progressing />
                    ) : unschedulable ? (
                        CORDON_NODE_MODAL_MESSAGING.uncordon
                    ) : (
                        CORDON_NODE_MODAL_MESSAGING.cordon
                    )}
                </button>
            </ConfirmationDialog.ButtonGroup>
        </ConfirmationDialog>
    )
}
