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

import {
    components,
    DropdownIndicatorProps,
    ControlProps,
    OptionProps,
    ClearIndicatorProps,
    ValueContainerProps,
    MenuListProps,
    MultiValueRemoveProps,
    MultiValueProps,
    MultiValue,
} from 'react-select'
import { Progressing } from '@Common/Progressing'
import { ReactComponent as ICCaretDown } from '@Icons/ic-caret-down.svg'
import { ReactComponent as ICClose } from '@Icons/ic-close.svg'
import { ReactComponent as ICErrorExclamation } from '@Icons/ic-error-exclamation.svg'
import { ChangeEvent } from 'react'
import { noop } from '@Common/Helper'
import { CHECKBOX_VALUE } from '@Common/Types'
import { Checkbox } from '@Common/Checkbox'
import { ReactSelectInputAction } from '@Common/Constants'
import { isNullOrUndefined } from '@Shared/Helpers'
import { Tooltip } from '@Common/Tooltip'
import { TooltipProps } from '@Common/Tooltip/types'
import { SelectPickerGroupHeadingProps, SelectPickerOptionType, SelectPickerProps } from './type'
import { getGroupCheckboxValue } from './utils'

const getTooltipProps = (tooltipProps: SelectPickerOptionType['tooltipProps'] = {}): TooltipProps => {
    if (tooltipProps) {
        if (Object.hasOwn(tooltipProps, 'shortcutKeyCombo') && 'shortcutKeyCombo' in tooltipProps) {
            return tooltipProps
        }

        return {
            // TODO: using some typing somersaults here, clean it up later
            alwaysShowTippyOnHover: !!(tooltipProps as Required<Pick<TooltipProps, 'content'>>)?.content,
            ...(tooltipProps as Required<Pick<TooltipProps, 'content'>>),
        }
    }

    return {
        alwaysShowTippyOnHover: false,
        content: null,
    }
}

export const SelectPickerDropdownIndicator = <OptionValue,>(
    props: DropdownIndicatorProps<SelectPickerOptionType<OptionValue>>,
) => {
    const { isDisabled } = props

    return (
        <components.DropdownIndicator {...props}>
            <ICCaretDown className={`icon-dim-16 ${isDisabled ? 'scn-3' : 'scn-6'} dc__no-shrink`} />
        </components.DropdownIndicator>
    )
}

export const SelectPickerClearIndicator = <OptionValue,>(
    props: ClearIndicatorProps<SelectPickerOptionType<OptionValue>>,
) => (
    <components.ClearIndicator {...props}>
        <ICClose className="icon-dim-16 icon-use-fill-n6 dc__no-shrink" />
    </components.ClearIndicator>
)

export const SelectPickerControl = <OptionValue, IsMulti extends boolean>({
    icon,
    showSelectedOptionIcon,
    ...props
}: ControlProps<SelectPickerOptionType<OptionValue>> &
    Pick<SelectPickerProps<OptionValue, IsMulti>, 'icon' | 'showSelectedOptionIcon'>) => {
    const { children, getValue } = props
    const { startIcon, endIcon } = getValue()?.[0] ?? {}

    let iconToDisplay: SelectPickerOptionType<OptionValue>['startIcon'] = icon

    if (showSelectedOptionIcon && (startIcon || endIcon)) {
        iconToDisplay = startIcon || endIcon
    }

    return (
        <components.Control {...props}>
            {iconToDisplay && (
                <div className="dc__no-shrink icon-dim-20 flex dc__fill-available-space">{iconToDisplay}</div>
            )}
            {children}
        </components.Control>
    )
}

export const SelectPickerValueContainer = <OptionValue, IsMulti extends boolean>({
    showSelectedOptionsCount,
    customSelectedOptionsCount,
    ...props
}: ValueContainerProps<SelectPickerOptionType<OptionValue>> &
    Pick<SelectPickerProps<OptionValue, IsMulti>, 'showSelectedOptionsCount' | 'customSelectedOptionsCount'>) => {
    const { getValue } = props
    const selectedOptionsLength = isNullOrUndefined(customSelectedOptionsCount)
        ? (getValue() ?? []).length
        : customSelectedOptionsCount

    return (
        <div className="flex left dc__gap-8 flex-grow-1">
            <div className="flex left">
                <components.ValueContainer {...props} />
            </div>
            {showSelectedOptionsCount && selectedOptionsLength > 0 && (
                <div className="bcb-50 dc__border eb-2 dc__border-radius-4-imp pl-5 pr-5 cb-5 fs-12 fw-6 lh-18 dc__truncate dc__no-shrink">
                    {selectedOptionsLength}
                </div>
            )}
        </div>
    )
}

export const SelectPickerLoadingIndicator = () => <Progressing />

export const SelectPickerOption = <OptionValue, IsMulti extends boolean>({
    disableDescriptionEllipsis,
    ...props
}: OptionProps<SelectPickerOptionType<OptionValue>> &
    Pick<SelectPickerProps<OptionValue, IsMulti>, 'disableDescriptionEllipsis'>) => {
    const {
        label,
        data,
        selectProps: { isMulti },
        selectOption,
        isDisabled,
        isSelected,
    } = props
    const { description, startIcon, endIcon, tooltipProps } = data ?? {}
    const showDescription = !!description
    // __isNew__ denotes the new option to be created
    const isCreatableOption = '__isNew__' in data && data.__isNew__

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
        e.stopPropagation()
        selectOption(data)
    }

    return (
        <components.Option {...props}>
            <Tooltip {...getTooltipProps(tooltipProps)}>
                <div className="flexbox dc__align-items-center dc__gap-8">
                    {isMulti && !isCreatableOption && (
                        <Checkbox
                            onChange={noop}
                            onClick={handleChange}
                            isChecked={isSelected || false}
                            value={CHECKBOX_VALUE.CHECKED}
                            rootClassName="mb-0 w-20 p-2 dc__align-self-start dc__no-shrink"
                            disabled={isDisabled}
                        />
                    )}
                    <div className={`flex left ${showDescription ? 'top' : ''} dc__gap-8`}>
                        {startIcon && (
                            <div className="dc__no-shrink icon-dim-20 flex dc__fill-available-space">{startIcon}</div>
                        )}
                        <div className="flex-grow-1">
                            <h4 className={`m-0 fs-13 ${isCreatableOption ? 'cb-5' : 'cn-9'} fw-4 lh-20 dc__truncate`}>
                                {label}
                            </h4>
                            {/* Add support for custom ellipsis if required */}
                            {showDescription &&
                                (typeof description === 'string' ? (
                                    <p
                                        className={`m-0 fs-12 fw-4 lh-18 cn-7 ${!disableDescriptionEllipsis ? 'dc__ellipsis-right__2nd-line' : ''}`}
                                    >
                                        {description}
                                    </p>
                                ) : (
                                    <div className="fs-12 lh-18">{description}</div>
                                ))}
                        </div>
                        {endIcon && (
                            <div className="dc__no-shrink icon-dim-20 flex dc__fill-available-space">{endIcon}</div>
                        )}
                    </div>
                </div>
            </Tooltip>
        </components.Option>
    )
}

export const SelectPickerMenuList = <OptionValue,>(props: MenuListProps<SelectPickerOptionType<OptionValue>>) => {
    const {
        children,
        selectProps: { inputValue, renderMenuListFooter, shouldRenderCustomOptions, renderCustomOptions },
    } = props

    return (
        // added key here to explicitly re-render the list on input change so that the top option is rendered
        <components.MenuList {...props} key={inputValue}>
            <div className="py-4 cursor">{shouldRenderCustomOptions ? renderCustomOptions() : children}</div>
            {/* Added to the bottom of menu list to prevent from hiding when the menu is opened close to the bottom of the screen */}
            {!shouldRenderCustomOptions && renderMenuListFooter && (
                <div className="dc__position-sticky dc__bottom-0 dc__bottom-radius-4 bcn-0 dc__zi-2">
                    {renderMenuListFooter()}
                </div>
            )}
        </components.MenuList>
    )
}

export const SelectPickerMultiValueLabel = <OptionValue, IsMulti extends boolean>({
    getIsOptionValid,
    ...props
}: MultiValueProps<SelectPickerOptionType<OptionValue>, true> &
    Pick<SelectPickerProps<OptionValue, IsMulti>['multiSelectProps'], 'getIsOptionValid'>) => {
    const { data, selectProps } = props
    const isOptionValid = getIsOptionValid(data)
    const iconToDisplay = isOptionValid ? data.startIcon || data.endIcon : <ICErrorExclamation />

    return (
        <div className="flex dc__gap-4 mw-0 dc__truncate">
            {iconToDisplay && (
                <div
                    className={`dc__no-shrink ${selectProps.isMulti ? 'icon-dim-16' : 'icon-dim-20'} flex dc__fill-available-space`}
                >
                    {iconToDisplay}
                </div>
            )}
            <components.MultiValueLabel {...props} />
        </div>
    )
}

export const SelectPickerMultiValueRemove = (props: MultiValueRemoveProps) => (
    <components.MultiValueLabel {...props}>
        <span className="flex dc__no-shrink">
            <ICClose className="icon-dim-12 icon-use-fill-n6" />
        </span>
    </components.MultiValueLabel>
)

export const SelectPickerGroupHeading = <OptionValue,>({
    isGroupHeadingSelectable,
    ...props
}: SelectPickerGroupHeadingProps<OptionValue>) => {
    const { data, selectProps } = props

    if (!data.label) {
        return null
    }

    if (!isGroupHeadingSelectable || !selectProps.isMulti) {
        return <components.GroupHeading {...props} />
    }

    const selectedOptions = (selectProps.value as MultiValue<SelectPickerOptionType<OptionValue>>) ?? []
    const groupHeadingOptions = data.options ?? []

    const checkboxValue = getGroupCheckboxValue(groupHeadingOptions, selectedOptions, selectProps.getOptionValue)

    const toggleGroupHeadingSelection = () => {
        const groupOptionsMapByValue = groupHeadingOptions.reduce<Record<string, true>>((acc, option) => {
            acc[selectProps.getOptionValue(option)] = true
            return acc
        }, {})
        const selectedOptionsWithoutGroupOptions = selectedOptions.filter(
            (selectedOption) => !groupOptionsMapByValue[selectProps.getOptionValue(selectedOption)],
        )

        // Clear all the selection(s) in the group if any of the option is selected
        if (checkboxValue) {
            selectProps?.onChange?.(selectedOptionsWithoutGroupOptions, {
                action: ReactSelectInputAction.deselectOption,
                option: null,
            })

            return
        }

        // Select all options
        selectProps?.onChange?.([...selectedOptionsWithoutGroupOptions, ...structuredClone(groupHeadingOptions)], {
            action: ReactSelectInputAction.selectOption,
            option: null,
        })
    }

    const handleToggleCheckbox = (e: ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
        e.stopPropagation()

        toggleGroupHeadingSelection()
    }

    return (
        <components.GroupHeading {...props} onClick={toggleGroupHeadingSelection}>
            <div className="flexbox dc__align-items-center dc__gap-8">
                {isGroupHeadingSelectable && (
                    <Checkbox
                        onChange={noop}
                        onClick={handleToggleCheckbox}
                        isChecked={!!checkboxValue}
                        value={checkboxValue}
                        rootClassName="mb-0 w-20 p-2 dc__align-self-start dc__no-shrink"
                    />
                )}
                <div className="dc__truncate">{props.data.label}</div>
            </div>
        </components.GroupHeading>
    )
}
