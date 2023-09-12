import { TippyCustomized, TippyTheme } from '@devtron-labs/devtron-fe-common-lib'
import React from 'react'
import { ReadFileAs } from '../common/hooks/types'
import ScopedVariablesInput from '../scopedVariables/ScopedVariablesInput'
import { validator } from '../scopedVariables/utils'
import { importConfigSecretImportFileMessaging } from './Constants'

function ConfigMapSecretFileReaderPopup({ toggleFileReaderPopup, showFileReaderPopup, readFile }) {

    const onClickFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isFileNameAsKey ) => {
        e.preventDefault()
        if (readFile) {
            readFile(e.target.files![0], validator, ReadFileAs.TEXT, isFileNameAsKey)
        }
    }

    const renderFileContent = () => {
      return  importConfigSecretImportFileMessaging.map((item, index) => {
            return (
                <div className="" key={`${item.title}-${index}`}>
                    <ScopedVariablesInput handleFileUpload={(e) => onClickFileUpload(e, item.isFileNameAsKey)}>
                        <div className="p-8">
                            <div>{item.title}</div>
                            <div>{item.description}</div>
                        </div>
                    </ScopedVariablesInput>
                </div>
            )
        })
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
