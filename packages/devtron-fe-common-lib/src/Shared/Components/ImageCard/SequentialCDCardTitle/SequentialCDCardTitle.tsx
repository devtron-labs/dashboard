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

import { ARTIFACT_STATUS, STAGE_TYPE } from '../../../constants'
import { DeploymentEnvState } from './DeploymentEnvState'
import { DEPLOYMENT_ENV_TEXT } from './DeploymentEnvState/constants'
import { SequentialCDCardTitleProps } from '../types'
import { ImageTagButton } from '../../../../Common'

const SequentialCDCardTitle = ({
    isLatest,
    isRunningOnParentCD,
    artifactStatus,
    environmentName,
    parentEnvironmentName,
    stageType,
    showLatestTag,
    isVirtualEnvironment,
    deployedOn,
    additionalInfo,
}: SequentialCDCardTitleProps) => {
    const getDeployedStateText = () => {
        if (isVirtualEnvironment) {
            return DEPLOYMENT_ENV_TEXT.VIRTUAL_ENV
        }
        return DEPLOYMENT_ENV_TEXT.ACTIVE
    }

    const renderDeployedEnvironmentName = () => {
        if (deployedOn?.length) {
            const deployedOnTitle = deployedOn.length === 1 ? deployedOn[0] : `${deployedOn.length} environments`

            return (
                <DeploymentEnvState
                    envStateText={getDeployedStateText()}
                    title={deployedOnTitle}
                    tooltipContent={deployedOn.join(',')}
                />
            )
        }

        return (
            <>
                {isLatest && environmentName && (
                    <DeploymentEnvState envStateText={getDeployedStateText()} title={environmentName} />
                )}
                {isRunningOnParentCD && parentEnvironmentName && (
                    <DeploymentEnvState envStateText={getDeployedStateText()} title={parentEnvironmentName} />
                )}
            </>
        )
    }

    if (stageType !== STAGE_TYPE.CD) {
        if (isLatest || additionalInfo) {
            return (
                <div className="bcn-0 pb-8 br-4 flex left dc__gap-8">
                    {isLatest && <span className="last-deployed-status">Last Run</span>}

                    {additionalInfo}
                </div>
            )
        }

        return null
    }

    if (
        isLatest ||
        isRunningOnParentCD ||
        Object.values(ARTIFACT_STATUS).includes(artifactStatus) ||
        showLatestTag ||
        deployedOn?.length ||
        additionalInfo
    ) {
        return (
            <div className="bcn-0 pb-8 br-4 flex left">
                {renderDeployedEnvironmentName()}
                {artifactStatus === ARTIFACT_STATUS.PROGRESSING && (
                    <DeploymentEnvState envStateText={DEPLOYMENT_ENV_TEXT.DEPLOYING} title={environmentName} />
                )}
                {(artifactStatus === ARTIFACT_STATUS.DEGRADED || artifactStatus === ARTIFACT_STATUS.FAILED) && (
                    <DeploymentEnvState envStateText={DEPLOYMENT_ENV_TEXT.FAILED} title={environmentName} />
                )}
                {showLatestTag && (
                    <ImageTagButton
                        text="Latest"
                        isSoftDeleted={false}
                        isEditing={false}
                        tagId={0}
                        softDeleteTags={[]}
                        isSuperAdmin
                    />
                )}
                {additionalInfo}
            </div>
        )
    }

    return null
}

export default SequentialCDCardTitle
