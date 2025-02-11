import { post, showError } from '@devtron-labs/devtron-fe-common-lib'
import { Routes } from '@Config/constants'
import {
    MigrateToDevtronFormState,
    ValidateMigrateToDevtronPayloadType,
    ValidateMigrationSourceDTO,
} from '../cdPipeline.types'
import { sanitizeValidateMigrationSourceResponse } from './utils'

export const validateMigrationSource = async (
    migrateToDevtronFormState: MigrateToDevtronFormState,
    appId: number,
): Promise<ValidateMigrationSourceDTO> => {
    try {
        const payload: ValidateMigrateToDevtronPayloadType = {
            deploymentAppType: migrateToDevtronFormState.deploymentAppType,
            deploymentAppName: migrateToDevtronFormState.migrateFromArgoFormState.appName,
            applicationObjectClusterId: migrateToDevtronFormState.migrateFromArgoFormState.clusterId,
            applicationObjectNamespace: migrateToDevtronFormState.migrateFromArgoFormState.namespace,
            appId,
        }
        const { result } = await post<ValidateMigrationSourceDTO, ValidateMigrateToDevtronPayloadType>(
            Routes.APP_CD_PIPELINE_VALIDATE_LINK_REQUEST,
            payload,
        )

        return sanitizeValidateMigrationSourceResponse(result)
    } catch (error) {
        showError(error)
        throw error
    }
}
