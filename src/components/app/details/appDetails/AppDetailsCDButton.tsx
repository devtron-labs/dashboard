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
import { useHistory, useLocation } from 'react-router-dom'
import {
    ACTION_STATE,
    DeploymentNodeType,
    VisibleModal,
    stopPropagation,
    useSearchString,
} from '@devtron-labs/devtron-fe-common-lib'
import { getCTAClass, importComponentFromFELibrary } from '../../../common'
import { URL_PARAM_MODE_TYPE } from '../../../common/helpers/types'
import CDMaterial from '../triggerView/cdMaterial'
import { MATERIAL_TYPE } from '../triggerView/types'
import { BUTTON_TITLE } from '../../../ApplicationGroup/Constants'
import { AppDetailsCDButtonType } from '../../types'
import { ReactComponent as DeployIcon } from '../../../../assets/icons/ic-nav-rocket.svg'
import { ReactComponent as InfoOutline } from '../../../../assets/icons/ic-info-outline.svg'
import { TRIGGER_VIEW_PARAMS } from '../triggerView/Constants'
import { getModuleInfo } from '../../../v2/devtronStackManager/DevtronStackManager.service'

const ApprovalMaterialModal = importComponentFromFELibrary('ApprovalMaterialModal')

const AppDetailsCDButton = ({
    appId,
    environmentId,
    cdModal,
    deploymentAppType,
    isVirtualEnvironment,
    deploymentUserActionState,
    loadingDetails,
    environmentName,
}: AppDetailsCDButtonType): JSX.Element => {
    const history = useHistory()
    const { searchParams } = useSearchString()
    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const mode = queryParams.get('mode')

    const onClickDeployButton = (event) => {
        stopPropagation(event)
        const newParams = {
            ...searchParams,
            mode: URL_PARAM_MODE_TYPE.LIST,
        }

        history.push({
            search: new URLSearchParams(newParams).toString(),
        })
    }

    const closeCDModal = (e: React.MouseEvent): void => {
        stopPropagation(e)
        history.push({ search: '' })
    }

    const renderDeployButton = () => (
        <button
            className={`${getCTAClass(deploymentUserActionState)} h-32`}
            data-testid="deploy-button"
            onClick={onClickDeployButton}
            type="button"
        >
            {deploymentUserActionState === ACTION_STATE.BLOCKED ? (
                <InfoOutline className="icon-dim-16 mr-6" />
            ) : (
                <DeployIcon
                    className={`icon-dim-16 dc__no-svg-fill mr-6 ${deploymentUserActionState === ACTION_STATE.PARTIAL ? 'scn-9' : ''}`}
                />
            )}
            {BUTTON_TITLE[DeploymentNodeType.CD]}
        </button>
    )

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
                materialType={MATERIAL_TYPE.inputMaterialList}
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
            <VisibleModal className="" parentClassName="dc__overflow-hidden" close={closeCDModal}>
                <div className="modal-body--cd-material h-100 contains-diff-view" onClick={stopPropagation}>
                    <CDMaterial
                        materialType={MATERIAL_TYPE.inputMaterialList}
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
                        isRedirectedFromAppDetails={cdModal.isRedirectedFromAppDetails}
                    />
                </div>
            </VisibleModal>
        )

    return (
        <>
            {renderDeployButton()}
            {renderCDModal()}
            {renderApprovalMaterial()}
        </>
    )
}
export default AppDetailsCDButton
