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
                <label className="fw-6 fs-13 cn-7 label-width text-capitalize text-underline-dashed">{taskField}{taskField === TaskFieldLabel.SCRIPT || taskField === TaskFieldLabel.STORESCRIPTAT || taskField === TaskFieldLabel.CONTAINERIMAGEPATH ? <span className='cr-5'>*</span> : '' }</label>
            </Tippy>
        </div>
    )
}

export default TaskFieldTippyDescription
