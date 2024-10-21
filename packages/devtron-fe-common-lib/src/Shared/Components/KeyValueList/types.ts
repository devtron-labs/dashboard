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

export enum KeyValueListActionType {
    ADD = 'ADD_KEY_VALUE',
    DELETE = 'DELETE_KEY_VALUE',
    UPDATE_KEY = 'UPDATE',
    UPDATE_VALUE = 'UPDATE_VALUE',
}

export type KeyValueListType = {
    key: string
    value: string
}

export interface KeyValueHandlerDataType {
    /**
     * Used to identify the key-value pair.
     * Optional - only for ADD action else it is mandatory
     */
    index?: number
    value?: string
}

export interface HandleKeyValueChangeType {
    action: KeyValueListActionType
    data?: KeyValueHandlerDataType
}

export interface KeyValueListProps {
    keyValueList: KeyValueListType[]
    handleKeyValueChange: ({ action, data }: HandleKeyValueChangeType) => void
    /**
     * Would disable adding/deleting/updating parameters
     */
    isDisabled?: boolean
    disabledInfo?: string
    /**
     * @default - Add Parameter
     */
    addButtonText?: string
    /**
     * @default - Enter Key
     */
    keyPlaceholder?: string
    /**
     * @default - Enter Value
     */
    valuePlaceholder?: string
    /**
     * to be applied on each item
     */
    itemClassName?: string
}

export interface KeyValueItemProps extends Omit<KeyValueListProps, 'addButtonText' | 'keyValueList' | 'disabledInfo'> {
    itemKey: string
    itemValue: string
    index: number
}
