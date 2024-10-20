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

import { useState } from 'react'
import { Progressing, useDownload } from '@devtron-labs/devtron-fe-common-lib'
import { ResponseRowType, TriggerModalRowType } from '../../AppGroup.types'
import { ReactComponent as Error } from '../../../../assets/icons/ic-error-exclamation.svg'
import { ReactComponent as Success } from '../../../../assets/icons/appstatus/healthy.svg'
import { ReactComponent as Download } from '../../../../assets/icons/ic-arrow-line-down.svg'
import { ReactComponent as UnAuthorized } from '../../../../assets/icons/ic-locked.svg'
import { ReactComponent as ICInfoFilled } from '../../../../assets/icons/ic-info-filled.svg'
import { BulkResponseStatus } from '../../Constants'
import { importComponentFromFELibrary } from '../../../common'

const getDownloadManifestUrl = importComponentFromFELibrary('getDownloadManifestUrl', null, 'function')

export const TriggerModalRow = ({ rowData, index, isVirtualEnv, envName }: TriggerModalRowType) => {
    const { isDownloading, handleDownload } = useDownload()
    const [isDownloaded, setIsDownloaded] = useState(false)
    const params = {
        appId: rowData.appId,
        envId: rowData.envId,
        appName: `${rowData.appName}-${envName}`,
    }

    const renderStatusIcon = (rowData: ResponseRowType): JSX.Element => {
        if (rowData.status === BulkResponseStatus.SKIP) {
            return <ICInfoFilled className="mr-8 icon-dim-18" />
        }
        if (rowData.status === BulkResponseStatus.UNAUTHORIZE) {
            return <UnAuthorized className="mr-8 icon-dim-18 fcy-7" />
        }
        if (rowData.status === BulkResponseStatus.PASS) {
            return <Success className="mr-8 icon-dim-18" />
        }
        return <Error className="mr-8 icon-dim-18" />
    }

    const downloadPackage = (e) => {
        e.stopPropagation()
        if (!getDownloadManifestUrl) {
            return
        }
        const downloadUrl = getDownloadManifestUrl(params)
        const downloadError = handleDownload({ downloadUrl, fileName: params.appName, showSuccessfulToast: false })
        if (!downloadError) {
            setIsDownloaded(true)
        }
    }

    return (
        <div
            className={`response-row  pt-8 pb-8 ${isVirtualEnv ? 'is-virtual' : ''}`}
            key={`response-${rowData.appId}`}
        >
            <div className="fs-13 fw-4 cn-9">{rowData.appName}</div>
            <div className="flex left top fs-13 fw-4 cn-9">
                {renderStatusIcon(rowData)}
                <span data-testid={`response-status-text-${index}`}>{rowData.statusText}</span>
            </div>
            <div className="fs-13 fw-4 cn-9">{rowData.message}</div>
            {isVirtualEnv && rowData.status === BulkResponseStatus.PASS && (
                <div
                    className="flex right cursor"
                    data-testid={`bulk-cd-manifest-download-button-${index}`}
                    onClick={downloadPackage}
                >
                    {isDownloading ? (
                        <span className="flex">
                            <Progressing />
                            <span className="fs-13 flex fw-4 ml-6 cn-7">Downloading</span>
                        </span>
                    ) : (
                        <span className={`flex ${isDownloaded ? 'cn-5 scn-5' : 'cb-5'} `}>
                            <Download className="icon-dim-16" />
                            <span className="ml-6 fw-6 fs-13">Download</span>
                        </span>
                    )}
                </div>
            )}
        </div>
    )
}
