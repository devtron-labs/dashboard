import React, { useEffect } from 'react'
import {
    getCommonSelectStyle,
    MultiValueChipContainer,
    Option,
    OptionType,
    UserRoleGroupsTable,
} from '@devtron-labs/devtron-fe-common-lib'
import Select from 'react-select'
import { User } from '../../../types'
import { useAuthorizationContext } from '../../../AuthorizationProvider'
import { mapByKey } from '../../../../../../components/common'
import { UserPermissionGroupsSelectorProps } from './types'

const _selectStyles = getCommonSelectStyle()

const selectStyles = {
    ..._selectStyles,
    control: (base, state) => ({
        ..._selectStyles.control(base, state),
        height: '36px',
    }),
}

const MultiValueContainer = (props) => <MultiValueChipContainer {...props} validator={null} />

const UserPermissionGroupsSelector = ({ userData, userGroups, setUserGroups }: UserPermissionGroupsSelectorProps) => {
    const { userGroupsList } = useAuthorizationContext()
    const userGroupsMap = mapByKey(userGroupsList, 'name')
    const availableGroups = userGroupsList?.map((group) => ({ value: group.name, label: group.name }))

    function populateDataFromAPI(data: User) {
        const { groups } = data
        setUserGroups(groups?.map((group) => ({ label: group, value: group })) || [])
    }

    useEffect(() => {
        if (userData) {
            populateDataFromAPI(userData)
        }
    }, [userData])

    const formatChartGroupOptionLabel = ({ value, label }) => (
        <div className="flex left column">
            <span>{label}</span>
            <small>{userGroupsMap.has(value) ? userGroupsMap.get(value).description : ''}</small>
        </div>
    )

    const handleChange = (selected) => setUserGroups((selected || []) as OptionType[])

    const handleDelete = () => {
        // TODO (v3): Integrate
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
                        // TODO (v3): Fix active state styling
                        Option,
                    }}
                    styles={selectStyles}
                    formatOptionLabel={formatChartGroupOptionLabel}
                    closeMenuOnSelect={false}
                    isMulti
                    name="groups"
                    options={availableGroups}
                    hideSelectedOptions={false}
                    onChange={handleChange}
                    // TODO (v3): Check and remove
                    className="basic-multi-select"
                    id="permission-groups-dropdown"
                    controlShouldRenderValue={false}
                />
            </div>
            {userGroups.length > 0 && (
                <UserRoleGroupsTable
                    // TODO (v3): Update with API integration
                    roleGroups={userGroups.map((group, index) => ({
                        id: index,
                        name: group.value,
                        description: 'Test description',
                    }))}
                    // TODO (v3): Add the check
                    showStatus
                    handleDelete={handleDelete}
                />
            )}
        </div>
    )
}

export default UserPermissionGroupsSelector
