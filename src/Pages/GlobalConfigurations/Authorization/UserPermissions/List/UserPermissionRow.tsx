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

import { useState } from 'react'
import { Link, useRouteMatch } from 'react-router-dom'
import Tippy from '@tippyjs/react'
import moment from 'moment'

import {
    BulkSelectionEvents,
    Button,
    ButtonComponentType,
    ButtonStyleType,
    ButtonVariantType,
    Checkbox,
    CHECKBOX_VALUE,
    ComponentSizeType,
    ConditionalWrap,
    getRandomColor,
    handleUTCTime,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as Trash } from '@Icons/ic-delete-interactive.svg'
import { ReactComponent as Lock } from '@Icons/ic-locked.svg'
import { ReactComponent as Edit } from '@Icons/ic-pencil.svg'

import { importComponentFromFELibrary } from '../../../../../components/common'
import { Moment12HourFormat } from '../../../../../config'
import { deleteUser } from '../../authorization.service'
import { useAuthorizationBulkSelection } from '../../Shared/components/BulkSelection'
import { LAST_LOGIN_TIME_NULL_STATE } from '../constants'
import { DeleteUserPermission } from '../DeleteUserPermission'
import { getIsAdminOrSystemUser } from '../utils'
import { DEFAULT_USER_TOOLTIP_CONTENT } from './constants'
import { UserPermissionRowProps } from './types'

const StatusCell = importComponentFromFELibrary('StatusCell', null, 'function')
const UserGroupCell = importComponentFromFELibrary('UserGroupCell', null, 'function')

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
    showCheckbox,
    userGroups,
}: UserPermissionRowProps) => {
    const { path } = useRouteMatch()
    const isAdminOrSystemUser = getIsAdminOrSystemUser(emailId)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const { handleBulkSelection, isBulkSelectionApplied } = useAuthorizationBulkSelection()

    const _showCheckbox = showCheckbox || isChecked

    const toggleDeleteModal = () => {
        setIsDeleteModalOpen(!isDeleteModalOpen)
    }

    const onDelete = async () => {
        await deleteUser(id)
        // Clearing the selection on single delete since the selected one might be removed
        if (!isBulkSelectionApplied) {
            handleBulkSelection({
                action: BulkSelectionEvents.CLEAR_ALL_SELECTIONS,
            })
        }
        refetchUserPermissionList()
    }

    const handleChecked = () => toggleChecked(id)

    return (
        <>
            {/* dc__visible-hover is required for status cell and checkbox */}
            <div
                className={`user-permission__row ${
                    showStatus ? 'user-permission__row--with-status' : ''
                } dc__visible-hover dc__visible-hover--parent dc__opacity-hover dc__opacity-hover--parent pl-20 pr-20 ${
                    isChecked && !isAdminOrSystemUser ? 'bc-b50' : ''
                } dc__hover-n50`}
            >
                {/* Note: no checkbox for admin/system */}
                <div className="flex dc__content-start">
                    {(!_showCheckbox || isAdminOrSystemUser) && (
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
                            rootClassName={`mb-0 ${_showCheckbox ? '' : 'dc__visible-hover--child'}`}
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
                {showStatus && <UserGroupCell userGroups={userGroups} />}
                <ConditionalWrap
                    condition={lastLoginTime !== LAST_LOGIN_TIME_NULL_STATE}
                    // eslint-disable-next-line react/no-unstable-nested-components
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
                        userStatus={userStatus}
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
                    <div className="flex dc__gap-4">
                        <Button
                            component={ButtonComponentType.link}
                            icon={<Edit />}
                            ariaLabel="Edit user"
                            showAriaLabelInTippy={false}
                            dataTestId={`user-permission__edit-button-${index}`}
                            linkProps={{
                                to: `${path}/${id}`,
                            }}
                            isOpacityHoverChild
                            size={ComponentSizeType.xs}
                            variant={ButtonVariantType.borderLess}
                            style={ButtonStyleType.neutral}
                        />
                        <Button
                            icon={<Trash />}
                            ariaLabel="Delete user"
                            showAriaLabelInTippy={false}
                            dataTestId={`user-permission__delete-button-${index}`}
                            onClick={toggleDeleteModal}
                            isOpacityHoverChild
                            size={ComponentSizeType.xs}
                            variant={ButtonVariantType.borderLess}
                            style={ButtonStyleType.negativeGrey}
                        />
                    </div>
                )}
            </div>
            {isDeleteModalOpen && (
                <DeleteUserPermission title={emailId} onDelete={onDelete} closeConfirmationModal={toggleDeleteModal} />
            )}
        </>
    )
}

export default UserPermissionRow
