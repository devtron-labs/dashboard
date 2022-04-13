
//@ts-nocheck

import React, { useEffect } from 'react';
import { Progressing, useEffectAfterMount, PopupMenu } from '../../common'
import { SelectComposition, SelectProps, OptionGroupProps, SelectAsync } from './types';

import arrowTriangle from '../../../assets/icons/ic-chevron-down.svg'
import checkIcon from '../../../assets/icons/appstatus/ic-check.svg'

import './select.css';
import { showError } from '../helpers/Helpers';

const SelectContext = React.createContext(null)

function useSelectContext() {
    const context = React.useContext(SelectContext)
    if (!context) {
        throw new Error(
            `Select compound components cannot be rendered outside the Toggle component`,
        )
    }
    return context
}

const Select: React.FC<SelectProps> & SelectComposition = function ({
    children = null, onChange, value = null,
    valueComparator,
    rootClassName = "",
    disabled = false, tabIndex = 0, name = "select",
    autoWidth = true, isKebab = false
}) {
    const [selected, select] = React.useState(value);
    const [popupOpen, togglePopup] = React.useState(false)
    const [searchString, search] = React.useState("")
    const [loading, setLoading] = React.useState(false)

    useEffectAfterMount(() => {
        if (selected === value) return
        togglePopup(false)
    }, [selected])

    useEffectAfterMount(() => {
        select(value);
    }, [value])

    function handleClick(event, value) {
        select(value)
        event.target.name = name
        event.target.value = value
        onChange(event)
    }

    if (!children) return null

    let { button, body, optionLength, AsyncComponent } = React.Children.toArray(children).reduce((agg, curr) => {
        if (curr.type === Button) {
            agg.button = curr
        }
        else if (curr.type === Async) {
            agg.AsyncComponent = curr
        }
        else if (curr.type === Option || curr.type === OptionGroup) {
            agg.optionLength += 1
            agg.body.push(curr)
        }
        else {
            agg.body.push(curr)
        }
        return agg
    }, { button: null, body: [], optionLength: 0, AsyncComponent: null })

    return <SelectContext.Provider value={{ selected, select, popupOpen, valueComparator, searchString, search, handleClick, disabled, loading, setLoading }}>
        <PopupMenu onToggleCallback={isOpen => togglePopup(isOpen)} autoClose={popupOpen}>
            <PopupMenu.Button isKebab={isKebab} disabled={disabled} tabIndex={tabIndex} rootClassName={rootClassName}>
                {button}
            </PopupMenu.Button>
            {popupOpen && AsyncComponent}
            <PopupMenu.Body rootClassName={`select-popup ${rootClassName || ""}`} autoWidth={autoWidth}>
                {loading ? null : <>
                    {optionLength === 0 && < div className={`${rootClassName} no-option-found flex`}>No results found</div>}
                    {body}
                </>}
            </PopupMenu.Body>
        </PopupMenu>
    </SelectContext.Provider>
}

function Option({ children, value, disabled = false, style = {}, active = false, name = "", rootClassName = "" }) {
    const { selected, searchString, valueComparator, handleClick } = useSelectContext()
    active = active || selected === value;
    if (typeof value === 'object') {
        active = active || valueComparator(value)
    }
    return name.includes(searchString) ?
        <div className={`select__option ${rootClassName} ${active ? 'selected' : ''}`}
            style={{ ...style, }}
            onClick={e => { if (!disabled) { e.persist(); handleClick(e, value) } }}>
            {children}
        </div> : null
}

const OptionGroup: React.SFC<OptionGroupProps> = function ({ children, label, rootClassName = "" }) {
    return <div className={`select__option-group ${rootClassName}`}>
        <span className="option-group__label">{label}</span>
        {children}
    </div>
}

function Button({ children, style = {}, rootClassName = "", arrowAsset = "" }) {
    const { popupOpen, loading } = useSelectContext()
    return <div className={`select-button flex ${rootClassName} ${popupOpen ? 'focused' : ''}`} style={{ ...style }}>
        {children}
        {loading ? <div><Progressing /></div> : <img src={arrowAsset || arrowTriangle} className="rotate select-button-sort-image" style={{ ['--rotateBy' as any]: popupOpen ? '180deg' : '0deg' }} />}
    </div>
}

function Search({ placeholder = "search", style = {}, inputStyle = {}, rootClassName = "" }) {
    const { searchString, search } = useSelectContext();
    return <div className={`${rootClassName} search search--select-menu`}
        onClickCapture={e => e.stopPropagation()} style={{ ...style }}>
        <span className="search__icon"><i className="fa fa-search"></i></span>
        <input autoFocus className="search__input" style={{ ...inputStyle }} type="text" placeholder={placeholder} value={searchString} onChange={e => search(e.target.value)} />
    </div>
}

const Async: React.FC<SelectAsync> = ({ api }) => {
    const { loading, setLoading } = useSelectContext()
    useEffect(() => {
        async function triggerAPI() {
            setLoading(true)
            try {
                await api()
            }
            catch (err) {
                showError(err)
            }
            finally {
                setLoading(false)
            }
        }
        triggerAPI()
    }, [])
    return null
}

function All({ rootClassName = "", style = {} }) {
    const { handleClick } = useSelectContext()
    return (
        <div className={`select__all ${rootClassName}`}
            style={{ ...style }}
            onClick={e => { e.persist(); handleClick(e, 'all') }}>
            Select All
        </div>
    )
}


Select.Button = Button
Select.OptGroup = OptionGroup
Select.Option = Option
Select.Search = Search
Select.All = All
Select.Async = Async

export default Select