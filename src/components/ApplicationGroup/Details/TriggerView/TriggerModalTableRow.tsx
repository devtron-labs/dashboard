import React, { useState } from 'react'
import { ResponseRowType, TriggerModalTabelRowType } from '../../AppGroup.types'
import { ReactComponent as Error } from '../../../../assets/icons/ic-error-exclamation.svg'
import { ReactComponent as Success } from '../../../../assets/icons/appstatus/healthy.svg'
import { ReactComponent as Download } from '../../../../assets/icons/ic-arrow-line-down.svg'
import { ReactComponent as UnAuthorized } from '../../../../assets/icons/ic-locked.svg'
import { Progressing } from '@devtron-labs/devtron-fe-common-lib'
import { BulkResponseStatus } from '../../Constants'
import { importComponentFromFELibrary } from '../../../common'

const getDeployManifestDownload = importComponentFromFELibrary('getDeployManifestDownload', null, 'function')

export function TriggerModalTabelRow({ rowData, index, isVirtualEnv }: TriggerModalTabelRowType) {
    const [downloader, setDownLoader] = useState(false)
    const params = {
        appId: rowData.appId,
        envId: rowData.envId,
        appName: rowData.appName
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
        if (getDeployManifestDownload) {
            getDeployManifestDownload(params, setDownLoader)
        }
    }

    return (
        <div className="response-row pt-8 pb-8" key={`response-${rowData.appId}`}>
            <div className="fs-13 fw-4 cn-9">{rowData.appName}</div>
            <div className="flex left top fs-13 fw-4 cn-9">
                {renderStatusIcon(rowData)}
                <span data-testid={`response-status-text-${index}`}>{rowData.statusText}</span>
            </div>
            <div className="fs-13 fw-4 cn-9">{rowData.message}</div>
            {isVirtualEnv && rowData.status === BulkResponseStatus.PASS && (
                <div
                    className="flex cursor"
                    onClick={downloadPackage}
                >
                    {downloader ? (
                        <Progressing />
                    ) : (
                        <>
                            <Download className="icon-dim-16" />
                            <span className="ml-6 fw-6 fs-13 cb-5">Download</span>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}
