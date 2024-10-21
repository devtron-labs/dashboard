/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react'
import Tippy from '@tippyjs/react'
import { ConditionalWrap, CustomInput } from '../../../Common'
import { TEXT_MESSAGES } from './constants'
import { KeyValueItemProps, KeyValueListActionType, KeyValueListProps } from './types'
import { ReactComponent as ICClose } from '../../../Assets/Icon/ic-close.svg'

const KeyValueItem = ({
    itemKey,
    itemValue,
    handleKeyValueChange,
    isDisabled,
    keyPlaceholder,
    valuePlaceholder,
    index,
    itemClassName,
}: KeyValueItemProps) => {
    const handleKeyUpdate = (event: React.ChangeEvent<HTMLInputElement>) => {
        const data = {
            index,
            value: event.target.value,
        }
        handleKeyValueChange({ action: KeyValueListActionType.UPDATE_KEY, data })
    }

    const handleValueUpdate = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const data = {
            index,
            value: event.target.value,
        }
        handleKeyValueChange({ action: KeyValueListActionType.UPDATE_VALUE, data })
    }

    const handleRemoveItem = (e: React.MouseEvent) => {
        e.stopPropagation()

        const data = {
            index,
        }
        handleKeyValueChange({ action: KeyValueListActionType.DELETE, data })
    }

    return (
        <div className={`flexbox justify-space ${itemClassName || ''}`}>
            <div className="pt-8 w-100">
                <CustomInput
                    name="item-key"
                    rootClassName={`w-100 dc__top-radius-4 pl-10 pr-10 pt-6 pb-6 en-2 bw-1 ${
                        isDisabled ? 'cursor-not-allowed' : ''
                    }`}
                    autoComplete="off"
                    placeholder={keyPlaceholder}
                    type="text"
                    value={itemKey}
                    disabled={isDisabled}
                    onChange={handleKeyUpdate}
                />
                <textarea
                    className={`w-100 dc__bottom-radius-4 dc__no-top-border pl-10 pr-10 pt-6 pb-6 en-2 bw-1 mxh-140 form__textarea ${
                        isDisabled ? 'cursor-not-allowed bcn-1' : 'build__value'
                    }`}
                    value={itemValue}
                    placeholder={valuePlaceholder}
                    onChange={handleValueUpdate}
                    disabled={isDisabled}
                />
            </div>

            {!isDisabled && (
                <button
                    className="dc__no-background flexbox dc__align-start dc__no-border dc__outline-none-imp dc__tab-focus"
                    onClick={handleRemoveItem}
                    type="button"
                    aria-label="remove-docker-args"
                >
                    <ICClose className="icon-dim-24 mt-6 ml-6" />
                </button>
            )}
        </div>
    )
}

const KeyValueList = ({
    keyValueList,
    handleKeyValueChange,
    isDisabled,
    disabledInfo,
    itemClassName,
    addButtonText = TEXT_MESSAGES.ADD_BUTTON_TEXT,
    keyPlaceholder = TEXT_MESSAGES.DEFAULT_KEY_PLACEHOLDER,
    valuePlaceholder = TEXT_MESSAGES.DEFAULT_VALUE_PLACEHOLDER,
}: KeyValueListProps) => {
    const handleAddParameter = () => {
        handleKeyValueChange({ action: KeyValueListActionType.ADD })
    }

    const renderDisabledInfoTippy = (children) => <Tippy content={disabledInfo}>{children}</Tippy>

    return (
        <>
            <ConditionalWrap condition={isDisabled} wrap={renderDisabledInfoTippy}>
                <button
                    className="p-0 cb-5 fw-6 fs-13 flex content-fit lh-32 dc__no-background dc__no-border dc__outline-none-imp dc__tab-focus"
                    onClick={handleAddParameter}
                    type="button"
                >
                    <span className="fa fa-plus mr-8" />
                    {addButtonText}
                </button>
            </ConditionalWrap>

            {keyValueList.length > 0 &&
                keyValueList.map((keyValueGroup, index) => (
                    <KeyValueItem
                        // eslint-disable-next-line react/no-array-index-key
                        key={index}
                        itemKey={keyValueGroup.key}
                        itemValue={keyValueGroup.value}
                        handleKeyValueChange={handleKeyValueChange}
                        isDisabled={isDisabled}
                        keyPlaceholder={keyPlaceholder}
                        valuePlaceholder={valuePlaceholder}
                        index={index}
                        itemClassName={itemClassName}
                    />
                ))}
        </>
    )
}

export default KeyValueList
