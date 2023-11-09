import React, { ChangeEvent } from 'react'
import { Toggle } from '@devtron-labs/devtron-fe-common-lib'
import { WidgetProps } from '@rjsf/utils'

export const Checkbox = ({
    id,
    onChange,
    value,
    required,
    disabled,
    readonly,
    autofocus,
    onBlur,
    onFocus,
}: WidgetProps) => {
    const handleEvent = (e: ChangeEvent<HTMLInputElement>, type: 'blur' | 'focus') => {
        const { id, checked } = e.target
        if (type === 'blur') {
            onBlur(id, checked)
        } else if (type === 'focus') {
            onFocus(id, checked)
        }
    }

    const isSelected: boolean = typeof value === 'undefined' ? false : value

    return (
        <div>
            <Toggle
                selected={isSelected}
                onSelect={onChange}
                id={id}
                name={id}
                required={required}
                disabled={disabled || readonly}
                autoFocus={autofocus}
                rootClassName="w-32 mb-0 dc__height-inherit"
                onBlur={(e) => handleEvent(e, 'blur')}
                onFocus={(e) => handleEvent(e, 'focus')}
            />
            <span className="dc__capitalize ml-8">{isSelected.toString()}</span>
        </div>
    )
}
