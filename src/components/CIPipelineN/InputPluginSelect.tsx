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

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { PopupMenu, ResizableTagTextArea } from '@devtron-labs/devtron-fe-common-lib'
import Tippy from '@tippyjs/react'
import { InputPluginSelectionType, OptionsListType } from './types'
import { ReactComponent as Clear } from '../../assets/icons/ic-error.svg'
import { ReactComponent as Var } from '../../assets/icons/ic-var-initial.svg'
import { TIPPY_VAR_MSG } from './Constants'

export const InputPluginSelection = ({
    selectedOutputVariable,
    variableOptions,
    setVariableData,
    variableData,
    refVar,
    noBackDrop,
    placeholder,
    selectedVariableIndex,
}: InputPluginSelectionType) => {
    const [selectedValue, setSelectedValue] = useState('')
    const [highlightedIndex, setHighlightedIndex] = useState(-1) // index of the selected option, regardless of category (global index), range: 0 to ListLength - 1
    const [filteredArray, setFilteredArray] = useState([])
    const [activeElement, setActiveElement] = useState<string>('')

    // total length of list.
    const totalLength = useRef(0)

    useEffect(() => {
        setSelectedValue(selectedOutputVariable.value)
    }, [selectedOutputVariable])

    useEffect(() => {
        if (variableOptions?.length) {
            let _uniqueIdx = 0
            const filtered = variableOptions
                // iterate over each category
                .map((variableType) => {
                    const filteredOptions = variableType.options.filter(
                        // filter options based on the input value
                        (val) => val.label && val.label.toLowerCase().indexOf(selectedValue.toLowerCase()) >= 0,
                    )
                    if (filteredOptions.length > 0) {
                        return {
                            label: variableType.label,
                            options: filteredOptions.map((option) => {
                                const _option = {
                                    ...option,
                                    highlightIndex: _uniqueIdx++, // assign a unique index to each option for keyboard navigation and highlighting
                                }
                                return _option
                            }),
                        }
                    }
                    return null
                })
                .filter((val) => val !== null) // remove empty categories
            totalLength.current = _uniqueIdx // set total length of list

            setFilteredArray(filtered)
        } else {
            setFilteredArray([])
        }
    }, [variableOptions, selectedValue])

    const handleInputChange = (event): void => {
        setSelectedValue(event.target.value)
        setVariableData({
            label: event.target.value,
            value: event.target.value,
        })
    }

    const handleOnKeyDown = (e) => {
        if (e.key === 'Backspace' && selectedValue.length === 1) {
            handleClear(e)
        } else if (e.key === 'ArrowDown') {
            const nextIndex = (highlightedIndex + 1) % totalLength.current
            setHighlightedIndex(nextIndex)
        } else if (e.key === 'ArrowUp') {
            const prevIndex = (highlightedIndex - 1 + totalLength.current) % totalLength.current
            setHighlightedIndex(prevIndex)
        } else if (e.key === 'Enter' && highlightedIndex !== -1) {
            const selectedOption = filteredArray.map((val) => val.options).flat()[highlightedIndex]

            if (selectedOption) {
                e.preventDefault()
                setVariableData({ ...selectedOption, label: selectedOption.label, value: selectedOption.value })
            }
            setHighlightedIndex(-1)
            setActiveElement('')
        }
    }

    const onSelectValue = (e, tag): void => {
        const _tagData = variableData
        const updatedTagData = {
            ...tag,
            label: e.currentTarget.dataset.key,
            value: e.currentTarget.dataset.key,
        }
        setVariableData(updatedTagData)
        setSelectedValue(_tagData.value)
        setActiveElement('')
    }

    const trimLines = (value: string) => {
        const trimmedLines = value.split('\n')
        const nonEmptyLines = trimmedLines.filter((line) => {
            return line.trim() !== ''
        })
        return nonEmptyLines.join('\n')
    }

    const handleOnBlur = (e) => {
        if (
            !e.relatedTarget ||
            !e?.relatedTarget?.classList?.value ||
            !e?.relatedTarget?.classList?.value.includes(`tag-${selectedVariableIndex}-class`)
        ) {
            setHighlightedIndex(-1)
            setActiveElement('')
            const _tagData = { ...variableData }
            const trimmedValue = trimLines(selectedValue)
            _tagData.value = trimmedValue

            setVariableData(_tagData)
        }
    }

    const handleOnFocus = (e) => {
        setActiveElement(`tag-${selectedVariableIndex}`)
    }

    const renderOutputOptions = (tag: OptionsListType, index: number): JSX.Element => {
        const isHighlighted = index === highlightedIndex
        return (
            <div
                key={index}
                data-key={tag?.label || ''}
                className={
                    isHighlighted
                        ? 'dc__bg-n50 dc__ellipsis-right lh-20 fs-13 fw-4 pt-6 pr-8 pb-6 pl-8'
                        : 'dc__hover-n50 dc__ellipsis-right lh-20 fs-13 fw-4 pt-6 pr-8 pb-6 pl-8 cursor'
                }
                onClick={(e) => onSelectValue(e, tag)}
                data-testid={`tag-label-value-${index}`}
            >
                <div className="flexbox dc__content-space dc__align-items-center">
                    <span>{tag?.label || ''}</span>

                    <span className=" font-roboto cn-5 fw-4">
                        {/* @ts-ignore */}
                        {tag?.refVariableTaskName}
                    </span>
                </div>
            </div>
        )
    }

    const renderSuggestions = () => {
        return (
            <>
                {filteredArray.map((_tag) => {
                    return (
                        <>
                            <div className="bcn-1 h-28 flexbox dc__align-items-center pl-10 fw-6">
                                <span>{_tag.label}</span>
                            </div>
                            <div>
                                {_tag.options.map((option, idx) => {
                                    return option?.description ? (
                                        <Tippy
                                            key={idx}
                                            className="default-tt"
                                            arrow={false}
                                            placement="right"
                                            content={
                                                <span className="fs-12 fw-6 cn-0 dc__break-word">
                                                    <div className="mb-10">{option.description}</div>
                                                </span>
                                            }
                                        >
                                            {renderOutputOptions(option, option.highlightIndex)}
                                        </Tippy>
                                    ) : (
                                        renderOutputOptions(option, option.highlightIndex)
                                    )
                                })}
                            </div>
                        </>
                    )
                })}
            </>
        )
    }

    const handleClear = (e) => {
        setVariableData({
            label: '',
            value: '',
        })
        setSelectedValue('')
    }
    const popupMenuBody = activeElement === `tag-${selectedVariableIndex}` ? renderSuggestions() : null
    return (
        <PopupMenu autoClose autoPosition>
            <PopupMenu.Button rootClassName="dc__bg-n50 flex top dc__no-border-imp flexbox dc__align-items-center dc__content-start">
                <ResizableTagTextArea
                    className={`dc__position-rel ${
                        variableData.refVariableStage ||
                        (variableData?.variableType && variableData.variableType !== 'NEW')
                            ? 'pl-28'
                            : ''
                    } form__input tag-input pt-4-imp pb-4-imp fs-13 scrollable dc__lh-inherit`}
                    minHeight={32}
                    maxHeight={80}
                    value={selectedValue}
                    onChange={handleInputChange}
                    onBlur={handleOnBlur}
                    onFocus={handleOnFocus}
                    placeholder={placeholder}
                    refVar={refVar}
                    tabIndex={selectedVariableIndex}
                    onKeyDown={handleOnKeyDown}
                />
                {(variableData.refVariableStage ||
                    (variableData?.variableType && variableData.variableType !== 'NEW')) && (
                    <Tippy content={TIPPY_VAR_MSG} placement="bottom-start" animation="shift-away" arrow={false}>
                        <div className="flex">
                            <Var className="dc__position-abs dc__left-6 icon-dim-18 icon-n4" />
                        </div>
                    </Tippy>
                )}
            </PopupMenu.Button>
            {selectedValue && (
                <button
                    type="button"
                    className="dc__transparent dc__position-abs"
                    style={{ top: '4px', right: '4px' }}
                    onClick={handleClear}
                >
                    <Clear className="icon-dim-18 icon-n4" />
                </button>
            )}
            {popupMenuBody && (
                <PopupMenu.Body
                    rootClassName={`mxh-210 dc__overflow-auto tag-${selectedVariableIndex}-class`}
                    autoWidth
                    preventWheelDisable
                    noBackDrop={noBackDrop}
                >
                    {popupMenuBody}
                </PopupMenu.Body>
            )}
        </PopupMenu>
    )
}
