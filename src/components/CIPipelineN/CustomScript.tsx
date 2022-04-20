import React from 'react'
import { FormType, TaskFieldDescription, TaskFieldLabel } from '../ciPipeline/types'
import CodeEditor from '../CodeEditor/CodeEditor'
import TaskFieldTippyDescription from './TaskFieldTippyDescription'

interface CustomScriptType {
    formData: FormType
    handleScriptChange:React.Dispatch<React.SetStateAction<unknown>>
    activeStageName: string
    selectedTaskIndex: number
}

function CustomScript({ formData, handleScriptChange, activeStageName, selectedTaskIndex }: CustomScriptType) {
    return (
        <div className="row-container mb-10">
        <TaskFieldTippyDescription
            taskField={TaskFieldLabel.SCRIPT}
            contentDescription={TaskFieldDescription.SCRIPT}
        />
        <div className="script-container">
            <CodeEditor
                mode="shell"
                shebang="#!/bin/sh"
                onChange={(value) =>
                    handleScriptChange({ target: { value } })
                }
                inline
                height={300}
                value={formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.script}
            ></CodeEditor>
        </div>
    </div>
    )
}

export default CustomScript
