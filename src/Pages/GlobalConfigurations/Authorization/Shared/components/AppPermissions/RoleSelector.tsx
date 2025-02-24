import {
    Checkbox,
    CHECKBOX_VALUE,
    noop,
    RadioGroup,
    RadioGroupItem,
    Tooltip,
    RoleSelectorOptionType,
    UserRoleConfig,
    RoleType,
    Icon,
} from '@devtron-labs/devtron-fe-common-lib'
import Select, { GroupProps, components, ValueContainerProps } from 'react-select'
import './roleSelectorStyles.scss'
import { useAuthorizationContext } from '@Pages/GlobalConfigurations/Authorization/AuthorizationProvider'
import { ActionTypes } from '@Pages/GlobalConfigurations/Authorization/constants'
import { ChangeEvent, useMemo, useState } from 'react'
import { importComponentFromFELibrary } from '@Components/common'
import { getDefaultRoleConfig, getRoleOptions, getRoleSelectorStyles, getSelectedRolesText } from './utils'
import { MANGER_ROLE_DEPRECATION_WARNING } from './constants'
import {
    RoleSelectorGroupHeaderProps,
    RoleSelectorGroupParams,
    RoleSelectorProps,
    RoleSelectorToggleConfig,
} from './types'
import { usePermissionConfiguration } from '../PermissionConfigurationForm'

const ToggleEnableRole = importComponentFromFELibrary('ToggleEnableRole', null, 'function')
const DeprecatedTag = importComponentFromFELibrary('DeprecatedTag', null, 'function')

const renderRoleInfoTippy = (label: string, description: string) => (
    <div className="flexbox-col fs-12 lh-18">
        <span className="fw-6">{label}</span>
        <p className="fw-4 mb-0">{description}</p>
        {MANGER_ROLE_DEPRECATION_WARNING && label === 'Manager' && (
            <p className="mt-10">{MANGER_ROLE_DEPRECATION_WARNING}</p>
        )}
    </div>
)

const RoleSelectorGroupHeader = ({ label, showToggle, toggleSelected, onChange }: RoleSelectorGroupHeaderProps) => (
    <Tooltip
        content={renderRoleInfoTippy(label, 'Can manage access of users with specific roles')}
        alwaysShowTippyOnHover={label === 'Access Manager'}
        placement="left"
    >
        <div className="flexbox dc__align-items-center dc__content-space px-8 py-6 bg__secondary br-4">
            <span className="fs-13 fw-4 lh-20">{label}</span>
            {ToggleEnableRole && showToggle && <ToggleEnableRole selected={toggleSelected} onChange={onChange} />}
        </div>
    </Tooltip>
)

const renderGroup = ({
    props,
    baseRoleValue,
    toggleConfig,
    showToggle,
    toggleBaseRole,
    toggleAccessManagerRoles,
    handleUpdateBaseRole,
}: RoleSelectorGroupParams) => {
    const { children, data } = props
    const { label } = data

    if (label === 'Additional role')
        return toggleConfig.baseRole ? (
            <div className="py-4">
                <div className="px-8 py-4 fs-12 lh-20 fw-6">{label}</div>
                {children}
            </div>
        ) : null

    if (label === 'Base Role') {
        return (
            <>
                <RoleSelectorGroupHeader
                    label={label}
                    showToggle={showToggle}
                    toggleSelected={toggleConfig.baseRole}
                    onChange={toggleBaseRole}
                />
                {toggleConfig.baseRole && (
                    <RadioGroup
                        name="base-role"
                        value={baseRoleValue}
                        onChange={handleUpdateBaseRole}
                        className="flexbox-imp flexbox-col dc__inline-radio-group dc__no-border-imp base-role-selector"
                    >
                        {children}
                    </RadioGroup>
                )}
            </>
        )
    }
    return (
        <div className="flexbox-col dc__gap-4">
            <div className="border__secondary--bottom" />
            <RoleSelectorGroupHeader
                label={label}
                showToggle
                onChange={toggleAccessManagerRoles}
                toggleSelected={toggleConfig.accessManagerRoles}
            />
            {toggleConfig.accessManagerRoles && children}
        </div>
    )
}

const renderValueContainer = (roleConfig: UserRoleConfig, props: ValueContainerProps<RoleSelectorOptionType>) => {
    const { selectProps } = props
    const selectedRolesText = getSelectedRolesText(roleConfig)

    return (
        <components.ValueContainer {...props}>
            {selectedRolesText ? <span className="dc__truncate">{selectedRolesText}</span> : selectProps.placeholder}
        </components.ValueContainer>
    )
}

const RoleSelector = ({ permission, handleUpdateDirectPermissionRoleConfig }: RoleSelectorProps) => {
    const { customRoles } = useAuthorizationContext()
    const { allowManageAllAccess, isLoggedInUserSuperAdmin } = usePermissionConfiguration()
    const { accessType, roleConfig, team, roleConfigError } = permission
    const [toggleConfig, setToggleConfig] = useState<RoleSelectorToggleConfig>(
        getDefaultRoleConfig(!!permission.roleConfig.accessManagerRoles.size),
    )

    const handleUpdateBaseRole = (event: ChangeEvent<HTMLInputElement>) => {
        handleUpdateDirectPermissionRoleConfig({ ...roleConfig, baseRole: event.target.value })
    }

    const handleUpdateAdditionalRoles = (updatedAdditionalRoles: UserRoleConfig['additionalRoles']) => {
        handleUpdateDirectPermissionRoleConfig({ ...roleConfig, additionalRoles: updatedAdditionalRoles })
    }

    const handleUpdateAccessManagerRoles = (updatedAccessRoles: UserRoleConfig['accessManagerRoles']) => {
        handleUpdateDirectPermissionRoleConfig({ ...roleConfig, accessManagerRoles: updatedAccessRoles })
    }

    const handleChangeAdditionalOrAccessRole = (isRoleSelected: boolean, value: string, roleType: RoleType) => {
        const currentSet = roleType !== 'baseRole' && roleConfig[roleType]
        if (isRoleSelected) {
            currentSet.delete(value)
        } else {
            currentSet.add(value)
        }

        if (roleType === 'additionalRoles') {
            handleUpdateAdditionalRoles(currentSet)
            return
        }
        handleUpdateAccessManagerRoles(currentSet)
    }

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
                handleUpdateAccessManagerRoles(new Set())
            }
            return { ...prev, accessManagerRoles: !prev.accessManagerRoles }
        })
    }

    const ValueContainer = (props: ValueContainerProps<RoleSelectorOptionType>) =>
        renderValueContainer(roleConfig, props)

    const Group = (props: GroupProps) =>
        renderGroup({
            props,
            baseRoleValue: roleConfig.baseRole,
            handleUpdateBaseRole,
            toggleConfig,
            toggleBaseRole,
            toggleAccessManagerRoles,
            showToggle: isLoggedInUserSuperAdmin,
        })

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

        const handleUpdateRole = () => handleChangeAdditionalOrAccessRole(isRoleSelected, value, roleType)
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
                    <div
                        className="flexbox dc__align-items-center"
                        role="button"
                        tabIndex={0}
                        onClick={handleUpdateRole}
                    >
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
                    ValueContainer,
                }}
                styles={roleSelectorStyles}
                closeMenuOnSelect={false}
                isSearchable={false}
                placeholder="Select roles"
                menuPlacement="auto"
                isDisabled={!team}
                hideSelectedOptions={false}
                isMulti
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
