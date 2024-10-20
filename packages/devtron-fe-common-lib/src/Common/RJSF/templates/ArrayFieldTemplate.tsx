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
import { getTemplate, getUiOptions, ArrayFieldTemplateProps, ArrayFieldTemplateItemType } from '@rjsf/utils'
import { FieldRowWithLabel } from '../common/FieldRow'

const ActionButton = ({ label, canAdd, onAddClick, disabled, readonly, uiSchema, registry }) => {
    const {
        ButtonTemplates: { AddButton },
    } = registry.templates

    return (
        canAdd && (
            <AddButton
                label={label}
                onClick={onAddClick}
                disabled={disabled || readonly}
                uiSchema={uiSchema}
                registry={registry}
            />
        )
    )
}

export const ArrayFieldTemplate = ({
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
    title,
}: ArrayFieldTemplateProps) => {
    const uiOptions = getUiOptions(uiSchema)
    const ArrayFieldItemTemplate = getTemplate<'ArrayFieldItemTemplate'>('ArrayFieldItemTemplate', registry, uiOptions)
    const label = uiOptions.title || title

    return (
        <fieldset className={className} id={idSchema.$id}>
            {/* Show the label here in case there are no items, otherwise handled by Field Template */}
            {items.length ? (
                <>
                    {items.map(({ key, ...itemProps }: ArrayFieldTemplateItemType, index) => {
                        // Show the title as the label for the first field
                        const children = {
                            ...itemProps.children,
                            props: {
                                ...itemProps.children.props,
                            },
                        }
                        return (
                            <ArrayFieldItemTemplate key={key} {...itemProps}>
                                {children}
                            </ArrayFieldItemTemplate>
                        )
                    })}
                    <ActionButton
                        label={label}
                        canAdd={canAdd}
                        onAddClick={onAddClick}
                        disabled={disabled}
                        readonly={readonly}
                        uiSchema={uiSchema}
                        registry={registry}
                    />
                </>
            ) : (
                <FieldRowWithLabel label={label} required={required} showLabel id={idSchema.$id}>
                    <ActionButton
                        label={label}
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
