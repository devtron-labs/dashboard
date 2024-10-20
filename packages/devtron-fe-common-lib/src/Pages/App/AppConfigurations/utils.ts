import { DeploymentStageType } from '@Shared/constants'

export const getDeploymentStageTitle = (stage: DeploymentStageType) => {
    switch (stage) {
        case DeploymentStageType.PRE:
            return 'pre-deployment'
        case DeploymentStageType.POST:
            return 'post-deployment'
        case DeploymentStageType.DEPLOY:
            return 'deployment'
        default:
            return '-'
    }
}
