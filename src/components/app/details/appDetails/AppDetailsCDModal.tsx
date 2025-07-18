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

import { useHistory, useLocation } from 'react-router-dom'

import { DeploymentNodeType, stopPropagation, VisibleModal } from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '../../../common'
import { URL_PARAM_MODE_TYPE } from '../../../common/helpers/types'
import { getModuleInfo } from '../../../v2/devtronStackManager/DevtronStackManager.service'
import { AppDetailsCDModalType } from '../../types'
import CDMaterial from '../triggerView/cdMaterial'
import { TRIGGER_VIEW_PARAMS } from '../triggerView/Constants'

const ApprovalMaterialModal = importComponentFromFELibrary('ApprovalMaterialModal')

const AppDetailsCDModal = ({
    appId,
    appName,
    environmentId,
    cdModal,
    deploymentAppType,
    isVirtualEnvironment,
    loadingDetails,
    environmentName,
    handleSuccess,
    materialType,
    closeCDModal,
}: AppDetailsCDModalType): JSX.Element => {
    const history = useHistory()
    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const mode = queryParams.get('mode')

    const node = {
        environmentName,
        parentEnvironmentName: cdModal.parentEnvironmentName,
        isVirtualEnvironment,
    }

    const renderApprovalMaterial = () =>
        ApprovalMaterialModal &&
        location.search.includes(TRIGGER_VIEW_PARAMS.APPROVAL_NODE) && (
            <ApprovalMaterialModal
                isLoading={loadingDetails}
                node={node}
                materialType={materialType}
                stageType={DeploymentNodeType.CD}
                closeApprovalModal={closeCDModal}
                appId={appId}
                pipelineId={cdModal.cdPipelineId}
                getModuleInfo={getModuleInfo}
                ciPipelineId={cdModal.ciPipelineId}
                history={history}
            />
        )

    const renderCDModal = () =>
        (mode === URL_PARAM_MODE_TYPE.LIST || mode === URL_PARAM_MODE_TYPE.REVIEW_CONFIG) && (
            <VisibleModal parentClassName="dc__overflow-hidden" close={closeCDModal}>
                <div className="modal-body--cd-material h-100 contains-diff-view flexbox-col" onClick={stopPropagation}>
                    <CDMaterial
                        materialType={materialType}
                        appId={appId}
                        envId={environmentId}
                        pipelineId={cdModal.cdPipelineId}
                        stageType={DeploymentNodeType.CD}
                        envName={environmentName}
                        closeCDModal={closeCDModal}
                        triggerType={cdModal.triggerType}
                        isVirtualEnvironment={isVirtualEnvironment}
                        ciPipelineId={cdModal.ciPipelineId}
                        deploymentAppType={deploymentAppType}
                        parentEnvironmentName={cdModal.parentEnvironmentName}
                        isLoading={loadingDetails}
                        isRedirectedFromAppDetails
                        handleSuccess={handleSuccess}
                        selectedAppName={appName}
                    />
                </div>
            </VisibleModal>
        )

    return (
        <>
            {renderCDModal()}
            {renderApprovalMaterial()}
        </>
    )
}
export default AppDetailsCDModal
