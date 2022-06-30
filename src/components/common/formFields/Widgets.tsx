import React, { useEffect, useRef, useState } from 'react'
import ReactSelect, { GroupBase, StylesConfig } from 'react-select'
import Tippy from '@tippyjs/react'
import { ReactComponent as Error } from '../../../assets/icons/ic-warning.svg'
import { ReactComponent as Info } from '../../../assets/icons/info-filled.svg'
import { DropdownIndicator, getCommonSelectStyle, Option } from '../../v2/common/ReactSelect.utils'
import { Checkbox, CheckboxProps } from './Checkbox'
import { ConditionalWrap } from '../helpers/Helpers'
import { OptionType } from '../../app/types'
import './Widgets.scss'

interface WidgetPropsType {
    title: string
    description?: string
    rootClassName?: string
    onChange?: (e) => void
    onBlur?: (e) => void
    minLength?: number
    maxLength?: number
    isRequired?: boolean
    placeholder?: string
    errorMessage?: string
}

const renderValidationErrorLabel = (message: string): JSX.Element => {
    return (
        <div className="error-label flex left align-start fs-11 fw-4 mt-6">
            <span className="error-label-icon">
                <Error className="icon-dim-16" />
            </span>
            <span className="ml-4 cr-5">{message}</span>
        </div>
    )
}

const renderDescription = (description: string) => {
    return (
        <div className="info-label flex left align-center fs-11 fw-4 mt-4">
            <span className="info-label-icon">
                <Info className="icon-dim-16" />
            </span>
            <span className="ml-4 cn-7">{description}</span>
        </div>
    )
}

interface StyledFieldPropsType {
    title: string
    description?: string
    rootClassName?: string
    isRequired?: boolean
    errorMessage?: string
    showBox?: boolean
    children: React.ReactNode
}

const StyledField = ({
    title,
    description,
    rootClassName,
    isRequired,
    errorMessage,
    children,
}: StyledFieldPropsType) => {
    return (
        <label className={`styled-field form__row form__row--w-100 ${rootClassName || ''}`}>
            <span className={`form__label fs-13 cn-9 mb-6${isRequired ? ' required-field' : ''}`}>{title}</span>
            {children}
            {description && renderDescription(description)}
            {errorMessage && renderValidationErrorLabel(errorMessage)}
        </label>
    )
}

export const StyledFormBox = ({ title, description, showBox, children }: StyledFieldPropsType) => {
    return (
        <div className={`styled-form-box ${showBox ? 'show-box' : ''}`}>
            <h2 className="fs-14 fw-6 p-0 m-0 lh-20">{title}</h2>
            {description && <p className="fs-11 fw-4 p-0 mt-4 lh-16">{description}</p>}
            <hr />
            {children}
        </div>
    )
}

interface StyledInputPropsType extends WidgetPropsType {
    value: string
    pattern?: string
}

export const StyledInput = ({
    title,
    value,
    description,
    rootClassName,
    onChange,
    onBlur,
    minLength,
    maxLength,
    pattern,
    isRequired,
    placeholder,
    errorMessage,
}: StyledInputPropsType): JSX.Element => {
    return (
        <StyledField
            title={title}
            description={description}
            rootClassName={rootClassName}
            isRequired={isRequired}
            errorMessage={errorMessage}
        >
            <input
                placeholder={placeholder && placeholder}
                name={title.replace(/\s/g, '').toLowerCase()}
                className="form__input"
                value={value as string}
                onChange={onChange}
                onBlur={onBlur}
                autoComplete="off"
                required={isRequired}
                minLength={minLength}
                maxLength={maxLength}
                pattern={pattern}
            />
        </StyledField>
    )
}

export const StyledTextarea = ({
    title,
    value,
    description,
    rootClassName,
    onChange,
    onBlur,
    minLength,
    maxLength,
    isRequired,
    placeholder,
    errorMessage,
}: StyledInputPropsType): JSX.Element => {
    return (
        <StyledField
            title={title}
            description={description}
            rootClassName={rootClassName}
            isRequired={isRequired}
            errorMessage={errorMessage}
        >
            <textarea
                className="form__input form__textarea"
                name={title.replace(/\s/g, '').toLowerCase()}
                value={value as string}
                placeholder={placeholder && placeholder}
                onChange={onChange}
                onBlur={onBlur}
                autoComplete="off"
                required={isRequired}
                minLength={minLength}
                maxLength={maxLength}
            />
        </StyledField>
    )
}

interface SliderPropsType extends WidgetPropsType {
    unit: string
    defaultValue?: number
    onInput?: (e) => void
    hideValueInput?: boolean
}

const sliderRangeUpdate = (e, value: number, min: number, max: number) => {
    const newValue = ((value - min) / (max - min)) * 100
    e.style.background = `linear-gradient(to right, var(--B500) 0%, var(--B500) ${newValue}%, var(--N200) ${newValue}%, var(--N200) 100%)`
}

export const Slider = ({
    title,
    description,
    rootClassName,
    onInput,
    minLength,
    maxLength,
    defaultValue,
    unit,
    hideValueInput,
    isRequired,
    errorMessage,
}: SliderPropsType) => {
    const [sliderValue, setSliderValue] = useState(defaultValue ?? minLength)
    const [sliderInputValue, setSliderInputValue] = useState(`${defaultValue ?? minLength}`)
    const sliderRef = useRef()

    useEffect(() => {
        if (sliderRef?.current) {
            sliderRangeUpdate(sliderRef.current, sliderValue, minLength, maxLength)
        }
    }, [sliderRef])

    const changeHandler = (e) => {
        const value = e.target.value && parseInt(e.target.value)
        if (value) {
            if (value >= minLength && value <= maxLength) {
                if (!hideValueInput) {
                    setSliderInputValue(e.target.value)
                }
                setSliderValue(value)
                onInput(value)
                sliderRangeUpdate(sliderRef.current, value, minLength, maxLength)
            }
        } else {
            if (!hideValueInput) {
                setSliderInputValue(`${defaultValue ?? minLength}`)
            }
            setSliderValue(defaultValue ?? minLength)
            onInput(defaultValue ?? minLength)
            sliderRangeUpdate(sliderRef.current, defaultValue ?? minLength, minLength, maxLength)
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
                min={minLength}
                max={maxLength}
                value={sliderValue}
                onChange={changeHandler}
            />
        )
    }

    return (
        <StyledField
            title={title}
            description={description}
            rootClassName={rootClassName}
            isRequired={isRequired}
            errorMessage={errorMessage}
        >
            {hideValueInput ? (
                renderInput()
            ) : (
                <div className="slider-input-box-container flex left">
                    {renderInput()}
                    <div className="slider-input-box-wrapper flex left">
                        <input
                            name={title.replace(/\s/g, '').toLowerCase()}
                            type="number"
                            autoComplete="off"
                            min={minLength}
                            max={maxLength}
                            className="slider-input-box"
                            value={sliderInputValue}
                            onChange={(e) => {
                                setSliderInputValue(e.target.value)
                            }}
                            onBlur={changeHandler}
                            onKeyDown={handleKeyDown}
                        />
                        {unit && <span className="slider-input-unit flex fs-13 fw-4 cn-9">{unit}</span>}
                    </div>
                </div>
            )}
        </StyledField>
    )
}

interface CheckboxWithTippyProps extends CheckboxProps {
    label: string
    showTippy: boolean
    description: string
}

export const CheckboxWithTippy = ({
    id,
    tabIndex,
    rootClassName,
    isChecked,
    label,
    showTippy,
    description,
    onClick,
    onChange,
    value,
    disabled,
}: CheckboxWithTippyProps) => {
    return (
        <Checkbox
            id={id}
            isChecked={isChecked}
            onClick={onClick}
            rootClassName={rootClassName || ''}
            value={value}
            onChange={onChange}
            disabled={disabled}
            tabIndex={tabIndex}
        >
            <ConditionalWrap
                condition={showTippy}
                wrap={(children) => (
                    <Tippy className="default-tt" arrow={false} placement="bottom" content={description}>
                        <span>{children}</span>
                    </Tippy>
                )}
            >
                <span className={`fs-13 cn-9 ${showTippy ? 'text-underline-dashed-300' : ''}`}>{label}</span>
            </ConditionalWrap>
        </Checkbox>
    )
}

interface StyledSelectPropsType extends WidgetPropsType {
    value: OptionType
    options: OptionType[]
    classNamePrefix?: string
    styleOverrides?: StylesConfig<any, false, GroupBase<any>>
}

export const StyledSelect = ({
    title,
    rootClassName,
    description,
    classNamePrefix,
    options,
    value,
    placeholder,
    onChange,
    styleOverrides,
    errorMessage,
    isRequired,
}: StyledSelectPropsType) => {
    return (
        <StyledField
            title={title}
            description={description}
            rootClassName={rootClassName}
            isRequired={isRequired}
            errorMessage={errorMessage}
        >
            <ReactSelect
                placeholder={placeholder}
                classNamePrefix={classNamePrefix}
                value={value}
                options={options}
                onChange={onChange}
                components={{
                    IndicatorSeparator: null,
                    DropdownIndicator,
                    Option,
                }}
                styles={getCommonSelectStyle(styleOverrides)}
            />
        </StyledField>
    )
}
