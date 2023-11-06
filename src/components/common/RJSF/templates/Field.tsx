import React from 'react'
import { FieldTemplateProps, getUiOptions, getTemplate } from '@rjsf/utils'
import { FieldRowWithLabel } from '../common/FieldRow'

export const Field = (props: FieldTemplateProps) => {
    const { id, label, children, errors, hidden, required, displayLabel, registry, uiSchema, classNames, schema } =
        props
    const uiOptions = getUiOptions(uiSchema)
    const WrapIfAdditionalTemplate = getTemplate<'WrapIfAdditionalTemplate'>(
        'WrapIfAdditionalTemplate',
        registry,
        uiOptions,
    )
    // Label is not displayed for boolean fields by default
    const showLabel = displayLabel || schema.type === 'boolean'

    return hidden ? (
        <div className="hidden">{children}</div>
    ) : (
        <div className={`${classNames} mb-12`}>
            <FieldRowWithLabel label={label} showLabel={showLabel} id={id} required={required}>
                <WrapIfAdditionalTemplate {...props}>{children}</WrapIfAdditionalTemplate>
            </FieldRowWithLabel>
            {/* TODO: Handle errors UI */}
            {errors}
        </div>
    )
}
