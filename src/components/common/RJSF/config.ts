import { RegistryWidgetsType } from '@rjsf/utils'

import { BaseInputTemplate, FieldTemplate, TitleFieldTemplate } from './templates'
import { CheckboxWidget, SelectWidget } from './widgets'

export const widgets: RegistryWidgetsType = {
    CheckboxWidget,
    SelectWidget,
}

export const templates = {
    BaseInputTemplate,
    FieldTemplate,
    TitleFieldTemplate,
}
