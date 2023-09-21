import React, { useState, useEffect } from 'react'
import { InputPluginSelectionType, optionsListType } from '../ConfigMapSecret/Types'
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
    const [activeElement, setActiveElement] = useState('')
    const [highlightedIndex, setHighlightedIndex] = useState(-1)

    useEffect(() => {
        setSelectedValue(selectedOutputVariable.value)
    }, [selectedOutputVariable])

    const handleOnFocus = (e) => {
        setTimeout(() => {
            setActiveElement(`tag-${variableType}`)
        }, 300)
    }

    const handleInputChange = (event): void => {
        setSelectedValue(event.target.value)
        setVariableData({
            label: event.target.value,
            value: event.target.value,
        })
    }

    const handleOnKeyDown = (e) => {
        if(e.key === 'Backspace' && selectedValue.length === 1) {
            handleClear(e)
        }
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault()
            const filteredArray = variableOptions.filter((tag) => tag.options.length > 0)[0]
            setHighlightedIndex((prevIndex) => {                                                      
                if (e.key === 'ArrowUp') {
                    return prevIndex <= 0 ? filteredArray.options.length - 1 : prevIndex - 1
                } else if (e.key === 'ArrowDown') {
                    return prevIndex === filteredArray.options.length - 1 ? 0 : prevIndex + 1
                }
            })
            if(highlightedIndex!=-1) {
                const selectedVariable = filteredArray.options[highlightedIndex]
                renderOutputOptions(selectedVariable, highlightedIndex)
            }
        } else if (e.key === 'Enter' && highlightedIndex !== -1) {
            const selectedOption = variableOptions.filter((tag) => tag.options.length > 0)[0].options[highlightedIndex]
            if (selectedOption) {
                setSelectedValue(selectedOption.value)
            }
        }
    }

    const onSelectValue = (e): void => {
        let _tagData = variableData
        _tagData.label = e.currentTarget.dataset.key
        _tagData.value = e.currentTarget.dataset.key
        setVariableData(_tagData)
        setSelectedValue(_tagData.value)
        setActiveElement('')
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
            !e.relatedTarget.classList.value ||
            !e.relatedTarget.classList.value.includes(`tag-${variableType}-class`)
        ) {
            setActiveElement('')
            setHighlightedIndex(-1)
            let _tagData = { ...variableData }
            let trimmedValue = trimLines(selectedValue)
            _tagData.value = trimmedValue
            setVariableData(_tagData)
        }
    }

    const renderOutputOptions = (tag: optionsListType, index?: number): JSX.Element => {
        const isHighlighted = index === highlightedIndex;
        return (
            <div
                key={`${index}`}
                data-key={tag.label}
                className={isHighlighted ? "dc__bg-n50 scrollable dc__ellipsis-right lh-20 fs-13 fw-4 pt-6 pr-8 pb-6 pl-8" : "dc__hover-n50 dc__ellipsis-right lh-20 fs-13 fw-4 pt-6 pr-8 pb-6 pl-8 cursor"}
                onClick={onSelectValue}
                data-testid={`tag-label-value-${index}`}
            >
                {tag.label}
            </div>
        )
    }

    const renderSuggestions = (): JSX.Element => {
        if (variableOptions?.length) {
            const filteredArray = variableOptions
                .filter((tag) => tag.options.length > 0)[0]
                .options.filter((tag) => tag.label.indexOf(selectedValue) >= 0)
            return (
                <>
                    {filteredArray.map((_tag, idx) => {
                        return (
                            <div>
                                {_tag.description ?
                                <Tippy
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
                                : renderOutputOptions(_tag, idx)}
                            </div>
                        )
                    })}
                </>
            )
        }
    }

    const handleClear = (e) => {
        setVariableData({
            label: '',
            value: '',
        })
        setSelectedValue('')
    }

    const popupMenuBody = activeElement === `tag-${variableType}` ? renderSuggestions() : null
    return (
        <PopupMenu autoClose autoPosition>
            <PopupMenu.Button rootClassName="dc__bg-n50 flex top dc__no-border-imp">
                <ResizableTagTextArea
                    className="form__input tag-input pt-4-imp pb-4-imp fs-13"
                    minHeight={30}
                    maxHeight={80}
                    value={selectedValue}
                    onChange={handleInputChange}
                    onBlur={handleOnBlur}
                    onFocus={handleOnFocus}
                    placeholder={placeholder}
                    refVar={refVar}
                    tabIndex={selectedVariableIndex}
                    handleKeyDown={handleOnKeyDown}
                />
            </PopupMenu.Button>
            <button type="button" className="dc__transparent dc__position-abs" style={{top:"3px", right:"0px"}} onClick={handleClear}>
                <Clear className="icon-dim-18 icon-n4"/>
            </button>
            {popupMenuBody && (
                <PopupMenu.Body
                    rootClassName={`mxh-210 dc__overflow-auto tag-${variableType}-class`}
                    autoWidth={true}
                    preventWheelDisable={true}
                    noBackDrop={noBackDrop}
                >
                    {popupMenuBody}
                </PopupMenu.Body>
            )}
        </PopupMenu>
    )
}
