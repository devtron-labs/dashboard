import React from 'react'
import { ReactComponent as ArrowDown } from '../assets/icons/ic-chevron-down.svg'
import { ReactComponent as Check } from '../assets/icons/ic-check.svg'
import DefaultIcon from '../../../assets/icons/ic-browser.svg'
import { components } from 'react-select'
import Tippy from '@tippyjs/react'

export const getCustomOptionSelectionStyle = (styleOverrides = {}) => {
    return (base, state) => ({
        ...base,
        backgroundColor: state.isSelected ? 'var(--B100)' : state.isFocused ? 'var(--N100)' : 'white',
        color: state.isSelected ? 'var(--B500)' : 'var(--N900)',
        textOverflow: 'ellipsis',
        fontWeight: '500',
        overflow: 'hidden',
        textAlign: 'left',
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        ...styleOverrides,
    })
}
export const styles = {
    control: (base, state) => ({
        ...base,
        boxShadow: 'none',
        border: state.isFocused ? '1px solid var(--B500)' : '1px solid var(--N200)',
    }),
    menu: (base, state) => {
        return {
            ...base,
            top: `0px`,
            backgroundColor: state.Selected ? 'white' : 'white',
        }
    },
    singleValue: (base, state) => {
        return {
            ...base,
            color: 'var(--N900)',
        }
    },
    option: (base, state) => {
        return {
            ...base,
            color: 'var(--N900)',
            backgroundColor: state.isFocused ? 'var(--N100)' : 'white',
        }
    },
}

export function Option(props) {
    const { selectProps, data, showTippy, style } = props
    selectProps.styles.option = getCustomOptionSelectionStyle(style)
    const getOption = () => {
        return (
            <div>
                <components.Option {...props} />
            </div>
        )
    }

    return showTippy ? (
        <Tippy className="default-white" arrow={false} placement="right" content={data.label}>
            {getOption()}
        </Tippy>
    ) : (
        getOption()
    )
}

export function DropdownIndicator(props) {
    return (
        <components.DropdownIndicator {...props}>
            <ArrowDown className="icon-dim-20 icon-n5" />
        </components.DropdownIndicator>
    )
}
