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

import RJSF from '@rjsf/core'
import RJSFValidator from '@rjsf/validator-ajv8'

import { templates, widgets } from './config'
import { FormProps } from './types'
import { translateString } from './utils'
import './rjsfForm.scss'

// Need to use this way because the default import was not working as expected
// The default import resolves to an object intead of a function
const Form = RJSF
const validator = RJSFValidator

export const RJSFForm = (props: FormProps) => (
    <Form
        noHtml5Validate
        showErrorList={false}
        autoComplete="off"
        {...props}
        className={`rjsf-form-template__container ${props.className || ''}`}
        validator={validator}
        templates={{
            ...templates,
            ...props.templates,
        }}
        formContext={props.formData}
        widgets={{ ...widgets, ...props.widgets }}
        translateString={translateString}
    />
)
