import React from 'react'
import Tippy from '@tippyjs/react';

export const envDescriptionTippy = (environmentName: string, description: string) => {
    return (
        <Tippy
            className="default-tt w-200"
            arrow={true}
            placement="bottom"
            content={
                <div className="w-100">
                    <div className="fw-6">{environmentName}</div>
                    {description && <div className="dc__word-break-all lh-16 mt-4">{description}</div>}
                </div>
            }
        >
            <span className="dc__ellipsis-right">{environmentName}</span>
        </Tippy>
    )
}
