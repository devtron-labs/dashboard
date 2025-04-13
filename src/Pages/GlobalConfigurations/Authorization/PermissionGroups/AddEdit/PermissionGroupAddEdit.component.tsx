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

import { Link, useParams } from 'react-router-dom'

import {
    ERROR_EMPTY_SCREEN,
    ErrorScreenNotAuthorized,
    GenericEmptyState,
    Progressing,
    Reload,
    TOAST_ACCESS_DENIED,
    useAsync,
} from '@devtron-labs/devtron-fe-common-lib'

import { API_STATUS_CODES, URLS } from '../../../../../config'
import { getPermissionGroupById } from '../../authorization.service'
import { PermissionConfigurationFormProvider } from '../../Shared/components/PermissionConfigurationForm'
import PermissionGroupForm from './PermissionGroupForm'

const PermissionGroupAddEdit = () => {
    const { groupId: _groupId } = useParams<{ groupId: string }>()
    const isAddMode = _groupId === 'add'
    const groupId = Number(_groupId)

    const [isLoading, permissionGroup, error, reload] = useAsync(
        () => getPermissionGroupById(groupId),
        [groupId],
        !isAddMode,
    )

    if (isLoading) {
        return <Progressing pageLoader />
    }

    if (error) {
        if (error.code === API_STATUS_CODES.NOT_FOUND) {
            const renderNullStateButton = () => (
                <Link to={URLS.GLOBAL_CONFIG_AUTH_PERMISSION_GROUPS} className="cta flex h-32 anchor">
                    Go to Permission Groups
                </Link>
            )

            return (
                <GenericEmptyState
                    title="The requested permission group doesn't exist"
                    classname="flex-grow-1"
                    isButtonAvailable
                    renderButton={renderNullStateButton}
                />
            )
        }
        if (error.code === API_STATUS_CODES.PERMISSION_DENIED) {
            return (
                <ErrorScreenNotAuthorized
                    subtitle={ERROR_EMPTY_SCREEN.REQUIRED_MANAGER_ACCESS}
                    title={TOAST_ACCESS_DENIED.TITLE}
                />
            )
        }
        return <Reload reload={reload} />
    }

    return (
        <PermissionConfigurationFormProvider data={permissionGroup} showStatus={false}>
            <PermissionGroupForm isAddMode={isAddMode} />
        </PermissionConfigurationFormProvider>
    )
}

export default PermissionGroupAddEdit
