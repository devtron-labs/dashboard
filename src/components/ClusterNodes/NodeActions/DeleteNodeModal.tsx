import React, { useState } from 'react'
import { DeleteDialog, showError } from '../../common'
import InfoColourBar from '../../common/infocolourBar/InfoColourbar'
import { ReactComponent as Help } from '../../../assets/icons/ic-help.svg'
import { DeleteNodeModalProps } from '../types'
import { useParams } from 'react-router-dom'
import { deleteNodeCapacity } from '../clusterNodes.service'
import { toast } from 'react-toastify'
import { DELETE_NODE_MODAL_MESSAGING } from '../constants'

export default function DeleteNodeModal({
    nodeData,
    toggleShowDeleteNodeDialog,
    getNodeListData,
}: DeleteNodeModalProps) {
    const { clusterId } = useParams<{ clusterId: string }>()
    const [apiCallInProgress, setAPICallInProgress] = useState(false)

    const deleteAPI = async () => {
        try {
            const payload = {
                clusterId: Number(clusterId),
                name: nodeData.name,
                version: nodeData.version,
                kind: nodeData.kind,
            }
            await deleteNodeCapacity(payload)
            toast.success(DELETE_NODE_MODAL_MESSAGING.initiated)
            getNodeListData()
            toggleShowDeleteNodeDialog()
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
            title={`${DELETE_NODE_MODAL_MESSAGING.delete} ‘${nodeData.name}’ ?`}
            delete={deleteAPI}
            closeDelete={toggleShowDeleteNodeDialog}
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
