import React, { useState, useEffect } from 'react'
import { KEY_VALUE } from '@devtron-labs/devtron-fe-common-lib'
import { HeaderValueSelectorType } from './types'

export const HeaderValueSelector = ({
    selectedHeaderIndex,
    headerData,
    setHeaderData,
    headerInputType,
    placeholder,
    headerIndex = null,
}: HeaderValueSelectorType) => {
    const [selectedValue, setSelectedValue] = useState<string>('')

    useEffect(() => {
        setSelectedValue(headerData?.[headerInputType] || '')
    }, [selectedHeaderIndex, headerData, headerInputType])

    const onBlur = (e) => {
        if (
            !e.relatedTarget ||
            !e.relatedTarget.classList.value ||
            !e.relatedTarget.classList.value.includes(`tag-${selectedHeaderIndex}-class`)
        ) {
            const _headerData = { ...headerData }
            _headerData[headerInputType] = selectedValue
            setHeaderData(selectedHeaderIndex, _headerData)
        }
    }

    const handleInputChange = (e) => {
        setSelectedValue(e.target.value)
    }

    return (
        <input
            className={`form__input tag-input pt-4-imp pb-4-imp fs-13 ${headerInputType === "key"
                ? `dc__no-right-radius`
                : `dc__no-border-radius dc__no-right-border dc__no-left-border`
                }`}
            value={selectedValue}
            onChange={handleInputChange}
            onBlur={onBlur}
            placeholder={placeholder}
            data-testid={`header-${headerInputType === KEY_VALUE.KEY ? 'key' : 'value'}-${selectedHeaderIndex}`}
        />
    )
}