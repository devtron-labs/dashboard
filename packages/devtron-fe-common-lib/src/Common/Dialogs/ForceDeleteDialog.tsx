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

import React from 'react'
import { ForceDeleteDialogType } from './Types'
import { DeleteDialog } from './DeleteDialog'

export default function ForceDeleteDialog({
    onClickDelete,
    closeDeleteModal,
    forceDeleteDialogTitle,
    forceDeleteDialogMessage,
}: ForceDeleteDialogType) {
    return (
        <div>
            <DeleteDialog
                title={forceDeleteDialogTitle}
                delete={onClickDelete}
                closeDelete={closeDeleteModal}
                deletePrefix="Force "
            >
                <DeleteDialog.Description>
                    <p className="mt-12 mb-12 p-8 dc__break-word dc__window-bg">Error: {forceDeleteDialogMessage}</p>
                    <p>Do you want to force delete?</p>
                </DeleteDialog.Description>
            </DeleteDialog>
        </div>
    )
}
