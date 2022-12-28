import React, { useState, useEffect, useContext } from 'react'
import { baseSelectStyles } from './TagSelector.utils'
import CreatableSelect from 'react-select/creatable'
import { components } from 'react-select'
import { getCustomOptionSelectionStyle } from '../../../v2/common/ReactSelect.utils'
import Tippy from '@tippyjs/react'
import { OptionType } from '../../../app/types'

export default function TagLabelValueSelector({ selectedVariableIndex }: { selectedVariableIndex: number }) {
    const [selectedOutputVariable, setSelectedOutputVariable] = useState<OptionType>({
        label: '',
        value: '',
    })

    const [inputVariableOptions, setInputVariableOptions] = useState<
        {
            label: string
            options: any[]
        }[]
    >([])

    const handleOutputVariableSelector = (selectedValue: OptionType) => {
        setSelectedOutputVariable(selectedValue)
    }

    const ValueContainer = (props) => {
        let value = props.getValue()[0]?.label
        return (
            <components.ValueContainer {...props}>
                <>
                    {!props.selectProps.menuIsOpen && (value ? `${value}` : <span className="cn-5">Enter key</span>)}
                    {React.cloneElement(props.children[1])}
                </>
            </components.ValueContainer>
        )
    }

    function handleCreatableBlur(e) {
        if (e.target.value) {
            handleOutputVariableSelector({
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
        return null
    }

    return (
        <CreatableSelect
            tabIndex={1}
            value={selectedOutputVariable}
            options={inputVariableOptions}
            placeholder="Enter key"
            onChange={handleOutputVariableSelector}
            styles={baseSelectStyles}
            classNamePrefix="tag-select"
            className="w-100"
            components={{
                ValueContainer,
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
