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

import { noop } from '@devtron-labs/devtron-fe-common-lib'

import BulkDeleteModal from './BulkDeleteModal'
import BulkSelectionClearConfirmationModal from './BulkSelectionClearConfirmationModal'
import { BulkSelectionModalTypes } from './constants'
import { BulkSelectionModalProps } from './types'

const BulkSelectionModal = ({
    type,
    refetchList,
    urlFilters,
    selectedIdentifiersCount,
    setBulkSelectionModalConfig,
    onSuccess = noop,
    onCancel = noop,
    entityType,
}: BulkSelectionModalProps) => {
    const handleClose = () => {
        setBulkSelectionModalConfig(null)
        onCancel()
    }

    switch (type) {
        case BulkSelectionModalTypes.deleteConfirmation:
            return (
                <BulkDeleteModal
                    onClose={handleClose}
                    selectedIdentifiersCount={selectedIdentifiersCount}
                    refetchList={refetchList}
                    urlFilters={urlFilters}
                    entityType={entityType}
                />
            )
        case BulkSelectionModalTypes.selectAllAcrossPages:
        case BulkSelectionModalTypes.clearAllAcrossPages:
            return <BulkSelectionClearConfirmationModal type={type} onClose={handleClose} onSubmit={onSuccess} />
        default:
            throw new Error(`Unknown type ${type}`)
    }
}

export default BulkSelectionModal
