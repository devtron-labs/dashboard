import React from 'react'
import { useFileReader } from './utils/hooks'
import { StyledProgressBar } from '../common/formFields/Widgets/Widgets'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { ReactComponent as ICError } from '../../assets/icons/ic-error.svg'
import { validator } from './utils/helpers'
import { ReadFileAs, LoadScopedVariablesI, ScopedVariablesInputI } from './types'
import {
    DEFAULT_DESCRIPTION,
    DOWNLOAD_TEMPLATE,
    DEFAULT_TITLE,
    UPLOAD_DESCRIPTION_L1,
    UPLOAD_DESCRIPTION_L2,
} from './constants'
import './styles.scss'

const ICUpload = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
                d="M10.2083 12.0835V3.3358M6.927 6.61389L10.2083 3.3335L13.4895 6.61389M17.0833 12.0835V16.4585C17.0833 16.6243 17.0174 16.7832 16.9002 16.9004C16.783 17.0176 16.624 17.0835 16.4583 17.0835H3.95825C3.79249 17.0835 3.63352 17.0176 3.51631 16.9004C3.3991 16.7832 3.33325 16.6243 3.33325 16.4585V12.0835"
                stroke="#0066CC"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}

const ScopedVariablesInput = ({ handleFileUpload }: ScopedVariablesInputI) => {
    return (
        <>
            <input
                type="file"
                id="scoped-variables-input"
                accept=".yaml, .yml, .json"
                style={{
                    display: 'none',
                }}
                onChange={handleFileUpload}
            />

            <label
                htmlFor="scoped-variables-input"
                className="flex column center"
                style={{ cursor: 'pointer', width: '100%', height: '100%' }}
            >
                <div className="flex center upload-scoped-variables-button__icon">
                    <ICUpload />
                </div>
                <div className="flex column center">
                    <p className="upload-description-l1-typography">{UPLOAD_DESCRIPTION_L1}</p>
                    <p className="upload-description-l2-typography">{UPLOAD_DESCRIPTION_L2}</p>
                </div>
            </label>
        </>
    )
}

const LoadScopedVariables = ({ status, progress, fileData, abortRead }: LoadScopedVariablesI) => {
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

const UploadScopedVariables = () => {
    const { fileData, progress, status, readFile, abortRead } = useFileReader()

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
        readFile(e.target.files[0], validator, ReadFileAs.TEXT)
    }

    return (
        <div className="flex column center h-100vh default-bg-color">
            <div className="flex column center dc__gap-20 w-320 dc__no-shrink">
                <div className="flex column center dc__gap-8">
                    <p className="default-view-title-typography">{DEFAULT_TITLE}</p>
                    <p className="default-view-description-typography">{DEFAULT_DESCRIPTION}</p>
                </div>

                <div className="upload-scoped-variables-card">
                    {status === null ? (
                        <ScopedVariablesInput handleFileUpload={handleFileUpload} />
                    ) : (
                        <LoadScopedVariables
                            status={status}
                            progress={progress}
                            fileData={fileData}
                            abortRead={abortRead}
                        />
                    )}
                </div>

                <button className="p-0 dc__no-background dc__no-border default-download-template-typography">
                    {DOWNLOAD_TEMPLATE}
                </button>
            </div>
        </div>
    )
}

const ScopedVariables = () => {
    return <UploadScopedVariables />
}

export default ScopedVariables
