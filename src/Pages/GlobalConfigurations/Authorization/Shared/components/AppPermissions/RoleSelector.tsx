import {
    Checkbox,
    CHECKBOX_VALUE,
    noop,
    RadioGroupItem,
    Tooltip,
    RoleSelectorOptionType,
    Icon,
    ActionTypes,
    ACCESS_TYPE_MAP,
} from '@devtron-labs/devtron-fe-common-lib'
import Select, { GroupProps, OptionProps, GroupHeadingProps } from 'react-select'
import './roleSelectorStyles.scss'
import { useAuthorizationContext } from '@Pages/GlobalConfigurations/Authorization/AuthorizationProvider'
import { useMemo, useState } from 'react'
import { importComponentFromFELibrary } from '@Components/common'
import { getDefaultRolesToggleConfig, getRoleOptions, getRoleSelectorStyles, getSelectedRolesText } from './utils'
import { RoleSelectorProps, RoleSelectorToggleConfig } from './types'
import { usePermissionConfiguration } from '../PermissionConfigurationForm'
import { renderGroup, renderGroupHeading, renderOption, renderRoleInfoTippy } from './roleSelectorHelpers'
import { ACCESS_ROLE_OPTIONS_CONTAINER_ID } from './constants'

const DeprecatedTag = importComponentFromFELibrary('DeprecatedTag', null, 'function')

const RoleSelector = ({ permission, handleUpdateDirectPermissionRoleConfig }: RoleSelectorProps) => {
    const { customRoles } = useAuthorizationContext()
    const { allowManageAllAccess, isLoggedInUserSuperAdmin } = usePermissionConfiguration()
    const { accessType, roleConfig, team, roleConfigError } = permission
    const [toggleConfig, setToggleConfig] = useState<RoleSelectorToggleConfig>(getDefaultRolesToggleConfig(roleConfig))

    const toggleBaseRole = () => {
        setToggleConfig((prev) => {
            if (prev.baseRole) {
                handleUpdateDirectPermissionRoleConfig({
                    ...roleConfig,
                    baseRole: '',
                    additionalRoles: new Set(),
                })
            } else {
                handleUpdateDirectPermissionRoleConfig({
                    ...roleConfig,
                    baseRole: 'view',
                })
            }
            return { ...prev, baseRole: !prev.baseRole }
        })
    }

    const toggleAccessManagerRoles = () => {
        setToggleConfig((prev) => {
            // On toggling off clear selected roles
            if (prev.accessManagerRoles) {
                handleUpdateDirectPermissionRoleConfig({ ...roleConfig, accessManagerRoles: new Set() })
            } else {
                try {
                    // Need to set timeout as element is rendered in dom after state is set
                    setTimeout(() => {
                        const element = document.getElementById(ACCESS_ROLE_OPTIONS_CONTAINER_ID)
                        element.scrollIntoView({ behavior: 'smooth', block: 'end' })
                    }, 100)
                } catch {
                    // do nothing
                }
            }
            return { ...prev, accessManagerRoles: !prev.accessManagerRoles }
        })
    }

    const selectText = useMemo(() => {
        const baseRole =
            customRoles.customRoles.find(
                (role) => role.accessType === accessType && role.roleName === roleConfig.baseRole,
            )?.roleDisplayName || ''

        return getSelectedRolesText(baseRole, roleConfig, allowManageAllAccess)
    }, [roleConfig, allowManageAllAccess])

    const GroupHeading = (props: GroupHeadingProps) =>
        renderGroupHeading({
            props,
            toggleConfig,
            toggleBaseRole,
            toggleAccessManagerRoles,
            showToggle: isLoggedInUserSuperAdmin && accessType === ACCESS_TYPE_MAP.DEVTRON_APPS,
        })

    const Group = (props: GroupProps) =>
        renderGroup({
            props,
            baseRoleValue: roleConfig.baseRole,
            toggleConfig,
        })

    const Option = (props: OptionProps<RoleSelectorOptionType>) =>
        renderOption({ props, roleConfig, handleUpdateDirectPermissionRoleConfig })

    const groupedOptions = useMemo(
        () =>
            getRoleOptions({
                customRoles: customRoles.customRoles,
                accessType,
                showAccessRoles: isLoggedInUserSuperAdmin && !allowManageAllAccess,
            }),
        [customRoles, accessType, isLoggedInUserSuperAdmin, allowManageAllAccess],
    )

    const formatOptionLabel = ({ value, label, description, roleType }: RoleSelectorOptionType) => {
        const isRoleSelected: boolean = roleType !== 'baseRole' && roleConfig[roleType].has(value)

        return (
            <Tooltip
                content={renderRoleInfoTippy(label as string, description as string)}
                alwaysShowTippyOnHover
                placement="left"
            >
                {roleType === 'baseRole' ? (
                    <div className="flexbox dc__align-items-center">
                        <RadioGroupItem value={value}>
                            <div className="flexbox dc__align-items-center dc__gap-8 fs-13 lh-20">
                                <span>{label}</span>
                                {value === ActionTypes.MANAGER && DeprecatedTag && <DeprecatedTag />}
                            </div>
                        </RadioGroupItem>
                    </div>
                ) : (
                    <div className="flexbox dc__align-items-center">
                        <Checkbox
                            isChecked={isRoleSelected}
                            onChange={noop}
                            value={CHECKBOX_VALUE.CHECKED}
                            rootClassName="mb-0"
                        />
                        <span>{label}</span>
                    </div>
                )}
            </Tooltip>
        )
    }

    const roleSelectorStyles = useMemo(() => getRoleSelectorStyles(roleConfigError), [roleConfigError])

    return (
        <div className="flexbox-col dc__gap-4">
            <Select<RoleSelectorOptionType, true>
                formatOptionLabel={formatOptionLabel}
                options={groupedOptions}
                components={{
                    ClearIndicator: null,
                    IndicatorSeparator: null,
                    Group,
                    Option,
                    GroupHeading,
                }}
                styles={roleSelectorStyles}
                closeMenuOnSelect={false}
                isSearchable={false}
                placeholder={selectText}
                menuPlacement="auto"
                isDisabled={!team}
                hideSelectedOptions={false}
                isMulti
                controlShouldRenderValue={false}
            />
            {roleConfigError && (
                <div className="flexbox dc__align-items-center dc__gap-4">
                    <Icon name="ic-error" size={16} color={null} />
                    <span className="cr-5 fs-11 lh-16 fw-4">Required</span>
                </div>
            )}
        </div>
    )
}

export default RoleSelector
