import React from 'react'
import { RegistryWidgetsType } from '@rjsf/utils'

import {
    AddButton,
    ArrayFieldItemTemplate,
    ArrayFieldTemplate,
    BaseInputTemplate,
    DescriptionFieldTemplate,
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
    DescriptionFieldTemplate,
    FieldTemplate,
    FieldErrorTemplate,
    ObjectFieldTemplate,
    TitleFieldTemplate,
    WrapIfAdditionalTemplate,
}
