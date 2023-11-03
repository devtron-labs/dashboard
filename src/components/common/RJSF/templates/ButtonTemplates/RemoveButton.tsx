import React from 'react'
import { IconButtonProps } from '@rjsf/utils'

import { ReactComponent as CrossIcon } from '../../../../../assets/icons/ic-cross.svg'

export const RemoveButton = ({ icon, iconType, registry, uiSchema, ...props }: IconButtonProps) => (
    <button {...props} type="button" className="dc__outline-none-imp p-0 dc__transparent flex" title="Remove">
        <CrossIcon className="icon-dim-16 fcr-5" />
    </button>
)
