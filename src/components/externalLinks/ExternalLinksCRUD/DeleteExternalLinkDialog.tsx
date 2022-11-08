import React from 'react'
import { toast } from 'react-toastify'
import { DeleteDialog, showError } from '../../common'
import { deleteExternalLink, getExternalLinks } from '../ExternalLinks.service'
import { DeleteExternalLinkType } from '../ExternalLinks.type'
import { sortByUpdatedOn } from '../ExternalLinks.utils'

export default function DeleteExternalLinkDialog({
    selectedLink,
    isAPICallInProgress,
    setAPICallInProgress,
    setExternalLinks,
    setShowDeleteConfirmation,
}: DeleteExternalLinkType): JSX.Element {
    const deleteLink = async (): Promise<void> => {
        try {
            setAPICallInProgress(true)
            const { result } = await deleteExternalLink(selectedLink.id)

            if (result?.success) {
                toast.success('Deleted successfully!')

                const { result } = await getExternalLinks()
                setExternalLinks(result?.sort(sortByUpdatedOn) || [])
            }
        } catch (e) {
            showError(e)
        } finally {
            setAPICallInProgress(false)
            setShowDeleteConfirmation(false)
        }
    }

    return (
        <DeleteDialog
            title={`Delete external link "${selectedLink.name}"`}
            delete={deleteLink}
            closeDelete={() => setShowDeleteConfirmation(false)}
            apiCallInProgress={isAPICallInProgress}
        >
            <DeleteDialog.Description>
                <p>{selectedLink.name} links will no longer be shown in applications.</p>
                <p>Are you sure ?</p>
            </DeleteDialog.Description>
        </DeleteDialog>
    )
}
