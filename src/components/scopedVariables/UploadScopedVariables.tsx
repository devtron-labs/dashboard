import React from 'react'
import ScopedVariablesInput from './ScopedVariablesInput'
import ScopedVariablesEditor from './ScopedVariablesEditor'
import { useFileReader } from './utils/hooks'
import { StyledProgressBar } from '../common/formFields/Widgets/Widgets'
import { validator, downloadData } from './utils/helpers'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { ReactComponent as ICError } from '../../assets/icons/ic-error-exclamation.svg'
import { ReactComponent as ICUpload } from '../../assets/icons/ic-upload-blue.svg'
import { ReadFileAs, LoadScopedVariablesI, UploadScopedVariablesI } from './types'
import {
    DEFAULT_DESCRIPTION,
    DOWNLOAD_TEMPLATE,
    DEFAULT_TITLE,
    SCOPED_VARIABLES_TEMPLATE_DATA,
    UPLOAD_DESCRIPTION_L1,
    UPLOAD_DESCRIPTION_L2,
    DOWNLOAD_TEMPLATE_NAME,
    DOWNLOAD_FILES_AS,
} from './constants'

export function LoadScopedVariables({ status, progress, fileData, abortRead }: LoadScopedVariablesI) {
    return (
        <div className="cursor-default w-200 flex column dc__align-start dc__content-start dc__gap-8">
            <div className="flex dc__align-start dc__gap-8 dc__align-self-stretch dc__content-start">
                <p className="dc__ellipsis-right dc__no-shrink flex-grow-1 m-0 cn-6 fs-13 fw-4 lh-20 dc__align-left">
                    {fileData?.name}
                </p>

                <button
                    className="dc__no-background p-0 dc__no-border cursor dc__outline-none-imp h-20"
                    onClick={abortRead}
                >
                    <Close className="icon-dim-20" />
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
                <div className="flex dc__align-start dc__align-self-stretch dc__gap-4 dc__content-start">
                    <ICError className="icon-dim-20" />
                    <p className="cr-5 fs-13 fw-4 lh-20 dc__align-left">Upload failed</p>
                </div>
            )}
        </div>
    )
}

export default function UploadScopedVariables({
    reloadScopedVariables,
    jsonSchema,
    setScopedVariables,
}: UploadScopedVariablesI) {
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
            reloadScopedVariables={reloadScopedVariables}
            jsonSchema={jsonSchema}
            setScopedVariables={setScopedVariables}
        />
    ) : (
        <div className="flex column center bcn-0 h-100">
            <div className="flex column center dc__gap-20 w-320 dc__no-shrink">
                <div className="flex column center dc__gap-8">
                    <p className="cn-9 fs-16 m-0 fw-6">{DEFAULT_TITLE}</p>
                    <p className="cn-7 fs-13 m-0 fw-4 lh-20 dc__align-center dc__align-self-stretch">
                        {DEFAULT_DESCRIPTION}
                    </p>
                </div>

                <div className="flex column center dc__gap-8 bc-n50 dc__align-self-stretch dc__border-dashed w-320 h-128 br-4">
                    {status === null ? (
                        <ScopedVariablesInput handleFileUpload={handleFileUpload}>
                            <div className="flex center p-8 dc__gap-4 dc__border-radius-50-per bcb-1">
                                <ICUpload className="icon-dim-20" />
                            </div>
                            <div className="flex column center">
                                <p className="cb-5 fs-13 fw-6 lh-20 m-0">{UPLOAD_DESCRIPTION_L1}</p>
                                <p className="cn-6 fs-10 fw-4 lh-16 m-0">{UPLOAD_DESCRIPTION_L2}</p>
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
                    className="p-0 dc__no-background dc__no-border cb-5 fs-13 fw-400 lh-20"
                    onClick={() =>
                        downloadData(SCOPED_VARIABLES_TEMPLATE_DATA, DOWNLOAD_TEMPLATE_NAME, DOWNLOAD_FILES_AS)
                    }
                >
                    {DOWNLOAD_TEMPLATE}
                </button>
            </div>
        </div>
    )
}
