import React from 'react'
import { FieldRowProps } from './types'

export const FieldRowWithLabel = ({
    showLabel,
    label,
    required,
    children,
    id,
    shouldAlignCenter = true,
}: FieldRowProps) => (
    <div
        className={
            showLabel
                ? `display-grid dc__gap-12 rjsf-form-template__field ${shouldAlignCenter ? 'flex-align-center' : ''}`
                : ''
        }
    >
        {showLabel && (
            <label className="cn-7 fs-13 lh-32 fw-4 flexbox mb-0" htmlFor={id}>
                {!!label && (
                    <>
                        <span className="dc__ellipsis-right">{label}</span>
                        {required && <span className="cr-5">&nbsp;*</span>}
                    </>
                )}
            </label>
        )}
        {children}
    </div>
)
