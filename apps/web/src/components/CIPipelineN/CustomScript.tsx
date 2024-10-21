/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useContext, useEffect, useState } from 'react'
import { ScriptType, CodeEditor } from '@devtron-labs/devtron-fe-common-lib'
import { TaskFieldDescription, TaskFieldLabel } from '../ciPipeline/types'
import TaskFieldTippyDescription from './TaskFieldTippyDescription'
import { ReactComponent as AlertTriangle } from '../../assets/icons/ic-alert-triangle.svg'
import { pipelineContext } from '../workflowEditor/workflowEditor'

interface CustomScriptType {
    handleScriptChange: React.Dispatch<React.SetStateAction<unknown>>
}

const CustomScript = ({ handleScriptChange }: CustomScriptType) => {
    const { selectedTaskIndex, formData, activeStageName, formDataErrorObj } = useContext(pipelineContext)

    const [editorValue, setEditorValue] = useState<string>(
        formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.script,
    )
    useEffect(() => {
        setEditorValue(formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.script)
    }, [formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.script])
    return (
        <div className="mb-12">
            <div>
                {formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.scriptType ===
                    ScriptType.SHELL && (
                    <TaskFieldTippyDescription
                        taskField={TaskFieldLabel.SCRIPT}
                        contentDescription={TaskFieldDescription.SCRIPT}
                    />
                )}
                <div className="script-container no-padding-script-container">
                    <CodeEditor
                        theme="vs-alice-blue"
                        mode="shell"
                        noParsing
                        onChange={(value) => handleScriptChange({ target: { value } })}
                        inline
                        height={300}
                        value={editorValue}
                    />
                </div>
            </div>

            {formDataErrorObj[activeStageName].steps[selectedTaskIndex].inlineStepDetail?.script &&
                !formDataErrorObj[activeStageName].steps[selectedTaskIndex].inlineStepDetail.script.isValid && (
                    <span className="flexbox cr-5 mt-4 fw-5 fs-11 flexbox">
                        <AlertTriangle className="icon-dim-14 mr-5 ml-5 mt-2" />
                        <span>
                            {formDataErrorObj[activeStageName].steps[selectedTaskIndex].inlineStepDetail.script.message}
                        </span>
                    </span>
                )}
        </div>
    )
}

export default CustomScript
