import Tippy from '@tippyjs/react'
import React, { useState, useEffect } from 'react'
import { ConditionalWrap } from '../helpers/Helpers'
import './radioGroup.scss'

const RadioContext = React.createContext(null)

function useRadioContext() {
    const context = React.useContext(RadioContext)
    if (!context) {
        throw new Error(`Radio compound components cannot be rendered outside the Toggle component`)
    }
    return context
}

interface RadioGroupInterface {
    name: string
    onChange: any
    className?: string
    initialTab: string
    disabled: boolean
    showTippy?: boolean
    tippyContent?: any
}

interface RadioGroupComposition {
    Radio?: React.FC<any>
}

const RadioGroup: React.FC<RadioGroupInterface> & RadioGroupComposition = React.memo(function RadioGroup({
    name,
    onChange,
    children,
    className = '',
    initialTab,
    disabled = false,
}) {
    const [selected, select] = useState(null)

    useEffect(() => {
        if (initialTab === selected) return
        select(initialTab)
    }, [initialTab])

    return (
        <RadioContext.Provider value={{ name, selected, select, disabled, onChange }}>
            <div className={`${className} radio-group`}>{children}</div>
        </RadioContext.Provider>
    )
})

function Radio({ value, children, className = '', showTippy = false, tippyContent = '', canSelect = true, isDisabled = false }) {
    const { name, selected, select, disabled, onChange } = useRadioContext()
    return (
        <ConditionalWrap
            condition={showTippy}
            wrap={(children) => (
                <Tippy className="default-tt w-250" arrow={false} placement="bottom" content={tippyContent}>
                    {children}
                </Tippy>
            )}
        >
            <label className={`${className} radio ${(isDisabled || disabled)? 'disabled': ''}`}>
                <input
                    type="checkbox"
                    value={value}
                    name={name}
                    checked={value === selected}
                    onChange={(e) => {
                        e.persist()
                        if (canSelect) {
                            select(e.target.value)
                        }
                        onChange(e)
                    }}
                    disabled={isDisabled || disabled}
                />
                <span className="radio__item-label">{children}</span>
            </label>
        </ConditionalWrap>
    )
}

RadioGroup.Radio = Radio
export default RadioGroup
