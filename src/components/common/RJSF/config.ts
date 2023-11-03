import { RegistryWidgetsType } from '@rjsf/utils'

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
