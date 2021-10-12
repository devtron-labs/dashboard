import React, {useState, useEffect} from 'react'
import './radioGroup.scss'

export const RadioContext = React.createContext(null)

function useRadioContext() {
    const context = React.useContext(RadioContext)
    if (!context) {
        throw new Error(
            `Radio compound components cannot be rendered outside the Toggle component`,
        )
    }
    return context
}

interface RadioGroupInterface{
    name:string;
    onChange:any;
    className?:string;
    initialTab:string;
    disabled:boolean;
}

interface RadioGroupComposition {
    Radio?: React.FC<any>;
}

export const RadioGroup: React.FC<RadioGroupInterface> & RadioGroupComposition = React.memo(function RadioGroup({ name, onChange, children, className = "", initialTab, disabled=false }) {
    const [selected, select] = useState(null)

    useEffect(()=>{
        if(initialTab === selected) return
        select(initialTab)
    },[initialTab])

    return (
        <RadioContext.Provider value={{ name, selected, select, disabled, onChange }}>
            <div className={`${className} radio-group`}>
                {children}
            </div>
        </RadioContext.Provider>
    )
})

function Radio({ value, children, className = "" }) {
    const { name, selected, select, disabled, onChange } = useRadioContext()
    return (
        <label className={`${className} radio`}>
            <input type="checkbox" value={value} name={name} checked={value === selected} onChange={e=>{e.persist(); select(e.target.value); onChange(e)}} disabled={disabled}/>
            <span className="radio__item-label">{children}</span>
        </label>
    )
}

RadioGroup.Radio = Radio
export default RadioGroup

