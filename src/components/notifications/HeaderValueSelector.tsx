import React, { useState, useEffect } from 'react'
import { KEY_VALUE } from '@devtron-labs/devtron-fe-common-lib'
import { HeaderValueSelectorType } from './types'

export const HeaderValueSelector = ({
    minHeight,
    maxHeight,
    selectedHeaderIndex,
    headerData,
    setHeaderData,
    headerInputType,
    placeholder,
    headerIndex = null,
    refVar,
    dependentRef,
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

    // const reInitHeight = () => {
    //     if (document.activeElement !== refVar.current) return
    //     refVar.current.style.height = minHeight + 'px'
    //     dependentRef.current.style.height = minHeight + 'px'
    //     let nextHeight = refVar.current.scrollHeight
    //     if (nextHeight < dependentRef.current.scrollHeight) {
    //         nextHeight = dependentRef.current.scrollHeight
    //     }
    //     if (minHeight && nextHeight < minHeight) {
    //         nextHeight = minHeight
    //     }
    //     if (maxHeight && nextHeight > maxHeight) {
    //         nextHeight = maxHeight
    //     }
    //     refVar.current.style.height = nextHeight + 'px'
    //     dependentRef.current.style.height = nextHeight + 'px'
    // }

    // const handleOnFocus = () => {
    //     reInitHeight()
    // }

    return (
        <input
            className={`form__input tag-input pt-4-imp pb-4-imp fs-13 ${headerInputType === "key"
                ? `dc__no-right-radius`
                : `dc__no-border-radius dc__no-right-border dc__no-left-border`
                }`}
            value={selectedValue}
            onChange={handleInputChange}
            onBlur={onBlur}
            // onFocus={handleOnFocus}
            placeholder={placeholder}
            data-testid={`tag-${headerInputType === KEY_VALUE.KEY ? 'key' : 'value'}-${selectedHeaderIndex}`}
        />
    )
}