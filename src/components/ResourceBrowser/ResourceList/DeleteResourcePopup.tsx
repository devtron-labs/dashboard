import React, { useState } from 'react'
import { showError, DeleteDialog, Checkbox, CHECKBOX_VALUE } from '@devtron-labs/devtron-fe-common-lib'
import { DELETE_MODAL_MESSAGING } from '../Constants'
import { DeleteResourcePopupType, ResourceListPayloadType } from '../Types'
import { deleteResource } from '../ResourceBrowser.service'
import { toast } from 'react-toastify'
import { useHistory } from 'react-router-dom'

export default function DeleteResourcePopup({
    clusterId,
    resourceData,
    selectedResource,
    getResourceListData,
    toggleDeleteDialog,
    removeTabByIdentifier,
}: DeleteResourcePopupType) {
    const { push } = useHistory()
    const [apiCallInProgress, setApiCallInProgress] = useState(false)
    const [forceDelete, setForceDelete] = useState(false)

    const handleDelete = async (): Promise<void> => {
        try {
            setApiCallInProgress(true)
            const resourceDeletePayload: ResourceListPayloadType = {
                clusterId: Number(clusterId),
                k8sRequest: {
                    resourceIdentifier: {
                        groupVersionKind: selectedResource.gvk,
                        namespace: resourceData.namespace,
                        name: resourceData.name,
                    },
                },
            }

            await deleteResource(resourceDeletePayload)
            toast.success('Resource deleted successfully')
            getResourceListData(true)
            toggleDeleteDialog()
            if (removeTabByIdentifier) {
                const pushURL = removeTabByIdentifier(
                    `${selectedResource?.gvk?.Kind.toLowerCase()}/${resourceData.name}`,
                )
                setTimeout(() => {
                    if (pushURL) {
                        push(pushURL)
                    }
                }, 1)
            }
        } catch (err) {
            showError(err)
        } finally {
            setApiCallInProgress(false)
        }
    }

    const forceDeleteHandler = (e) => {
        setForceDelete((prevState) => !prevState)
    }

    return (
        <DeleteDialog
            title={`Delete ${selectedResource.gvk.Kind} "${resourceData.name}"`}
            delete={handleDelete}
            closeDelete={toggleDeleteDialog}
            apiCallInProgress={apiCallInProgress}
        >
            <DeleteDialog.Description>
                <p className="mb-12">{DELETE_MODAL_MESSAGING.description}</p>
                <Checkbox
                    rootClassName="resource-force-delete"
                    isChecked={forceDelete}
                    value={CHECKBOX_VALUE.CHECKED}
                    disabled={apiCallInProgress}
                    onChange={forceDeleteHandler}
                >
                    {DELETE_MODAL_MESSAGING.checkboxText}
                </Checkbox>
            </DeleteDialog.Description>
        </DeleteDialog>
    )
}
