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

import { KEY_VALUE } from '../Constants'
import { OptionType } from '../Types'

export interface SuggestedTagOptionType extends OptionType {
    description: string
    propagate: boolean
}
export interface TagType {
    id?: number
    key: string
    value?: string
    description?: string
    propagate: boolean
    mandatoryProjectIdsCsv?: string
    isInvalidKey?: boolean
    isInvalidValue?: boolean
    isSuggested?: boolean
    isPropagateDisabled?: boolean
}

export interface TagErrorType {
    isValid: boolean
    messages: string[]
}
export interface TagLabelSelectType {
    isCreateApp?: boolean
    labelTags: TagType[]
    setLabelTags: (tagList: TagType[]) => void
    tabIndex?: number
    selectedProjectId?: number
    suggestedTagsOptions?: SuggestedTagOptionType[]
    reloadProjectTags?: boolean
    hidePropagateTag?: boolean
}

export interface TagDetailType {
    index: number
    tagData: TagType
    setTagData: (index: number, tagData: TagType) => void
    removeTag?: (index: number) => void
    tabIndex?: number
    suggestedTagsOptions?: SuggestedTagOptionType[]
    hidePropagateTag?: boolean
}

export interface TagLabelValueSelectorType {
    selectedTagIndex: number
    tagData: TagType
    setTagData: (index: number, tagData: TagType) => void
    tagOptions?: SuggestedTagOptionType[]
    isRequired?: boolean
    tagInputType?: KEY_VALUE
    placeholder?: string
    tabIndex?: number
    refVar?: React.MutableRefObject<HTMLTextAreaElement>
    dependentRef?: React.MutableRefObject<HTMLTextAreaElement>
    noBackDrop?: boolean
}

export interface ResizableTagTextAreaProps {
    className?: string
    minHeight?: number
    maxHeight?: number
    value?: string
    onChange?: (e) => void
    onBlur?: (e) => void
    onFocus?: (e) => void
    placeholder?: string
    tabIndex?: number
    refVar?: React.MutableRefObject<HTMLTextAreaElement>
    dependentRef?: React.MutableRefObject<HTMLTextAreaElement>
    dataTestId?: string
    handleKeyDown?: any
    disabled?: boolean
    disableOnBlurResizeToMinHeight?: boolean
}
