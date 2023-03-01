import React, { useState, useEffect } from 'react'
import { TagLabelValueSelectorType } from '../../../app/types'
import { PopupMenu, stopPropagation } from '../../../common'
import { ValidationRules } from '../validationRules'
import { ReactComponent as ErrorCross } from '../../../../assets/icons/ic-cross.svg'
import { ReactComponent as Info } from '../../../../assets/icons/ic-info-outlined.svg'
import { KEY_VALUE } from '../../../../config'
import { ResizableTagTextArea } from './ResizableTagTextArea'

export default function TagLabelValueSelector({
    selectedTagIndex,
    tagData,
    setTagData,
    tagOptions,
    isRequired,
    tagInputType,
    placeholder,
    tabIndex = null,
    refVar,
    dependentRef,
}: TagLabelValueSelectorType) {
    const [selectedValue, setSelectedValue] = useState<string>('')
    const [activeElement, setActiveElement] = useState<string>('')
    const validationRules = new ValidationRules()

    useEffect(() => {
        setSelectedValue(tagData?.[tagInputType] || '')
    }, [selectedTagIndex, tagData, tagInputType])

    const handleOnFocus = (e) => {
        setTimeout(() => {
            setActiveElement(`tag-${tagInputType}-${selectedTagIndex}`)
        }, 300)
    }
    const handleOnBlur = (e) => {
        setActiveElement('')
        if (
            !e.relatedTarget ||
            !e.relatedTarget.classList.value ||
            !e.relatedTarget.classList.value.includes(`tag-${selectedTagIndex}-class`)
        ) {
            const _tagData = { ...tagData }
            _tagData[tagInputType] = selectedValue
            if (tagInputType === KEY_VALUE.KEY) {
                _tagData.isInvalidKey = selectedValue
                    ? !validationRules.propagateTagKey(selectedValue).isValid
                    : _tagData.value !== ''
            } else if (selectedValue) {
                _tagData.isInvalidValue = !validationRules.propagateTagValue(selectedValue).isValid
                _tagData.isInvalidKey = !_tagData.key || _tagData.isInvalidKey
            } else {
                _tagData.isInvalidValue = false
                _tagData.isInvalidKey = !_tagData.key ? false : _tagData.isInvalidKey
            }
            setTagData(selectedTagIndex, _tagData)
        }
    }

    const handleInputChange = (e): void => {
        setSelectedValue(e.target.value)
    }

    const onSelectValue = (e): void => {
        stopPropagation(e)
        const _tagData = { ...tagData }
        _tagData[tagInputType] = e.currentTarget.dataset.key
        setTagData(selectedTagIndex, _tagData)
    }

    const renderValidationsSuggestions = (): JSX.Element => {
        let field = { isValid: true, messages: [] }
        if (tagInputType === KEY_VALUE.KEY) {
            if (selectedValue || tagData.value) {
                field = validationRules.propagateTagKey(selectedValue)
            }
        } else if (isRequired || selectedValue) {
            field = validationRules.propagateTagValue(selectedValue)
        }
        if (!field.isValid) {
            return (
                <div className="p-4" onClick={stopPropagation}>
                    {field.messages.map((error) => (
                        <div key={error} className="flexbox pr-4 pl-4">
                            <span>
                                <ErrorCross className="icon-dim-14 scr-5 mt-3 mr-4" />
                            </span>
                            <span>{error}</span>
                        </div>
                    ))}
                    {tagInputType === KEY_VALUE.KEY && (
                        <div className="flexbox pr-4 pl-4">
                            <span>
                                <Info className="icon-dim-14 mt-3 mr-4" />
                            </span>
                            <span className="dc__italic-font-style">Key format: prefix/name or name</span>
                        </div>
                    )}
                </div>
            )
        }
        return null
    }

    const renderSuggestions = (): JSX.Element => {
        if (tagOptions?.length) {
            const filteredTags = tagOptions.filter((tag) => tag.value.indexOf(selectedValue) >= 0)
            if (filteredTags.length) {
                return (
                    <div className="p-8">
                        {tagOptions
                            .filter((tag) => tag.value.indexOf(selectedValue) >= 0)
                            .map((tag, index) => (
                                <div data-key={`${tag.value}-${index}`} className="cursor" onClick={onSelectValue}>
                                    {tag.label}
                                </div>
                            ))}
                    </div>
                )
            }
        }
        return renderValidationsSuggestions()
    }

    return (
        <PopupMenu autoClose autoPosition>
            <PopupMenu.Button rootClassName="dc__bg-n50 flex top dc__no-border">
                <ResizableTagTextArea
                    minHeight={30}
                    maxHeight={80}
                    className={`form__input pt-4-imp pb-4-imp fs-13 ${
                        tagInputType === KEY_VALUE.KEY
                            ? `dc__no-right-radius`
                            : `dc__no-border-radius dc__no-right-border dc__no-left-border`
                    } ${
                        tagData[tagInputType === KEY_VALUE.KEY ? 'isInvalidKey' : 'isInvalidValue']
                            ? 'form__input--error'
                            : ''
                    }`}
                    value={selectedValue}
                    onChange={handleInputChange}
                    onBlur={handleOnBlur}
                    onFocus={handleOnFocus}
                    placeholder={placeholder}
                    tabIndex={tabIndex}
                    refVar={refVar}
                    dependentRef={dependentRef}
                />
            </PopupMenu.Button>
            <PopupMenu.Body rootClassName={`tag-${selectedTagIndex}-class`} autoWidth={true} preventWheelDisable={true}>
                {activeElement === `tag-${tagInputType}-${selectedTagIndex}` && renderSuggestions()}
            </PopupMenu.Body>
        </PopupMenu>
    )
}
