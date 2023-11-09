import React from 'react'
import { FieldTemplateProps, getUiOptions, getTemplate, ADDITIONAL_PROPERTY_FLAG } from '@rjsf/utils'
import { FieldRowWithLabel } from '../common/FieldRow'

export const Field = (props: FieldTemplateProps) => {
    const { id, label, children, errors, hidden, required, displayLabel, registry, uiSchema, classNames, schema, description } =
        props
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

    return hidden ? (
        <div className="hidden">{children}</div>
    ) : (
        <div className={`${classNames} mb-12`}>
            <FieldRowWithLabel label={label} showLabel={showLabel} id={id} required={required}>
                <WrapIfAdditionalTemplate {...props}>{children}</WrapIfAdditionalTemplate>
            </FieldRowWithLabel>
            {description}
            {errors}
        </div>
    )
}
