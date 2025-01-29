import { post, showError } from '@devtron-labs/devtron-fe-common-lib'
import { Routes } from '@Config/constants'
import {
    MigrateToDevtronFormState,
    MigrateToDevtronRequiredFieldsDTO,
    ValidateMigrationSourceDTO,
} from '../cdPipeline.types'

export const validateMigrationSource = async (
    migrateToDevtronFormState: MigrateToDevtronFormState,
): Promise<ValidateMigrationSourceDTO> => {
    try {
        const payload: MigrateToDevtronRequiredFieldsDTO = {
            deploymentAppType: migrateToDevtronFormState.deploymentAppType,
            deploymentAppName: migrateToDevtronFormState.migrateFromArgoFormState.appName,
            applicationObjectClusterId: migrateToDevtronFormState.migrateFromArgoFormState.clusterId,
            applicationObjectNamespace: migrateToDevtronFormState.migrateFromArgoFormState.namespace,
        }
        const { result } = await post<ValidateMigrationSourceDTO, MigrateToDevtronRequiredFieldsDTO>(
            Routes.CD_PIPELINE_VALIDATE_LINK_REQUEST,
            payload,
        )

        return result
    } catch (error) {
        showError(error)
        throw error
    }
}
