/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { showError, DeleteDialog, ToastVariantType, ToastManager } from '@devtron-labs/devtron-fe-common-lib'
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
                 ToastManager.showToast({
                     variant: ToastVariantType.success,
                     description: 'Deleted successfully!',
                 })

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
