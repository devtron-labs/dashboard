import React, { ComponentProps } from 'react'
import RJSFForm from '@rjsf/core'
import validator from '@rjsf/validator-ajv8'

import { fields, templates, widgets } from './config'
import { FormProps } from './types'
import './rjsfForm.scss'

export const Form = (props: FormProps) => (
    <RJSFForm
        noHtml5Validate
        showErrorList={false}
        autoComplete="off"
        {...props}
        validator={validator}
        templates={{
            ...templates,
            ...props.templates,
        }}
        widgets={{ ...widgets, ...props.widgets }}
        fields={{ ...fields, ...props.fields }}
    />
)
