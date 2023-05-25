import React from 'react'
import { ReactComponent as Helm } from '../../../assets/icons/helm-app.svg'
import { ReactComponent as VirtualCluster } from '../../../assets/icons/ic-virtual-cluster.svg'
import { DeploymentAppType } from '../../v2/appDetails/appDetails.type'
import { ReactComponent as ArgoCD } from '../../../assets/icons/argo-cd-app.svg'

function DeploymentTypeIcon({ deploymentAppType }: { deploymentAppType: string }): JSX.Element {
    const renderDeploymentTypeIcon = () => {
        if (deploymentAppType === DeploymentAppType.manifest_download) {
            return <VirtualCluster data-testid="virtual-environment" className="icon-dim-32 fcb-5 ml-16" />
        } else if (deploymentAppType === DeploymentAppType.argo_cd) {
            return <ArgoCD data-testid="argo-cd-app-logo" className="icon-dim-32 ml-16" />
        } else if (deploymentAppType === DeploymentAppType.helm) {
            return <Helm data-testid="helm-app-logo" className="icon-dim-32 ml-16" />
        }
    }

    return renderDeploymentTypeIcon()
}

export default DeploymentTypeIcon
