import React from 'react'
import { FieldProps, RegistryWidgetsType } from '@rjsf/utils'

import { ArrayField } from './fields'
import {
    AddButton,
    ArrayFieldItemTemplate,
    ArrayFieldTemplate,
    BaseInputTemplate,
    FieldTemplate,
    RemoveButton,
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
    ButtonTemplates: { AddButton, RemoveButton },
    FieldTemplate,
    TitleFieldTemplate,
    WrapIfAdditionalTemplate,
}

export const fields: FormProps['fields'] = { ArrayField: ArrayField as unknown as React.ComponentType<FieldProps> }
