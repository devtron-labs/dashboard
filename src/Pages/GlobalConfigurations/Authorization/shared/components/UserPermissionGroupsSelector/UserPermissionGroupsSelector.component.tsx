import React, { useEffect } from 'react'
import {
    MultiValueChipContainer,
    Option,
    OptionType,
    useAsync,
    UserRoleGroupsTable,
    GenericSectionErrorState,
    LoadingIndicator,
} from '@devtron-labs/devtron-fe-common-lib'
import Select from 'react-select'
import { User } from '../../../types'
import { importComponentFromFELibrary, mapByKey } from '../../../../../../components/common'
import { getPermissionGroupList } from '../../../authorization.service'
import { usePermissionConfiguration } from '../PermissionConfigurationForm'
import { authorizationSelectStyles } from '../userGroups/UserGroup'

const showStatus = !!importComponentFromFELibrary('StatusHeaderCell', null, 'function')

const MultiValueContainer = (props) => <MultiValueChipContainer {...props} validator={null} />

const UserPermissionGroupsSelector = () => {
    const { userGroups, setUserGroups, data: userData } = usePermissionConfiguration()
    // Casting as if showUserPermissionGroupSelector is true than type for data is User
    const _userData = userData as User
    const [isLoading, result, error, reloadGroupList] = useAsync(() =>
        getPermissionGroupList({
            showAll: true,
        }),
    )

    function populateDataFromAPI(data: User) {
        const { groups } = data
        setUserGroups(groups?.map((group) => ({ label: group, value: group })) || [])
    }

    useEffect(() => {
        if (userData) {
            populateDataFromAPI(_userData)
        }
    }, [userData])

    const { permissionGroups: userGroupsList = [] } = result ?? {}

    const userGroupsMap = mapByKey(userGroupsList, 'name')
    const groupOptions = userGroupsList?.map((group) => ({ value: group.name, label: group.name }))
    const roleGroups = userGroups.map((group, index) => ({
        id: index,
        name: group.value,
        description: `Test description - ${index}`,
    }))

    const formatChartGroupOptionLabel = ({ value, label }) => (
        <div className="flex left column">
            <span>{label}</span>
            <small>{userGroupsMap.has(value) ? userGroupsMap.get(value).description : ''}</small>
        </div>
    )

    const handleChange = (selected) => setUserGroups((selected || []) as OptionType[])

    const handleDelete = (id) => {
        // TODO (v3): Fix & Integrate
        setUserGroups(userGroups.filter((group, index) => index !== id))
    }

    return (
        <div className="flexbox-col dc__gap-8">
            <div className="flexbox-col dc__gap-8">
                <h3 className="cn-9 fs-13 lh-20 fw-6 m-0">Permission Groups</h3>
                {/* TODO (v3): Add ref */}
                <Select
                    placeholder="Select permission groups"
                    value={userGroups}
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
                    // TODO (v3): Update with API integration
                    roleGroups={roleGroups}
                    // TODO (v3): Add the check
                    showStatus={showStatus}
                    handleDelete={handleDelete}
                />
            )}
        </div>
    )
}

export default UserPermissionGroupsSelector
