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

import { useDownload } from '@devtron-labs/devtron-fe-common-lib'
import { ResponseRowType, TriggerModalRowType } from '../../AppGroup.types'
import { ReactComponent as Error } from '../../../../assets/icons/ic-error-exclamation.svg'
import { ReactComponent as Success } from '../../../../assets/icons/appstatus/healthy.svg'
import { ReactComponent as UnAuthorized } from '../../../../assets/icons/ic-locked.svg'
import { ReactComponent as ICInfoFilled } from '../../../../assets/icons/ic-info-filled.svg'
import { BulkResponseStatus } from '../../Constants'
import { importComponentFromFELibrary } from '../../../common'

const DownloadManifestForVirtualEnvironmentButton = importComponentFromFELibrary(
    'DownloadManifestForVirtualEnvironmentButton',
    null,
    'function',
)

export const TriggerModalRow = ({ rowData, index, isVirtualEnv }: TriggerModalRowType) => {
    const { handleDownload } = useDownload()

    const renderStatusIcon = (responseRowData: ResponseRowType): JSX.Element => {
        if (responseRowData.status === BulkResponseStatus.SKIP) {
            return <ICInfoFilled className="mr-8 icon-dim-18" />
        }
        if (responseRowData.status === BulkResponseStatus.UNAUTHORIZE) {
            return <UnAuthorized className="mr-8 icon-dim-18 fcy-7" />
        }
        if (responseRowData.status === BulkResponseStatus.PASS) {
            return <Success className="mr-8 icon-dim-18" />
        }
        return <Error className="mr-8 icon-dim-18" />
    }

    return (
        <div className={`response-row py-8 ${isVirtualEnv ? 'is-virtual' : ''}`} key={`response-${rowData.appId}`}>
            <div className="fs-13 fw-4 cn-9">{rowData.appName}</div>
            <div className="flex left top fs-13 fw-4 cn-9">
                {renderStatusIcon(rowData)}
                <span data-testid={`response-status-text-${index}`}>{rowData.statusText}</span>
            </div>
            <div className="fs-13 fw-4 cn-9">{rowData.message}</div>
            {isVirtualEnv && rowData.status === BulkResponseStatus.PASS && (
                <DownloadManifestForVirtualEnvironmentButton
                    appId={rowData.appId}
                    envId={rowData.envId}
                    helmPackageName={rowData.helmPackageName}
                    cdWorkflowType={rowData.cdWorkflowType}
                    handleDownload={handleDownload}
                    showSuccessfulToast={false}
                />
            )}
        </div>
    )
}
