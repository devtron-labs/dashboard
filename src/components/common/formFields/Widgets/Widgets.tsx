import React, { useEffect, useRef, useState } from 'react'
import ReactSelect from 'react-select'
import Tippy from '@tippyjs/react'
import { ReactComponent as Error } from '../../../../assets/icons/ic-warning.svg'
import { ReactComponent as Info } from '../../../../assets/icons/info-filled.svg'
import { DropdownIndicator, getCommonSelectStyle, Option } from '../../../v2/common/ReactSelect.utils'
import { Checkbox } from '../Checkbox'
import { ConditionalWrap } from '../../helpers/Helpers'
import {
    CheckboxWithTippyProps,
    SliderPropsType,
    StyledFieldPropsType,
    StyledInputPropsType,
    StyledSelectPropsType,
} from './Widgets.type'
import './Widgets.scss'

const renderValidationErrorLabel = (message: string): JSX.Element => {
    return (
        <div className="error-label flex left align-start fs-11 fw-4 mt-6">
            <span className="error-label-icon icon-dim-16">
                <Error className="icon-dim-16" />
            </span>
            <span className="ml-4 cr-5">{message}</span>
        </div>
    )
}

const renderDescription = (description: string) => {
    return (
        <div className="info-label flex left align-center fs-11 fw-4 mt-4">
            <span className="info-label-icon icon-dim-16">
                <Info className="icon-dim-16" />
            </span>
            <span className="ml-4 cn-7">{description}</span>
        </div>
    )
}

const StyledField = (props: StyledFieldPropsType) => {
    return (
        <label className={`styled-field form__row form__row--w-100 ${props.rootClassName || ''}`}>
            <span className={`form__label fs-13 cn-9 mb-6${props.isRequired ? ' required-field' : ''}`}>
                {props.title}
            </span>
            {props.children}
            {props.description && renderDescription(props.description)}
            {props.errorMessage && renderValidationErrorLabel(props.errorMessage)}
        </label>
    )
}

export const StyledFormBox = (props: StyledFieldPropsType) => {
    return (
        <div className={`styled-form-box ${props.showBox ? 'en-2 bw-1 br-4 p-16' : ''}`}>
            <h2 className="fs-14 fw-6 p-0 m-0 lh-20">{props.title}</h2>
            {props.description && <p className="fs-11 fw-4 p-0 mt-4 lh-16">{props.description}</p>}
            <hr />
            {props.children}
        </div>
    )
}

export const StyledInput = (props: StyledInputPropsType): JSX.Element => {
    return (
        <StyledField
            title={props.title}
            description={props.description}
            rootClassName={props.rootClassName}
            isRequired={props.isRequired}
            errorMessage={props.errorMessage}
        >
            <input
                placeholder={props.placeholder && props.placeholder}
                name={props.title.replace(/\s/g, '_')}
                className="form__input h-32"
                value={props.value}
                onChange={props.onChange}
                onBlur={props.onBlur}
                autoComplete="off"
                required={props.isRequired}
                minLength={props.minLength}
                maxLength={props.maxLength}
                pattern={props.pattern}
            />
        </StyledField>
    )
}

export const StyledTextarea = (props: StyledInputPropsType): JSX.Element => {
    return (
        <StyledField
            title={props.title}
            description={props.description}
            rootClassName={props.rootClassName}
            isRequired={props.isRequired}
            errorMessage={props.errorMessage}
        >
            <textarea
                className="form__input form__textarea"
                name={props.title.replace(/\s/g, '_')}
                value={props.value}
                placeholder={props.placeholder && props.placeholder}
                onChange={props.onChange}
                onBlur={props.onBlur}
                autoComplete="off"
                required={props.isRequired}
                minLength={props.minLength}
                maxLength={props.maxLength}
            />
        </StyledField>
    )
}

export const RangeSlider = (props: SliderPropsType) => {
    const [sliderValue, setSliderValue] = useState(props.defaultValue ?? props.minLength)
    const [sliderInputValue, setSliderInputValue] = useState(`${props.defaultValue ?? props.minLength}`)
    const sliderRef = useRef()

    useEffect(() => {
        if (sliderRef?.current) {
            sliderRangeUpdate(sliderRef.current, sliderValue, props.minLength, props.maxLength)
        }
    }, [sliderRef])

    const updateStates = (inputValue: string, sliderValue: number) => {
        if (!props.hideValueInput) {
            setSliderInputValue(inputValue)
        }
        setSliderValue(sliderValue)
        props.onInput(sliderValue)
        sliderRangeUpdate(sliderRef.current, sliderValue, props.minLength, props.maxLength)
    }

    const sliderRangeUpdate = (e, value: number, min: number, max: number) => {
        const newValue = ((value - min) / (max - min)) * 100
        e.style.background = `linear-gradient(to right, var(--B500) 0%, var(--B500) ${newValue}%, var(--N200) ${newValue}%, var(--N200) 100%)`
    }

    const changeHandler = (e) => {
        const value = e.target.value && parseInt(e.target.value)

        if (!value) {
            updateStates(`${props.defaultValue ?? props.minLength}`, props.defaultValue ?? props.minLength)
        } else if (value >= props.minLength && value <= props.maxLength) {
            updateStates(e.target.value, value)
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            changeHandler(e)
        }
    }

    const renderInput = () => {
        return (
            <input
                ref={sliderRef}
                className="slider-input"
                type="range"
                min={props.minLength}
                max={props.maxLength}
                value={sliderValue}
                onChange={changeHandler}
            />
        )
    }

    const renderValueInput = () => {
        return (
            <div className="slider-input-box-wrapper flex left ml-20">
                <input
                    name={props.title.replace(/\s/g, '_')}
                    type="number"
                    autoComplete="off"
                    min={props.minLength}
                    max={props.maxLength}
                    className="slider-input-box h-32 en-2 bw-1 left-radius-4"
                    value={sliderInputValue}
                    onChange={(e) => {
                        setSliderInputValue(e.target.value)
                    }}
                    onBlur={changeHandler}
                    onKeyDown={handleKeyDown}
                />
                {props.unit && (
                    <span className="slider-input-unit flex fs-13 fw-4 cn-9 h-32 en-2 bw-1 right-radius-4">
                        {props.unit}
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
            onClick={props.onClick}
            rootClassName={props.rootClassName || ''}
            value={props.value}
            onChange={props.onChange}
            disabled={props.disabled}
            tabIndex={props.tabIndex}
        >
            <ConditionalWrap
                condition={props.showTippy}
                wrap={(children) => (
                    <Tippy className="default-tt" arrow={false} placement="bottom" content={props.description}>
                        <span>{children}</span>
                    </Tippy>
                )}
            >
                <span className={`fs-13 cn-9 ${props.showTippy ? 'text-underline-dashed-300' : ''}`}>
                    {props.label}
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
                onChange={props.onChange}
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
