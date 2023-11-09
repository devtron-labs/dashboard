import React, { ComponentProps } from 'react'
import RJSFForm from '@rjsf/core'
import validator from '@rjsf/validator-ajv8'

import { templates, widgets } from './config'
import './rjsfForm.scss'

export const Form = (props: Omit<ComponentProps<typeof RJSFForm>, 'validator'>) => (
    <RJSFForm
        noHtml5Validate
        showErrorList={false}
        {...props}
        validator={validator}
        templates={{
            ...templates,
            ...props.templates,
        }}
        widgets={{ ...widgets, ...props.widgets }}
    />
)
