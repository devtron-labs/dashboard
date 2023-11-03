import React from 'react'
import { getTemplate, getUiOptions, ArrayFieldTemplateProps, ArrayFieldTemplateItemType } from '@rjsf/utils'

export const ArrayFieldTemplate = (props: ArrayFieldTemplateProps) => {
    const {
        canAdd,
        className,
        disabled,
        idSchema,
        uiSchema,
        items,
        onAddClick,
        readonly,
        registry,
        required,
        schema,
        title,
    } = props
    const uiOptions = getUiOptions(uiSchema)
    const ArrayFieldItemTemplate = getTemplate<'ArrayFieldItemTemplate'>('ArrayFieldItemTemplate', registry, uiOptions)
    const TitleFieldTemplate = getTemplate<'TitleFieldTemplate'>('TitleFieldTemplate', registry, uiOptions)
    const {
        ButtonTemplates: { AddButton },
    } = registry.templates
    return (
        <fieldset className={className} id={idSchema.$id}>
            <TitleFieldTemplate
                id={idSchema.$id}
                title={uiOptions.title || title}
                required={required}
                schema={schema}
                uiSchema={uiSchema}
                registry={registry}
            />
            {items?.map(({ key, ...itemProps }: ArrayFieldTemplateItemType) => (
                <ArrayFieldItemTemplate key={key} {...itemProps} />
            ))}
            {canAdd && (
                <AddButton
                    onClick={onAddClick}
                    disabled={disabled || readonly}
                    uiSchema={uiSchema}
                    registry={registry}
                />
            )}
        </fieldset>
    )
}
