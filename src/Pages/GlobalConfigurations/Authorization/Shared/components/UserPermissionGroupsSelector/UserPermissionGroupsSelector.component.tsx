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

import { useEffect } from 'react'
import {
    MultiValueChipContainer,
    Option,
    useAsync,
    UserRoleGroupsTable,
    GenericSectionErrorState,
    LoadingIndicator,
    OptionType,
    UserStatus,
    UserRoleGroup,
} from '@devtron-labs/devtron-fe-common-lib'
import Select from 'react-select'
import { PermissionGroup, User } from '../../../types'
import { importComponentFromFELibrary, mapByKey } from '../../../../../../components/common'
import { getPermissionGroupList } from '../../../authorization.service'
import { usePermissionConfiguration } from '../PermissionConfigurationForm'
import { authorizationSelectStyles } from '../../../constants'
import { getDefaultStatusAndTimeout } from '../../../libUtils'

const StatusHeaderCell = importComponentFromFELibrary('StatusHeaderCell', null, 'function')
const UserStatusUpdate = importComponentFromFELibrary('UserStatusUpdate', null, 'function')

const MultiValueContainer = (props) => <MultiValueChipContainer {...props} validator={null} />

const UserPermissionGroupsSelector = () => {
    const { userRoleGroups, setUserRoleGroups, data: userData, userStatus, showStatus } = usePermissionConfiguration()
    const [isLoading, result, error, reloadGroupList] = useAsync(() =>
        getPermissionGroupList({
            showAll: true,
        }),
    )

    function populateDataFromAPI(data: User) {
        const { userRoleGroups: userRoleGroupsFromAPI } = data
        setUserRoleGroups(userRoleGroupsFromAPI)
    }

    useEffect(() => {
        if (userData) {
            // Casting as if showUserPermissionGroupSelector is true than type for data is User
            populateDataFromAPI(userData as User)
        }
    }, [userData])

    const { permissionGroups: userGroupsList = [] } = result ?? {}

    const userGroupsMap = mapByKey<Map<PermissionGroup['name'], PermissionGroup>>(userGroupsList, 'name')

    const groupOptions = userGroupsList?.map((group) => ({ value: group.name, label: group.name }))
    const selectedValue = userRoleGroups.map((userGroup) => ({ value: userGroup.name, label: userGroup.name }))

    const formatChartGroupOptionLabel = ({ value, label }) => (
        <div className="flex left column">
            <span>{label}</span>
            <small>{userGroupsMap.has(value) ? userGroupsMap.get(value).description : ''}</small>
        </div>
    )

    const handleChange = (selectedOptions: OptionType[]) => {
        const alreadyAddedGroupsMap = mapByKey(userRoleGroups, 'name')
        const selectedOptionsMap = mapByKey(selectedOptions, 'value')

        const filteredOptions: User['userRoleGroups'] = selectedOptions
            .filter((selectedOption) => !alreadyAddedGroupsMap.has(selectedOption.value))
            .map((selectedOption) => {
                const { id, name, description } = userGroupsMap.get(selectedOption.value)

                return {
                    id,
                    name,
                    description,
                    ...getDefaultStatusAndTimeout(),
                }
            })

        // Remove any group that was deselected
        setUserRoleGroups([
            ...userRoleGroups.filter((userGroup) => selectedOptionsMap.has(userGroup.name)),
            ...filteredOptions,
        ])
    }

    const handleDelete = (id) => {
        setUserRoleGroups(userRoleGroups.filter((group) => group.id !== id))
    }

    const handleStatusUpdate = (
        id: UserRoleGroup['id'],
        status: UserRoleGroup['status'],
        timeToLive: UserRoleGroup['timeToLive'],
    ) => {
        setUserRoleGroups(
            userRoleGroups.map((userGroup) => ({
                ...userGroup,
                ...(userGroup.id === id
                    ? {
                          status,
                          timeToLive,
                      }
                    : {}),
            })),
        )
    }

    return (
        <div className="flexbox-col dc__gap-8">
            <div className="flexbox-col dc__gap-8">
                <h3 className="cn-9 fs-13 lh-20 fw-6 m-0">Permission Groups</h3>
                <Select
                    placeholder="Select permission groups"
                    value={selectedValue}
                    components={{
                        IndicatorSeparator: null,
                        MultiValueContainer,
                        ClearIndicator: null,
                        Option,
                        LoadingIndicator,
                        ...(error
                            ? {
                                  // eslint-disable-next-line react/no-unstable-nested-components
                                  NoOptionsMessage: () => (
                                      <GenericSectionErrorState withBorder reload={reloadGroupList} />
                                  ),
                              }
                            : {}),
                    }}
                    styles={authorizationSelectStyles}
                    formatOptionLabel={formatChartGroupOptionLabel}
                    closeMenuOnSelect={false}
                    isMulti
                    name="groups"
                    options={groupOptions}
                    hideSelectedOptions={false}
                    onChange={handleChange}
                    id="permission-groups-dropdown"
                    controlShouldRenderValue={false}
                    isLoading={isLoading}
                    isDisabled={isLoading}
                    menuPlacement="auto"
                />
            </div>
            {userRoleGroups.length > 0 && (
                <UserRoleGroupsTable
                    roleGroups={userRoleGroups}
                    showStatus={showStatus}
                    handleDelete={handleDelete}
                    statusComponent={UserStatusUpdate}
                    statusHeaderComponent={StatusHeaderCell}
                    handleStatusUpdate={handleStatusUpdate}
                    disableStatusComponent={userStatus === UserStatus.inactive}
                />
            )}
        </div>
    )
}

export default UserPermissionGroupsSelector
