import React, { useEffect } from 'react'
import {
    ClearIndicator,
    multiSelectStyles,
    MultiValueChipContainer,
    MultiValueRemove,
    removeItemsFromArray,
    Option,
    mapByKey,
} from '../common'
import AppPermissions from '../userGroups/AppPermissions'
import { GroupRow, useUserGroupContext } from '../userGroups/UserGroup'
import Select from 'react-select'
import { OptionType } from '../app/types'
import { ChartGroupPermissionsFilter, CreateUser, DirectPermissionsRoleFilter } from '../userGroups/userGroups.types'

function GroupPermission({
    userData,
    userGroups,
    setUserGroups,
    directPermission,
    setDirectPermission,
    chartPermission,
    setChartPermission,
}: {
    userData: CreateUser
    userGroups: OptionType[]
    setUserGroups: React.Dispatch<React.SetStateAction<OptionType[]>>
    directPermission: DirectPermissionsRoleFilter[]
    setDirectPermission: React.Dispatch<React.SetStateAction<DirectPermissionsRoleFilter[]>>
    chartPermission: ChartGroupPermissionsFilter
    setChartPermission: React.Dispatch<React.SetStateAction<ChartGroupPermissionsFilter>>
}) {
    const { userGroupsList } = useUserGroupContext()
    const userGroupsMap = mapByKey(userGroupsList, 'name')
    const availableGroups = userGroupsList?.map((group) => ({ value: group.name, label: group.name }))

    useEffect(() => {
        if (userData) {
            populateDataFromAPI(userData)
        }
    }, [userData])

    function populateDataFromAPI(data: CreateUser) {
        const { groups, superAdmin } = data
        setUserGroups(groups?.map((group) => ({ label: group, value: group })) || [])
    }

    function formatChartGroupOptionLabel({ value, label }) {
        return (
            <div className="flex left column">
                <span>{label}</span>
                <small>{userGroupsMap.has(value) ? userGroupsMap.get(value).description : ''}</small>
            </div>
        )
    }

    return (
        <>
            <div className="cn-9 fs-13 mt-10 fw-4 mb-6">Group permissions</div>
            <Select
                placeholder="Select permission groups"
                value={userGroups}
                components={{
                    IndicatorSeparator: () => null,
                    MultiValueContainer: ({ ...props }) => <MultiValueChipContainer {...props} validator={null} />,
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
                onChange={(selected) => setUserGroups((selected || []) as any)}
                className="basic-multi-select"
            />
            {userGroups.length > 0 && (
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '184px 1fr 24px',
                        gridAutoRows: '48px',
                        gridColumnGap: '16px',
                        alignItems: 'center',
                    }}
                >
                    {userGroups.map((userGroup, idx) => (
                        <GroupRow
                            key={idx}
                            name={userGroup.value}
                            description={userGroupsMap.get(userGroup.value).description}
                            removeRow={(e) => setUserGroups((userGroups) => removeItemsFromArray(userGroups, idx, 1))}
                        />
                    ))}
                </div>
            )}
            <AppPermissions
                data={userData}
                directPermission={directPermission}
                setDirectPermission={setDirectPermission}
                chartPermission={chartPermission}
                setChartPermission={setChartPermission}
                hideInfoLegend={true}
            />
        </>
    )
}

export default GroupPermission
