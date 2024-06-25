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
import ReactSelect from 'react-select'
import { CustomInput, multiSelectStyles } from '@devtron-labs/devtron-fe-common-lib'
import { Option } from '../v2/common/ReactSelect.utils'
import { ReactComponent as CloseIcon } from '../../assets/icons/ic-close.svg'

export const WebhookSelectorCondition = ({
    conditionIndex,
    masterSelectorList,
    selectorCondition,
    onSelectorChange,
    onSelectorValueChange,
    deleteWebhookCondition,
    canEditSelectorCondition,
}) => {
    return (
        <div className="ci-webhook-condition mb-16 flex left">
            <ReactSelect
                className="w-200 bcn-1"
                components={{
                    IndicatorSeparator: null,
                    ClearIndicator: null,
                    Option,
                }}
                classNamePrefix={`build-webhook-select-key-dropdown-${conditionIndex}`}
                isSearchable
                tabIndex={1}
                placeholder="Select Key"
                styles={{
                    ...multiSelectStyles,
                    menuList: (base) => {
                        return {
                            ...base,
                            position: 'relative',
                            paddingBottom: '0px',
                            maxHeight: '176px',
                        }
                    },
                }}
                options={masterSelectorList}
                value={masterSelectorList.filter((_selector) => _selector.value == selectorCondition.selectorId)}
                onChange={(selectedSelector) => onSelectorChange(conditionIndex, selectedSelector.value)}
                isDisabled={!canEditSelectorCondition}
            />
            <CustomInput
                name="selector-value"
                data-testid={`build-webhook-select-key-input-${conditionIndex}`}
                placeholder="Enter regex"
                disabled={!canEditSelectorCondition}
                onChange={(event) => {
                    onSelectorValueChange(conditionIndex, event.target.value)
                }}
                value={selectorCondition.value}
            />
            {canEditSelectorCondition && (
                <CloseIcon className="pointer icon-dim-20" onClick={(e) => deleteWebhookCondition(conditionIndex)} />
            )}
        </div>
    )
}
