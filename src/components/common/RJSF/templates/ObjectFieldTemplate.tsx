import React from 'react'
import {
    ObjectFieldTemplatePropertyType,
    ObjectFieldTemplateProps,
    canExpand,
    getTemplate,
    getUiOptions,
    titleId,
} from '@rjsf/utils'
import { FieldRowWithLabel } from '../common/FieldRow'

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
}: ObjectFieldTemplateProps) => {
    const {
        ButtonTemplates: { AddButton },
    } = registry.templates
    const hasAdditionalProperties = !!schema.additionalProperties

    const ActionButton = canExpand(schema, uiSchema, formData) && (
        <AddButton
            className="object-property-expand"
            onClick={onAddClick(schema)}
            disabled={disabled || readonly}
            uiSchema={uiSchema}
            registry={registry}
        />
    )

    const Properties = properties.map((prop: ObjectFieldTemplatePropertyType) => prop.content)

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
        } else {
            return (
                <FieldRowWithLabel label={title} required={required} showLabel id={idSchema.$id}>
                    {ActionButton}
                </FieldRowWithLabel>
            )
        }
    }
    return (
        <>
            {Properties}
            {ActionButton}
        </>
    )
}

export const ObjectFieldTemplate = (props: ObjectFieldTemplateProps) => {
    const { idSchema, registry, required, schema, title, uiSchema } = props
    const options = getUiOptions(uiSchema)
    const TitleFieldTemplate = getTemplate('TitleFieldTemplate', registry, options)
    const hasAdditionalProperties = !!schema.additionalProperties
    const showTitle = title && !hasAdditionalProperties

    return (
        <fieldset id={idSchema.$id}>
            {showTitle && (
                <TitleFieldTemplate
                    id={titleId(idSchema)}
                    title={title}
                    required={required}
                    schema={schema}
                    uiSchema={uiSchema}
                    registry={registry}
                />
            )}
            <Field {...props} />
        </fieldset>
    )
}
