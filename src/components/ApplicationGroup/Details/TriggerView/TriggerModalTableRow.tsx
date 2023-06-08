import React, { useState } from 'react'
import { ResponseRowType, TriggerModalRowType } from '../../AppGroup.types'
import { ReactComponent as Error } from '../../../../assets/icons/ic-error-exclamation.svg'
import { ReactComponent as Success } from '../../../../assets/icons/appstatus/healthy.svg'
import { ReactComponent as Download } from '../../../../assets/icons/ic-arrow-line-down.svg'
import { ReactComponent as UnAuthorized } from '../../../../assets/icons/ic-locked.svg'
import { Progressing } from '@devtron-labs/devtron-fe-common-lib'
import { BulkResponseStatus } from '../../Constants'
import { importComponentFromFELibrary } from '../../../common'

const getDeployManifestDownload = importComponentFromFELibrary('getDeployManifestDownload', null, 'function')

export function TriggerModalRow({ rowData, index, isVirtualEnv, envName }: TriggerModalRowType) {
    const [downloader, setDownLoader] = useState(false)
    const [isDownloaded, setIsDownLoad] = useState(false)
    const params = {
        appId: rowData.appId,
        envId: rowData.envId,
        appName: `${rowData.appName}-${envName}`
    }

    const renderStatusIcon = (rowData: ResponseRowType): JSX.Element => {
        if (rowData.status === BulkResponseStatus.UNAUTHORIZE) {
            return <UnAuthorized className="mr-8 icon-dim-18 fcy-7" />
        } else if (rowData.status === BulkResponseStatus.PASS) {
            return <Success className="mr-8 icon-dim-18" />
        } else {
            return <Error className="mr-8 icon-dim-18" />
        }
    }

    const downloadPackage = (e) => {
        e.stopPropagation()
        setIsDownLoad(true)
        if (getDeployManifestDownload) {
            getDeployManifestDownload(params, setDownLoader,true)
        }
    }

    return (
        <div className={`response-row  pt-8 pb-8 ${isVirtualEnv ? 'is-virtual': ''}`} key={`response-${rowData.appId}`}>
            <div className="fs-13 fw-4 cn-9">{rowData.appName}</div>
            <div className="flex left top fs-13 fw-4 cn-9">
                {renderStatusIcon(rowData)}
                <span data-testid={`response-status-text-${index}`}>{rowData.statusText}</span>
            </div>
            <div className="fs-13 fw-4 cn-9">{rowData.message}</div>
            {isVirtualEnv && rowData.status === BulkResponseStatus.PASS && (
                <div className="flex right cursor" data-testid="bulk_cd_manifest_download_button" onClick={downloadPackage}>
                    {downloader ? (
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
