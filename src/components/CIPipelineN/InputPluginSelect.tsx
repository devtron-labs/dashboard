import React, { useState, useEffect } from 'react'
import { InputPluginSelectionType, optionsListType } from '../ConfigMapSecret/Types'
import { PopupMenu, ResizableTagTextArea, stopPropagation } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as Clear } from '../../assets/icons/ic-error.svg'
import Tippy from '@tippyjs/react'

export const InputPluginSelection = ({
    selectedOutputVariable,
    tagOptions,
    setTagData,
    tagData,
    refVar,
    noBackDrop,
    variableType,
    placeholder,
}: InputPluginSelectionType) => {
    const [selectedValue, setSelectedValue] = useState('')
    const [activeElement, setActiveElement] = useState('')

    useEffect(() => {
        setSelectedValue(selectedOutputVariable.value)
    }, [selectedOutputVariable])

    const handleOnFocus = (e) => {
        setTimeout(() => {
            setActiveElement(`tag-${variableType}`)
        }, 300)
    }

    const handleInputChange = (event): void => {
        if(event.target.value){
            setSelectedValue(event.target.value)
            setTagData({
                label: event.target.value,
                value: event.target.value,
            })
        }
    }

    const onSelectValue = (e): void => {
        stopPropagation(e)
        let _tagData = tagData
        _tagData.label = e.currentTarget.dataset.key
        _tagData.value = e.currentTarget.dataset.key
        setTagData(_tagData)
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
        if (!e.relatedTarget || !e.relatedTarget.classList.value || !e.relatedTarget.classList.value.includes(`tag-${variableType}-class`)) {
            setActiveElement('')
            let _tagData = { ...tagData }
            let trimmedValue = trimLines(selectedValue)
            _tagData.value = trimmedValue
            setTagData(_tagData)
        }
    }

    const option = (tag: optionsListType, index: number): JSX.Element => {
        return (
            <div
                key={`${tag.value}-${index}`}
                data-key={tag.label}
                className="dc__hover-n50 dc__ellipsis-right lh-20 fs-13 fw-4 pt-6 pr-8 pb-6 pl-8 cursor"
                onClick={onSelectValue}
                data-testid={`tag-label-value-${index}`}
            >
                {tag.label}
            </div>
        )
    }

    const renderSuggestions = (): JSX.Element => {
        if (tagOptions?.length) {
            const filteredArray = tagOptions
                .filter((tag) => tag.options.length > 0)[0]
                .options.filter((tag) => tag.label.indexOf(selectedValue) >= 0)
            return (
                <>
                    {filteredArray.map((_tag, idx) => {
                        return (
                            <div>
                                {_tag.descriptions ? (
                                    <Tippy
                                        className="default-tt"
                                        arrow={false}
                                        placement="left"
                                        content={
                                            <>
                                                <span style={{ display: 'block', width: '220px' }}>
                                                    {_tag.descriptions}
                                                </span>
                                                <div className="cn-5 pl-12 pt-4 pb-4 dc__italic-font-style">
                                                    <div className="fs-12 fw-6 cn-9 dc__break-word">{_tag.label}</div>
                                                    <div className="fs-12 fw-4 cn-9 dc__break-word">{_tag.descriptions}</div>
                                                </div>
                                            </>
                                        }
                                    >   
                                        {option(_tag, idx)}
                                    </Tippy>
                                ) : (
                                    option(_tag, idx)
                                )}
                            </div>
                        )
                    })}
                </>
            )
        }
    }

    const handleClear = (e) => {
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
                    clearable={false}
                />
                <button type="button" className="dc__transparent" onClick={handleClear}>
                    <Clear className="icon-dim-18 icon-n4 vertical-align-middle" />
                </button>
            </PopupMenu.Button>
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