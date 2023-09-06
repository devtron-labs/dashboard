import { ConditionalWrap, TippyCustomized, TippyTheme } from '@devtron-labs/devtron-fe-common-lib'
import React from 'react'
import { ReadFileAs } from '../common/hooks/types'
import ScopedVariablesInput from '../scopedVariables/ScopedVariablesInput'

function ConfigMapSecretFileReaderPopup({ toggleFileReaderPopup, showFileReaderPopup, readFile }) {
    const handleReUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
        if (readFile) {
            readFile(e.target.files![0], ReadFileAs.TEXT)
        }
    }

    const renderFileContent = (): JSX.Element => {
        return (
                <div className="">
                    <ScopedVariablesInput handleFileUpload={handleReUpload}>
                        <div onChange={handleReUpload}>
                            <div>--from</div>
                            <div>Use file name as key and file content as value (supports multi-line data)</div>
                        </div>
                    </ScopedVariablesInput>

                    <div>
                        <div>--from-env-file</div>
                        <div>Create secret from an env-file. Uses file content as key:value</div>
                    </div>
                </div>
        )
    }

    return (
        <div>
            <TippyCustomized 
              hideHeading={true}
                noHeadingBorder={true}
                theme={TippyTheme.white}
                className="default-tt p-12"
                arrow={false}
                placement="bottom"
                trigger="click"
                additionalContent={renderFileContent()}
                interactive={true}
            >
            <div className="cb-5 ml-4 cursor" onClick={toggleFileReaderPopup}>
                Import from file...
            </div>
            </TippyCustomized>
        </div>
    )
}

export default ConfigMapSecretFileReaderPopup
