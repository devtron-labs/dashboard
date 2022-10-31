import React from 'react'
import { ReactComponent as ArrowDown } from '../assets/icons/ic-chevron-down.svg'
import { components } from 'react-select'
import Tippy from '@tippyjs/react'
import { noop } from '../../common'

export const getCustomOptionSelectionStyle = (styleOverrides = {}) => {
    return (base, state) => ({
        ...base,
        backgroundColor: state.isSelected ? 'var(--B100)' : state.isFocused ? 'var(--N50)' : 'white',
        color: state.isSelected ? 'var(--B500)' : 'var(--N900)',
        textOverflow: 'ellipsis',
        fontWeight: '500',
        overflow: 'hidden',
        textAlign: 'left',
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        fontSize: '13px',
        ...styleOverrides,
    })
}

export const getCommonSelectStyle = (styleOverrides = {}) => {
    return {
        menuList: (base) => ({
            ...base,
            paddingTop: 0,
            paddingBottom: 0,
        }),
        control: (base, state) => ({
            ...base,
            minHeight: '32px',
            boxShadow: 'none',
            backgroundColor: 'var(--N50)',
            border: state.isFocused ? '1px solid var(--B500)' : '1px solid var(--N200)',
            cursor: 'pointer',
        }),
        option: (base, state) => ({
            ...base,
            color: 'var(--N900)',
            backgroundColor: state.isFocused ? 'var(--N100)' : 'white',
            padding: '10px 12px',
        }),
        dropdownIndicator: (base, state) => ({
            ...base,
            color: 'var(--N400)',
            padding: '0 8px',
            transition: 'all .2s ease',
            transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
        }),
        valueContainer: (base) => ({
            ...base,
            padding: '0 8px',
            fontWeight: '400',
        }),
        loadingMessage: (base) => ({
            ...base,
            color: 'var(--N600)',
        }),
        noOptionsMessage: (base) => ({
            ...base,
            color: 'var(--N600)',
        }),
        ...styleOverrides,
    }
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
            color: state.isSelected ? 'var(--B500)' : 'var(--N900)',
            backgroundColor: state.isFocused ? 'var(--N50)' : 'white',
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

export function customOption(label: string, icon: string, className = '', onImageLoadError = noop) {
    return (
        <div className={`flex left ${className}`}>
            {icon && <img src={icon} alt={label} className="icon-dim-16 mr-8" onError={onImageLoadError} />}
            <span className="dc__ellipsis-right">{label}</span>
        </div>
    )
}

export function OptionWithIcon(props) {
    const { data } = props
    return <components.Option {...props}>{customOption(data.label, data.icon)}</components.Option>
}

export function ValueContainerWithIcon(props) {
    const { selectProps } = props
    return (
        <components.ValueContainer {...props}>
            {selectProps.value ? (
                <>
                    {customOption(selectProps.value.label, selectProps.value.icon, 'dc__position-abs pl-10 pr-10')}
                    {React.cloneElement(props.children[1])}
                </>
            ) : (
                <>{props.children}</>
            )}
        </components.ValueContainer>
    )
}
