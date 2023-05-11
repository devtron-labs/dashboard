import React, { useState, useRef } from 'react'
import CodeEditor from '../CodeEditor/CodeEditor'
import { UPLOAD_STATE } from '../CustomChart/types'
import YAML from 'yaml'
import { MODES } from '../../config/constants'

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
                const data = YAML.parseDocument(reader.result.toString())
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
        <>
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
        </>
    )
}
