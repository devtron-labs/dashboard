import { useRef, useState } from 'react'

import { CodeEditor, MODES } from '@devtron-labs/devtron-fe-common-lib'

import { UPLOAD_STATE } from '@Pages/GlobalConfigurations/DeploymentCharts/types'

import { KubeConfigEditorProps } from './types'

const KubeConfigEditor = ({ saveYamlData, setSaveYamlData, errorText }: KubeConfigEditorProps) => {
    const inputFileRef = useRef<HTMLInputElement>(null)

    const [uploadState, setUploadState] = useState<string>(UPLOAD_STATE.UPLOAD)

    const onFileChange = (e): void => {
        setUploadState(UPLOAD_STATE.UPLOADING)
        const file = e.target.files[0]
        const reader = new FileReader()
        reader.onload = () => {
            try {
                setSaveYamlData(reader.result.toString())
            } catch {
                // do nothing
            }
        }
        reader.readAsText(file)
        setUploadState(UPLOAD_STATE.SUCCESS)
    }

    const handleBrowseFileClick = (): void => {
        inputFileRef.current.click()
    }

    const onChangeEditorValue = (val: string) => {
        setSaveYamlData(val)
    }

    return (
        <div className="flexbox-col flex-grow-1 dc__overflow-hidden">
            <CodeEditor
                diffView={false}
                mode={MODES.YAML}
                value={saveYamlData}
                onChange={onChangeEditorValue}
                height="fitToParent"
            >
                <CodeEditor.Header>
                    <div className="user-list__subtitle flex fs-13 lh-20 w-100">
                        <span className="flex left">Paste the contents of kubeconfig file here</span>
                        <div className="dc__link ml-auto cursor">
                            {uploadState !== UPLOAD_STATE.UPLOADING && (
                                <div
                                    data-testid="browse_file_to_upload"
                                    onClick={handleBrowseFileClick}
                                    className="flex fw-6"
                                >
                                    Browse file...
                                </div>
                            )}
                        </div>
                        <input
                            type="file"
                            ref={inputFileRef}
                            onChange={onFileChange}
                            // NOTE: by default the .kube/config file does not have .yml/.yaml extension
                            // therefore won't be selectable under these formats, although it is yaml file
                            accept="text/plain, text/x-yaml, application/x-yaml, text/yaml, application/yaml"
                            style={{ display: 'none' }}
                            data-testid="select_code_editor"
                        />
                    </div>
                </CodeEditor.Header>
                {errorText && <CodeEditor.ErrorBar text={errorText} />}
            </CodeEditor>
        </div>
    )
}

export default KubeConfigEditor
