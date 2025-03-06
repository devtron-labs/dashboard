import { DeploymentAppTypes, TriggerType } from '@devtron-labs/devtron-fe-common-lib'
import { importComponentFromFELibrary } from '@Components/common'
import { MigrateToDevtronFormState } from './cdPipeline.types'
import { sanitizeValidateMigrationSourceResponse } from './MigrateToDevtron/utils'

const isFELibAvailable = importComponentFromFELibrary('isFELibAvailable', null, 'function')

export const DEFAULT_MIGRATE_TO_DEVTRON_DEPLOYMENT_APP_TYPE: MigrateToDevtronFormState['deploymentAppType'] =
    isFELibAvailable ? DeploymentAppTypes.HELM : DeploymentAppTypes.GITOPS

export const MIGRATE_TO_DEVTRON_FORM_STATE: MigrateToDevtronFormState = {
    deploymentAppType: DEFAULT_MIGRATE_TO_DEVTRON_DEPLOYMENT_APP_TYPE,
    migrateFromArgoFormState: {
        appName: '',
        namespace: '',
        clusterId: 0,
        clusterName: '',
        validationResponse: sanitizeValidateMigrationSourceResponse(null),
    },
    triggerType: TriggerType.Auto,
}
