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

import { CHECKBOX_VALUE } from '@Common/Types'
import { ComponentSizeType } from '@Shared/constants'
import { GroupBase, MultiValue, OptionsOrGroups, StylesConfig } from 'react-select'
import { SelectPickerOptionType, SelectPickerProps, SelectPickerVariantType } from './type'

const getMenuWidthFromSize = <OptionValue, IsMulti extends boolean>(
    menuSize: SelectPickerProps<OptionValue, IsMulti>['menuSize'],
): { width: string; minWidth: string } => {
    switch (menuSize) {
        case ComponentSizeType.medium:
            return {
                width: '125%',
                minWidth: '250px',
            }
        case ComponentSizeType.large:
            return {
                width: '150%',
                minWidth: '300px',
            }
        case ComponentSizeType.small:
        default:
            return {
                width: '100%',
                minWidth: '200px',
            }
    }
}

const getVariantOverrides = <OptionValue>(
    variant: SelectPickerVariantType,
): StylesConfig<SelectPickerOptionType<OptionValue>> => {
    switch (variant) {
        case SelectPickerVariantType.BORDER_LESS:
            return {
                control: () => ({
                    backgroundColor: 'transparent',
                    border: 'none',
                    padding: 0,
                    gap: '2px',
                }),
                singleValue: () => ({
                    fontWeight: 600,
                }),
            }
        default:
            return null
    }
}

const getOptionBgColor = <OptionValue>(
    state: Parameters<StylesConfig<SelectPickerOptionType<OptionValue>>['option']>[1],
): string => {
    if (state.isSelected && !state.selectProps.isMulti) {
        return 'var(--B100)'
    }

    if (state.isFocused) {
        return 'var(--N50)'
    }

    return 'var(--N0)'
}

export const getCommonSelectStyle = <OptionValue, IsMulti extends boolean>({
    error,
    size,
    menuSize,
    variant,
    getIsOptionValid,
    isGroupHeadingSelectable,
    shouldMenuAlignRight,
}: Pick<SelectPickerProps<OptionValue, IsMulti>, 'error' | 'size' | 'menuSize' | 'variant' | 'shouldMenuAlignRight'> &
    Pick<
        SelectPickerProps<OptionValue, IsMulti>['multiSelectProps'],
        'getIsOptionValid' | 'isGroupHeadingSelectable'
    >): StylesConfig<SelectPickerOptionType<OptionValue>> => ({
    container: (base, state) => ({
        ...base,
        ...(state.isDisabled && {
            cursor: 'not-allowed',
            pointerEvents: 'auto',
        }),
    }),
    menu: (base) => ({
        ...base,
        overflow: 'hidden',
        marginBlock: '4px',
        backgroundColor: 'var(--N0)',
        border: '1px solid var(--N200)',
        boxShadow: '0px 2px 4px 0px rgba(0, 0, 0, 0.20)',
        width: getMenuWidthFromSize(menuSize).width,
        minWidth: getMenuWidthFromSize(menuSize).minWidth,
        zIndex: 'var(--select-picker-menu-index)',
        ...(shouldMenuAlignRight && {
            right: 0,
        }),
    }),
    menuList: (base) => ({
        ...base,
        padding: 0,
    }),
    control: (base, state) => ({
        ...base,
        minHeight: size === ComponentSizeType.medium ? 'auto' : '36px',
        minWidth: '56px',
        boxShadow: 'none',
        backgroundColor: 'var(--N50)',
        border: `1px solid ${error ? 'var(--R500)' : 'var(--N200)'}`,
        cursor: state.isDisabled ? 'not-allowed' : 'pointer',
        padding: '5px 8px',
        gap: '6px',
        opacity: state.isDisabled ? 0.5 : 1,
        flexWrap: 'nowrap',
        maxHeight: '120px',
        overflow: 'auto',
        alignItems: 'safe center',
        ...(getVariantOverrides(variant)?.control(base, state) || {}),

        '&:hover': {
            borderColor: state.isDisabled ? 'var(--N200)' : 'var(--N300)',
        },
        '&:focus, &:focus-within': {
            borderColor: state.isDisabled ? 'var(--N200)' : 'var(--B500)',
            outline: 'none',
        },
    }),
    option: (base, state) => ({
        ...base,
        color: 'var(--N900)',
        backgroundColor: getOptionBgColor(state),
        padding: '6px 8px',
        cursor: 'pointer',
        fontSize: '13px',
        lineHeight: '20px',
        fontWeight: 400,

        ':active': {
            backgroundColor: 'var(--N100)',
        },

        ':hover': {
            backgroundColor: 'var(--N50)',
        },

        ...(state.isDisabled && {
            cursor: 'not-allowed',
            opacity: 0.5,
        }),
    }),
    dropdownIndicator: (base, state) => ({
        ...base,
        color: 'var(--N600)',
        padding: '0',
        transition: 'all .2s ease',
        transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
    }),
    clearIndicator: (base) => ({
        ...base,
        padding: 0,

        '&:hover': {
            backgroundColor: 'transparent',
            color: 'inherit',

            'svg use': {
                fill: 'var(--R500)',
            },
        },
    }),
    valueContainer: (base, state) => ({
        ...base,
        padding: '0',
        fontWeight: '400',
        ...(state.selectProps.isMulti && {
            gap: '6px',
        }),
    }),
    multiValue: (base, state) => {
        const isOptionValid = getIsOptionValid(state.data)

        return {
            ...base,
            background: isOptionValid ? 'var(--N0)' : 'var(--R100)',
            border: isOptionValid ? '1px solid var(--N200)' : '1px solid var(--R200)',
            borderRadius: '4px',
            padding: '1px 5px',
            maxWidth: '250px',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
        }
    },
    multiValueLabel: (base) => ({
        ...base,
        borderRadius: 0,
        color: 'var(--N900)',
        fontSize: '12px',
        fontWeight: 400,
        lineHeight: '20px',
        padding: 0,
        paddingLeft: 0,
    }),
    multiValueRemove: (base) => ({
        ...base,
        padding: 0,
        borderRadius: 0,

        '&:hover': {
            backgroundColor: 'var(--R100)',
            color: 'inherit',
            borderRadius: '2px',

            'svg use': {
                fill: 'var(--R500)',
            },
        },
    }),
    loadingMessage: (base) => ({
        ...base,
        color: 'var(--N600)',
    }),
    noOptionsMessage: (base) => ({
        ...base,
        color: 'var(--N600)',
    }),
    group: (base) => ({
        ...base,
        paddingTop: '4px',
        paddingBottom: 0,

        '&:first-child': {
            paddingTop: 0,
        },
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
        position: 'sticky',
        top: 0,
        zIndex: 1,

        ...(isGroupHeadingSelectable && {
            cursor: 'pointer',
        }),
    }),
    input: (base) => ({
        ...base,
        margin: 0,
        padding: 0,
        color: 'var(--N900)',
        size: '13px',
        fontWeight: 400,
        lineHeight: '20px',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'clip',
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
    indicatorsContainer: (base) => ({
        ...base,
        gap: '4px',
        flexShrink: 0,
    }),
    singleValue: (base, state) => ({
        ...base,
        margin: 0,
        color: 'var(--N900)',
        fontSize: '13px',
        fontWeight: 400,
        lineHeight: '20px',
        ...(getVariantOverrides(variant)?.singleValue(base, state) || {}),
    }),
})

export const getGroupCheckboxValue = <OptionValue>(
    groupHeadingOptions: readonly SelectPickerOptionType<OptionValue>[],
    selectedOptions: MultiValue<SelectPickerOptionType<OptionValue>>,
    getOptionValue: (option: SelectPickerOptionType<OptionValue>) => string,
) => {
    const selectedOptionsMapByValue = selectedOptions.reduce<Record<string, true>>((acc, option) => {
        acc[getOptionValue(option)] = true
        return acc
    }, {})
    const groupOptionsComputedValue = groupHeadingOptions.map((option) => getOptionValue(option))

    const isEveryOptionInGroupSelected = groupOptionsComputedValue.every((value) => selectedOptionsMapByValue[value])

    if (isEveryOptionInGroupSelected) {
        return CHECKBOX_VALUE.CHECKED
    }

    const isSomeOptionInGroupSelected = groupOptionsComputedValue.some((value) => selectedOptionsMapByValue[value])

    if (isSomeOptionInGroupSelected) {
        return CHECKBOX_VALUE.INTERMEDIATE
    }

    return null
}

/**
 * Retrieves an option from the options list based on the provided value.
 *
 * @param optionsList - The list of options or groups of options.
 * @param value - The value to compare against the options' values.
 * @param defaultOption - The default option to return if no match is found.
 * @returns The matched option or the default option if no match is found.
 */
export const getSelectPickerOptionByValue = <OptionValue>(
    optionsList: OptionsOrGroups<SelectPickerOptionType<OptionValue>, GroupBase<SelectPickerOptionType<OptionValue>>>,
    value: OptionValue,
    defaultOption: SelectPickerOptionType<OptionValue> = { label: '', value: '' as unknown as OptionValue },
): SelectPickerOptionType<OptionValue> => {
    if (!Array.isArray(optionsList)) {
        return defaultOption
    }

    const foundOption = optionsList.reduce(
        (acc, curr) => {
            if (!acc.notFound) return acc

            if ('value' in curr && curr.value === value) {
                return { data: curr, notFound: false }
            }

            if ('options' in curr && curr.options) {
                const nestedOption = curr.options.find(({ value: _value }) => _value === value)
                if (nestedOption) {
                    return { data: nestedOption, notFound: false }
                }
            }

            return acc
        },
        { notFound: true, data: defaultOption },
    ).data

    return foundOption
}
