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

import React, { useEffect, useState } from 'react'
import { PopupMenu, useEffectAfterMount } from '@devtron-labs/devtron-fe-common-lib'
import arrowTriangle from '../../../assets/icons/appstatus/ic-sort-down.svg'

const MultiSelectContext = React.createContext(null)

function useMultiSelectContext() {
    const context = React.useContext(MultiSelectContext)
    if (!context) {
        throw new Error(`Select compound components cannot be rendered outside the Toggle component`)
    }
    return context
}

interface Options {
    value: any
    label: string
}
interface multiSelectProps {
    autoClose?: boolean
    options: Options[]
    rootClassName?: string
    placeholder?: string
    buttonText?: string
    all?: boolean
    createButtonElement?: any
    tabIndex: number
    onSelect?: any
    selected: Options[]
}

const MultiSelect: React.FunctionComponent<multiSelectProps> = (props) => {
    const [selected, select] = useState({})
    const [popupOpen, togglePopup] = useState(false)
    const [searchString, search] = useState('')

    useEffectAfterMount(() => {
        if (!popupOpen) {
            props.onSelect(Object.values(selected))
        }
    }, [popupOpen])

    useEffect(() => {
        const originalSelected = props.selected.map((a) => a.value)
        const selectedArray = new Set(Object.keys(selected))
        const intersect = new Set([...originalSelected].filter((i) => selectedArray.has(i)))
        if (Array.from(intersect).length === 0) {
            return
        }
        if (selected && Object.keys(selected).length > 0) {
            props.onSelect(Object.values(selected))
        }
    }, [selected])

    useEffect(() => {
        if (!Array.isArray(props.selected)) {
            return
        }
        select(
            props.selected.reduce((agg, { value, ...rest }, idx) => {
                agg[value] = { value, ...rest }
                return agg
            }, {}),
        )
    }, [props.selected])

    const eligibleOptions = props.options
        .filter(
            (option) =>
                option.label.includes(searchString) &&
                (props.createButtonElement || !selected.hasOwnProperty(option.value)),
        )
        .map((option, idx) => <Option key={idx} {...option} />)

    return (
        <MultiSelectContext.Provider
            value={{ selected, select, togglePopup, popupOpen, searchString, search, options: props.options }}
        >
            <PopupMenu onToggleCallback={(isOpen) => togglePopup(isOpen)} autoClose={props.autoClose}>
                <PopupMenu.Button rootClassName={props.rootClassName} tabIndex={props.tabIndex || 0}>
                    <div className={`multi-select-button ${props.rootClassName}`}>
                        {selected && (
                            <div className="selected-buttons-container">
                                {!props.createButtonElement &&
                                    Object.keys(selected).map((selectedOption, idx) => (
                                        <SelectedButton key={idx} {...selected[selectedOption]} />
                                    ))}
                                {popupOpen && (
                                    <input
                                        className="multi-select-input"
                                        value={searchString}
                                        autoFocus
                                        onChange={(e) => search(e.target.value)}
                                        placeholder={props.placeholder || '+Add New'}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                )}
                                {!popupOpen &&
                                    typeof props.createButtonElement === 'function' &&
                                    props.createButtonElement(Object.values(selected))}
                                {!popupOpen && !props.createButtonElement && (
                                    <span className="multiselect-selected-button placeholder">{props.placeholder}</span>
                                )}
                            </div>
                        )}
                        <img
                            src={arrowTriangle}
                            className="rotate select-button-sort-image"
                            style={{ ['--rotateBy' as any]: popupOpen ? '180deg' : '0deg' }}
                        />
                    </div>
                </PopupMenu.Button>
                <PopupMenu.Body rootClassName={props.rootClassName}>
                    {props.all && <All />}
                    {eligibleOptions}
                    {eligibleOptions.length === 0 && (
                        <div className={`${props.rootClassName} no-option-found flex`}>No results found</div>
                    )}
                </PopupMenu.Body>
            </PopupMenu>
        </MultiSelectContext.Provider>
    )
}

const All = () => {
    const { selected, select, options } = useMultiSelectContext()
    const isAllSelected = Object.keys(selected).length === options.length
    return (
        <div
            className="multi-select-option"
            onClick={(e) => {
                if (isAllSelected) {
                    select({})
                } else {
                    select(
                        options.reduce((agg, curr) => {
                            agg[curr.value] = curr
                            return agg
                        }, {}),
                    )
                }
            }}
        >
            {isAllSelected ? 'Unselect All' : 'Select All'}
        </div>
    )
}

const SelectedButton = ({ label, value, icon = '' }) => {
    const { selected, select } = useMultiSelectContext()
    return (
        <span className="multiselect-selected-button" onClick={(e) => e.stopPropagation()}>
            {icon && <img src={icon} />}
            {label}
            <div
                className="fa fa-times-circle"
                onClickCapture={(e) => {
                    select((selected) => {
                        delete selected[value]
                        return { ...selected }
                    })
                }}
            />
        </span>
    )
}

const Option = ({ label, value, style = {}, ...rest }) => {
    const { selected, select } = useMultiSelectContext()
    const active = selected.hasOwnProperty(value)
    function toggleSelection(e) {
        const tempSelected = { ...selected }
        if (!tempSelected[value]) {
            tempSelected[value] = { label, value, ...rest }
        } else {
            delete tempSelected[value]
        }
        select(tempSelected)
    }
    return (
        <div
            style={{ ...style }}
            className={`multi-select-option ${active ? 'selected' : ''}`}
            onClick={toggleSelection}
        >
            <span className="fa fa-check" />
            {rest.icon && <img src={rest.icon} />}
            {label}
        </div>
    )
}

export default React.memo(MultiSelect)
