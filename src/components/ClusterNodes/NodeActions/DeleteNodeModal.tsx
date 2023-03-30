import React, { useState } from 'react'
import { showError, DeleteDialog, InfoColourBar } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as Help } from '../../../assets/icons/ic-help.svg'
import { NodeActionModalPropType } from '../types'
import { useParams } from 'react-router-dom'
import { deleteNodeCapacity } from '../clusterNodes.service'
import { toast } from 'react-toastify'
import { DELETE_NODE_MODAL_MESSAGING } from '../constants'

export default function DeleteNodeModal({ name, version, kind, closePopup }: NodeActionModalPropType) {
    const { clusterId } = useParams<{ clusterId: string }>()
    const [apiCallInProgress, setAPICallInProgress] = useState(false)

    const onClose = (): void => {
        closePopup()
    }

    const deleteAPI = async () => {
        try {
            setAPICallInProgress(true)
            const payload = {
                clusterId: Number(clusterId),
                name: name,
                version: version,
                kind: kind,
            }
            await deleteNodeCapacity(payload)
            toast.success(DELETE_NODE_MODAL_MESSAGING.initiated)
            closePopup(true)
        } catch (err) {
            showError(err)
        } finally {
            setAPICallInProgress(false)
        }
    }

    const RecommendedNote = () => {
        return (
            <div className="fs-13 fw-4 lh-20">
                <span className="fw-6">{DELETE_NODE_MODAL_MESSAGING.recommended}</span>
                {DELETE_NODE_MODAL_MESSAGING.recommendedInfoText}
            </div>
        )
    }

    return (
        <DeleteDialog
            title={`${DELETE_NODE_MODAL_MESSAGING.delete} ‘${name}’ ?`}
            delete={deleteAPI}
            closeDelete={onClose}
            deletePostfix={DELETE_NODE_MODAL_MESSAGING.deletePostfix}
            apiCallInProgress={apiCallInProgress}
        >
            <InfoColourBar
                classname="question-bar p-lr-12"
                message={<RecommendedNote />}
                Icon={Help}
                iconClass="fcv-5"
            />
            <DeleteDialog.Description>
                <p className="mt-12 mb-12">{DELETE_NODE_MODAL_MESSAGING.description}</p>
            </DeleteDialog.Description>
        </DeleteDialog>
    )
}
