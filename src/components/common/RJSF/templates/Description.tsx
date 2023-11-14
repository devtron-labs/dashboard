import React from 'react'
import { DescriptionFieldProps } from '@rjsf/utils'

import { ReactComponent as Info } from '../../../../assets/icons/info-filled.svg'

export const Description = ({ id, description }: DescriptionFieldProps) =>
    description && (
        <div id={id} className="flex left flex-align-center mt-4 dc__gap-4">
            <Info className="icon-dim-16 mw-16 info-icon-n5" />
            <span className="cn-7 fs-11 fw-4 dc__ellipsis-right">{description}</span>
        </div>
    )
