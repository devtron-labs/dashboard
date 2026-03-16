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

import type { JSX } from 'react'

import { DeploymentAppTypes, Tooltip } from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as ArgoCD } from '@Icons/argo-cd-app.svg'
import { ReactComponent as Helm } from '@Icons/helm-app.svg'
import { ReactComponent as FluxCD } from '@Icons/ic-fluxcd.svg'

import { importComponentFromFELibrary } from '../helpers/Helpers'

export const DEPLOYMENT_TYPE_TO_TEXT_MAP: Record<
    Extract<DeploymentAppTypes, DeploymentAppTypes.ARGO | DeploymentAppTypes.FLUX | DeploymentAppTypes.HELM>,
    string
> = {
    [DeploymentAppTypes.ARGO]: 'ArgoCD',
    [DeploymentAppTypes.FLUX]: 'FluxCD',
    [DeploymentAppTypes.HELM]: 'Helm',
}

interface DeploymentTypeIconProps {
    deploymentAppType: DeploymentAppTypes
    iconSize?: 24 | 32
}

const VirtualEnvHelpTippy = importComponentFromFELibrary('VirtualEnvHelpTippy')

const getDeploymentTypeIcon = ({ deploymentAppType, iconSize = 32 }: DeploymentTypeIconProps) => {
    const className = `icon-dim-${iconSize}`
    switch (deploymentAppType) {
        case DeploymentAppTypes.ARGO:
            return <ArgoCD data-testid="argo-cd-app-logo" className={className} />
        case DeploymentAppTypes.FLUX:
            return <FluxCD data-testid="flux-cd-app-logo" className={className} />
        case DeploymentAppTypes.HELM:
            return <Helm data-testid="helm-app-logo" className={className} />
        default:
            return null
    }
}

const DeploymentTypeIcon = ({ deploymentAppType, iconSize = 32 }: DeploymentTypeIconProps): JSX.Element => {
    switch (deploymentAppType) {
        case DeploymentAppTypes.MANIFEST_DOWNLOAD:
        case DeploymentAppTypes.MANIFEST_PUSH:
            return VirtualEnvHelpTippy ? <VirtualEnvHelpTippy isVirtualIcon /> : null
        case DeploymentAppTypes.ARGO:
        case DeploymentAppTypes.FLUX:
        case DeploymentAppTypes.HELM:
            return (
                <Tooltip
                    alwaysShowTippyOnHover
                    content={`Deployed Using ${DEPLOYMENT_TYPE_TO_TEXT_MAP[deploymentAppType]}`}
                >
                    <div className={`icon-dim-${iconSize}`}>
                        {getDeploymentTypeIcon({ deploymentAppType, iconSize })}
                    </div>
                </Tooltip>
            )
        default:
            return null
    }
}

export default DeploymentTypeIcon
