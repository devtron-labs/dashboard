import React, { CSSProperties } from 'react'
import { ArrayFieldTemplateItemType } from '@rjsf/utils'

export const ArrayFieldItemTemplate = (props: ArrayFieldTemplateItemType) => {
    const {
        children,
        className,
        disabled,
        hasToolbar,
        hasRemove,
        index,
        onCopyIndexClick,
        onDropIndexClick,
        readonly,
        registry,
        uiSchema,
    } = props
    const { RemoveButton } = registry.templates.ButtonTemplates

    return (
        <div className="display-grid rjsf-form-template__array-field-item flex-align-center dc__gap-8 mb-12">
            {children}
            {hasToolbar && hasRemove && (
                <div>
                    <RemoveButton
                        disabled={disabled || readonly}
                        onClick={onDropIndexClick(index)}
                        uiSchema={uiSchema}
                        registry={registry}
                    />
                </div>
            )}
        </div>
    )
}
