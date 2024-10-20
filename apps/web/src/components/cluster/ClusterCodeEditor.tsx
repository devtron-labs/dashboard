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

import { useState, useRef } from 'react'
import YAML from 'yaml'
import { UPLOAD_STATE } from '@Pages/GlobalConfigurations/DeploymentCharts/types'
import { MODES } from '../../config/constants'
import { CodeEditor } from '@devtron-labs/devtron-fe-common-lib'

export default function ClusterCodeEditor() {
    const inputFileRef = useRef(null)
    const [saveYamlData, setSaveYamlData] = useState<string>('')
    const [uploadState, setUploadState] = useState<string>(UPLOAD_STATE.UPLOAD)

    const onChangeEditorValue = (val: string) => {
        setSaveYamlData(val)
    }

    const onFileChange = (e): void => {
        setUploadState(UPLOAD_STATE.UPLOADING)
        const file = e.target.files[0]
        const reader = new FileReader()
        reader.onload = () => {
            try {
                YAML.parseDocument(reader.result.toString())
                setSaveYamlData(reader.result.toString())
            } catch (e) {}
        }
        reader.readAsText(file)
        setUploadState(UPLOAD_STATE.SUCCESS)
    }

    const handleBrowseFileClick = (): void => {
        inputFileRef.current.click()
    }

    return (
        <div className="code-editor-container">
            <CodeEditor
                value={saveYamlData}
                height={514}
                diffView={false}
                onChange={onChangeEditorValue}
                mode={MODES.YAML}
            >
                <CodeEditor.Header>
                    <div className="user-list__subtitle flex p-8">
                        <span className="flex left">Paste the contents of kubeconfig file here</span>
                        <div className="dc__link ml-auto cursor">
                            {uploadState !== UPLOAD_STATE.UPLOADING && (
                                <div onClick={handleBrowseFileClick} className="flex">
                                    Browse file...
                                </div>
                            )}
                        </div>
                        <input
                            type="file"
                            ref={inputFileRef}
                            onChange={onFileChange}
                            accept=".yaml"
                            style={{ display: 'none' }}
                        />
                    </div>
                    <CodeEditor.ValidationError />
                </CodeEditor.Header>
            </CodeEditor>
        </div>
    )
}
