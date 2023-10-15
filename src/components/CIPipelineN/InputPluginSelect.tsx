import React, { useState, useEffect } from 'react'
import { InputPluginSelectionType, OptionsListType } from '../ConfigMapSecret/Types'
import { PopupMenu, ResizableTagTextArea } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as Clear } from '../../assets/icons/ic-error.svg'
import Tippy from '@tippyjs/react'

export const InputPluginSelection = ({
    selectedOutputVariable,
    variableOptions,
    setVariableData,
    variableData,
    refVar,
    noBackDrop,
    placeholder,
    selectedVariableIndex,
    variableMap,
}: InputPluginSelectionType) => {
    const [selectedValue, setSelectedValue] = useState('')
    const [highlightedIndex, setHighlightedIndex] = useState(-1)
    const [highlightedCategoryIndex, setHighlightedCategoryIndex] = useState(0)
    const [localHighlightedIndex, setLocalHighlightedIndex] = useState(-1)
    const [filteredArray, setFilteredArray] = useState([])

    useEffect(() => {
        setSelectedValue(selectedOutputVariable.value)
    }, [selectedOutputVariable])

    useEffect(() => {
        if (variableOptions?.length) {
            let _uniqueIdx = 0
            const filtered = variableOptions
                .map((variableType) => {
                    const filteredOptions = variableType.options.filter(
                        (val) => val.label && val.label.toLowerCase().indexOf(selectedValue.toLowerCase()) >= 0,
                    )
                    if (filteredOptions.length > 0) {
                        return {
                            label: variableType.label,
                            options: filteredOptions.map((option) => {
                                const _option = {
                                    ...option,
                                    highlightIndex: _uniqueIdx++,
                                }
                                return _option
                            }),
                        }
                    } else {
                        return null
                    }
                })
                .filter((val) => val !== null)

            setFilteredArray(filtered)
        } else {
            setFilteredArray([])
        }
    }, [variableOptions, selectedValue])

    const handleInputChange = (event): void => {
        setSelectedValue(event.target.value)
        if (variableMap.has(event.target.value)) {
            const updatedTagData = {
                ...variableMap.get(event.target.value),
                label: event.target.value,
                value: event.target.value,
            }
            setVariableData(updatedTagData)
        } else {
            setVariableData({
                label: event.target.value,
                value: event.target.value,
            })
        }
    }

    const handleOnKeyDown = (e) => {
        if (e.key === 'Backspace' && selectedValue.length === 1) {
            handleClear(e)
        }
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            const totalLength = filteredArray.reduce((acc, curr) => {
                return acc + curr.options.length
            }, 0)
            const categoryLength = filteredArray.length

            if (e.key === 'ArrowDown') {
                if (highlightedIndex === totalLength - 1) {
                    
                    setHighlightedIndex(0)
                    setLocalHighlightedIndex(0)
                    setHighlightedCategoryIndex(0)
                } else if (localHighlightedIndex === filteredArray[highlightedCategoryIndex]?.options?.length - 1) {
                    if (highlightedCategoryIndex !== categoryLength - 1) {
                        
                        setHighlightedCategoryIndex(highlightedCategoryIndex + 1)
                        setLocalHighlightedIndex(0)
                        setHighlightedIndex(highlightedIndex + 1)
                    } else {
                        
                        setHighlightedCategoryIndex(0)
                        setHighlightedIndex(0)
                        setLocalHighlightedIndex(0)
                    }
                } else {
                    
                    setHighlightedIndex(highlightedIndex + 1)
                    setLocalHighlightedIndex(localHighlightedIndex + 1)
                }
            } else if (e.key === 'ArrowUp') {
                if (highlightedIndex <= 0) {
                    setHighlightedIndex(totalLength - 1)
                    setHighlightedCategoryIndex(categoryLength - 1)
                    setLocalHighlightedIndex(filteredArray[categoryLength - 1]?.options?.length - 1)
                } else if (localHighlightedIndex === 0) {
                    if (highlightedCategoryIndex !== 0) {
                        setHighlightedCategoryIndex(highlightedCategoryIndex - 1)
                        setLocalHighlightedIndex(filteredArray[highlightedCategoryIndex - 1]?.options?.length - 1)
                        setHighlightedIndex(highlightedIndex - 1)
                    } else {
                        setHighlightedCategoryIndex(categoryLength - 1)
                        setHighlightedIndex(totalLength - 1)
                        setLocalHighlightedIndex(filteredArray[categoryLength - 1]?.options?.length - 1)
                    }
                } else {
                    setHighlightedIndex(highlightedIndex - 1)
                    setLocalHighlightedIndex(localHighlightedIndex - 1)
                }
            }
        } else if (e.key === 'Enter' && highlightedIndex !== -1) {
            const selectedOption = filteredArray[highlightedCategoryIndex]?.options[localHighlightedIndex]
            if (selectedOption) {
                setSelectedValue(selectedOption.value)
            } else {
                setSelectedValue(e.target.value)
            }
            setHighlightedIndex(-1)
            setHighlightedCategoryIndex(0)
            setLocalHighlightedIndex(-1)
        }
    }

    const onSelectValue = (e, tag): void => {
        let _tagData = variableData
        const updatedTagData = {
            ...tag,
            label: e.currentTarget.dataset.key,
            value: e.currentTarget.dataset.key,
        }
        setVariableData(updatedTagData)
        setSelectedValue(_tagData.value)
    }

    const trimLines = (value: string) => {
        let trimmedLines = value.split('\n')
        let nonEmptyLines = trimmedLines.filter((line) => {
            return line.trim() !== ''
        })
        return nonEmptyLines.join('\n')
    }

    const handleOnBlur = (e) => {
        if (
            !e.relatedTarget ||
            !e?.relatedTarget?.classList?.value ||
            !e?.relatedTarget?.classList?.value.includes(`tag-${selectedOutputVariable.format}-class`)
        ) {
            setHighlightedIndex(-1)
            let _tagData = { ...variableData }
            let trimmedValue = trimLines(selectedValue)
            _tagData.value = trimmedValue
            if (variableMap.has(_tagData.value)) {
                const updatedTagData = {
                    ...variableMap.get(_tagData.value),
                    label: variableData.label,
                    value: variableData.value,
                }
                setVariableData(updatedTagData)
            } else {
                setVariableData(_tagData)
            }
        }
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
                {tag?.label || ''}
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

    return (
        <PopupMenu autoClose autoPosition>
            <PopupMenu.Button rootClassName="dc__bg-n50 flex top dc__no-border-imp">
                <ResizableTagTextArea
                    className="form__input tag-input pt-4-imp pb-4-imp fs-13 scrollable"
                    minHeight={30}
                    maxHeight={80}
                    value={selectedValue}
                    onChange={handleInputChange}
                    onBlur={handleOnBlur}
                    placeholder={placeholder}
                    refVar={refVar}
                    tabIndex={selectedVariableIndex}
                    handleKeyDown={handleOnKeyDown}
                />
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
            <PopupMenu.Body
                rootClassName={`mxh-210 dc__overflow-auto tag-${selectedOutputVariable.format}-class`}
                autoWidth={true}
                preventWheelDisable={true}
                noBackDrop={noBackDrop}
            >
                {renderSuggestions()}
            </PopupMenu.Body>
        </PopupMenu>
    )
}
