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
import { ADDITIONAL_PROPERTY_FLAG, WrapIfAdditionalTemplateProps } from '@rjsf/utils'

import { PLACEHOLDERS } from '../constants'

export const WrapIfAdditionalTemplate = ({
    id,
    disabled,
    label,
    onKeyChange,
    onDropPropertyClick,
    readonly,
    schema,
    children,
    uiSchema,
    registry,
}: WrapIfAdditionalTemplateProps) => {
    const { templates } = registry
    const { RemoveButton } = templates.ButtonTemplates
    const additional = ADDITIONAL_PROPERTY_FLAG in schema

    return (
        <>
            {additional ? (
                <div className="dc__position-rel rjsf-form-template__additional-fields display-grid dc__gap-8 flex-align-center">
                    <div>
                        <input
                            type="text"
                            className="form__input cn-9 fs-13 lh-20 fw-4"
                            id={`${id}-key`}
                            onBlur={(event) => onKeyChange(event.target.value)}
                            placeholder={PLACEHOLDERS.OBJECT_KEY}
                            defaultValue={label}
                        />
                    </div>
                    <div>{children}</div>
                    <div className="dc__position-abs remove-btn__container" style={{ right: '-28px', top: '9px' }}>
                        <RemoveButton
                            disabled={disabled || readonly}
                            onClick={onDropPropertyClick(label)}
                            uiSchema={uiSchema}
                            registry={registry}
                        />
                    </div>
                </div>
            ) : (
                children
            )}
        </>
    )
}
