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

import { DeploymentAppTypes } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as Helm } from '../../../assets/icons/helm-app.svg'
import { ReactComponent as ArgoCD } from '../../../assets/icons/argo-cd-app.svg'
import { importComponentFromFELibrary } from '../helpers/Helpers'

const VirtualEnvHelpTippy = importComponentFromFELibrary('VirtualEnvHelpTippy')

function DeploymentTypeIcon({
    deploymentAppType,
    isExternalArgoApp,
}: {
    deploymentAppType: string
    isExternalArgoApp?: boolean
}): JSX.Element {
    const renderDeploymentTypeIcon = () => {
        if (
            (deploymentAppType === DeploymentAppTypes.MANIFEST_DOWNLOAD ||
                deploymentAppType === DeploymentAppTypes.MANIFEST_PUSH) &&
            VirtualEnvHelpTippy
        ) {
            return <VirtualEnvHelpTippy isVirtualIcon />
        }
        if (deploymentAppType === DeploymentAppTypes.GITOPS || isExternalArgoApp) {
            return <ArgoCD data-testid="argo-cd-app-logo" className="icon-dim-32 ml-16" />
        }
        if (deploymentAppType === DeploymentAppTypes.HELM) {
            return <Helm data-testid="helm-app-logo" className="icon-dim-32 ml-16" />
        }
        return null
    }

    return renderDeploymentTypeIcon()
}

export default DeploymentTypeIcon
