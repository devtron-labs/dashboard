import React, { useState, useEffect, useContext, useRef } from 'react'
import { InputPluginSelectionType, SuggestedTagOptionType } from '../ConfigMapSecret/Types'
import { OptionType, PopupMenu, ResizableTagTextArea, stopPropagation } from '@devtron-labs/devtron-fe-common-lib'
import Tippy from '@tippyjs/react'



export const InputPluginSelection = ({
    selectedOutputVariable,
    tagOptions,
    setTagData,
    tagData,
    refVar,
    noBackDrop,

}: InputPluginSelectionType) => {
    const [selectedValue, setSelectedValue] = useState('')
    const refVal = useRef(null)
    const dependentRef = useRef(null)

    useEffect(() => {
        setSelectedValue(selectedOutputVariable.value)
    }, [selectedOutputVariable])

    const handleInputChange = (e): void => {
        setSelectedValue(e.target.value)
    }
    
    const handleBlue = () => {
        
    }

    const onSelectValue = (e): void => {
        stopPropagation(e)
        let _tagData = { ...tagData }
        _tagData = e.currentTarget.dataset.key
        setTagData(_tagData)
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

    const renderSuggestions = (): JSX.Element => {
        if (tagOptions?.length) {
            const filteredTags = tagOptions.filter((tag) => tag.label.indexOf(selectedValue) >= 0)
            if (filteredTags.length) {
                return (
                    <div>
                        {filteredTags.map((tag, index) =>
                            tag.description ? optionWithTippy(tag, index) : option(tag, index),
                        )}
                    </div>
                )
            }
        }
        return null
    }

    // let popupMenuBody = 
    return (
    //     <PopupMenu autoClose autoPosition>
    //     <PopupMenu.Button rootClassName="dc__bg-n50 flex top dc__no-border-imp">
    //         <ResizableTagTextArea
    //             minHeight={30}
    //             maxHeight={80}
    //             value={selectedValue}
    //             onChange={handleInputChange}
    //             onBlur={handleOnBlur}
    //             onFocus={handleOnFocus}
    //             placeholder={placeholder}
    //             refVar={refVar}
    //             dependentRef={dependentRef}
    //         />
    //     </PopupMenu.Button>
    //         {popupMenuBody && (
    //         <PopupMenu.Body
    //             rootClassName={`mxh-210 dc__overflow-auto tag-class`}
    //             autoWidth={true}
    //             preventWheelDisable={true}
    //             noBackDrop={noBackDrop}
    //         >
    //             {popupMenuBody}
    //         </PopupMenu.Body>
    //     )}
    // </PopupMenu>
    null
    )
    
}