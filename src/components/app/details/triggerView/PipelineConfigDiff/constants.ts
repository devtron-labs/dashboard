import { DeploymentWithConfigType } from '@devtron-labs/devtron-fe-common-lib'

export const PIPELINE_CONFIG_VS_LABEL_MAP: Record<DeploymentWithConfigType, string> = {
    [DeploymentWithConfigType.LAST_SAVED_CONFIG]: 'Last saved config',
    [DeploymentWithConfigType.LATEST_TRIGGER_CONFIG]: 'Last deployed config',
    [DeploymentWithConfigType.SPECIFIC_TRIGGER_CONFIG]: 'Config deployed with selected image',
}
