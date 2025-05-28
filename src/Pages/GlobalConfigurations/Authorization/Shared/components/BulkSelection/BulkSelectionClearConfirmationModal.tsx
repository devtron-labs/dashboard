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

import { BulkSelectionEvents, ConfirmationDialog } from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as CleanBrush } from '../../../../../../assets/icons/ic-clean-brush-medium.svg'
import { BulkSelectionModalTypes } from './constants'
import { BulkSelectionClearConfirmationModalProps } from './types'
import useAuthorizationBulkSelection from './useAuthorizationBulkSelection'

const config = {
    [BulkSelectionModalTypes.clearAllAcrossPages]: {
        title: 'Selections across all pages will be cleared',
        subTitle: 'Searching or applying a filter will clear selections across all pages.',
        buttonText: 'Clear selections & continue',
    },
    [BulkSelectionModalTypes.selectAllAcrossPages]: {
        title: 'Previous selection will be cleared',
        subTitle: 'Selecting all items across pages will clear previous selections.',
        buttonText: 'Clear previous & select',
    },
} as const

const BulkSelectionClearConfirmationModal = ({ type, onClose, onSubmit }: BulkSelectionClearConfirmationModalProps) => {
    const { title, subTitle, buttonText } = config[type]
    const { handleBulkSelection } = useAuthorizationBulkSelection()

    const handleSubmit = () => {
        if (type === BulkSelectionModalTypes.selectAllAcrossPages) {
            handleBulkSelection({
                action: BulkSelectionEvents.CLEAR_SELECTIONS_AND_SELECT_ALL_ACROSS_PAGES,
            })
        } else {
            handleBulkSelection({
                action: BulkSelectionEvents.CLEAR_ALL_SELECTIONS,
            })
            // Execute the remaining actions
            onSubmit()
        }
        onClose()
    }

    return (
        <ConfirmationDialog className="w-400">
            <CleanBrush className="icon-dim-48" />
            <ConfirmationDialog.Body title={title} subtitle={subTitle} />
            <ConfirmationDialog.ButtonGroup>
                <button type="button" className="cta cancel" onClick={onClose}>
                    Cancel
                </button>
                <button type="submit" className="cta" onClick={handleSubmit}>
                    {buttonText}
                </button>
            </ConfirmationDialog.ButtonGroup>
        </ConfirmationDialog>
    )
}

export default BulkSelectionClearConfirmationModal
