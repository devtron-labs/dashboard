import React from 'react'
import RJSFForm from '@rjsf/core'
import validator from '@rjsf/validator-ajv8'

import { templates, widgets } from './config'
import { FormProps } from './types'
import { translateString } from './utils'
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
        translateString={translateString}
    />
)
