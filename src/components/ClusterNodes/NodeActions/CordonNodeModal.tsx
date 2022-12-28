import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { ConfirmationDialog, Progressing, showError } from '../../common'
import CubeIcon from '../../../assets/icons/ic-cube-line.svg'
import { CordonNodeModalProps } from '../types'
import { toast } from 'react-toastify'
import { cordonNodeCapacity } from '../clusterNodes.service'

export default function CordonNodeModal({ nodeData, toggleShowCordonNodeDialog }: CordonNodeModalProps) {
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
                    unschedulableDesired: false,
                },
            }
            // await cordonNodeCapacity(payload)
            toast.success('Cordoning node')
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
            <ConfirmationDialog.Body title={`Cordon node ‘${nodeData.name}’ ?`} />
            <p className="fs-14 fw-4 lh-20">Cordoning this node will mark this node as unschedulable.</p>
            <br />
            <p className="fs-14 fw-4 lh-20">
                By cordoning a node, you can be sure that no new pods will be scheduled on this node.
            </p>
            <ConfirmationDialog.ButtonGroup>
                <button
                    type="button"
                    className="flex cta cancel h-36"
                    disabled={apiCallInProgress}
                    onClick={toggleShowCordonNodeDialog}
                >
                    Cancel
                </button>
                <button type="button" className="flex cta delete h-36" disabled={apiCallInProgress} onClick={cordonAPI}>
                    {apiCallInProgress ? <Progressing /> : 'Cordon node'}
                </button>
            </ConfirmationDialog.ButtonGroup>
        </ConfirmationDialog>
    )
}
