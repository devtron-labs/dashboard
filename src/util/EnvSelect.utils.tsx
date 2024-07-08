import React from 'react'
import { components, DropdownIndicatorProps } from 'react-select'

import { commonSelectStyles, getCommonSelectStyle } from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as ArrowDown } from '../assets/icons/ic-chevron-down.svg'

export const EnvSelectDropdownIndicator = (props: DropdownIndicatorProps) => {
    return (
        <components.DropdownIndicator {...props}>
            <ArrowDown className="icon-dim-16 fcn-6" data-testid="env-configuration-dropdown" />
        </components.DropdownIndicator>
    )
}

export const envSelectStyles = getCommonSelectStyle({
    container: (base, state) => ({ ...commonSelectStyles.container(base, state), flexGrow: 1 }),
    menu: (base) => ({ ...base, minWidth: '238px', left: '-32px' }),
    control: (base, state) => ({
        ...commonSelectStyles.control(base, state),
        border: 'none',
        flexGrow: 1,
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
    }),
    singleValue: (base) => ({ ...base, margin: '0' }),
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
