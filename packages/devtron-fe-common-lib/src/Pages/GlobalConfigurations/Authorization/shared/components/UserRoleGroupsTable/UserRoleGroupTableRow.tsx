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

import { Link } from 'react-router-dom'
import Tippy from '@tippyjs/react'

import { URLS } from '@Common/Constants'
import { getRandomColor } from '@Common/Helper'
import { UserRoleGroupsTableProps } from './types'
import { ReactComponent as TrashIcon } from '../../../../../../Assets/Icon/ic-delete-interactive.svg'
import { UserRoleGroup } from '../../../types'

const UserRoleGroupTableRow = ({
    id,
    name,
    description,
    status,
    timeToLive,
    modifierClassName,
    disableStatusComponent,
    handleStatusUpdate,
    handleDelete,
    statusComponent: StatusComponent,
    showStatus,
    showDelete,
}: UserRoleGroup &
    Pick<
        UserRoleGroupsTableProps,
        'disableStatusComponent' | 'handleStatusUpdate' | 'handleDelete' | 'statusComponent' | 'showStatus'
    > & {
        modifierClassName: string
        showDelete: boolean
    }) => {
    const _handleStatusUpdate = (updatedStatus, updatedTimeToLive) => {
        handleStatusUpdate?.(id, updatedStatus, updatedTimeToLive)
    }

    const _handleDelete = () => {
        handleDelete(id)
    }

    return (
        <div
            key={`user-groups-group-${id}`}
            className={`user-role-groups__table-row ${modifierClassName} display-grid dc__align-items-center`}
        >
            <div
                className="icon-dim-20 mw-20 flexbox flex-justify-center flex-align-center dc__border-radius-50-per dc__uppercase cn-0"
                style={{ backgroundColor: getRandomColor(name) }}
            >
                {name[0]}
            </div>
            <Link to={`${URLS.PERMISSION_GROUPS}/${id}`} className="dc__ellipsis-right anchor cursor">
                {name}
            </Link>
            <div className="dc__ellipsis-right">{description || '-'}</div>
            {showStatus && (
                <StatusComponent
                    userStatus={status}
                    timeToLive={timeToLive}
                    userEmail=""
                    handleChange={_handleStatusUpdate}
                    disabled={disableStatusComponent}
                    showDropdownBorder={false}
                    breakLinesForTemporaryAccess
                    showTooltipWhenDisabled
                />
            )}
            {showDelete && (
                <Tippy className="default-tt" arrow={false} placement="top" content="Delete">
                    <button
                        type="button"
                        className="dc__transparent flex p-4"
                        data-testid="user-role-groups__delete-button icon-delete"
                        onClick={_handleDelete}
                        aria-label="Delete row"
                    >
                        <TrashIcon className="scn-6 icon-dim-16 icon-delete" />
                    </button>
                </Tippy>
            )}
        </div>
    )
}

export default UserRoleGroupTableRow
