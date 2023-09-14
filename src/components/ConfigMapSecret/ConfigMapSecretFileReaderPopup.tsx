import { TippyCustomized, TippyTheme } from '@devtron-labs/devtron-fe-common-lib'
import React from 'react'
import { ReadFileAs } from '../common/hooks/types'
import { configMapsSecretImportFileValidator, importConfigSecretImportFileMessaging } from './Constants'
import { HiddenInput } from '../common'

function ConfigMapSecretFileReaderPopup({readFile }) {

    const onClickFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isFileNameAsKey ) => {
        e.preventDefault()
        if (readFile) {
            readFile(e.target.files![0], configMapsSecretImportFileValidator, ReadFileAs.TEXT, isFileNameAsKey)
        }
    }

    const renderFileContent = () => {
      return  importConfigSecretImportFileMessaging.map((item, index) => {
            return (
                <div className="" key={item.title}>
                    <HiddenInput handleFileUpload={(e) => onClickFileUpload(e, item.isFileNameAsKey)} id={item.title}>
                        <div className="p-8 fw-4">
                            <div>{item.title}</div>
                            <div>{item.description}</div>
                        </div>
                    </HiddenInput>
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
                <div className="cb-5 ml-8 fw-6 cursor">
                    Import from file...
                </div>
            </TippyCustomized>
        </div>
    )
}

export default ConfigMapSecretFileReaderPopup
