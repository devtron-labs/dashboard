import { DeploymentConfigDiffProps } from '@devtron-labs/devtron-fe-common-lib'

import { deploymentConfigDiffTabs } from './constants'

export const getDeploymentConfigDiffTabs = (): DeploymentConfigDiffProps['tabConfig']['tabs'] =>
    Object.values(deploymentConfigDiffTabs)
