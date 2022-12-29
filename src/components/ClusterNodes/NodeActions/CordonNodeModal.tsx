import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { ConfirmationDialog, Progressing, showError } from '../../common'
import CubeIcon from '../../../assets/icons/ic-cube-line.svg'
import { CordonNodeModalProps } from '../types'
import { toast } from 'react-toastify'
import { cordonNodeCapacity } from '../clusterNodes.service'
import { CORDON_NODE_MODAL_MESSAGING } from '../constants'

export default function CordonNodeModal({
    nodeData,
    toggleShowCordonNodeDialog,
    getNodeListData,
}: CordonNodeModalProps) {
    const { clusterId } = useParams<{ clusterId: string }>()
    const [apiCallInProgress, setAPICallInProgress] = useState(false)

    const cordonAPI = async () => {
        try {
            const payload = {
                clusterId: Number(clusterId),
                name: nodeData.name,
                version: nodeData.version,
                kind: nodeData.kind,
                nodeCordonHelper: {
                    unschedulableDesired: !nodeData.unschedulable,
                },
            }
            await cordonNodeCapacity(payload)
            toast.success(
                nodeData.unschedulable
                    ? CORDON_NODE_MODAL_MESSAGING.uncordoning
                    : CORDON_NODE_MODAL_MESSAGING.cordoning,
            )
            getNodeListData()
            toggleShowCordonNodeDialog()
        } catch (err) {
            showError(err)
        } finally {
            setAPICallInProgress(false)
        }
    }

    return (
        <ConfirmationDialog className="confirmation-dialog__body--w-400">
            <ConfirmationDialog.Icon src={CubeIcon} />
            <ConfirmationDialog.Body title={`${CORDON_NODE_MODAL_MESSAGING.cordon} ‘${nodeData.name}’ ?`} />
            <p className="fs-14 fw-4 lh-20">{CORDON_NODE_MODAL_MESSAGING.infoText.lineOne}</p>
            <br />
            <p className="fs-14 fw-4 lh-20">{CORDON_NODE_MODAL_MESSAGING.infoText.lineTwo}</p>
            <ConfirmationDialog.ButtonGroup>
                <button
                    type="button"
                    className="flex cta cancel h-36"
                    disabled={apiCallInProgress}
                    onClick={toggleShowCordonNodeDialog}
                >
                    {CORDON_NODE_MODAL_MESSAGING.cancel}
                </button>
                <button type="button" className="flex cta delete h-36" disabled={apiCallInProgress} onClick={cordonAPI}>
                    {apiCallInProgress ? (
                        <Progressing />
                    ) : nodeData.unschedulable ? (
                        CORDON_NODE_MODAL_MESSAGING.uncordon
                    ) : (
                        CORDON_NODE_MODAL_MESSAGING.cordon
                    )}
                </button>
            </ConfirmationDialog.ButtonGroup>
        </ConfirmationDialog>
    )
}
