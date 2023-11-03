import React from 'react'
import { getDefaultRegistry } from '@rjsf/core'
import { BaseInputTemplateProps } from '@rjsf/utils'
import { PLACEHOLDERS } from '../constants'

const {
    templates: { BaseInputTemplate },
} = getDefaultRegistry()

export const BaseInput = ({ placeholder = PLACEHOLDERS.INPUT, ...props }: BaseInputTemplateProps) => (
    <BaseInputTemplate {...props} className="form__input cn-9 fs-13 lh-20 fw-4" />
)
