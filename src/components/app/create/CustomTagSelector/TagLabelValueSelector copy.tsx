import React, { useState, useEffect, useContext } from 'react'
import { baseSelectStyles } from './TagSelector.utils'
import CreatableSelect from 'react-select/creatable'
import { components } from 'react-select'
import { getCustomOptionSelectionStyle } from '../../../v2/common/ReactSelect.utils'
import Tippy from '@tippyjs/react'
import { OptionType, TagType } from '../../../app/types'

export default function TagLabelValueSelector({
    selectedTagIndex,
    tagData,
    setTagData,
    tagOptions = [],
    isRequired,
    type,
}: {
    selectedTagIndex: number
    tagData: TagType
    setTagData: (index: number, tagData: TagType) => void
    tagOptions?: OptionType[]
    isRequired?: boolean
    type?: string
}) {
    const [selectedValue, setSelectedOutputVariable] = useState<OptionType>({
        label: '',
        value: '',
    })

    useEffect(() => {
        const _tagData = { ...tagData }
        setSelectedOutputVariable({ label: _tagData[type], value: _tagData[type] })
    }, [selectedTagIndex, tagData])

    const handleValueChange = (selectedValue: OptionType) => {
        setSelectedOutputVariable(selectedValue)
    }

    const ValueContainer = (props) => {
        let value = props.getValue()[0]?.label
        return (
            <components.ValueContainer {...props}>
                <>
                    {!props.selectProps.menuIsOpen && (value ? `${value}` : <span className="cn-5">Enter {type}</span>)}
                    {React.cloneElement(props.children[1])}
                </>
            </components.ValueContainer>
        )
    }

    function handleCreatableBlur(e) {
        if (e.target.value) {
            handleValueChange({
                label: e.target.value,
                value: e.target.value,
            })
        }
    }

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' || event.key === 'Tab') {
            event.target.blur()
        }
    }

    const showCustomKeyValidation = (): string => {
        if (tagData.propagate) {
            return 'hello'
        } else if (isRequired && !selectedValue.value) {
            return 'hi'
        }
        return null
    }

    return (
        <CreatableSelect
            tabIndex={1}
            value={selectedValue}
            options={tagOptions}
            placeholder={`Enter ${type}`}
            onChange={handleValueChange}
            styles={baseSelectStyles}
            classNamePrefix="tag-select"
            className="w-100"
            components={{
                IndicatorSeparator: null,
                DropdownIndicator: null,
            }}
            noOptionsMessage={showCustomKeyValidation}
            onBlur={handleCreatableBlur}
            isValidNewOption={() => false}
            onKeyDown={handleKeyDown}
            menuPlacement="auto"
        />
    )
}
