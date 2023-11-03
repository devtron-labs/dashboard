import React from 'react'
import { ADDITIONAL_PROPERTY_FLAG, WrapIfAdditionalTemplateProps } from '@rjsf/utils'

import { PLACEHOLDERS } from '../constants'

export const WrapIfAdditionalTemplate = (props: WrapIfAdditionalTemplateProps) => {
    const { id, disabled, label, onKeyChange, onDropPropertyClick, readonly, schema, children, uiSchema, registry } =
        props
    const { templates } = registry
    const { RemoveButton } = templates.ButtonTemplates
    const additional = ADDITIONAL_PROPERTY_FLAG in schema

    return (
        <>
            {additional ? (
                <div className="rjsf-form-template__additional-fields display-grid dc__gap-8 flex-align-center">
                    <div>
                        <input
                            type="text"
                            className="form__input cn-9 fs-13 lh-20 fw-4"
                            id={`${id}-key`}
                            onBlur={(event) => onKeyChange(event.target.value)}
                            placeholder={PLACEHOLDERS.OBJECT_KEY}
                            defaultValue={label}
                        />
                    </div>
                    <div>{children}</div>
                    <div>
                        <RemoveButton
                            disabled={disabled || readonly}
                            onClick={onDropPropertyClick(label)}
                            uiSchema={uiSchema}
                            registry={registry}
                        />
                    </div>
                </div>
            ) : (
                children
            )}
        </>
    )
}
