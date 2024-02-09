import React, { useState } from 'react'
import {
    handleUTCTime,
    getRandomColor,
    showError,
    DeleteDialog,
    ConditionalWrap,
    Checkbox,
    CHECKBOX_VALUE,
    BulkSelectionEvents,
} from '@devtron-labs/devtron-fe-common-lib'
import { Link, useRouteMatch } from 'react-router-dom'
import Tippy from '@tippyjs/react'
import { toast } from 'react-toastify'
import moment from 'moment'
import { ReactComponent as Edit } from '../../../../../assets/icons/ic-pencil.svg'
import { ReactComponent as Lock } from '../../../../../assets/icons/ic-locked.svg'
import { ReactComponent as Trash } from '../../../../../assets/icons/ic-delete-interactive.svg'

import { UserPermissionRowProps } from './types'
import { DEFAULT_USER_TOOLTIP_CONTENT } from './constants'
import { getIsAdminOrSystemUser } from '../utils'
import { deleteUser } from '../../authorization.service'
import { importComponentFromFELibrary } from '../../../../../components/common'
import { Moment12HourFormat } from '../../../../../config'
import { LAST_LOGIN_TIME_NULL_STATE } from '../constants'
import { useAuthorizationBulkSelection } from '../../shared/components/BulkSelection'

const StatusCell = importComponentFromFELibrary('StatusCell', null, 'function')

const UserPermissionRow = ({
    id,
    emailId,
    lastLoginTime,
    userStatus,
    timeToLive,
    index,
    showStatus,
    refetchUserPermissionList,
    isChecked = false,
    toggleChecked,
    showCheckbox: _showCheckbox,
}: UserPermissionRowProps) => {
    const { path } = useRouteMatch()
    const isAdminOrSystemUser = getIsAdminOrSystemUser(emailId)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [isModalLoading, setIsModalLoading] = useState(false)
    const { handleBulkSelection, isBulkSelectionApplied } = useAuthorizationBulkSelection()

    const showCheckbox = _showCheckbox || isChecked

    const toggleDeleteModal = () => {
        setIsDeleteModalOpen(!isDeleteModalOpen)
    }

    const handleDelete = async () => {
        setIsModalLoading(true)
        try {
            await deleteUser(id)
            toast.success('User deleted')
            refetchUserPermissionList()
            setIsDeleteModalOpen(false)

            // Clearing the selection on single delete since the selected one might be removed
            if (!isBulkSelectionApplied) {
                handleBulkSelection({
                    action: BulkSelectionEvents.CLEAR_ALL_SELECTIONS,
                })
            }
        } catch (err) {
            showError(err)
        } finally {
            setIsModalLoading(false)
        }
    }

    const handleChecked = () => {
        toggleChecked(id)
    }

    return (
        <>
            <div
                className={`user-permission__row ${
                    showStatus ? 'user-permission__row--with-status' : ''
                } dc__visible-hover dc__visible-hover--parent pl-20 pr-20 ${
                    isChecked && !isAdminOrSystemUser ? 'bc-b50' : ''
                } dc__hover-n50`}
            >
                {/* Note (v2): no checkbox for admin/system */}
                <div className="flex dc__content-start">
                    {(!showCheckbox || isAdminOrSystemUser) && (
                        <span
                            className={`icon-dim-20 mw-20 flex dc__border-radius-50-per dc__uppercase cn-0 fw-4 ${
                                isAdminOrSystemUser ? '' : 'dc__visible-hover--hide-child'
                            }`}
                            style={{
                                backgroundColor: getRandomColor(emailId),
                            }}
                        >
                            {emailId[0]}
                        </span>
                    )}
                    {!isAdminOrSystemUser && (
                        <Checkbox
                            isChecked={isChecked}
                            onChange={handleChecked}
                            rootClassName={`mb-0 ${showCheckbox ? '' : 'dc__visible-hover--child'}`}
                            value={CHECKBOX_VALUE.CHECKED}
                        />
                    )}
                </div>
                {isAdminOrSystemUser ? (
                    <span className="flexbox">
                        <Tippy
                            content={DEFAULT_USER_TOOLTIP_CONTENT[emailId]}
                            className="default-tt w-200"
                            placement="auto"
                            arrow={false}
                        >
                            <span className="dc__ellipsis-right flex dc__content-start dc__gap-4 cn-9">
                                {emailId}
                                <Lock className="icon-dim-14 fcn-6" />
                            </span>
                        </Tippy>
                    </span>
                ) : (
                    <span className="dc__ellipsis-right">
                        <Link className="anchor dc__ellipsis-right" to={`${path}/${id}`}>
                            {emailId}
                        </Link>
                    </span>
                )}
                <ConditionalWrap
                    condition={lastLoginTime !== LAST_LOGIN_TIME_NULL_STATE}
                    wrap={(child) => (
                        <Tippy
                            content={moment(lastLoginTime).format(Moment12HourFormat)}
                            className="default-tt"
                            placement="left"
                            arrow={false}
                        >
                            {child}
                        </Tippy>
                    )}
                >
                    <span className="dc__ellipsis-right">
                        {lastLoginTime === LAST_LOGIN_TIME_NULL_STATE
                            ? lastLoginTime
                            : handleUTCTime(lastLoginTime, true)}
                    </span>
                </ConditionalWrap>
                {showStatus && (
                    <StatusCell
                        status={userStatus}
                        timeToLive={timeToLive}
                        userEmail={emailId}
                        userId={id}
                        refetchUserPermissionList={refetchUserPermissionList}
                        // Status is readonly for admin/system user
                        isReadOnly={isAdminOrSystemUser}
                    />
                )}
                {isAdminOrSystemUser ? (
                    <span />
                ) : (
                    <div className="flex dc__gap-12">
                        <Link
                            type="button"
                            className="dc__visible-hover--child dc__transparent"
                            data-testid={`user-permission__edit-button-${index}`}
                            aria-label="Edit user"
                            to={`${path}/${id}`}
                        >
                            <Edit className="scn-6 icon-dim-16 mw-16" />
                        </Link>
                        <button
                            type="button"
                            className="dc__visible-hover--child dc__transparent"
                            data-testid={`user-permission__delete-button-${index}`}
                            onClick={toggleDeleteModal}
                            aria-label="Delete user"
                        >
                            <Trash className="scn-6 icon-dim-16 mw-16 icon-delete" />
                        </button>
                    </div>
                )}
            </div>
            {isDeleteModalOpen && (
                <DeleteDialog
                    dataTestId="user-form-delete-dialog"
                    title={`Delete user '${emailId || ''}'?`}
                    description="Deleting this user will remove the user and revoke all their permissions."
                    delete={handleDelete}
                    closeDelete={toggleDeleteModal}
                    apiCallInProgress={isModalLoading}
                />
            )}
        </>
    )
}

export default UserPermissionRow
