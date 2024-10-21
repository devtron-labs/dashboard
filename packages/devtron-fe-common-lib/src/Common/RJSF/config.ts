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
import { RegistryWidgetsType } from '@rjsf/utils'

import {
    AddButton,
    ArrayFieldItemTemplate,
    ArrayFieldTemplate,
    BaseInputTemplate,
    FieldTemplate,
    FieldErrorTemplate,
    ObjectFieldTemplate,
    RemoveButton,
    SubmitButton,
    TitleFieldTemplate,
    WrapIfAdditionalTemplate,
} from './templates'
import { CheckboxWidget, SelectWidget } from './widgets'
import { FormProps } from './types'

export const widgets: RegistryWidgetsType = {
    CheckboxWidget,
    SelectWidget,
}

export const templates: FormProps['templates'] = {
    ArrayFieldItemTemplate,
    ArrayFieldTemplate,
    BaseInputTemplate,
    ButtonTemplates: { AddButton, RemoveButton, SubmitButton },
    FieldTemplate,
    FieldErrorTemplate,
    ObjectFieldTemplate,
    TitleFieldTemplate,
    WrapIfAdditionalTemplate,
}
