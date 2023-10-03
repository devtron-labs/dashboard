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
    variableType,
    placeholder,
    selectedVariableIndex,
}: InputPluginSelectionType) => {
    const [selectedValue, setSelectedValue] = useState('')
    const [highlightedIndex, setHighlightedIndex] = useState(-1)
    const [filteredArray, setFilteredArray] = useState([])

    useEffect(() => {
        setSelectedValue(selectedOutputVariable.value)
    }, [selectedOutputVariable])

    useEffect(() => {
        if (variableOptions?.length) {
            const filtered = variableOptions
                .filter((tag) => tag.options.length > 0)[0]
                .options.filter((tag) => tag.label.toLowerCase().indexOf(selectedValue.toLowerCase()) >= 0)
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
        }
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            setHighlightedIndex((prevIndex) => {
                if (e.key === 'ArrowUp') {
                    if(prevIndex === -1 || prevIndex === 0) return -1;
                    return prevIndex <= 0 ? filteredArray.length - 1 : prevIndex - 1
                } else if (e.key === 'ArrowDown') {
                    return prevIndex === filteredArray.length - 1 ? 0 : prevIndex + 1
                }
            })
            if (highlightedIndex != -1) {
                const selectedVariable = filteredArray[highlightedIndex]
                renderOutputOptions(selectedVariable, highlightedIndex)
            }
        } else if (e.key === 'Enter' && highlightedIndex !== -1) {
            const selectedOption = filteredArray[highlightedIndex]
            if (selectedOption) {
                setSelectedValue(selectedOption.value)
            } else {
                setSelectedValue(e.target.value)
            }
            setHighlightedIndex(-1)
        }
    }

    const onSelectValue = (e): void => {
        let _tagData = variableData
        _tagData.label = e.currentTarget.dataset.key
        _tagData.value = e.currentTarget.dataset.key
        setVariableData(_tagData)
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
            !e?.relatedTarget?.classList?.value.includes(`tag-${variableType}-class`)
        ) {
            setHighlightedIndex(-1)
            let _tagData = { ...variableData }
            let trimmedValue = trimLines(selectedValue)
            _tagData.value = trimmedValue
            setVariableData(_tagData)
        }
    }

    const renderOutputOptions = (tag: OptionsListType, index: number): JSX.Element => {
        const isHighlighted = index === highlightedIndex
        return (
            <div
                key={index}
                data-key={tag?.label || ""}
                className={
                    isHighlighted
                        ? 'dc__bg-n50 dc__ellipsis-right lh-20 fs-13 fw-4 pt-6 pr-8 pb-6 pl-8'
                        : 'dc__hover-n50 dc__ellipsis-right lh-20 fs-13 fw-4 pt-6 pr-8 pb-6 pl-8 cursor'
                }
                onClick={onSelectValue}
                data-testid={`tag-label-value-${index}`}
            >
                {tag?.label || ""}
            </div>
        )
    }

    const renderSuggestions = () => {
        return (
            <>
                {filteredArray.map((_tag, idx) => {
                    return (
                        <div>
                            {_tag.description ? (
                                <Tippy
                                    key={idx}
                                    className="default-tt"
                                    arrow={false}
                                    placement="right"
                                    content={
                                        <span className="fs-12 fw-6 cn-0 dc__break-word">
                                            <div className="mb-10">{_tag.description}</div>
                                        </span>
                                    }
                                >
                                    {renderOutputOptions(_tag, idx)}
                                </Tippy>
                            ) : (
                                renderOutputOptions(_tag, idx)
                            )}
                        </div>
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
                </button>)}
            <PopupMenu.Body
                rootClassName={`mxh-210 dc__overflow-auto tag-${variableType}-class`}
                autoWidth={true}
                preventWheelDisable={true}
                noBackDrop={noBackDrop}
            >
                {renderSuggestions()}
            </PopupMenu.Body>
        </PopupMenu>
    )
}
