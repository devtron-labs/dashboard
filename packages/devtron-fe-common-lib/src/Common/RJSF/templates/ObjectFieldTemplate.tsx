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

import { ObjectFieldTemplateProps, canExpand, titleId, deepEquals } from '@rjsf/utils'
import { JSONPath } from 'jsonpath-plus'
import { convertJSONPointerToJSONPath } from '@Common/Helper'
import { FieldRowWithLabel } from '../common/FieldRow'
import { TitleField } from './TitleField'
import { AddButton } from './ButtonTemplates'
import { RJSFFormSchema } from '../types'
import { parseSchemaHiddenType } from '../utils'

const Field = ({
    disabled,
    formData,
    idSchema,
    onAddClick,
    properties,
    readonly,
    registry,
    required,
    schema,
    title,
    uiSchema,
    formContext,
}: ObjectFieldTemplateProps<any, RJSFFormSchema, any>) => {
    const hasAdditionalProperties = !!schema.additionalProperties

    const ActionButton = canExpand(schema, uiSchema, formData) && (
        <AddButton
            label={title}
            className="object-property-expand"
            onClick={onAddClick(schema)}
            disabled={disabled || readonly}
            uiSchema={uiSchema}
            registry={registry}
        />
    )

    const Properties = properties
        .filter((prop) => {
            const hiddenSchemaProp = schema.properties?.[prop.name]?.hidden
            if (!hiddenSchemaProp) {
                return true
            }
            try {
                const hiddenSchema = parseSchemaHiddenType(hiddenSchemaProp)
                if (!hiddenSchema.path) {
                    throw new Error('Empty path property of hidden descriptor field')
                }
                if (!hiddenSchema.path.match(/^\/\w+(\/\w+)*$/g)) {
                    throw new Error('Provided path is not a valid JSON pointer')
                }
                // NOTE: formContext is the formData passed to RJSFForm
                const value = JSONPath({
                    path: convertJSONPointerToJSONPath(hiddenSchema.path),
                    json: formContext,
                })?.[0]
                const isHidden = value === undefined || deepEquals(hiddenSchema.value, value)
                return !isHidden
            } catch {
                return true
            }
        })
        // NOTE: we probably should use uiSchema instead?
        .sort((prop) => (schema.properties?.[prop.name]?.type === 'boolean' ? -1 : 1))
        .map((prop) => prop.content)

    if (hasAdditionalProperties) {
        if (properties.length) {
            return (
                <>
                    <FieldRowWithLabel
                        label={title}
                        required={required}
                        showLabel
                        id={idSchema.$id}
                        shouldAlignCenter={false}
                    >
                        <div>{Properties}</div>
                    </FieldRowWithLabel>
                    {ActionButton}
                </>
            )
        }
        return (
            <FieldRowWithLabel label={title} required={required} showLabel id={idSchema.$id}>
                {ActionButton}
            </FieldRowWithLabel>
        )
    }
    return (
        <>
            {Properties}
            {ActionButton}
        </>
    )
}

export const ObjectFieldTemplate = (props: ObjectFieldTemplateProps<any, RJSFFormSchema, any>) => {
    const { idSchema, registry, required, schema, title, uiSchema, description } = props
    const hasAdditionalProperties = !!schema.additionalProperties
    const showTitle = title && !hasAdditionalProperties

    return (
        <fieldset id={idSchema.$id}>
            {showTitle && (
                <TitleField
                    id={titleId(idSchema as Parameters<typeof titleId>[0])}
                    title={title}
                    required={required}
                    schema={schema}
                    uiSchema={uiSchema}
                    registry={registry}
                    description={description}
                />
            )}
            {/* Not adding the border and padding for non-objects and root schema */}
            <div
                className={`${
                    schema.properties && !hasAdditionalProperties && idSchema.$id !== 'root'
                        ? 'dc__border-left pl-12'
                        : ''
                } flexbox-col dc__gap-8`}
            >
                <Field {...props} />
            </div>
        </fieldset>
    )
}
