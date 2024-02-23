import React, { useEffect } from 'react'
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
import { authorizationSelectStyles } from '../userGroups/UserGroup'
import { getFormattedTimeToLive } from '../../../utils'
import { getDefaultStatusAndTimeout } from '../../../libUtils'

const StatusHeaderCell = importComponentFromFELibrary('StatusHeaderCell', null, 'function')
const UserStatusUpdate = importComponentFromFELibrary('UserStatusUpdate', null, 'function')

const MultiValueContainer = (props) => <MultiValueChipContainer {...props} validator={null} />

const UserPermissionGroupsSelector = () => {
    const { userGroups, setUserGroups, data: userData, userStatus, showStatus } = usePermissionConfiguration()
    // Casting as if showUserPermissionGroupSelector is true than type for data is User
    const _userData = userData as User
    const [isLoading, result, error, reloadGroupList] = useAsync(() =>
        getPermissionGroupList({
            showAll: true,
        }),
    )

    function populateDataFromAPI(data: User) {
        const { userRoleGroups } = data
        setUserGroups(userRoleGroups)
    }

    useEffect(() => {
        if (userData) {
            populateDataFromAPI(_userData)
        }
    }, [userData])

    const { permissionGroups: userGroupsList = [] } = result ?? {}

    const userGroupsMap: Map<PermissionGroup['name'], PermissionGroup> = mapByKey(userGroupsList, 'name')

    const groupOptions = userGroupsList?.map((group) => ({ value: group.name, label: group.name }))
    const selectedValue = userGroups.map((userGroup) => ({ value: userGroup.name, label: userGroup.name }))

    const formatChartGroupOptionLabel = ({ value, label }) => (
        <div className="flex left column">
            <span>{label}</span>
            <small>{userGroupsMap.has(value) ? userGroupsMap.get(value).description : ''}</small>
        </div>
    )

    const handleChange = (selectedOptions: OptionType[]) => {
        const alreadyAddedGroupsMap = mapByKey(userGroups, 'name')
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
        setUserGroups([...userGroups.filter((userGroup) => selectedOptionsMap.has(userGroup.name)), ...filteredOptions])
    }

    const handleDelete = (id) => {
        setUserGroups(userGroups.filter((group) => group.id !== id))
    }

    const handleStatusUpdate = (
        id: UserRoleGroup['id'],
        updatedStatus: UserRoleGroup['status'],
        updatedTimeToLive: UserRoleGroup['timeToLive'],
    ) => {
        setUserGroups(
            userGroups.map((userGroup) => ({
                ...userGroup,
                ...(userGroup.id === id
                    ? {
                          status: updatedStatus,
                          timeToLive: getFormattedTimeToLive(updatedTimeToLive),
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
            {userGroups.length > 0 && (
                <UserRoleGroupsTable
                    roleGroups={userGroups}
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
