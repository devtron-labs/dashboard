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

import {
    BulkSelectionEvents,
    Button,
    ButtonComponentType,
    ButtonStyleType,
    ButtonVariantType,
    Checkbox,
    CHECKBOX_VALUE,
    ComponentSizeType,
    getRandomColor,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as Trash } from '@Icons/ic-delete-interactive.svg'
import { ReactComponent as Edit } from '@Icons/ic-pencil.svg'

import { deletePermissionGroup } from '../../authorization.service'
import { useAuthorizationBulkSelection } from '../../Shared/components/BulkSelection'
import { DeleteUserPermission } from '../../UserPermissions/DeleteUserPermission'
import { PermissionGroupIcon } from './PermissionGroupList.component'
import { PermissionGroupRowProps } from './types'

const PermissionGroupRow = ({
    id,
    name,
    description,
    index,
    refetchPermissionGroupList,
    isChecked = false,
    toggleChecked,
    showCheckbox,
    hasSuperAdminPermission,
    hasAccessManagerPermission,
}: PermissionGroupRowProps) => {
    const { path } = useRouteMatch()
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const { isBulkSelectionApplied, handleBulkSelection } = useAuthorizationBulkSelection()

    const _showCheckbox = showCheckbox || isChecked

    const toggleDeleteModal = () => {
        setIsDeleteModalOpen(!isDeleteModalOpen)
    }

    const onDelete = async () => {
        await deletePermissionGroup(id)
        if (!isBulkSelectionApplied) {
            // Clearing the selection on single delete since the selected one might be removed
            handleBulkSelection({
                action: BulkSelectionEvents.CLEAR_ALL_SELECTIONS,
            })
        }
        refetchPermissionGroupList()
    }

    const handleChecked = () => {
        toggleChecked(id)
    }

    return (
        <>
            <div
                className={`user-permission__row dc__visible-hover dc__visible-hover--parent dc__opacity-hover dc__opacity-hover--parent px-20 dc__hover-n50 ${
                    isChecked ? 'bc-b50' : ''
                }`}
            >
                <div className="flex dc__content-start">
                    {!_showCheckbox && (
                        <span
                            className="icon-dim-20 mw-20 flex dc__border-radius-50-per dc__uppercase cn-0 fw-4 dc__visible-hover--hide-child"
                            style={{
                                backgroundColor: getRandomColor(name),
                            }}
                        >
                            {name[0]}
                        </span>
                    )}
                    <Checkbox
                        isChecked={isChecked}
                        onChange={handleChecked}
                        rootClassName={`mb-0 ${_showCheckbox ? '' : 'dc__visible-hover--child'}`}
                        value={CHECKBOX_VALUE.CHECKED}
                    />
                </div>
                <div className="flexbox dc__align-items-center dc__gap-8">
                    <span className="dc__ellipsis-right">
                        <Link className="anchor dc__ellipsis-right" to={`${path}/${id}`}>
                            {name}
                        </Link>
                    </span>
                    <PermissionGroupIcon
                        hasSuperAdminPermission={hasSuperAdminPermission}
                        hasAccessManagerPermission={hasAccessManagerPermission}
                    />
                </div>
                <span className="dc__ellipsis-right">{description || '-'}</span>
                <div className="flex dc__gap-4">
                    <Button
                        component={ButtonComponentType.link}
                        icon={<Edit />}
                        ariaLabel="Edit permission group"
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
                        ariaLabel="Delete permission group"
                        showAriaLabelInTippy={false}
                        dataTestId={`user-permission__delete-button-${index}`}
                        onClick={toggleDeleteModal}
                        isOpacityHoverChild
                        size={ComponentSizeType.xs}
                        variant={ButtonVariantType.borderLess}
                        style={ButtonStyleType.negativeGrey}
                    />
                </div>
            </div>
            {isDeleteModalOpen && (
                <DeleteUserPermission
                    title={name}
                    onDelete={onDelete}
                    closeConfirmationModal={toggleDeleteModal}
                    isUserGroup
                />
            )}
        </>
    )
}

export default PermissionGroupRow
