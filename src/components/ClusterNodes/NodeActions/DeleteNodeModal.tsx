import React, { useState } from 'react'
import { DeleteDialog, showError } from '../../common'
import InfoColourBar from '../../common/infocolourBar/InfoColourbar'
import { ReactComponent as Help } from '../../../assets/icons/ic-help.svg'
import { DeleteNodeModalProps } from '../types'
import { useParams } from 'react-router-dom'
import { deleteNodeCapacity } from '../clusterNodes.service'
import { toast } from 'react-toastify'

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
            toast.success('Node deletion initiated')
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
                <span className="fw-6">Recommended: </span>Drain the node before deleting it as it may cause disruption
                because of pod deletion.
            </div>
        )
    }

    return (
        <DeleteDialog
            title={`Delete node ‘${nodeData.name}’ ?`}
            delete={deleteAPI}
            closeDelete={toggleShowDeleteNodeDialog}
            deletePostfix=" Node"
            apiCallInProgress={apiCallInProgress}
        >
            <InfoColourBar
                classname="question-bar p-lr-12"
                message={<RecommendedNote />}
                Icon={Help}
                iconClass="fcv-5"
            />
            <DeleteDialog.Description>
                <p className="mt-12 mb-12">Are you sure you want to delete this node?</p>
            </DeleteDialog.Description>
        </DeleteDialog>
    )
}
