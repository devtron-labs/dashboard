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

import React, { useRef } from 'react'
import { ReactComponent as DeleteCross } from '../../Assets/Icon/ic-cross.svg'
import { ReactComponent as InjectTag } from '../../Assets/Icon/inject-tag.svg'
import { TagLabelValueSelector } from './TagLabelValueSelector'
import { KEY_VALUE } from '../Constants'
import { stopPropagation } from '../Helper'
import { TagDetailType } from './Types'
import { ValidationRules } from './ValidationRules'

export const TagDetails = ({
    index,
    tagData,
    setTagData,
    removeTag,
    tabIndex = 1,
    suggestedTagsOptions,
    hidePropagateTag,
}: TagDetailType) => {
    const keyRef = useRef(null)
    const valueRef = useRef(null)
    const validationRules = new ValidationRules()

    const deleteTag = (e): void => {
        stopPropagation(e)
        removeTag(index)
    }
    const propagateTagToResource = (): void => {
        const _tagData = { ...tagData }
        _tagData.propagate = !_tagData.propagate
        if (_tagData.propagate) {
            _tagData.isInvalidKey = _tagData.isInvalidKey || !_tagData.key
            _tagData.isInvalidValue = _tagData.isInvalidValue || !_tagData.value
        } else {
            _tagData.isInvalidKey =
                _tagData.key || _tagData.value ? !validationRules.propagateTagKey(_tagData.key).isValid : false
            _tagData.isInvalidValue = _tagData.value
                ? !validationRules.propagateTagValue(_tagData.value, _tagData.key).isValid
                : false
        }
        setTagData(index, _tagData)
    }
    return (
        <div className="flexbox mb-8">
            {!hidePropagateTag && (
                <div
                    className={`dc__border h-30 pl-4 pr-4 br-4 mr-8 pointer ${tagData.propagate ? 'bcn-7' : ''} ${tagData.key.startsWith('devtron.ai/') ? 'cursor-not-allowed bcn-1' : ''}`}
                    onClick={!tagData?.isPropagateDisabled ? propagateTagToResource : null}
                    data-testid={`propagate-tag-${index}`}
                >
                    <InjectTag className={`icon-dim-20 mt-4 ${tagData.propagate ? 'scn-0' : ''}`} />
                </div>
            )}
            <TagLabelValueSelector
                selectedTagIndex={index}
                tagData={tagData}
                setTagData={setTagData}
                tagInputType={KEY_VALUE.KEY}
                placeholder="Enter key"
                tabIndex={tabIndex - 1}
                refVar={keyRef}
                dependentRef={valueRef}
                tagOptions={suggestedTagsOptions}
            />
            <TagLabelValueSelector
                selectedTagIndex={index}
                tagData={tagData}
                setTagData={setTagData}
                tagInputType={KEY_VALUE.VALUE}
                placeholder="Enter value"
                tabIndex={tabIndex}
                refVar={valueRef}
                dependentRef={keyRef}
            />
            <div
                className="dc__border pl-4 pr-4 dc__right-radius-4 pointer flex top"
                onClick={deleteTag}
                data-testid={`delete-tag-${index}`}
            >
                <DeleteCross className="icon-dim-20 mt-4" />
            </div>
        </div>
    )
}
