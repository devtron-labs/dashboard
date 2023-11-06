import React from 'react'
import { getTemplate, getUiOptions, ArrayFieldTemplateProps, ArrayFieldTemplateItemType } from '@rjsf/utils'
import { FieldRowWithLabel } from '../common/FieldRow'

const ActionButton = ({ canAdd, onAddClick, disabled, readonly, uiSchema, registry }) => {
    const {
        ButtonTemplates: { AddButton },
    } = registry.templates

    return (
        canAdd && (
            <AddButton onClick={onAddClick} disabled={disabled || readonly} uiSchema={uiSchema} registry={registry} />
        )
    )
}

export const ArrayFieldTemplate = (props: ArrayFieldTemplateProps) => {
    const { canAdd, className, disabled, idSchema, uiSchema, items, onAddClick, readonly, registry, required, title } =
        props
    const uiOptions = getUiOptions(uiSchema)
    const ArrayFieldItemTemplate = getTemplate<'ArrayFieldItemTemplate'>('ArrayFieldItemTemplate', registry, uiOptions)

    return (
        <fieldset className={className} id={idSchema.$id}>
            {/* Show the label here in case there are no items, otherwise handled by Field Template */}
            {items.length ? (
                <>
                    {items?.map(({ key, ...itemProps }: ArrayFieldTemplateItemType) => (
                        <ArrayFieldItemTemplate key={key} {...itemProps} />
                    ))}
                    <ActionButton
                        canAdd={canAdd}
                        onAddClick={onAddClick}
                        disabled={disabled}
                        readonly={readonly}
                        uiSchema={uiSchema}
                        registry={registry}
                    />
                </>
            ) : (
                <FieldRowWithLabel label={title} required={required} showLabel id={idSchema.$id}>
                    <ActionButton
                        canAdd={canAdd}
                        onAddClick={onAddClick}
                        disabled={disabled}
                        readonly={readonly}
                        uiSchema={uiSchema}
                        registry={registry}
                    />
                </FieldRowWithLabel>
            )}
        </fieldset>
    )
}
