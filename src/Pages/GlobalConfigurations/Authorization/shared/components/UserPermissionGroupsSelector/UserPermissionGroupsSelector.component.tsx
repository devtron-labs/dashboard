import React, { useEffect } from 'react'
import {
    getCommonSelectStyle,
    MultiValueChipContainer,
    Option,
    OptionType,
    useAsync,
    UserRoleGroupsTable,
    Progressing,
    GenericSectionErrorState,
} from '@devtron-labs/devtron-fe-common-lib'
import Select from 'react-select'
import { User } from '../../../types'
import { importComponentFromFELibrary, mapByKey } from '../../../../../../components/common'
import { UserPermissionGroupsSelectorProps } from './types'
import { getPermissionGroupList } from '../../../authorization.service'

const showStatus = !!importComponentFromFELibrary('StatusHeaderCell', null, 'function')

const _selectStyles = getCommonSelectStyle()

const selectStyles = {
    ..._selectStyles,
    control: (base, state) => ({
        ..._selectStyles.control(base, state),
        height: '36px',
    }),
}

const MultiValueContainer = (props) => <MultiValueChipContainer {...props} validator={null} />

const LoadingIndicator = () => <Progressing />

const UserPermissionGroupsSelector = ({ userData, userGroups, setUserGroups }: UserPermissionGroupsSelectorProps) => {
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
            populateDataFromAPI(userData)
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
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <label htmlFor="permission-groups-dropdown" className="cn-9 fs-13 fw-4 mb-0">
                    Group permissions
                </label>
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
                    styles={selectStyles}
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
