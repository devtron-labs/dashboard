import React from 'react'
import {
    ErrorScreenNotAuthorized,
    ERROR_EMPTY_SCREEN,
    GenericEmptyState,
    Progressing,
    Reload,
    TOAST_ACCESS_DENIED,
    useAsync,
} from '@devtron-labs/devtron-fe-common-lib'
import { Link, useParams } from 'react-router-dom'
import { API_STATUS_CODES, URLS } from '../../../../config'
import { getUserById } from '../../authorization.service'
import UserForm from './UserForm'
import { getIsAdminOrSystemUser } from '../utils'

const UserPermissionAddEdit = () => {
    const { userId: _userId } = useParams<{ userId: string }>()
    const isAddMode = _userId === 'add'
    const userId = Number(_userId)
    const [isLoading, user, error, reload] = useAsync(() => getUserById(userId), [userId], !isAddMode)

    if (isLoading) {
        return <Progressing pageLoader />
    }

    if ((error && error.code === API_STATUS_CODES.NOT_FOUND) || getIsAdminOrSystemUser(user?.emailId)) {
        const renderNullStateButton = () => (
            <Link to={URLS.GLOBAL_CONFIG_AUTH_USER_PERMISSION} className="cta flex h-32 anchor">
                Go to User Permissions
            </Link>
        )

        return (
            <GenericEmptyState
                title="The requested user doesn't exist"
                classname="flex-grow-1"
                isButtonAvailable
                renderButton={renderNullStateButton}
            />
        )
    }
    if (error) {
        if ([API_STATUS_CODES.PERMISSION_DENIED, API_STATUS_CODES.UNAUTHORIZED].includes(error.code)) {
            return (
                <ErrorScreenNotAuthorized
                    subtitle={ERROR_EMPTY_SCREEN.REQUIRED_MANAGER_ACCESS}
                    title={TOAST_ACCESS_DENIED.TITLE}
                />
            )
        }
        return <Reload reload={reload} />
    }

    return <UserForm isAddMode={isAddMode} userData={user} />
}

export default UserPermissionAddEdit
