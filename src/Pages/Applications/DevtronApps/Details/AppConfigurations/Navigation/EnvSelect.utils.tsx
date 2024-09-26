import { components, DropdownIndicatorProps, OptionProps } from 'react-select'

import { commonSelectStyles, getCommonSelectStyle } from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as ArrowDown } from '@Icons/ic-chevron-down.svg'
import { ReactComponent as ProtectedIcon } from '@Icons/ic-shield-protect-fill.svg'
import { EnvironmentOptionType } from '@Pages/Applications/DevtronApps/Details/AppConfigurations/AppConfig.types'

export const EnvSelectDropdownIndicator = (props: DropdownIndicatorProps) => (
    <components.DropdownIndicator {...props}>
        <ArrowDown className="icon-dim-16 fcn-6" data-testid="env-configuration-dropdown" />
    </components.DropdownIndicator>
)

export const envSelectStyles = getCommonSelectStyle({
    container: (base, state) => ({ ...commonSelectStyles.container(base, state), flexGrow: 1 }),
    menu: (base) => ({ ...base, minWidth: '238px', left: '-32px' }),
    control: (base, state) => ({
        ...commonSelectStyles.control(base, state),
        border: 'none',
        flexGrow: 1,
        maxWidth: '200px',
        flexWrap: 'nowrap',
        backgroundColor: 'transparent',
        minHeight: '0',
        justifyContent: 'flex-start',
    }),
    valueContainer: (base) => ({
        ...commonSelectStyles.valueContainer(base),
        padding: '0',
        flex: 'initial',
        fontSize: '13px',
        fontWeight: 600,
        lineHeight: '20px',
    }),
    singleValue: (base) => ({ ...base, margin: '0', color: 'var(--N900)' }),
    input: (base) => ({ ...base, margin: '0', padding: '0' }),
    dropdownIndicator: (base, state) => ({
        ...commonSelectStyles.dropdownIndicator(base, state),
        padding: '0',
    }),
    option: (base, state) => ({
        ...commonSelectStyles.option(base, state),
        padding: '6px 8px',
        ...(state.isFocused ? { backgroundColor: 'var(--N50)' } : {}),
        ...(state.isSelected
            ? {
                  color: 'var(--B500)',
                  backgroundColor: 'var(--B100)',
              }
            : {}),
    }),
})

export const EnvSelectOption = (props: OptionProps<EnvironmentOptionType>) => {
    const { data, label } = props

    return (
        <components.Option {...props}>
            <div className="flexbox dc__align-items-center dc__gap-8">
                <span className="flex-grow-1 dc__align-left">{label}</span>
                {data.isProtected && <ProtectedIcon className="icon-dim-20 fcv-5 dc__no-shrink" />}
            </div>
        </components.Option>
    )
}
