import React from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import {
    ACTION_STATE,
    DeploymentNodeType,
    VisibleModal,
    stopPropagation,
    useSearchString,
} from '@devtron-labs/devtron-fe-common-lib'
import { getCTAClass } from '../../../common'
import { URL_PARAM_MODE_TYPE } from '../../../common/helpers/types'
import CDMaterial from '../triggerView/cdMaterial'
import { MATERIAL_TYPE } from '../triggerView/types'
import { BUTTON_TITLE } from '../../../ApplicationGroup/Constants'
import { AppDetailsCDButtonType } from '../../types'
import { ReactComponent as DeployIcon } from '../../../../assets/icons/ic-nav-rocket.svg'
import { ReactComponent as InfoOutline } from '../../../../assets/icons/ic-info-outline.svg'

const AppDetailsCDButton = ({
    appId,
    environmentId,
    cdPipelineId,
    isVirtualEnvironment,
    ciPipelineId,
    deploymentAppType,
    parentEnvironmentName,
    deploymentUserActionState,
    loadingDetails,
    environmentName,
    triggerType,
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

    const renderDeployButton = () => {
        return (
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
                        className={`icon-dim-16 dc__no-svg-fill mr-6 ${deploymentUserActionState === ACTION_STATE.ALLOWED ? '' : 'scn-9'}`}
                    />
                )}
                {BUTTON_TITLE[DeploymentNodeType.CD]}
            </button>
        )
    }

    const renderCDModal = () => {
        return (
            (mode === URL_PARAM_MODE_TYPE.LIST || mode === URL_PARAM_MODE_TYPE.REVIEW_CONFIG) && (
                <VisibleModal className="" parentClassName="dc__overflow-hidden" close={closeCDModal}>
                    <div className="modal-body--cd-material h-100 contains-diff-view" onClick={stopPropagation}>
                        <CDMaterial
                            materialType={MATERIAL_TYPE.inputMaterialList}
                            appId={appId}
                            envId={environmentId}
                            pipelineId={cdPipelineId}
                            stageType={DeploymentNodeType.CD}
                            envName={environmentName}
                            closeCDModal={closeCDModal}
                            triggerType={triggerType}
                            isVirtualEnvironment={isVirtualEnvironment}
                            ciPipelineId={ciPipelineId}
                            deploymentAppType={deploymentAppType}
                            parentEnvironmentName={parentEnvironmentName}
                            isLoading={loadingDetails}
                        />
                    </div>
                </VisibleModal>
            )
        )
    }

    return (
        <>
            {renderDeployButton()}
            {renderCDModal()}
        </>
    )
}
export default AppDetailsCDButton
