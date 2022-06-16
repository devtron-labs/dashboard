import React, { useState } from 'react'
import {
    ClearIndicator,
    multiSelectStyles,
    MultiValueChipContainer,
    MultiValueRemove,
    removeItemsFromArray,
    Option,
    useAsync,
} from '../common'
import AppPermissions from '../userGroups/AppPermissions'
import { GroupRow } from '../userGroups/UserGroup'
import Select from 'react-select'
import { OptionType } from '../app/types'
import {
    ActionTypes,
    ChartGroupPermissionsFilter,
    DirectPermissionsRoleFilter,
    EntityTypes,
} from '../userGroups/userGroups.types'

function GroupPermission({
    groupPermissionsRef,
    formatChartGroupOptionLabel,
    id,
    availableGroups,
    userGroupsMap,
    userData,
}) {
    //   const [dataLoading, data, dataError, reloadData, setData] = useAsync(
    //     type === 'group' ? () => getGroupId(id) : () => getUserId(id),
    //     [id, type],
    //     !collapsed,
    // );
    const [directPermission, setDirectPermission] = useState<DirectPermissionsRoleFilter[]>([])
    const [userGroups, setUserGroups] = useState<OptionType[]>([])
    const [chartPermission, setChartPermission] = useState<ChartGroupPermissionsFilter>({
        entity: EntityTypes.CHART_GROUP,
        action: ActionTypes.VIEW,
        entityName: [],
    })

    return (
        <>
            <div className="cn-9 fs-14 fw-6 mb-16">Group permissions</div>
            {/* <Select
                value={userGroups}
                ref={groupPermissionsRef}
                components={{
                    MultiValueContainer: ({ ...props }) => <MultiValueChipContainer {...props} validator={null} />,
                    DropdownIndicator: null,
                    ClearIndicator,
                    MultiValueRemove,
                    Option,
                }}
                styles={{
                    ...multiSelectStyles,
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
                autoFocus={!id}
                menuPortalTarget={document.body}
                name="groups"
                options={availableGroups}
                hideSelectedOptions={false}
                onChange={(selected, actionMeta) => setUserGroups((selected || []) as any)}
                className={`basic-multi-select ${id ? 'mt-8 mb-16' : ''}`}
            /> */}
            {userGroups.length > 0 && id && (
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
            />
        </>
    )
}

export default GroupPermission
