import React from 'react'
import { FieldTemplateProps, getUiOptions, getTemplate } from '@rjsf/utils'

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
        <WrapIfAdditionalTemplate {...props} classNames={`${classNames} mb-12`}>
            <div className={showLabel ? 'display-grid dc__gap-12 flex-align-center rjsf-form-template__field' : ''}>
                {showLabel && (
                    <label className="cn-7 fs-13 lh-32 fw-4 flexbox mb-0" htmlFor={id}>
                        <span className="dc__ellipsis-right">{label}</span>
                        {required && <span className="cr-5">&nbsp;*</span>}
                    </label>
                )}
                {children}
            </div>
            {/* TODO: Handle errors UI */}
            {errors}
        </WrapIfAdditionalTemplate>
    )
}
