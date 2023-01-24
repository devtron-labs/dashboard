import React, { useState, useEffect } from 'react'
import { TagLabelValueSelectorType } from '../../../app/types'
import { PopupMenu } from '../../../common'
import { ValidationRules } from '../validationRules'
import { ReactComponent as ErrorCross } from '../../../../assets/icons/ic-close.svg'
import { ReactComponent as Info } from '../../../../assets/icons/ic-info-outlined.svg'

export default function TagLabelValueSelector({
    selectedTagIndex,
    tagData,
    setTagData,
    tagOptions,
    isRequired,
    type,
}: TagLabelValueSelectorType) {
    const [selectedValue, setSelectedValue] = useState<string>('')
    const [isPopupOpen, togglePopup] = useState<boolean>(false)

    const validationRules = new ValidationRules()

    useEffect(() => {
        setSelectedValue(tagData?.[type] || '')
    }, [selectedTagIndex, tagData, type])

    const handleOnBlur = (e) => {
        if (
            !e.relatedTarget ||
            !e.relatedTarget.classList.value ||
            !e.relatedTarget.classList.value.includes(`tag-${selectedTagIndex}-class`)
        ) {
            const _tagData = { ...tagData }
            _tagData[type] = selectedValue
            if (type === 'key') {
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
        const _tagData = { ...tagData }
        _tagData[type] = e.currentTarget.dataset.key
        setTagData(selectedTagIndex, _tagData)
    }

    const renderValidationsSuggestions = (): JSX.Element => {
        let field = { isValid: true, messages: [] }
        if (type === 'key') {
            field = validationRules.propagateTagKey(selectedValue)
        } else if (isRequired || selectedValue) {
            field = validationRules.propagateTagValue(selectedValue)
        }
        if (!field.isValid) {
            return (
                <div className="p-4">
                    {field.messages.map((error) => (
                        <div key={error} className="flexbox p-4">
                            <span>
                                <ErrorCross className="icon-dim-14 scr-5 mt-3 mr-4" />
                            </span>
                            <span>{error}</span>
                        </div>
                    ))}
                    {type === 'key' && (
                        <div className="flexbox p-4">
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
        <PopupMenu onToggleCallback={(isOpen) => togglePopup(isOpen)} autoClose>
            <PopupMenu.Button
                rootClassName={`${
                    type === 'key'
                        ? `dc__no-right-radius`
                        : `dc__no-border-radius dc__no-right-border dc__no-left-border`
                } ${tagData[type === 'key' ? 'isInvalidKey' : 'isInvalidValue'] ? 'er-5 bw-1' : ''}`}
            >
                <input
                    type="text"
                    className="form__input pt-4-imp pb-4-imp dc__no-border"
                    value={selectedValue}
                    onChange={handleInputChange}
                    onBlur={handleOnBlur}
                />
            </PopupMenu.Button>
            <PopupMenu.Body rootClassName={`tag-${selectedTagIndex}-class`} autoWidth={true}>
                {isPopupOpen && renderSuggestions()}
            </PopupMenu.Body>
        </PopupMenu>
    )
}
