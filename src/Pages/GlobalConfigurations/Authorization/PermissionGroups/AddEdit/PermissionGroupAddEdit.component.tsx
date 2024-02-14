import {
    ErrorScreenNotAuthorized,
    ERROR_EMPTY_SCREEN,
    GenericEmptyState,
    Progressing,
    Reload,
    TOAST_ACCESS_DENIED,
    useAsync,
} from '@devtron-labs/devtron-fe-common-lib'
import React from 'react'
import { Link, useParams } from 'react-router-dom'
import { API_STATUS_CODES, URLS } from '../../../../../config'
import { getPermissionGroupById } from '../../authorization.service'
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

    return <PermissionGroupForm permissionGroup={permissionGroup} isAddMode={isAddMode} />
}

export default PermissionGroupAddEdit
