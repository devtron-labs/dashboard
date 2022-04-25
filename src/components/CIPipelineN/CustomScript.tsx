import React, { useContext } from 'react'
import { FormErrorObjectType, FormType, TaskFieldDescription, TaskFieldLabel } from '../ciPipeline/types'
import CodeEditor from '../CodeEditor/CodeEditor'
import TaskFieldTippyDescription from './TaskFieldTippyDescription'
import { ReactComponent as AlertTriangle } from '../../assets/icons/ic-alert-triangle.svg'
import { ciPipelineContext } from './CIPipeline'

interface CustomScriptType {
    handleScriptChange: React.Dispatch<React.SetStateAction<unknown>>
}

function CustomScript({ handleScriptChange }: CustomScriptType) {
    const {
        selectedTaskIndex,
        formData,
        activeStageName,
        formDataErrorObj,
    }: {
        selectedTaskIndex: number
        formData: FormType
        activeStageName: string
        formDataErrorObj: FormErrorObjectType
    } = useContext(ciPipelineContext)
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
                    onChange={(value) => handleScriptChange({ target: { value } })}
                    inline
                    height={300}
                    value={formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.script}
                ></CodeEditor>

                {formDataErrorObj[activeStageName].steps[selectedTaskIndex].inlineStepDetail?.script &&
                    !formDataErrorObj[activeStageName].steps[selectedTaskIndex].inlineStepDetail?.script.isValid && (
                        <span className="flexbox cr-5 mb-4 mt-4 fw-5 fs-11 flexbox">
                            <AlertTriangle className="icon-dim-14 mr-5 ml-5 mt-2" />
                            <span>
                                {
                                    formDataErrorObj[activeStageName].steps[selectedTaskIndex].inlineStepDetail?.script
                                        .message
                                }
                            </span>
                        </span>
                    )}
            </div>
        </div>
    )
}

export default CustomScript
