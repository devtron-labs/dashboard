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

import React, { useEffect, useRef, useState } from 'react'
import ReactSelect from 'react-select'
import Tippy from '@tippyjs/react'
import { ReactComponent as Error } from '../../../../assets/icons/ic-warning.svg'
import { ReactComponent as Info } from '../../../../assets/icons/info-filled.svg'
import { DropdownIndicator, getCommonSelectStyle, Option } from '../../../v2/common/ReactSelect.utils'
import { Checkbox, CustomInput, ConditionalWrap } from '@devtron-labs/devtron-fe-common-lib'
import {
    CheckboxWithTippyProps,
    ShortcutKeyBadgeProps,
    SliderPropsType,
    StyledFieldPropsType,
    StyledInputPropsType,
    StyledProgressBarProps,
    StyledSelectPropsType,
} from './Widgets.type'
import './Widgets.scss'

const renderValidationErrorLabel = (message: string): JSX.Element => {
    return (
        <div className="error-label flex left top flex-align-center fs-11 fw-4 mt-6">
            <span className="error-label-icon icon-dim-16 mt-2">
                <Error className="icon-dim-16" />
            </span>
            <span className="ml-4 cr-5">{message}</span>
        </div>
    )
}

const renderDescription = (description: string) => {
    return (
        <div className="info-label flex left top flex-align-center fs-11 fw-4 mt-4">
            <span className="info-label-icon icon-dim-16 mt-2">
                <Info className="icon-dim-16" />
            </span>
            <span className="ml-4 cn-7">{description}</span>
        </div>
    )
}

const StyledField = (props: StyledFieldPropsType) => {
    return (
        <label className={`styled-field form__row form__row--w-100 ${props.rootClassName || ''}`}>
            {props.title && (
                <span className={`form__label fs-13 cn-9 mb-6${props.isRequired ? ' required-field' : ''}`}>
                    {props.title}
                </span>
            )}
            {props.children}
            {props.description && renderDescription(props.description)}
            {props.errorMessage && renderValidationErrorLabel(props.errorMessage)}
        </label>
    )
}

export const StyledFormBox = (props: StyledFieldPropsType) => {
    return (
        <div className={`styled-form-box mb-16 ${props.showBox ? 'en-2 bw-1 br-4 p-16' : ''}`}>
            {props.title && <h2 className="fs-14 fw-6 p-0 m-0 lh-20">{props.title}</h2>}
            {props.description && <p className="fs-11 fw-4 p-0 mt-4 lh-16">{props.description}</p>}
            {(props.title || props.description) && <hr />}
            {props.children}
        </div>
    )
}

export const StyledInput = (props: StyledInputPropsType): JSX.Element => {
    const [inputValue, setInputValue] = useState(props.value ?? '')

    const onValueChange = (e) => {
        setInputValue(e.target.value)

        if (props.onChange) {
            props.onChange(e)
        }
    }

    const onInputBlur = (e) => {
        setInputValue(e.target.value)

        if (props.onBlur) {
            props.onBlur(e)
        }
    }

    return (
        <StyledField
            title={props.title}
            description={props.description}
            rootClassName={props.rootClassName}
            isRequired={props.isRequired}
            errorMessage={props.errorMessage}
        >
            {props.type === 'textArea' ? (
                <textarea
                    className="form__input form__textarea"
                    name={props.title?.replace(/\s/g, '_') || 'textarea_widget'}
                    value={inputValue}
                    placeholder={props.placeholder && props.placeholder}
                    onChange={onValueChange}
                    onBlur={onInputBlur}
                    autoComplete="off"
                    required={props.isRequired}
                    minLength={props.minLength}
                    maxLength={props.maxLength}
                />
            ) : (
                <CustomInput
                    placeholder={props.placeholder && props.placeholder}
                    name={props.title?.replace(/\s/g, '_') || 'input_widget'}
                    rootClassName="h-32"
                    value={inputValue}
                    onChange={onValueChange}
                    onBlur={onInputBlur}
                    autoComplete="off"
                    required={props.isRequired}
                    {...(props.type === 'numberInput'
                        ? {
                              type: 'number',
                              min: props.minLength || 0,
                              max: props.maxLength,
                          }
                        : {
                              type: 'text',
                              minLength: props.minLength,
                              maxLength: props.maxLength,
                              pattern: props.pattern,
                          })}
                />
            )}
        </StyledField>
    )
}

export const RangeSlider = (props: SliderPropsType) => {
    const [sliderValue, setSliderValue] = useState(props.value ? parseInt(props.value) : props.sliderMin)
    const [sliderInputValue, setSliderInputValue] = useState(`${props.value ?? props.sliderMin}`)
    const sliderRef = useRef()

    useEffect(() => {
        if (sliderRef?.current) {
            sliderRangeUpdate(sliderRef.current, sliderValue)
        }
    }, [sliderRef])

    const updateStates = (inputValue: string, sliderValue: number) => {
        if (!props.hideValueInput) {
            setSliderInputValue(inputValue)
        }
        setSliderValue(sliderValue)
        sliderRangeUpdate(sliderRef.current, sliderValue)
    }

    const sliderRangeUpdate = (e, value: number) => {
        const newValue = ((value - props.sliderMin) / (props.sliderMax - props.sliderMin)) * 100
        e.style.background = `linear-gradient(to right, var(--B500) 0%, var(--B500) ${newValue}%, var(--N200) ${newValue}%, var(--N200) 100%)`
    }

    const changeHandler = (e) => {
        const value = e.target.value && parseInt(e.target.value)

        if (!e.target.value) {
            updateStates(`${props.value ?? props.sliderMin}`, props.value ? parseInt(props.value) : props.sliderMin)
        } else {
            updateStates(e.target.value, value)
        }
    }

    const handleSliderInputValue = (e) => {
        setSliderInputValue(e.target.value)
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            changeHandler(e)
        }
    }

    const onInputBlur = (e) => {
        if (props.onInputValue) {
            props.onInputValue(e.target.value ? parseInt(e.target.value) : sliderValue)
        }
    }

    const onValueInputBlur = (e) => {
        changeHandler(e)
        onInputBlur(e)
    }

    const renderInput = () => {
        return (
            <input
                ref={sliderRef}
                name={props.title?.replace(/\s/g, '_') || 'slider_widget'}
                className="slider-input"
                type="range"
                min={props.sliderMin || 0}
                max={props.sliderMax}
                value={sliderValue}
                onChange={changeHandler}
                onBlur={onInputBlur}
            />
        )
    }

    const renderValueInput = () => {
        return (
            <div className="slider-input-box-wrapper flex left ml-20">
                <input
                    name={props.title?.replace(/\s/g, '_') || 'slider_widget_input_box'}
                    type="number"
                    autoComplete="off"
                    min={props.sliderMin || 0}
                    max={props.sliderMax}
                    className="slider-input-box h-32 en-2 bw-1 dc__left-radius-4"
                    value={sliderInputValue}
                    onChange={handleSliderInputValue}
                    onBlur={onValueInputBlur}
                    onKeyDown={handleKeyDown}
                />
                {props.sliderUnit && (
                    <span className="slider-input-unit flex fs-13 fw-4 cn-9 h-32 en-2 bw-1 dc__right-radius-4">
                        {props.sliderUnit}
                    </span>
                )}
            </div>
        )
    }

    return (
        <StyledField
            title={props.title}
            description={props.description}
            rootClassName={props.rootClassName}
            isRequired={props.isRequired}
            errorMessage={props.errorMessage}
        >
            {props.hideValueInput ? (
                renderInput()
            ) : (
                <div className="slider-input-box-container flex left">
                    {renderInput()}
                    {renderValueInput()}
                </div>
            )}
        </StyledField>
    )
}

export const CheckboxWithTippy = (props: CheckboxWithTippyProps) => {
    return (
        <Checkbox
            id={props.id}
            isChecked={props.isChecked}
            onClick={props.onClick && props.onClick}
            rootClassName={props.rootClassName || ''}
            value={props.value}
            onChange={props.onChange && props.onChange}
            disabled={props.disabled}
            tabIndex={props.tabIndex}
        >
            <ConditionalWrap
                condition={!!props.description}
                wrap={(children) => (
                    <Tippy className="default-tt" arrow={false} placement="bottom" content={props.description}>
                        <span>{children}</span>
                    </Tippy>
                )}
            >
                <span className={`fs-13 cn-9 ${props.description ? 'text-underline-dashed-300' : ''}`}>
                    {props.title}
                </span>
            </ConditionalWrap>
        </Checkbox>
    )
}

export const StyledSelect = (props: StyledSelectPropsType) => {
    return (
        <StyledField
            title={props.title}
            description={props.description}
            rootClassName={props.rootClassName}
            isRequired={props.isRequired}
            errorMessage={props.errorMessage}
        >
            <ReactSelect
                placeholder={props.placeholder}
                classNamePrefix={props.classNamePrefix}
                value={props.value}
                options={props.options}
                isSearchable={props.options.length > 5}
                onChange={props.onChange && props.onChange}
                components={{
                    IndicatorSeparator: null,
                    DropdownIndicator,
                    Option,
                }}
                styles={getCommonSelectStyle(props.styleOverrides)}
            />
        </StyledField>
    )
}

export const StyledProgressBar = ({
    resetProgress,
    updateProgressValue,
    styles,
    classes,
    progress,
}: StyledProgressBarProps) => {
    const [progressValue, setProgressValue] = useState(progress ?? 0)
    let progressTimer = null

    useEffect(() => {
        progressTimer = setInterval(() => {
            setProgressValue((prevValue) => {
                const _currentValue = prevValue + 1
                // checking for both null and undefined
                if (progress != null) {
                    clearInterval(progressTimer)
                    return progress
                }

                if (_currentValue === 100) {
                    clearInterval(progressTimer)
                }

                if (updateProgressValue) {
                    updateProgressValue(_currentValue)
                }
                return _currentValue
            })
        }, 300)

        return (): void => {
            setProgressValue(0)
            if (progressTimer) {
                clearInterval(progressTimer)
            }
        }
    }, [resetProgress, progress])

    return (
        <progress
            className={`styled-progress-bar ${classes ?? ''}`}
            value={progressValue}
            max={100}
            style={styles ? { ...styles } : {}}
        />
    )
}

export const ShortcutKeyBadge = ({ rootClassName, shortcutKey, onClick }: ShortcutKeyBadgeProps) => {
    return (
        <div
            className={`shortcut-key-badge dc__position-abs flex fs-12 lh-20 icon-dim-20 bcn-0 cn-7 fw-6 dc__border br-2 ${
                rootClassName ?? ''
            }`}
            onClick={onClick}
        >
            {shortcutKey}
        </div>
    )
}
