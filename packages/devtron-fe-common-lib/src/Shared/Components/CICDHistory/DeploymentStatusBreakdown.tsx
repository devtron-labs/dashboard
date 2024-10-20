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

import { useRouteMatch } from 'react-router-dom'
import { URLS } from '../../../Common'
import { TIMELINE_STATUS } from '../../constants'
import { ErrorInfoStatusBar } from './ErrorInfoStatusBar'
import { DeploymentStatusDetailRow } from './DeploymentStatusDetailRow'
import { DeploymentStatusDetailBreakdownType } from './types'
import ErrorBar from '../Error/ErrorBar'
import { IndexStore } from '../../Store'

const DeploymentStatusDetailBreakdown = ({
    deploymentStatusDetailsBreakdownData,
    isVirtualEnvironment,
}: DeploymentStatusDetailBreakdownType) => {
    const _appDetails = IndexStore.getAppDetails()
    const { url } = useRouteMatch()
    const isHelmManifestPushed =
        deploymentStatusDetailsBreakdownData.deploymentStatusBreakdown[
            TIMELINE_STATUS.HELM_MANIFEST_PUSHED_TO_HELM_REPO
        ]?.showHelmManifest
    return (
        <>
            {!url.includes(`/${URLS.CD_DETAILS}`) && <ErrorBar appDetails={_appDetails} />}
            <div
                className="deployment-status-breakdown-container pl-20 pr-20 pt-20 pb-20"
                data-testid="deployment-history-steps-status"
            >
                <DeploymentStatusDetailRow
                    type={TIMELINE_STATUS.DEPLOYMENT_INITIATED}
                    deploymentDetailedData={deploymentStatusDetailsBreakdownData}
                />
                {!(
                    isVirtualEnvironment &&
                    deploymentStatusDetailsBreakdownData.deploymentStatusBreakdown[
                        TIMELINE_STATUS.HELM_PACKAGE_GENERATED
                    ]
                ) ? (
                    <>
                        <ErrorInfoStatusBar
                            type={TIMELINE_STATUS.GIT_COMMIT}
                            nonDeploymentError={deploymentStatusDetailsBreakdownData.nonDeploymentError}
                            errorMessage={deploymentStatusDetailsBreakdownData.deploymentError}
                        />
                        <DeploymentStatusDetailRow
                            type={TIMELINE_STATUS.GIT_COMMIT}
                            deploymentDetailedData={deploymentStatusDetailsBreakdownData}
                        />

                        <ErrorInfoStatusBar
                            type={TIMELINE_STATUS.ARGOCD_SYNC}
                            nonDeploymentError={deploymentStatusDetailsBreakdownData.nonDeploymentError}
                            errorMessage={deploymentStatusDetailsBreakdownData.deploymentError}
                        />
                        <DeploymentStatusDetailRow
                            type={TIMELINE_STATUS.ARGOCD_SYNC}
                            deploymentDetailedData={deploymentStatusDetailsBreakdownData}
                        />

                        <ErrorInfoStatusBar
                            type={TIMELINE_STATUS.KUBECTL_APPLY}
                            nonDeploymentError={deploymentStatusDetailsBreakdownData.nonDeploymentError}
                            errorMessage={deploymentStatusDetailsBreakdownData.deploymentError}
                        />
                        <DeploymentStatusDetailRow
                            type={TIMELINE_STATUS.KUBECTL_APPLY}
                            deploymentDetailedData={deploymentStatusDetailsBreakdownData}
                        />

                        <DeploymentStatusDetailRow
                            type={TIMELINE_STATUS.APP_HEALTH}
                            hideVerticalConnector
                            deploymentDetailedData={deploymentStatusDetailsBreakdownData}
                        />
                    </>
                ) : (
                    <>
                        <DeploymentStatusDetailRow
                            type={TIMELINE_STATUS.HELM_PACKAGE_GENERATED}
                            hideVerticalConnector={!isHelmManifestPushed}
                            deploymentDetailedData={deploymentStatusDetailsBreakdownData}
                        />
                        {isHelmManifestPushed && (
                            <DeploymentStatusDetailRow
                                type={TIMELINE_STATUS.HELM_MANIFEST_PUSHED_TO_HELM_REPO}
                                hideVerticalConnector
                                deploymentDetailedData={deploymentStatusDetailsBreakdownData}
                            />
                        )}
                    </>
                )}
            </div>
        </>
    )
}

export default DeploymentStatusDetailBreakdown
