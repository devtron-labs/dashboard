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
import { FieldTemplateProps, getUiOptions, getTemplate, ADDITIONAL_PROPERTY_FLAG } from '@rjsf/utils'
import { FieldRowWithLabel } from '../common/FieldRow'
import { TitleField } from './TitleField'

export const Field = (props: FieldTemplateProps) => {
    const {
        id,
        label,
        children,
        errors,
        hidden,
        required,
        displayLabel,
        registry,
        uiSchema,
        classNames,
        schema,
        rawDescription,
    } = props
    const uiOptions = getUiOptions(uiSchema)
    const WrapIfAdditionalTemplate = getTemplate<'WrapIfAdditionalTemplate'>(
        'WrapIfAdditionalTemplate',
        registry,
        uiOptions,
    )
    // Object type fields have additional properties for key/value pairs
    const hasAdditionalProperties = ADDITIONAL_PROPERTY_FLAG in schema
    // Label is not displayed for boolean fields by default and hide for object type fields
    const showLabel = (displayLabel || schema.type === 'boolean') && !hasAdditionalProperties
    const showTitle = schema.type === 'array'

    return hidden ? (
        <div className="hidden">{children}</div>
    ) : (
        // NOTE: need to override the margins of default rjsf css
        <div className={`${classNames} mb-0`}>
            {showTitle && (
                <TitleField
                    id={id}
                    title={label}
                    required={required}
                    registry={registry}
                    uiSchema={uiSchema}
                    schema={schema}
                    description={rawDescription}
                />
            )}
            <FieldRowWithLabel
                label={label}
                showLabel={showLabel}
                id={id}
                required={required}
                rawDescription={rawDescription}
            >
                <WrapIfAdditionalTemplate {...props}>{children}</WrapIfAdditionalTemplate>
            </FieldRowWithLabel>
            {errors}
        </div>
    )
}
