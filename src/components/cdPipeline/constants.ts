import { DeploymentAppTypes, TriggerType } from '@devtron-labs/devtron-fe-common-lib'
import { MigrateToDevtronFormState } from './cdPipeline.types'
import { sanitizeValidateMigrationSourceResponse } from './MigrateToDevtron/utils'

export const MIGRATE_TO_DEVTRON_FORM_STATE: MigrateToDevtronFormState = {
    deploymentAppType: DeploymentAppTypes.HELM,
    migrateFromArgoFormState: {
        appName: '',
        namespace: '',
        clusterId: 0,
        clusterName: '',
        validationResponse: sanitizeValidateMigrationSourceResponse(null),
    },
    triggerType: TriggerType.Auto,
}
