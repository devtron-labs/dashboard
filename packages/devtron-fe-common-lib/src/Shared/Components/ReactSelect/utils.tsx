/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { cloneElement } from 'react'
import Tippy from '@tippyjs/react'
import { components, MenuListProps, ValueContainerProps } from 'react-select'
import { OptionType, Progressing, stopPropagation } from '../../../Common'
import { ReactComponent as ICSearch } from '../../../Assets/Icon/ic-search.svg'
import { ReactComponent as ICFilter } from '../../../Assets/Icon/ic-filter.svg'
import { ReactComponent as ICFilterApplied } from '../../../Assets/Icon/ic-filter-applied.svg'

export const getCommonSelectStyle = (styleOverrides = {}) => ({
    container: (base, state) => ({
        ...base,
        ...(state.isDisabled && {
            cursor: 'not-allowed',
            pointerEvents: 'auto',
        }),
    }),
    menuList: (base) => ({
        ...base,
        padding: 0,
        paddingBlock: '4px',
        cursor: 'pointer',
    }),
    control: (base, state) => ({
        ...base,
        minHeight: '32px',
        boxShadow: 'none',
        backgroundColor: state.isDisabled ? 'var(--N100)' : 'var(--N50)',
        border: '1px solid var(--N200)',
        cursor: state.isDisabled ? 'not-allowed' : 'pointer',

        '&:hover': {
            borderColor: 'var(--N300)',
        },
        '&:focus, &:focus-within': {
            borderColor: 'var(--B500)',
            outline: 'none',
        },
    }),
    option: (base, state) => ({
        ...base,
        color: 'var(--N900)',
        // eslint-disable-next-line no-nested-ternary
        backgroundColor: state.isSelected ? 'var(--B100)' : state.isFocused ? 'var(--N100)' : 'white',
        padding: '10px 12px',
        cursor: 'pointer',
        fontSize: '13px',
        lineHeight: '20px',
        fontWeight: 400,

        ':active': {
            backgroundColor: 'var(--N100)',
        },
    }),
    dropdownIndicator: (base, state) => ({
        ...base,
        color: 'var(--N600)',
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
    placeholder: (base) => ({
        ...base,
        color: 'var(--N500)',
        fontSize: '13px',
        lineHeight: '20px',
        fontWeight: 400,
        margin: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    }),
    group: (base) => ({
        ...base,
        paddingTop: '4px',
        paddingBottom: 0,
    }),
    groupHeading: (base) => ({
        ...base,
        fontWeight: 600,
        fontSize: '12px',
        color: 'var(--N900)',
        backgroundColor: 'var(--N100)',
        marginBottom: 0,
        padding: '4px 8px',
        textTransform: 'none',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    }),
    ...styleOverrides,
})

const getCustomOptionBackgroundColor = (isSelected: boolean, isFocused: boolean) => {
    if (isSelected) {
        return 'var(--B100)'
    }

    if (isFocused) {
        return 'var(--N50)'
    }

    return 'var(--white)'
}

export const getCustomOptionSelectionStyle =
    (styleOverrides = {}) =>
    (base, state) => ({
        ...base,
        backgroundColor: getCustomOptionBackgroundColor(state.isSelected, state.isFocused),
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

export const SelectOption = (props: any) => {
    const { selectProps, data, showTippy, style, placement, tippyContent, tippyClass } = props
    selectProps.styles.option = getCustomOptionSelectionStyle(style)
    const getOption = () => (
        <div onClick={stopPropagation}>
            <components.Option {...props} />
        </div>
    )

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

export const LoadingIndicator = () => <Progressing />

export const GroupHeading = (props: any) => {
    const { data } = props
    if (!data.label) {
        return null
    }

    return (
        <components.GroupHeading {...props}>
            <div className="flex dc__no-text-transform flex-justify dc__truncate-text h-100">
                <span className="dc__truncate-text">{data.label}</span>
            </div>
        </components.GroupHeading>
    )
}

export const commonSelectStyles = getCommonSelectStyle()

export const MenuListWithApplyButton = ({
    handleApplyFilter,
    ...props
}: MenuListProps & { handleApplyFilter: () => void }) => {
    const handleApplyClick = () => {
        props.selectProps.onInputChange('', {
            action: 'set-value',
            prevInputValue: props.selectProps.inputValue,
        })
        handleApplyFilter()
    }

    return (
        <>
            <components.MenuList {...props} />
            {props.selectProps.options.length > 0 && (
                <div className="p-8 dc__position-sticky dc__bottom-0 dc__border-top-n1 bcn-0 dc__bottom-radius-4">
                    <button
                        type="button"
                        className="dc__unset-button-styles w-100 br-4 h-28 flex bcb-5 cn-0 fw-6 lh-28 fs-12 h-28 br-4 pt-5 pr-12 pb-5 pl-12"
                        onClick={handleApplyClick}
                        aria-label="Apply filters"
                    >
                        Apply
                    </button>
                </div>
            )}
        </>
    )
}

export const MultiSelectValueContainer = ({
    title,
    ...props
}: ValueContainerProps<OptionType, true> & { title: string }) => {
    const { children, selectProps, getValue } = props
    const value = getValue() || []

    const renderContainer = () => {
        if (selectProps.menuIsOpen) {
            if (!selectProps.inputValue) {
                return (
                    <>
                        <ICSearch className="icon-dim-16 dc__no-shrink mr-4 mw-18" />
                        <span className="dc__position-abs dc__left-35 cn-5 ml-2">{selectProps.placeholder}</span>
                    </>
                )
            }

            return <ICSearch className="icon-dim-16 dc__no-shrink mr-4 mw-18" />
        }

        if (value.length) {
            return (
                <>
                    <ICFilterApplied className="icon-dim-16 dc__no-shrink mr-4 mw-18" />
                    <span className="dc__position-abs dc__left-35 cn-9 fs-13 fw-4 lh-20">{title}</span>
                </>
            )
        }

        return (
            <>
                <ICFilter className="icon-dim-16 dc__no-shrink mr-4 mw-18" />
                <span className="dc__position-abs dc__left-35 cn-5 fs-13 fw-4 lh-20">{title}</span>
            </>
        )
    }

    return (
        <components.ValueContainer {...props}>
            <div className="flexbox dc__align-items-center">
                {renderContainer()}
                {cloneElement(children[1])}
            </div>
        </components.ValueContainer>
    )
}
