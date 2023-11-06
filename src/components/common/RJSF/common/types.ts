import { FieldTemplateProps } from '@rjsf/utils'

export interface FieldRowProps extends Pick<FieldTemplateProps, 'children' | 'label' | 'required' | 'id'> {
    showLabel: boolean
}
