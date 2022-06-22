import React from 'react'
import Select, { components } from 'react-select'
import { ReactComponent as ClearIcon } from '../../../assets/icons/ic-appstatus-cancelled.svg'
import { ReactComponent as Check } from '../../../assets/icons/appstatus/ic-check.svg'
import { ReactComponent as RedWarning } from '../../../assets/icons/ic-error-medium.svg'

export const Option = (props) => {
    const { selectOption, data } = props
    return (
        <div className="flex left pl-12" style={{ background: props.isFocused ? 'var(--N100)' : 'transparent' }}>
            <input
                checked={props.isSelected}
                onChange={(e) => selectOption(data)}
                type="checkbox"
                style={{ height: '16px', width: '16px', flex: '0 0 16px' }}
                className="mr-8"
            />
            <components.Option {...props} />
        </div>
    )
}

export const SingleSelectOption = (props) => {
    const { selectOption, data } = props
    const style = { height: '16px', width: '16px', flex: '0 0 16px' }
    const onClick = (e) => selectOption(data)
    return (
        <div className="flex left pl-12" style={{ background: props.isFocused ? 'var(--N100)' : 'transparent' }}>
            {props.isSelected ? (
                <Check onClick={onClick} className="mr-8 icon-dim-16" style={style} />
            ) : (
                <span onClick={onClick} className="mr-8" style={style} />
            )}
            <components.Option {...props} />
        </div>
    )
}

export const MultiValueContainer = (props) => {
    const { children, data, innerProps, selectProps } = props
    const { label, value } = data
    return (
        <components.MultiValueContainer {...{ data, innerProps, selectProps }}>
            <div className={`flex fs-12 ml-4 cn-9`}>{label}</div>
            {children[1]}
        </components.MultiValueContainer>
    )
}

export const ClearIndicator = (props) => {
    const {
        children = <ClearIcon className="icon-dim-24" />,
        getStyles,
        innerProps: { ref, ...restInnerProps },
    } = props
    return (
        <div {...restInnerProps} ref={ref} style={getStyles('clearIndicator', props)}>
            <div className="flex pointer">{children}</div>
        </div>
    )
}

export const MultiValueRemove = (props) => {
    const {
        data,
        innerProps: { onClick, onMouseDown },
        selectProps,
    } = props
    return (
        <components.MultiValueRemove {...props}>
            <ClearIcon
                {...{ onClick, onMouseDown }}
                onClick={(e) => onClick(data)}
                style={{ height: '18px', width: '18px' }}
            />
        </components.MultiValueRemove>
    )
}

export const MultiValueChipContainer = ({ validator, ...props }) => {
    const { children, data, innerProps, selectProps } = props
    const { label, value } = data
    const isValidEmail = validator ? validator(value) : true
    return (
        <components.MultiValueContainer {...{ data, innerProps, selectProps }}>
            <div className={`flex fs-12 pl-4 pr-4`}>
                {!isValidEmail && <RedWarning className="mr-4 icon-dim-16" />}
                <div className={`${isValidEmail ? 'cn-9' : 'cr-5'}`}>{label}</div>
            </div>
            {children[1]}
        </components.MultiValueContainer>
    )
}

export const multiSelectStyles = {
    control: (base, state) => ({
        ...base,
        cursor: state.isDisabled ? 'not-allowed' : 'normal',
        border: state.isFocused ? '1px solid #06c' : '1px solid #d6dbdf',
        boxShadow: 'none',
    }),
    menu: (base, state) => ({
        ...base,
    }),
    option: (base, state) => {
        return {
            ...base,
            backgroundColor: state.isFocused ? 'var(--N100)' : 'white',
            color: 'var(--N900)',
            padding: '8px 12px',
        }
    },
    container: (base, state) => ({
        ...base,
        cursor: state.isDisabled ? 'not-allowed' : 'normal',
    }),
    valueContainer: (base, state) => ({
        ...base,
        color: state.selectProps.menuIsOpen ? 'var(--N500)' : base.color,
    }),
}

interface CustomSelect {
    sortSelected?: boolean

    options: any[]
    onChange: (...args) => void
    value?: any
    name?: string
    placeholder?: string
    className?: string
    classNamePrefix?: string
    menuPortalTarget?: any
    components?: object
    styles?: object
    isMulti?: boolean
    isDisabled?: boolean
    closeMenuOnSelect?: boolean
    hideSelectedOptions?: boolean
    formatOptionLabel?: (...args) => any
}

export const CustomSelect: React.FC<CustomSelect> = (props) => {
    return <Select {...props} />
}
