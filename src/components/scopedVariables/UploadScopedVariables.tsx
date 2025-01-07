/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react'
import { useFileReader, HiddenInput, importComponentFromFELibrary } from '../common'
import ScopedVariablesEditor from './ScopedVariablesEditor'
import ScopedVariablesLoader from './ScopedVariablesLoader'
import { validator, downloadData } from './utils'
import { ReactComponent as ICUpload } from '../../assets/icons/ic-upload-blue.svg'
import { UploadScopedVariablesProps } from './types'
import { FileReaderStatus, ReadFileAs } from '../common/hooks/types'
import {
    DOWNLOAD_TEMPLATE,
    SCOPED_VARIABLES_TEMPLATE_DATA,
    UPLOAD_DESCRIPTION_L1,
    UPLOAD_DESCRIPTION_L2,
    DOWNLOAD_TEMPLATE_NAME,
    DOWNLOAD_FILES_AS,
} from './constants'
import { HEADER_TEXT } from '@Config/constants'

export default function UploadScopedVariables({
    reloadScopedVariables,
    jsonSchema,
    setScopedVariables,
}: UploadScopedVariablesProps) {
    const { fileData, progress, status, readFile, abortRead } = useFileReader()

    const SCOPED_VARIABLES_TEMPLATE = importComponentFromFELibrary(
        'SCOPED_VARIABLES_TEMPLATE_DATA',
        SCOPED_VARIABLES_TEMPLATE_DATA,
        'function',
    )

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
        readFile(e.target.files![0], validator, ReadFileAs.TEXT)
    }

    const handleDownloadTemplate = () => {
        downloadData(SCOPED_VARIABLES_TEMPLATE, DOWNLOAD_TEMPLATE_NAME, DOWNLOAD_FILES_AS)
    }

    return status?.status === FileReaderStatus.SUCCESS ? (
        <ScopedVariablesEditor
            variablesData={status?.message?.data}
            name={fileData?.name}
            abortRead={abortRead}
            reloadScopedVariables={reloadScopedVariables}
            jsonSchema={jsonSchema}
            setScopedVariables={setScopedVariables}
        />
    ) : (
        <div className="flex column center bg__primary h-100">
            <div className="flex column center dc__gap-20 w-320 dc__no-shrink">
                <div className="flex column center dc__gap-8">
                    <p className="cn-9 fs-16 m-0 fw-6">{HEADER_TEXT.SCOPED_VARIABLES.title}</p>
                    <p className="cn-7 fs-13 m-0 fw-4 lh-20 dc__align-center dc__align-self-stretch">
                        {HEADER_TEXT.SCOPED_VARIABLES.description}
                    </p>
                </div>

                <div className="flex column center dc__gap-8 bg__secondary dc__align-self-stretch dc__border-dashed w-320 h-128 br-4">
                    {status === null ? (
                        <HiddenInput handleFileUpload={handleFileUpload} id="upload-scoped-variables-input">
                            <div className="flex center p-8 dc__gap-4 dc__border-radius-50-per bcb-1">
                                <ICUpload className="icon-dim-20" />
                            </div>
                            <div className="flex column center">
                                <p className="cb-5 fs-13 fw-6 lh-20 m-0">{UPLOAD_DESCRIPTION_L1}</p>
                                <p className="cn-6 fs-10 fw-4 lh-16 m-0">{UPLOAD_DESCRIPTION_L2}</p>
                            </div>
                        </HiddenInput>
                    ) : (
                        <ScopedVariablesLoader
                            status={status}
                            progress={progress}
                            fileData={fileData}
                            abortRead={abortRead}
                        />
                    )}
                </div>

                <button
                    type="button"
                    className="p-0 dc__no-background dc__no-border cb-5 fs-13 fw-400 lh-20"
                    onClick={handleDownloadTemplate}
                >
                    {DOWNLOAD_TEMPLATE}
                </button>
            </div>
        </div>
    )
}
