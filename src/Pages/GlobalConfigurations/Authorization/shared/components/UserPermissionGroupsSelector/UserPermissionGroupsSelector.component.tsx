import React, { useEffect } from 'react'
import {
    ClearIndicator,
    multiSelectStyles,
    MultiValueChipContainer,
    MultiValueRemove,
    Option,
    OptionType,
} from '@devtron-labs/devtron-fe-common-lib'
import Select from 'react-select'
import { User } from '../../../types'
import { useAuthorizationContext } from '../../../AuthorizationProvider'
import { mapByKey } from '../../../../../../components/common'
import { UserPermissionGroupsSelectorProps } from './types'

const MultiValueContainer = ({ ...props }) => <MultiValueChipContainer {...props} validator={null} />

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

    return (
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
                    ClearIndicator,
                    MultiValueRemove,
                    Option,
                }}
                styles={{
                    ...multiSelectStyles,
                    dropdownIndicator: (base, state) => ({
                        ...base,
                        transition: 'all .2s ease',
                        transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    }),
                    multiValue: (base) => ({
                        ...base,
                        border: `1px solid var(--N200)`,
                        borderRadius: `4px`,
                        background: 'white',
                        height: '30px',
                        margin: '0 8px 0 0',
                        padding: '1px',
                    }),
                }}
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
            />
        </div>
    )
}

export default UserPermissionGroupsSelector
