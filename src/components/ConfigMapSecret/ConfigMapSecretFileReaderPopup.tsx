import { TippyCustomized, TippyTheme, stopPropagation } from '@devtron-labs/devtron-fe-common-lib'
import React, { useEffect, useState } from 'react'
import { FileReaderStatus, ReadFileAs } from '../common/hooks/types'
import { configMapsSecretImportFileValidator, importConfigSecretImportFileMessaging } from './Constants'
import { HiddenInput, useFileReader } from '../common'
import { ConfigMapActionTypes, ConfigMapSecretFileReaderPopupType } from './Types'
import YAML from 'yaml'
import { convertToValidValue, useKeyValueYaml } from './ConfigMapSecret.components'
import { PATTERNS } from '../../config'

function ConfigMapSecretFileReaderPopup({
    toggleFileReaderPopup,
    hideFileReaderPopup,
    showFileReaderPopup,
    isDisabledClick,
    dispatch,
    setKeyValueArray,
    state,
}: ConfigMapSecretFileReaderPopupType) {
    const { status, readFile } = useFileReader()
    
    const { setError } = useKeyValueYaml(
        state.currentData,
        setKeyValueArray,
        PATTERNS.CONFIG_MAP_AND_SECRET_KEY,
        `Key must consist of alphanumeric characters, '.', '-' and '_'`,
    )

    useEffect(() => {
        let errorneousKeys = []
        let keyPattern = PATTERNS.CONFIG_MAP_AND_SECRET_KEY
        if (status?.message?.data && status?.status === FileReaderStatus.SUCCESS) {
            try {
                let obj = YAML.parse(status?.message?.data)
                let tempArray = Object.keys(obj).reduce((agg, k) => {
                    if (!k && !obj[k]) return agg
                    let v =
                        obj[k] && typeof obj[k] === 'object'
                            ? YAML.stringify(obj[k], { indent: 2 })
                            : convertToValidValue(obj[k])
                    let keyErr = `Key must consist of alphanumeric characters, '.', '-' and '_'`

                    if (k && keyPattern.test(k)) {
                        keyErr = ''
                    } else {
                        keyErr = keyErr
                        errorneousKeys.push(k)
                    }
                    return [...agg, { k, v: v ?? '', keyError: keyErr, valueError: '' }]
                }, [])
                setKeyValueArray(tempArray)
                dispatch({ type: ConfigMapActionTypes.updateCurrentData, payload: tempArray })

                let error = ''
                if (errorneousKeys.length > 0) {
                    error = `Keys can contain: (Alphanumeric) (-) (_) (.) > Errors: ${errorneousKeys
                        .map((e) => `"${e}"`)
                        .join(', ')}`
                }
                setError(error)
            } catch (err) {
                setError('Could not parse to valid YAML')
                dispatch({
                    type: ConfigMapActionTypes.updateCurrentData,
                    payload: [...errorneousKeys, { k: status?.message?.data }],
                })
            }
        }
    }, [status?.message?.data])

    const onClickFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isFileNameAsKey) => {
        if (readFile) {
            readFile(e.target.files![0], configMapsSecretImportFileValidator, ReadFileAs.TEXT, isFileNameAsKey)
        }
        hideFileReaderPopup()
    }

    const renderFileContent = () => {
        return (
            <div>
                {importConfigSecretImportFileMessaging.map((item, index) => {
                    return (
                        <div key={item.title}>
                            <HiddenInput
                                handleFileUpload={(e) => onClickFileUpload(e, item.isFileNameAsKey)}
                                id={item.title}
                            >
                                <div className="p-8 fw-4 import-file-dropdown__row mt-4 mb-4 w-250 cursor">
                                    <div>{item.title}</div>
                                    <div>{item.description}</div>
                                </div>
                            </HiddenInput>
                        </div>
                    )
                })}
            </div>
        )
    }

    return (
        <div>
            <TippyCustomized
                hideHeading={true}
                noHeadingBorder={true}
                theme={TippyTheme.white}
                className="default-tt"
                arrow={false}
                placement="bottom"
                trigger="click"
                additionalContent={!isDisabledClick ? renderFileContent() : null}
                interactive={true}
            >
                <div
                    className={`${isDisabledClick ? 'cursor-not-allowed dc__opacity-0_5' : ''} cb-5 ml-8 fw-6 cursor`}
                    onClick={toggleFileReaderPopup}
                >
                    Import from file...
                </div>
            </TippyCustomized>

            {/* {showFileReaderPopup && !isDisabledClick ? renderFileContent() : null} */}
        </div>
    )
}

export default ConfigMapSecretFileReaderPopup
