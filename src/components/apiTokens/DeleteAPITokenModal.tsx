import React, { useState } from 'react'
import { useHistory, useRouteMatch } from 'react-router-dom'
import { toast } from 'react-toastify'
import { DeleteDialog, showError } from '../common'
import { deleteUser } from '../userGroups/userGroup.service'
import { deleteGeneratedAPIToken } from './service'

const DeleteAPITokenModal = ({
    isEditView,
    tokenData,
    reload,
    setDeleteConfirmation,
}: {
    tokenData
    reload: () => void
    setDeleteConfirmation
    isEditView?: boolean
}) => {
    const history = useHistory()
    const match = useRouteMatch()
    const [apiCallInProgress, setApiCallInProgress] = useState(false)

    const deleteToken = async () => {
        setApiCallInProgress(true)

        try {
            const { result } = await deleteGeneratedAPIToken(tokenData.id)

            if (result) {
                toast.success('Deleted successfully')
                reload()

                if (isEditView) {
                    history.push(`${match.path.split('edit')[0]}list`)
                }
            }
        } catch (error) {
            showError(error)
        } finally {
            setApiCallInProgress(false)
        }
    }

    return (
        <DeleteDialog
            title={`Delete API token '${tokenData.name}'?`}
            delete={deleteToken}
            closeDelete={() => {
                setDeleteConfirmation(false)
            }}
            apiCallInProgress={apiCallInProgress}
        >
            <DeleteDialog.Description>
                {tokenData.description && (
                    <p className="fs-14 cn-7 lh-20 bcn-1 p-16 br-4 break-word">
                        {tokenData.description && <span className="fw-6">Token description:</span>}
                        <br />
                        <span>{tokenData.description}</span>
                    </p>
                )}
                <p className="fs-14 cn-7 lh-20">
                    Any applications or scripts using this token will no longer be able to access the Devtron API.
                </p>
                <p className="fs-14 cn-7 lh-20">
                    You cannot undo this action. Are you sure you want to delete this token?
                </p>
            </DeleteDialog.Description>
        </DeleteDialog>
    )
}

export default DeleteAPITokenModal
