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

import { AppType, DeploymentAppTypes } from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as ArgoCD } from '../../../assets/icons/argo-cd-app.svg'
import { ReactComponent as Helm } from '../../../assets/icons/helm-app.svg'
import { ReactComponent as FluxCD } from '../../../assets/icons/ic-fluxcd.svg'
import { importComponentFromFELibrary } from '../helpers/Helpers'

const VirtualEnvHelpTippy = importComponentFromFELibrary('VirtualEnvHelpTippy')

function DeploymentTypeIcon({
    deploymentAppType,
    appType,
}: {
    deploymentAppType: string
    appType: string
}): JSX.Element {
    const renderDeploymentTypeIcon = () => {
        if (
            (deploymentAppType === DeploymentAppTypes.MANIFEST_DOWNLOAD ||
                deploymentAppType === DeploymentAppTypes.MANIFEST_PUSH) &&
            VirtualEnvHelpTippy
        ) {
            return <VirtualEnvHelpTippy isVirtualIcon />
        }
        if (deploymentAppType === DeploymentAppTypes.GITOPS || appType === AppType.EXTERNAL_ARGO_APP) {
            return <ArgoCD data-testid="argo-cd-app-logo" className="icon-dim-32" />
        }
        if (appType === AppType.EXTERNAL_FLUX_APP) {
            return <FluxCD data-testid="flux-cd-app-logo" className="icon-dim-32" />
        }
        if (deploymentAppType === DeploymentAppTypes.HELM) {
            return <Helm data-testid="helm-app-logo" className="icon-dim-32" />
        }
        return null
    }

    return renderDeploymentTypeIcon()
}

export default DeploymentTypeIcon
