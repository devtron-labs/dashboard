import React, { useState, useEffect, useContext, useRef } from 'react'
import { InputPluginSelectionType, SuggestedTagOptionType } from '../ConfigMapSecret/Types'
import { OptionType, PopupMenu, ResizableTagTextArea, stopPropagation } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as CloseIcon } from '../../assets/icons/ic-close.svg'
import Tippy from '@tippyjs/react'

export const InputPluginSelection = ({
    selectedOutputVariable,
    tagOptions,
    setTagData,
    tagData,
    refVar,
    dependentRef,
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

    const handleInputChange = (e): void => {
        setSelectedValue(e.target.value)
    }

    const onSelectValue = (e): void => {
        stopPropagation(e)
        let _tagData = { ...tagData }
        _tagData = e.currentTarget.dataset.key
        setTagData(_tagData)
        setActiveElement('')
    } 

    const option = (tag: SuggestedTagOptionType, index: number): JSX.Element => {
        return (
            <div
                key={`${tag.value}-${index}`}
                data-key={tag.label}
                className="dc__hover-n50 dc__ellipsis-right lh-20 fs-13 fw-4 pt-6 pr-8 pb-6 pl-8 cursor"
                onClick={onSelectValue}
            >
                {tag.label}
            </div>
        )
    }
    
    const optionWithTippy = (tag: SuggestedTagOptionType, index: number): JSX.Element => {
        return (
            <Tippy
                className="default-tt"
                arrow={false}
                placement="right"
                content={
                    <div>
                        <div className="mb-10 fs-12 fw-6 cn-0 dc__break-word">{tag.label}</div>
                        <div className="fs-12 fw-4 cn-0 dc__break-word">{tag.value}</div>
                    </div>
                }
            >
                {option(tag, index)}
            </Tippy>
        )
    }

    const handleOnBlur = (e) => {
        if (!e.relatedTarget || !e.relatedTarget.classList.value) {
            setActiveElement('')
            let _tagData = { ...tagData }
            _tagData.value = selectedValue
            setTagData(_tagData)
        }
    }

    const renderSuggestions = (): JSX.Element => {
        if (tagOptions?.length) {
            const filteredTags = tagOptions.filter((tag) => tag.label.indexOf(selectedValue) >= 0)
            if (filteredTags.length) {
                return (
                    <div>
                        {filteredTags.map((tag, index) =>
                            tag.label ? optionWithTippy(tag, index) : option(tag, index),
                        )}
                    </div>
                )
            }
        }
    }

    const handleCloseIcon = () => {
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
                    dependentRef={dependentRef}
                />
                <button type="button" className="dc__transparent" onClick={handleCloseIcon}>
                    <CloseIcon />
                </button>
            </PopupMenu.Button>
            {popupMenuBody && (
                <PopupMenu.Body
                    rootClassName="mxh-210 dc__overflow-auto tag"
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