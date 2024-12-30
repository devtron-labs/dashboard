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
    Button,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    OptionType,
} from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as Clone } from '../../../../../../assets/icons/ic-copy.svg'
import { ReactComponent as TrashIcon } from '../../../../../../assets/icons/ic-delete-interactive.svg'
import { ReactComponent as Edit } from '../../../../../../assets/icons/ic-pencil.svg'
import { usePermissionConfiguration } from '../PermissionConfigurationForm'
import { importComponentFromFELibrary } from '../../../../../../components/common'
import { K8sPermissionActionType } from './constants'
import { SELECT_ALL_VALUE } from '../../../../../../config'
import { K8sPermissionFilter } from '../../../types'
import { getIsStatusDropdownDisabled } from '../../../libUtils'
import { K8sPermissionRowProps } from './types'

const UserStatusUpdate = importComponentFromFELibrary('UserStatusUpdate', null, 'function')

const K8sPermissionRow = ({
    permission,
    index,
    rowClass,
    handleStatusUpdate,
    editPermission,
    deletePermission,
}: K8sPermissionRowProps) => {
    const { showStatus, userStatus } = usePermissionConfiguration()
    const { cluster, group, kind, namespace, resource, action, status, timeToLive } = permission

    const clonePermission = () => {
        editPermission(permission, K8sPermissionActionType.clone, index)
    }

    const _editPermission = () => {
        editPermission(permission, K8sPermissionActionType.edit, index)
    }

    const _deletePermission = () => {
        deletePermission(index)
    }

    const _handleStatusUpdate = (
        _status: K8sPermissionFilter['status'],
        _timeToLive: K8sPermissionFilter['timeToLive'],
    ) => {
        handleStatusUpdate(_status, _timeToLive, index)
    }

    const getLabelFromArray = (array: OptionType[], label: string) => {
        const selectAllOption = array.find((element) => element.value === SELECT_ALL_VALUE)
        if (selectAllOption) {
            return selectAllOption.label
        }
        return array.length > 1 ? `${array.length} ${label}` : array[0].label
    }

    return (
        <div className={`${rowClass} cn-9 fs-13 fw-4 lh-20 dc__border-bottom-n1`}>
            <span data-testid={`k8s-permission-list-${index}-cluster`} className="dc__truncate-text">
                {cluster.label}
            </span>
            <span data-testid={`k8s-permission-list-${index}-group`} className="dc__truncate-text">
                {group.label}
            </span>
            <span data-testid={`k8s-permission-list-${index}-kind`} className="dc__truncate-text">
                {kind.label}
            </span>
            <span data-testid={`k8s-permission-list-${index}-namespace`} className="dc__truncate-text">
                {getLabelFromArray(namespace, 'namespaces')}
            </span>
            <span data-testid={`k8s-permission-list-${index}-resource`} className="dc__truncate-text">
                {getLabelFromArray(resource, 'objects')}
            </span>
            <span data-testid={`k8s-permission-list-${index}-action`} className="dc__truncate-text">
                {action?.label}
            </span>
            {showStatus && (
                <span data-testid={`k8s-permission-list-${index}-status`} className="dc__truncate-text">
                    <UserStatusUpdate
                        userStatus={status}
                        timeToLive={timeToLive}
                        userEmail=""
                        handleChange={_handleStatusUpdate}
                        disabled={getIsStatusDropdownDisabled(userStatus)}
                        showTooltipWhenDisabled
                        showDropdownBorder={false}
                        breakLinesForTemporaryAccess
                        size={ComponentSizeType.medium}
                    />
                </span>
            )}
            <span className="flex right">
                <Button
                    icon={<Clone />}
                    ariaLabel="Clone permission"
                    onClick={clonePermission}
                    dataTestId={`clone-permission-${index}`}
                    variant={ButtonVariantType.borderLess}
                    size={ComponentSizeType.xs}
                    style={ButtonStyleType.neutral}
                />
                <Button
                    icon={<Edit />}
                    ariaLabel="Edit permission"
                    onClick={_editPermission}
                    dataTestId={`edit-permission-${index}`}
                    variant={ButtonVariantType.borderLess}
                    size={ComponentSizeType.xs}
                    style={ButtonStyleType.neutral}
                />
                <Button
                    icon={<TrashIcon />}
                    ariaLabel="Delete permission"
                    onClick={_deletePermission}
                    dataTestId={`delete-permission-${index}`}
                    variant={ButtonVariantType.borderLess}
                    size={ComponentSizeType.xs}
                    style={ButtonStyleType.negativeGrey}
                />
            </span>
        </div>
    )
}

export default K8sPermissionRow
