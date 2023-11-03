import { ComponentProps } from 'react'
import RJSFForm from '@rjsf/core'

export type FormProps = Omit<ComponentProps<typeof RJSFForm>, 'validator'>
