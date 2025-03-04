import { MainContext } from '@devtron-labs/devtron-fe-common-lib'

export const DEFAULT_GIT_OPS_FEATURE_FLAGS: MainContext['featureGitOpsFlags'] = {
    isFeatureArgoCdMigrationEnabled: false,
    isFeatureGitOpsEnabled: false,
    isFeatureUserDefinedGitOpsEnabled: false,
}
