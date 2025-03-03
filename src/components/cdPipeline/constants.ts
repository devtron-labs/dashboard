import { DeploymentAppTypes, TriggerType } from '@devtron-labs/devtron-fe-common-lib'
import { MigrateToDevtronFormState } from './cdPipeline.types'
import { sanitizeValidateMigrationSourceResponse } from './MigrateToDevtron/utils'

// NOTE: Please don't add any react node in the default value of the form state since we are doing structuredClone
export const MIGRATE_TO_DEVTRON_FORM_STATE: MigrateToDevtronFormState = {
    deploymentAppType: DeploymentAppTypes.HELM,
    migrateFromArgoFormState: {
        appName: '',
        namespace: '',
        clusterId: null,
        clusterName: '',
        validationResponse: sanitizeValidateMigrationSourceResponse(null, DeploymentAppTypes.GITOPS),
        appIcon: null,
    },
    migrateFromHelmFormState: {
        appName: '',
        namespace: '',
        clusterId: null,
        clusterName: '',
        validationResponse: sanitizeValidateMigrationSourceResponse(null, DeploymentAppTypes.HELM),
        appIcon: null,
    },
    triggerType: TriggerType.Auto,
}
