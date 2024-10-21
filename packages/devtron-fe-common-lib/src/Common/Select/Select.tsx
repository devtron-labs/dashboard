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

// @ts-nocheck

import React, { useEffect } from 'react'
import { SelectComposition, SelectProps, OptionGroupProps, SelectAsync } from './types'

import arrowTriangle from '../../Assets/Icon/ic-chevron-down.svg' // '../../../assets/icons/ic-chevron-down.svg'

import './select.scss'
import PopupMenu from '../PopupMenu'
import { showError } from '../Helper'

const SelectContext = React.createContext(null)

function useSelectContext() {
    const context = React.useContext(SelectContext)
    if (!context) {
        throw new Error(`Select compound components cannot be rendered outside the Toggle component`)
    }
    return context
}

const Select: React.FC<SelectProps> & SelectComposition = ({
    children = null,
    onChange,
    value = null,
    valueComparator,
    rootClassName = '',
    disabled = false,
    tabIndex = 0,
    name = 'select',
    autoWidth = true,
    isKebab = false,
    dataTestId = '',
}) => {
    const [selected, select] = React.useState(value)
    const [popupOpen, togglePopup] = React.useState(false)
    const [searchString, search] = React.useState('')
    const [loading, setLoading] = React.useState(false)

    useEffectAfterMount(() => {
        if (selected === value) return
        togglePopup(false)
    }, [selected])

    useEffectAfterMount(() => {
        select(value)
    }, [value])

    function handleClick(event, value) {
        select(value)
        event.target.name = name
        event.target.value = value
        onChange(event)
    }

    if (!children) return null

    const { button, body, optionLength, AsyncComponent } = React.Children.toArray(children).reduce(
        (agg, curr) => {
            if (curr.type === Button) {
                agg.button = curr
            } else if (curr.type === Async) {
                agg.AsyncComponent = curr
            } else if (curr.type === Option || curr.type === OptionGroup) {
                agg.optionLength += 1
                agg.body.push(curr)
            } else {
                agg.body.push(curr)
            }
            return agg
        },
        { button: null, body: [], optionLength: 0, AsyncComponent: null },
    )

    return (
        <SelectContext.Provider
            value={{
                selected,
                select,
                popupOpen,
                valueComparator,
                searchString,
                search,
                handleClick,
                disabled,
                loading,
                setLoading,
            }}
        >
            <PopupMenu onToggleCallback={(isOpen) => togglePopup(isOpen)} autoClose={popupOpen}>
                <PopupMenu.Button
                    isKebab={isKebab}
                    disabled={disabled}
                    tabIndex={tabIndex}
                    rootClassName={rootClassName}
                    dataTestId={dataTestId}
                >
                    {button}
                </PopupMenu.Button>
                {popupOpen && AsyncComponent}
                <PopupMenu.Body rootClassName={`select-popup ${rootClassName || ''}`} autoWidth={autoWidth}>
                    {loading ? null : (
                        <>
                            {optionLength === 0 && (
                                <div className={`${rootClassName} no-option-found flex`}>No results found</div>
                            )}
                            {body}
                        </>
                    )}
                </PopupMenu.Body>
            </PopupMenu>
        </SelectContext.Provider>
    )
}

const Option = ({
    dataTestIdMenuList,
    children,
    value,
    disabled = false,
    style = {},
    active = false,
    name = '',
    rootClassName = '',
}) => {
    const { selected, searchString, valueComparator, handleClick } = useSelectContext()
    active = active || selected === value
    if (typeof value === 'object') {
        active = active || valueComparator(value)
    }
    return name.includes(searchString) ? (
        <div
            data-testid={`list-${dataTestIdMenuList}`}
            className={`select__option ${rootClassName} ${active ? 'selected' : ''}`}
            style={{ ...style }}
            onClick={(e) => {
                if (!disabled) {
                    e.persist()
                    handleClick(e, value)
                }
            }}
        >
            {children}
        </div>
    ) : null
}

const OptionGroup: React.SFC<OptionGroupProps> = ({ children, label, rootClassName = '' }) => (
    <div className={`select__option-group ${rootClassName}`}>
        <span className="option-group__label">{label}</span>
        {children}
    </div>
)

const Button = ({
    dataTestIdDropdown,
    children,
    style = {},
    rootClassName = '',
    arrowAsset = '',
    hideArrow = false,
}) => {
    const { popupOpen, loading } = useSelectContext()
    return (
        <div
            data-testid={dataTestIdDropdown}
            className={`select-button flex ${rootClassName} ${popupOpen ? 'focused' : ''}`}
            style={{ ...style }}
        >
            {children}
            {!hideArrow &&
                (loading ? (
                    <div>
                        <Progressing />
                    </div>
                ) : (
                    <img
                        src={arrowAsset || arrowTriangle}
                        className="rotate select-button-sort-image"
                        style={{ ['--rotateBy' as any]: popupOpen ? '180deg' : '0deg' }}
                    />
                ))}
        </div>
    )
}

const Search = ({ placeholder = 'search', style = {}, inputStyle = {}, rootClassName = '' }) => {
    const { searchString, search } = useSelectContext()
    return (
        <div
            className={`${rootClassName} search search--select-menu`}
            onClickCapture={(e) => e.stopPropagation()}
            style={{ ...style }}
        >
            <span className="search__icon">
                <i className="fa fa-search" />
            </span>
            <input
                autoFocus
                className="search__input"
                style={{ ...inputStyle }}
                type="text"
                placeholder={placeholder}
                value={searchString}
                onChange={(e) => search(e.target.value)}
            />
        </div>
    )
}

const Async: React.FC<SelectAsync> = ({ api }) => {
    const { loading, setLoading } = useSelectContext()
    useEffect(() => {
        async function triggerAPI() {
            setLoading(true)
            try {
                await api()
            } catch (err) {
                showError(err)
            } finally {
                setLoading(false)
            }
        }
        triggerAPI()
    }, [])
    return null
}

const All = ({ rootClassName = '', style = {} }) => {
    const { handleClick } = useSelectContext()
    return (
        <div
            className={`select__all ${rootClassName}`}
            style={{ ...style }}
            onClick={(e) => {
                e.persist()
                handleClick(e, 'all')
            }}
        >
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
