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

import { DELETE_ACTION } from '@Config/constants'
import { ApplicationDeletionInfo } from '@Pages/Shared/ApplicationDeletionInfo/ApplicationDeletionInfo'
import { ConfirmationModal, ConfirmationModalVariantType } from '@devtron-labs/devtron-fe-common-lib'
import { DeleteChartDialogProps } from './ChartValuesView.type'

export const DeleteChartDialog = ({
    appName,
    handleDelete,
    toggleConfirmation,
    isCreateValueView,
    disableButton,
}: DeleteChartDialogProps) => {
    const closeConfirmation = () => {
        toggleConfirmation(false)
    }
    const onClickDelete = async () => {
        await handleDelete(DELETE_ACTION.DELETE)
    }

    return (
        // Using Confirmation modal instead of DeleteConfirmation as handleForceDelete function is handling multiple actions in error case
        <ConfirmationModal
            title={`Delete chart '${appName}' ?`}
            variant={ConfirmationModalVariantType.delete}
            buttonConfig={{
                secondaryButtonConfig: {
                    text: 'Cancel',
                    onClick: closeConfirmation,
                },
                primaryButtonConfig: {
                    text: 'Delete',
                    onClick: onClickDelete,
                    isLoading: disableButton,
                    disabled: disableButton,
                },
            }}
            subtitle={<ApplicationDeletionInfo isPresetValue={isCreateValueView} />}
            handleClose={closeConfirmation}
        />
    )
}
