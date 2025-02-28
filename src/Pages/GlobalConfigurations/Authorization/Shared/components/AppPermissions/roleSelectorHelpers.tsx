import { noop, RadioGroup, Tooltip, UserRoleConfig } from '@devtron-labs/devtron-fe-common-lib'
import { importComponentFromFELibrary } from '@Components/common'
import { components } from 'react-select'
import { RoleSelectorGroupHeaderProps, RoleSelectorGroupParams, RoleSelectorOptionParams } from './types'
import { ACCESS_ROLE_OPTIONS_CONTAINER_ID } from './constants'

const ToggleEnableRole = importComponentFromFELibrary('ToggleEnableRole', null, 'function')

export const MANGER_ROLE_DEPRECATION_WARNING = importComponentFromFELibrary(
    'MANGER_ROLE_DEPRECATION_WARNING',
    null,
    'function',
)

export const renderRoleInfoTippy = (label: string, description: string) => (
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
        <div className="flexbox dc__align-items-center dc__content-space px-8 py-6 bg__menu--secondary br-4">
            <span className="fs-13 fw-4 lh-20">{label}</span>
            {ToggleEnableRole && showToggle && <ToggleEnableRole selected={toggleSelected} onChange={onChange} />}
        </div>
    </Tooltip>
)

export const renderGroup = ({
    props,
    baseRoleValue,
    toggleConfig,
    showToggle,
    toggleBaseRole,
    toggleAccessManagerRoles,
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
                        onChange={noop}
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
            {toggleConfig.accessManagerRoles && <div id={ACCESS_ROLE_OPTIONS_CONTAINER_ID}>{children}</div>}
        </div>
    )
}

export const renderOption = ({
    props,
    roleConfig,
    handleUpdateDirectPermissionRoleConfig,
}: RoleSelectorOptionParams) => {
    const { children, data } = props
    const { value, roleType } = data

    const handleUpdateBaseRole = () => {
        handleUpdateDirectPermissionRoleConfig({ ...roleConfig, baseRole: value })
    }

    const handleUpdateAdditionalRoles = (updatedAdditionalRoles: UserRoleConfig['additionalRoles']) => {
        handleUpdateDirectPermissionRoleConfig({ ...roleConfig, additionalRoles: updatedAdditionalRoles })
    }

    const handleUpdateAccessManagerRoles = (updatedAccessRoles: UserRoleConfig['accessManagerRoles']) => {
        handleUpdateDirectPermissionRoleConfig({ ...roleConfig, accessManagerRoles: updatedAccessRoles })
    }

    const handleChangeAdditionalOrAccessRole = () => {
        const currentSet = roleType !== 'baseRole' && roleConfig[roleType]
        if (currentSet.has(value)) {
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

    return (
        <components.Option {...props}>
            <div
                className="px-8 py-6"
                onClick={roleType === 'baseRole' ? handleUpdateBaseRole : handleChangeAdditionalOrAccessRole}
            >
                {children}
            </div>
        </components.Option>
    )
}
