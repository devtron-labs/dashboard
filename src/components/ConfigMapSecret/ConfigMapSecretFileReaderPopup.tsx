import { stopPropagation } from '@devtron-labs/devtron-fe-common-lib'
import React, { useEffect } from 'react'
import { FileReaderStatus, ReadFileAs } from '../common/hooks/types'
import { configMapsSecretImportFileValidator, importConfigSecretImportFileMessaging } from './Constants'
import { HiddenInput, useFileReader } from '../common'
import { ConfigMapActionTypes, ConfigMapSecretFileReaderPopupType } from './Types'
import YAML from 'yaml'

function ConfigMapSecretFileReaderPopup({
    toggleFileReaderPopup,
    hideFileReaderPopup,
    showFileReaderPopup,
    isDisabledClick,
    dispatch,
    state,
}: ConfigMapSecretFileReaderPopupType) {

    const { status, readFile } = useFileReader()
    useEffect(() => {
        if (status?.message?.data && status?.status === FileReaderStatus.SUCCESS) {
            const _currentData = []
        let obj = YAML.parse(status?.message?.data)
       _currentData.push( {
            k: Object.keys(obj),
            v: Object.values(obj),
            keyError: '',
            valueError: '',
        })
            dispatch({ type: ConfigMapActionTypes.updateCurrentData, payload:  _currentData})
        }
    },[status?.message?.data])

    const onClickFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isFileNameAsKey) => {
        if (readFile) {
            readFile(e.target.files![0], configMapsSecretImportFileValidator, ReadFileAs.TEXT, isFileNameAsKey)
        }
        hideFileReaderPopup()
    }

    const renderFileContent = () => {
        return (
            <div className="dc__transparent-div" onClick={hideFileReaderPopup}>
                <div
                    className="w-250 en-2 bw-1 bcn-0 dc__position-abs config-map-pop-up pt-4 pb-4"
                    onClick={stopPropagation}
                >
                    {importConfigSecretImportFileMessaging.map((item, index) => {
                        return (
                            <div key={item.title}>
                                <HiddenInput
                                    handleFileUpload={(e) => onClickFileUpload(e, item.isFileNameAsKey)}
                                    id={item.title}
                                >
                                    <div className="p-8 fw-4">
                                        <div>{item.title}</div>
                                        <div>{item.description}</div>
                                    </div>
                                </HiddenInput>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

    return (
        <div>
            <div className={`${isDisabledClick ? 'cursor-not-allowed dc__opacity-0_5' : ''} cb-5 ml-8 fw-6 cursor dc__position-rel`} onClick={toggleFileReaderPopup}>
                Import from file...
            </div>
            {showFileReaderPopup ? renderFileContent() : null}
        </div>
    )
}

export default ConfigMapSecretFileReaderPopup
