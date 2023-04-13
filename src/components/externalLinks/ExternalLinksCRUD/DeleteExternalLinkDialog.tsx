import React from 'react'
import { toast } from 'react-toastify'
import { showError, DeleteDialog } from '@devtron-labs/devtron-fe-common-lib'
import { deleteExternalLink, getExternalLinks } from '../ExternalLinks.service'
import { DeleteExternalLinkType, ExternalLinkIdentifierType, ExternalLinkScopeType } from '../ExternalLinks.type'
import { sortByUpdatedOn } from '../ExternalLinks.utils'

export default function DeleteExternalLinkDialog({
    appId,
    isAppConfigView,
    selectedLink,
    isAPICallInProgress,
    setAPICallInProgress,
    setExternalLinks,
    setShowDeleteConfirmation,
}: DeleteExternalLinkType): JSX.Element {
    const deleteLink = async (): Promise<void> => {
        try {
            setAPICallInProgress(true)
            const { result } = await deleteExternalLink(selectedLink.id, isAppConfigView ? appId : '')

            if (result?.success) {
                toast.success('Deleted successfully!')

                if (isAppConfigView) {
                    const { result } = await getExternalLinks(0, appId, ExternalLinkIdentifierType.DevtronApp)
                    setExternalLinks(
                        result?.ExternalLinks?.filter(
                            (_link) => _link.isEditable && _link.type === ExternalLinkScopeType.AppLevel,
                        ).sort(sortByUpdatedOn) || [],
                    )
                } else {
                    const { result } = await getExternalLinks()
                    setExternalLinks(result?.ExternalLinks?.sort(sortByUpdatedOn) || [])
                }
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
