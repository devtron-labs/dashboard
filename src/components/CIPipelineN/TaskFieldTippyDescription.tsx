import React from 'react'
import Tippy from '@tippyjs/react'

interface TippyDescriptionType {
    taskField: string;
    contentDescription?: string
}

function TaskFieldTippyDescription({ taskField, contentDescription } : TippyDescriptionType ) {
    return (
        <div>
            <Tippy className="default-tt" arrow={false} content={contentDescription}>
                <label className="fw-6 fs-13 cn-7 label-width text-capitalize text-underline-dashed">{taskField}</label>
            </Tippy>
        </div>
    )
}

export default TaskFieldTippyDescription
