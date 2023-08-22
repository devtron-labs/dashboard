import React from 'react'
import ScopedVariablesInput from './ScopedVariablesInput'
import Descriptor from './Descriptor'
import CodeEditor from '../CodeEditor/CodeEditor'
import { useFileReader } from './utils/hooks'
import { StyledProgressBar } from '../common/formFields/Widgets/Widgets'
import { validator, downloadData } from './utils/helpers'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { ReactComponent as ICError } from '../../assets/icons/ic-error-exclamation.svg'
import { ReactComponent as ICUpload } from '../../assets/icons/ic-upload-blue.svg'
import { ReadFileAs, LoadScopedVariablesI, ScopedVariablesEditorI, UploadScopedVariablesI } from './types'
import {
    DEFAULT_DESCRIPTION,
    DOWNLOAD_TEMPLATE,
    DEFAULT_TITLE,
    VARIABLES_TEMPLATE,
    UPLOAD_DESCRIPTION_L1,
    UPLOAD_DESCRIPTION_L2,
    DOWNLOAD_TEMPLATE_NAME,
} from './constants'

export const LoadScopedVariables = ({ status, progress, fileData, abortRead }: LoadScopedVariablesI) => {
    return (
        <div className="load-scoped-variables-container">
            <div className="load-scoped-variables-container__header">
                <p className="dc__ellipsis-right load-scoped-variables-container__typography">{fileData?.name}</p>

                <button className="load-scoped-variables-container__abort-read-btn" onClick={abortRead}>
                    <Close width={'20px'} height={'20px'} />
                </button>
            </div>

            <StyledProgressBar
                styles={{
                    height: '4px',
                    width: '100%',
                    borderRadius: '2px',
                }}
                classes={`${status?.status ? '' : 'styled-progress-bar-error'}`}
                progress={progress}
            />

            {!status?.status && (
                <div className="load-scoped-variables-container__error-container">
                    <ICError width={'20px'} height={'20px'} />
                    <p className="load-scoped-variables-container__error-typography">Upload failed</p>
                </div>
            )}
        </div>
    )
}

export const ScopedVariablesEditor = ({
    variablesData,
    name,
    abortRead,
    setScopedVariables,
}: ScopedVariablesEditorI) => {
    const handleSave = () => {
        setScopedVariables(variablesData)
        abortRead()
    }
    return (
        <div className="flex column dc__content-space h-100 default-bg-color">
            <Descriptor />
            <div className="uploaded-variables-editor-background">
                <div className="uploaded-variables-editor-container">
                    <div className="uploaded-variables-editor-infobar">
                        <p className="uploaded-variables-editor-infobar__typography dc__ellipsis-right">
                            Upload <span style={{ fontWeight: 700 }}>{name?.split('.').slice(0, -1).join('.')}</span>
                        </p>

                        <button className="uploaded-variables-editor-infobar__abort-read-btn" onClick={abortRead}>
                            <Close width={'20px'} height={'20px'} />
                        </button>
                    </div>

                    <CodeEditor mode="yaml" value={variablesData} noParsing={false} height={'100%'} />

                    <div className="uploaded-variables-editor-footer">
                        <button className="uploaded-variables-editor-footer__cancel-button" onClick={abortRead}>
                            Cancel
                        </button>

                        <button className="uploaded-variables-editor-footer__save-button" onClick={handleSave}>
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

const UploadScopedVariables = ({ setScopedVariables }: UploadScopedVariablesI) => {
    const { fileData, progress, status, readFile, abortRead } = useFileReader()

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
        readFile(e.target.files![0], validator, ReadFileAs.TEXT)
    }

    return status?.status === true ? (
        <ScopedVariablesEditor
            variablesData={status?.message?.data}
            name={fileData?.name}
            abortRead={abortRead}
            setScopedVariables={setScopedVariables}
        />
    ) : (
        <div className="flex column center default-bg-color h-100">
            <div className="flex column center dc__gap-20 w-320 dc__no-shrink">
                <div className="flex column center dc__gap-8">
                    <p className="default-view-title-typography">{DEFAULT_TITLE}</p>
                    <p className="default-view-description-typography">{DEFAULT_DESCRIPTION}</p>
                </div>

                <div className="upload-scoped-variables-card">
                    {status === null ? (
                        <ScopedVariablesInput handleFileUpload={handleFileUpload}>
                            <div className="flex center upload-scoped-variables-button__icon">
                                <ICUpload width={20} height={20} />
                            </div>
                            <div className="flex column center">
                                <p className="upload-description-l1-typography">{UPLOAD_DESCRIPTION_L1}</p>
                                <p className="upload-description-l2-typography">{UPLOAD_DESCRIPTION_L2}</p>
                            </div>
                        </ScopedVariablesInput>
                    ) : (
                        <LoadScopedVariables
                            status={status}
                            progress={progress}
                            fileData={fileData}
                            abortRead={abortRead}
                        />
                    )}
                </div>

                <button
                    className="p-0 dc__no-background dc__no-border default-download-template-typography"
                    onClick={() => downloadData(VARIABLES_TEMPLATE, DOWNLOAD_TEMPLATE_NAME, 'application/x-yaml')}
                >
                    {DOWNLOAD_TEMPLATE}
                </button>
            </div>
        </div>
    )
}

export default UploadScopedVariables
