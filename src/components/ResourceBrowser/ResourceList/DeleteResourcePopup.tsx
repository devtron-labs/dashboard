import React, { useState } from 'react'
import { showError, DeleteDialog, Checkbox, CHECKBOX_VALUE, noop } from '@devtron-labs/devtron-fe-common-lib'
import { toast } from 'react-toastify'
import { useHistory } from 'react-router-dom'
import { DELETE_MODAL_MESSAGING } from '../Constants'
import { DeleteResourcePopupType, ResourceListPayloadType } from '../Types'
import { deleteResource } from '../ResourceBrowser.service'

const DeleteResourcePopup: React.FC<DeleteResourcePopupType> = ({
    clusterId,
    resourceData,
    selectedResource,
    getResourceListData,
    toggleDeleteDialog,
    removeTabByIdentifier,
}) => {
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
                        namespace: String(resourceData.namespace),
                        name: String(resourceData.name),
                    },
                    forceDelete,
                },
            }

            await deleteResource(resourceDeletePayload)
            toast.success('Resource deleted successfully')
            await getResourceListData()
            toggleDeleteDialog()
            if (removeTabByIdentifier) {
                removeTabByIdentifier(
                    `${selectedResource?.gvk?.Kind.toLowerCase()}_${resourceData.namespace}/${resourceData.name}`,
                )
                    .then((url) => url && push(url))
                    .catch(noop)
            }
        } catch (err) {
            showError(err)
        } finally {
            setApiCallInProgress(false)
        }
    }

    const forceDeleteHandler = () => {
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

export default DeleteResourcePopup
