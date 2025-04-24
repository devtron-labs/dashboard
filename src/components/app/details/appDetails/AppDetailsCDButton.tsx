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
import ReactGA from 'react-ga4'
import { useHistory, useLocation } from 'react-router-dom'

import {
    ACTION_STATE,
    Button,
    ButtonComponentType,
    ButtonVariantType,
    ComponentSizeType,
    DeploymentNodeType,
    stopPropagation,
    useSearchString,
    VisibleModal,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as InfoOutline } from '../../../../assets/icons/ic-info-outline.svg'
import { ReactComponent as DeployIcon } from '../../../../assets/icons/ic-nav-rocket.svg'
import { BUTTON_TITLE } from '../../../ApplicationGroup/Constants'
import { importComponentFromFELibrary } from '../../../common'
import { URL_PARAM_MODE_TYPE } from '../../../common/helpers/types'
import { getModuleInfo } from '../../../v2/devtronStackManager/DevtronStackManager.service'
import { AppDetailsCDButtonType } from '../../types'
import CDMaterial from '../triggerView/cdMaterial'
import { TRIGGER_VIEW_PARAMS } from '../triggerView/Constants'
import { MATERIAL_TYPE } from '../triggerView/types'
import { DA_APP_DETAILS_GA_EVENTS } from './constants'
import { getDeployButtonStyle } from './utils'

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
    isForEmptyState = false,
    handleSuccess,
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

        ReactGA.event(DA_APP_DETAILS_GA_EVENTS.DeployButtonClicked)
    }

    const closeCDModal = (e: React.MouseEvent): void => {
        stopPropagation(e)
        history.push({ search: '' })
    }

    const renderDeployButton = () => (
        <Button
            dataTestId="deploy-button"
            size={isForEmptyState ? ComponentSizeType.large : ComponentSizeType.small}
            variant={ButtonVariantType.primary}
            text={BUTTON_TITLE[DeploymentNodeType.CD]}
            startIcon={deploymentUserActionState === ACTION_STATE.BLOCKED ? <InfoOutline /> : <DeployIcon />}
            onClick={onClickDeployButton}
            component={ButtonComponentType.button}
            style={getDeployButtonStyle(deploymentUserActionState)}
        />
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
                <div className="modal-body--cd-material h-100 contains-diff-view flexbox-col" onClick={stopPropagation}>
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
                        isRedirectedFromAppDetails
                        handleSuccess={handleSuccess}
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
