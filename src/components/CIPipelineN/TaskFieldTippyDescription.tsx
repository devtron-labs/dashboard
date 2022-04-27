import React from 'react'
import Tippy from '@tippyjs/react'
import { TaskFieldLabel } from '../ciPipeline/types'

interface TippyDescriptionType {
    taskField: string;
    contentDescription?: string
}

function TaskFieldTippyDescription({ taskField, contentDescription } : TippyDescriptionType ) {
    return (
        <div>
            <Tippy className="default-tt" arrow={false} content={<span style={{ display: "block", width: "220px" }}>{contentDescription}</span>}>
                <div className="fw-6 fs-13 lh-32 cn-7 text-underline-dashed text-capitalize">{taskField}{taskField === TaskFieldLabel.SCRIPT || taskField === TaskFieldLabel.STORESCRIPTAT || taskField === TaskFieldLabel.CONTAINERIMAGEPATH ? <span className='cr-5'> *</span> : '' }</div>
            </Tippy>
        </div>
    )
}

export default TaskFieldTippyDescription
