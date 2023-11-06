import React from 'react'
import { IconButtonProps } from '@rjsf/utils'

import { ReactComponent as PlusIcon } from '../../../../../assets/icons/ic-add.svg'

export const AddButton = ({ icon, iconType, registry, uiSchema, ...props }: IconButtonProps) => (
    <div className="flexbox flex-justify-end">
        <button
            {...props}
            type="button"
            className="dc__outline-none-imp p-0 dc__transparent flex dc__gap-4 cursor"
            title="Add"
        >
            <PlusIcon className="icon-dim-16 fcb-5" />
            <span className="cb-5 fs-13 lh-20">Add</span>
        </button>
    </div>
)
