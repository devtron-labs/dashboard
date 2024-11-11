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

import { GroupHeadingProps, MultiValueProps, OptionProps, ValueContainerProps, MenuPlacement } from 'react-select'
import CreatableSelect from 'react-select/creatable'
import { ReactElement, useCallback, useMemo } from 'react'

import { ReactComponent as ErrorIcon } from '@Icons/ic-warning.svg'
import { ReactComponent as ICInfoFilledOverride } from '@Icons/ic-info-filled-override.svg'
import { ComponentSizeType } from '@Shared/constants'
import { ConditionalWrap } from '@Common/Helper'
import Tippy from '@tippyjs/react'
import { getCommonSelectStyle, getSelectPickerOptionByValue } from './utils'
import {
    SelectPickerMultiValueLabel,
    SelectPickerMultiValueRemove,
    SelectPickerClearIndicator,
    SelectPickerControl,
    SelectPickerDropdownIndicator,
    SelectPickerGroupHeading,
    SelectPickerLoadingIndicator,
    SelectPickerMenuList,
    SelectPickerOption,
    SelectPickerValueContainer,
} from './common'
import { SelectPickerOptionType, SelectPickerProps, SelectPickerVariantType } from './type'
import { GenericSectionErrorState } from '../GenericSectionErrorState'

/**
 * Generic component for select picker
 *
 * @example With icon in control
 * ```tsx
 * <SelectPicker ... icon={<CustomIcon />} />
 * ```
 *
 * @example Medium menu list width
 * ```tsx
 * <SelectPicker ... menuSize={ComponentSizeType.medium} />
 * ```
 *
 * @example Large menu list width
 * ```tsx
 * <SelectPicker ... menuSize={ComponentSizeType.large} />
 * ```
 *
 * @example Required label
 * ```tsx
 * <SelectPicker ... required label="Label" />
 * ```
 *
 * @example Custom label
 * ```tsx
 * <SelectPicker ... label={<div>Label</div>} />
 * ```
 *
 * @example Error state
 * ```tsx
 * <SelectPicker ... error="Something went wrong" />
 * ```
 *
 * @example Helper text
 * ```tsx
 * <SelectPicker ... helperText="Help information" />
 * ```
 *
 * @example Menu list footer
 * The footer is sticky by default
 * ```tsx
 * <SelectPicker
 *      ...
 *      renderMenuListFooter={() => (
 *          <div className="px-8 py-6 dc__border-top bcn-50 cn-6">
 *              <div>Foot note</div>
 *          </div>
 *      )}
 * />
 * ```
 *
 * @example Loading state
 * ```tsx
 * <SelectPicker ... isLoading />
 * ```
 *
 * @example Disabled state
 * ```tsx
 * <SelectPicker ... isDisabled />
 * ```
 *
 * @example Loading & disabled state
 * ```tsx
 * <SelectPicker ... isLoading isDisabled />
 * ```
 *
 * @example Hide selected option icon in control
 * ```tsx
 * <SelectPicker ... showSelectedOptionIcon={false} />
 * ```
 *
 * @example Selected option clearable
 * ```tsx
 * <SelectPicker ... isClearable />
 * ```
 *
 * @example Selected option clearable
 * ```tsx
 * <SelectPicker ... showSelectedOptionsCount />
 * ```
 * @example Multi Select
 * ```tsx
 * <SelectPicker ... isMulti />
 * ```
 *
 * @example Creatable Multi Select
 * ```tsx
 * <SelectPicker
 *      ...
 *      isMulti
 *      multiSelectProps={{
 *          isCreatable: true
 *      }}
 * />
 * ```
 *
 * @example Multi Select with group heading selectable
 * ```tsx
 * <SelectPicker
 *      ...
 *      isMulti
 *      multiSelectProps={{
 *          isGroupHeadingSelectable: true
 *      }}
 * />
 * ```
 *
 * @example Multi Select with selected option validator
 * ```tsx
 * <SelectPicker
 *      ...
 *      isMulti
 *      multiSelectProps={{
 *          getIsOptionValid: (option) => boolean
 *      }}
 * />
 * ```
 *
 * @example Custom options rendering support (menuIsOpen needs to be handled by consumer)
 * ```tsx
 * <SelectPicker
 *      ...
 *      shouldRenderCustomOptions
 *      renderCustomOptions={() => <div />}
 * />
 * ```
 *
 * @example Align the menu at the right most end
 * ```tsx
 * <SelectPicker
 *      ...
 *      shouldMenuAlignRight
 * />
 * ```
 */
const SelectPicker = <OptionValue, IsMulti extends boolean>({
    error,
    icon,
    helperText,
    placeholder = 'Select a option',
    label,
    showSelectedOptionIcon = true,
    size = ComponentSizeType.medium,
    disabledTippyContent,
    showSelectedOptionsCount = false,
    menuSize,
    optionListError,
    reloadOptionList,
    menuPosition = 'fixed',
    variant = SelectPickerVariantType.DEFAULT,
    disableDescriptionEllipsis = false,
    multiSelectProps = {},
    isMulti,
    name,
    classNamePrefix,
    shouldRenderCustomOptions = false,
    isSearchable,
    selectRef,
    shouldMenuAlignRight = false,
    fullWidth = false,
    customSelectedOptionsCount = null,
    renderMenuListFooter,
    inputValue,
    onInputChange,
    isCreatable = false,
    onCreateOption,
    closeMenuOnSelect = false,
    shouldShowNoOptionsMessage = true,
    ...props
}: SelectPickerProps<OptionValue, IsMulti>) => {
    const { inputId, required, isDisabled, controlShouldRenderValue = true, value, options, getOptionValue } = props
    const { isGroupHeadingSelectable = false, getIsOptionValid = () => true } = multiSelectProps

    // Only large variant is supported for multi select picker
    const selectSize = isMulti && controlShouldRenderValue ? ComponentSizeType.large : size
    const shouldShowSelectedOptionIcon = !isMulti && showSelectedOptionIcon
    const isSelectSearchable = !shouldRenderCustomOptions && isSearchable

    const labelId = `${inputId}-label`
    const errorElementId = `${inputId}-error-msg`

    // Option disabled, group null state, checkbox hover, create option visibility (scroll reset on search)
    const selectStyles = useMemo(
        () =>
            getCommonSelectStyle({
                error,
                size: selectSize,
                menuSize,
                variant,
                getIsOptionValid,
                isGroupHeadingSelectable,
                shouldMenuAlignRight,
            }),
        [error, selectSize, menuSize, variant, isGroupHeadingSelectable, shouldMenuAlignRight],
    )

    // Used to show the create new option for creatable select and the option(s) doesn't have the input value
    const isValidNewOption = (_inputValue: string) => {
        const trimmedInput = _inputValue?.trim()

        return (
            isCreatable &&
            !!trimmedInput &&
            !getSelectPickerOptionByValue<OptionValue>(
                value as SelectPickerOptionType<OptionValue>[],
                trimmedInput as OptionValue,
                null,
                getOptionValue,
            ) &&
            !getSelectPickerOptionByValue<OptionValue>(options, trimmedInput as OptionValue, null, getOptionValue)
        )
    }

    const renderValueContainer = useCallback(
        (valueContainerProps: ValueContainerProps<SelectPickerOptionType<OptionValue>>) => (
            <SelectPickerValueContainer
                {...valueContainerProps}
                showSelectedOptionsCount={showSelectedOptionsCount}
                customSelectedOptionsCount={customSelectedOptionsCount}
            />
        ),
        [showSelectedOptionsCount, customSelectedOptionsCount],
    )

    const renderOption = useCallback(
        (optionProps: OptionProps<SelectPickerOptionType<OptionValue>>) => (
            <SelectPickerOption {...optionProps} disableDescriptionEllipsis={disableDescriptionEllipsis} />
        ),
        [disableDescriptionEllipsis],
    )

    const renderMultiValueLabel = (
        multiValueLabelProps: MultiValueProps<SelectPickerOptionType<OptionValue>, true>,
    ) => <SelectPickerMultiValueLabel {...multiValueLabelProps} getIsOptionValid={getIsOptionValid} />

    const renderGroupHeading = useCallback(
        (groupHeadingProps: GroupHeadingProps<SelectPickerOptionType<OptionValue>>) => (
            <SelectPickerGroupHeading {...groupHeadingProps} isGroupHeadingSelectable={isGroupHeadingSelectable} />
        ),
        [isGroupHeadingSelectable],
    )

    const renderNoOptionsMessage = () => {
        if (optionListError) {
            return <GenericSectionErrorState reload={reloadOptionList} />
        }

        if (shouldShowNoOptionsMessage) {
            return <p className="m-0 cn-7 fs-13 fw-4 lh-20 py-6 px-8">No options</p>
        }

        return null
    }

    const renderDisabledTippy = (children: ReactElement) => (
        <Tippy content={disabledTippyContent} placement="top" className="default-tt" arrow={false}>
            {children}
        </Tippy>
    )

    const handleCreateOption: SelectPickerProps<OptionValue, boolean>['onCreateOption'] = (
        _inputValue: string,
    ): void => {
        const trimmedInputValue = _inputValue?.trim()
        if (trimmedInputValue) {
            onCreateOption(trimmedInputValue)
        }
    }

    const commonProps = useMemo(
        () => ({
            name: name || inputId,
            classNamePrefix: classNamePrefix || inputId,
            isSearchable: isSelectSearchable,
            placeholder,
            styles: selectStyles,
            menuPlacement: 'auto' as MenuPlacement,
            menuPosition,
            menuShouldScrollIntoView: true,
            backspaceRemovesValue: isMulti,
            'aria-errormessage': errorElementId,
            'aria-invalid': !!error,
            'aria-labelledby': labelId,
            hideSelectedOptions: false,
            shouldRenderCustomOptions: shouldRenderCustomOptions || false,
        }),
        [
            name,
            inputId,
            classNamePrefix,
            isSelectSearchable,
            placeholder,
            selectStyles,
            menuPosition,
            errorElementId,
            error,
            labelId,
            isMulti,
            shouldRenderCustomOptions,
        ],
    )

    return (
        <div className={`flex column left top dc__gap-4 ${fullWidth ? 'w-100' : ''}`}>
            {/* Note: Common out for fields */}
            <div className="flex column left top dc__gap-6 w-100">
                {label && (
                    <label
                        className="fs-13 lh-20 cn-7 fw-4 dc__block mb-0"
                        htmlFor={inputId}
                        data-testid={`label-${inputId}`}
                        id={labelId}
                    >
                        {typeof label === 'string' ? (
                            <span className={`flex left ${required ? 'dc__required-field' : ''}`}>
                                <span className="dc__truncate">{label}</span>
                                {required && <span>&nbsp;</span>}
                            </span>
                        ) : (
                            label
                        )}
                    </label>
                )}
                <ConditionalWrap condition={isDisabled && !!disabledTippyContent} wrap={renderDisabledTippy}>
                    <div className="w-100">
                        <CreatableSelect
                            {...props}
                            {...commonProps}
                            isMulti={isMulti}
                            ref={selectRef}
                            components={{
                                IndicatorSeparator: null,
                                LoadingIndicator: SelectPickerLoadingIndicator,
                                DropdownIndicator: SelectPickerDropdownIndicator,
                                Control: SelectPickerControl,
                                Option: renderOption,
                                MenuList: SelectPickerMenuList,
                                ClearIndicator: SelectPickerClearIndicator,
                                ValueContainer: renderValueContainer,
                                MultiValueLabel: renderMultiValueLabel,
                                MultiValueRemove: SelectPickerMultiValueRemove,
                                GroupHeading: renderGroupHeading,
                                NoOptionsMessage: renderNoOptionsMessage,
                            }}
                            closeMenuOnSelect={!isMulti || closeMenuOnSelect}
                            allowCreateWhileLoading={false}
                            isValidNewOption={isValidNewOption}
                            createOptionPosition="first"
                            onCreateOption={handleCreateOption}
                            renderMenuListFooter={!optionListError && renderMenuListFooter}
                            inputValue={inputValue}
                            onInputChange={onInputChange}
                            icon={icon}
                            showSelectedOptionIcon={shouldShowSelectedOptionIcon}
                        />
                    </div>
                </ConditionalWrap>
            </div>
            {error && (
                <div className="flex left dc__gap-4 cr-5 fs-11 lh-16 fw-4" id={errorElementId}>
                    <ErrorIcon className="icon-dim-16 p-1 form__icon--error dc__no-shrink dc__align-self-start" />
                    <span className="dc__ellipsis-right__2nd-line">{error}</span>
                </div>
            )}
            {/* Note: Common out for input fields */}
            {helperText && (
                <div className="flex left dc__gap-4 fs-11 lh-16 cn-7">
                    <ICInfoFilledOverride className="icon-dim-16 dc__no-shrink dc__align-self-start" />
                    <span className="dc__ellipsis-right__2nd-line">{helperText}</span>
                </div>
            )}
        </div>
    )
}

export default SelectPicker
