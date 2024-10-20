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

import { ArrayFieldTemplateItemType } from '@rjsf/utils'

export const ArrayFieldItemTemplate = ({
    children,
    disabled,
    hasToolbar,
    hasRemove,
    index,
    onDropIndexClick,
    readonly,
    registry,
    uiSchema,
}: ArrayFieldTemplateItemType) => {
    const { RemoveButton } = registry.templates.ButtonTemplates

    return (
        <div className="dc__position-rel display-grid rjsf-form-template__array-field-item flex-align-center">
            {children}
            <div className="dc__position-abs remove-btn__container" style={{ right: '-28px', top: '9px' }}>
                {hasToolbar && hasRemove && (
                    <RemoveButton
                        disabled={disabled || readonly}
                        onClick={onDropIndexClick(index)}
                        uiSchema={uiSchema}
                        registry={registry}
                    />
                )}
            </div>
        </div>
    )
}
