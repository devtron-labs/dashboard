import React from 'react'
import { DeploymentAppTypes } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as Helm } from '../../../assets/icons/helm-app.svg'
import { ReactComponent as ArgoCD } from '../../../assets/icons/argo-cd-app.svg'
import { importComponentFromFELibrary } from '../helpers/Helpers'

const VirtualEnvHelpTippy = importComponentFromFELibrary('VirtualEnvHelpTippy')

function DeploymentTypeIcon({ deploymentAppType }: { deploymentAppType: string }): JSX.Element {
    const renderDeploymentTypeIcon = () => {
        if (
            (deploymentAppType === DeploymentAppTypes.MANIFEST_DOWNLOAD ||
                deploymentAppType === DeploymentAppTypes.MANIFEST_PUSH) &&
            VirtualEnvHelpTippy
        ) {
            return <VirtualEnvHelpTippy isVirtualIcon />
        }
        if (deploymentAppType === DeploymentAppTypes.GITOPS) {
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
