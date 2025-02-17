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

import {
    USER_PERMISSION_DELETE_CONFIRMATION_MESSAGE,
    DeleteComponentsName,
    USER_PERMISSION_GROUP_DELETE_CONFIRMATION_MESSAGE,
} from '@Config/constantMessaging'
import { DeleteConfirmationModal } from '@devtron-labs/devtron-fe-common-lib'
import { DeleteUserPermissionProps } from '../types'

export const DeleteUserPermission = ({
    title,
    onDelete,
    showConfirmationModal,
    closeConfirmationModal,
    isUserGroup,
}: DeleteUserPermissionProps) => (
    <DeleteConfirmationModal
        title={title}
        subtitle={
            isUserGroup
                ? USER_PERMISSION_GROUP_DELETE_CONFIRMATION_MESSAGE
                : USER_PERMISSION_DELETE_CONFIRMATION_MESSAGE
        }
        component={isUserGroup ? DeleteComponentsName.GROUP : DeleteComponentsName.USER}
        onDelete={onDelete}
        showConfirmationModal={showConfirmationModal}
        closeConfirmationModal={closeConfirmationModal}
        successToastMessage={isUserGroup ? 'Group deleted successfully' : 'User Deleted successfully'}
    />
)
