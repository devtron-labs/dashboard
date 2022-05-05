import React, { useContext } from 'react'
import { FormErrorObjectType, FormType, ScriptType, TaskFieldDescription, TaskFieldLabel } from '../ciPipeline/types'
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
    let shebangHtml = formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.scriptType === ScriptType.SHELL ? <div style={{ resize: 'none', lineHeight: '1.4', border: 'none', overflow: 'none', color: '#f32e2e', fontSize: '14px', fontFamily: 'Consolas, "Courier New", monospace' }} >
            <p className="m-0" contentEditable="true"> #!/bin/sh</p>
            <p className="m-0" contentEditable="true"> set -eo pipefail</p>
            <p className="m-0" contentEditable="true"> #set -v</p>
            <p className="m-0" contentEditable="true">## uncomment this to debug the script</p>
        </div> : null;
    let codeEditorBody = (formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.scriptType === ScriptType.SHELL) ? formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.script : formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.script;
    
    return (
        <div className="mb-12">
            <div className="row-container">
                <TaskFieldTippyDescription
                    taskField={TaskFieldLabel.SCRIPT}
                    contentDescription={TaskFieldDescription.SCRIPT}
                />
                <div className="script-container">
                        <CodeEditor
                        theme="vs-alice-blue"
                        mode="shell"
                        shebang={shebangHtml}
                        onChange={(value) => handleScriptChange({ target: { value } })}
                        inline
                        height={300}
                        value={codeEditorBody}
                    ></CodeEditor> 
                </div>
            </div>

            <div className="pl-220">
                {formDataErrorObj[activeStageName].steps[selectedTaskIndex].inlineStepDetail?.script &&
                    !formDataErrorObj[activeStageName].steps[selectedTaskIndex].inlineStepDetail?.script.isValid && (
                        <span className="flexbox cr-5 mt-4 fw-5 fs-11 flexbox">
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
