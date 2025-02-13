import { post, showError } from '@devtron-labs/devtron-fe-common-lib'
import { Routes } from '@Config/constants'
import {
    ValidateMigrateToDevtronPayloadType,
    ValidateMigrationSourceDTO,
    ValidateMigrationSourceServiceParamsType,
} from '../cdPipeline.types'
import { getValidateMigrationSourcePayload, sanitizeValidateMigrationSourceResponse } from './utils'

export const validateMigrationSource = async (
    params: ValidateMigrationSourceServiceParamsType,
): Promise<ValidateMigrationSourceDTO> => {
    try {
        const { result } = await post<ValidateMigrationSourceDTO, ValidateMigrateToDevtronPayloadType>(
            Routes.APP_CD_PIPELINE_VALIDATE_LINK_REQUEST,
            getValidateMigrationSourcePayload(params),
        )

        return sanitizeValidateMigrationSourceResponse(result)
    } catch (error) {
        showError(error)
        throw error
    }
}
