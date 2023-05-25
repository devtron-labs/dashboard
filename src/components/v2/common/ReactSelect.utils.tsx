import React from 'react'
import { ReactComponent as ArrowDown } from '../assets/icons/ic-chevron-down.svg'
import { components } from 'react-select'
import Tippy from '@tippyjs/react'
import { noop, stopPropagation } from '@devtron-labs/devtron-fe-common-lib'
import { Environment } from '../../cdPipeline/cdPipeline.types'

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
    const { selectProps, data, showTippy, style, placement, tippyContent, tippyClass } = props
    selectProps.styles.option = getCustomOptionSelectionStyle(style)
    const getOption = () => {
        return (
            <div onClick={stopPropagation}>
                <components.Option {...props} />
            </div>
        )
    }

    return showTippy ? (
        <Tippy
            className={tippyClass || 'default-white'}
            arrow={false}
            placement={placement || 'right'}
            content={tippyContent || data.label}
        >
            {getOption()}
        </Tippy>
    ) : (
        getOption()
    )
}

export function DropdownIndicator(props) {
    return (
        <components.DropdownIndicator {...props}>
            <ArrowDown className="icon-dim-20 icon-n5" data-testid="overview-project-edit-dropdown" />
        </components.DropdownIndicator>
    )
}

export function customOption(label: string, icon: string, className = '', onImageLoadError = noop) {
    return (
        <div className={`flex left ${className}`}>
            {icon && <img src={icon} alt={label} className="icon-dim-20 mr-8" onError={onImageLoadError} />}
            <span className="dc__ellipsis-right">{label}</span>
        </div>
    )
}

export function OptionWithIcon(props) {
    const { selectProps, data, style } = props
    selectProps.styles.option = getCustomOptionSelectionStyle(style)
    return <components.Option {...props}>{customOption(data.label, data.icon)}</components.Option>
}

export function ValueContainerWithIcon(props) {
    const { selectProps } = props
    return (
        <components.ValueContainer {...props}>
            {selectProps.value ? (
                <>
                    {customOption(selectProps.value.label, selectProps.value.icon)}
                    {React.cloneElement(props.children[1], {
                        style: { position: 'absolute' },
                    })}
                </>
            ) : (
                <>{props.children}</>
            )}
        </components.ValueContainer>
    )
}

export const noMatchingOptions = () => 'No matching results'

export const formatOptionLabel = (option): JSX.Element => {
    return (
        <div className="flex left column">
            <span className="w-100 dc__ellipsis-right">{option.label}</span>
            {option.infoText && <small className="cn-6">{option.infoText}</small>}
        </div>
    )
}

export const CustomValueContainer = (props): JSX.Element => {
    return (
        <components.ValueContainer {...props}>
            {(!props.selectProps.menuIsOpen || !props.selectProps.inputValue) &&
                (props.selectProps.value?.label ? (
                    <span className={`dc__position-abs cn-9 ml-4 ${props.valClassName ?? ''}`}>{props.selectProps.value.label}</span>
                ) : (
                    <span className="dc__position-abs cn-5 ml-8">{props.selectProps.placeholder}</span>
                ))}
            {React.cloneElement(props.children[1])}
        </components.ValueContainer>
    )
}

export const menuComponent = (props, text) => {
    return (
        <components.MenuList {...props}>
            <div className="fw-4 lh-20 pl-8 pr-8 pt-6 pb-6 cn-7 fs-13 dc__italic-font-style">
                {`Type to enter custom ${text}`}
            </div>
            {props.children}
        </components.MenuList>
    )
}

export const noMatchingPlatformOptions = (): string => {
    return 'No matching options'
}

export function GroupHeading(props) {
    const {data, hideClusterName} = props
    if (!data.label) return null
    return (
        <components.GroupHeading {...props}>
            <div className="flex dc__no-text-transform flex-justify h-100">
                {!hideClusterName ? 'Cluster : ' : ''} {data.label}
            </div>
        </components.GroupHeading>
    )
}

export function EnvFormatOptions(props) {
    const { data, environmentfieldName } = props
    return <components.SingleValue {...props}>{data[environmentfieldName]}</components.SingleValue>
}

export function formatHighlightedText(option: Environment, inputValue: string, environmentfieldName: string) {
    const highLightText = (highlighted) => `<mark>${highlighted}</mark>`
    const regex = new RegExp(inputValue, 'gi')
    return (
        <div className="flex left column dc__highlight-text" data-testid={option[environmentfieldName]}>
            <span
                className="w-100 dc__ellipsis-right"
                dangerouslySetInnerHTML={{
                    __html: option[environmentfieldName].replace(regex, highLightText),
                }}
            />
            {option.clusterName && option.namespace && (
                <small
                    className="cn-6"
                    dangerouslySetInnerHTML={{
                        __html: (option.clusterName + '/' + option.namespace).replace(regex, highLightText),
                    }}
                ></small>
            )}
        </div>
    )
}

export function formatHighlightedTextDescription(option: Environment, inputValue: string, environmentfieldName: string) {
    const highLightText = (highlighted) => `<mark>${highlighted}</mark>`
    const regex = new RegExp(inputValue, 'gi')
    return (
        <div className="flex left column dc__highlight-text">
            <span
                className="w-100 dc__ellipsis-right"
                dangerouslySetInnerHTML={{
                    __html: option[environmentfieldName].replace(regex, highLightText),
                }}
            />
            {option.description && (
                <small
                    className="cn-6"
                    dangerouslySetInnerHTML={{
                        __html: (option.description + '').replace(regex, highLightText),
                    }}
                ></small>
            )}
        </div>
    )
}

