import { PATTERNS } from "../../config";
import { CHARACTER_ERROR_MAX,CHARACTER_ERROR_MIN,ERROR_MESSAGE_FOR_VALIDATION,INVALID_VOLUME_MOUNT_PATH_IN_CM_CS,REQUIRED_FIELD_MSG } from "../../config/constantMessaging";

export class ValidationRules {
    name = (value: string, pattern?: string): { isValid: boolean; message: string } => {
        let regExp = new RegExp(pattern || PATTERNS.APP_NAME)
        if (value.length === 0) return { isValid: false, message: REQUIRED_FIELD_MSG }
        if (value.length < 2) return { isValid: false, message: CHARACTER_ERROR_MIN }
        if (value.length > 50) return { isValid: false, message: CHARACTER_ERROR_MAX }
        else if (!regExp.test(value))
            return {
                isValid: false,
                message: ERROR_MESSAGE_FOR_VALIDATION,
            }
        else return { isValid: true, message: '' }
    }

    environment = (id: number): { isValid: boolean; message: string } => {
        if (!id) return { isValid: false, message: REQUIRED_FIELD_MSG }
        else return { isValid: true, message: null }
    }

    isGitProvider = (material) => {
        if (material.gitProviderId) return { isValid: true, message: '' }
        else return { isValid: false, message: REQUIRED_FIELD_MSG }
    }

    namespace = (name: string): { isValid: boolean; message: string } => {
        return this.name(name, PATTERNS.NAMESPACE)
    }

    containerRegistry = (containerRegistry: string): { isValid: boolean; message: string } => {
        if (!containerRegistry.length) return { isValid: false, message: REQUIRED_FIELD_MSG }
        else return { isValid: true, message: null }
    }

    repository = (repository: string): { isValid: boolean; message: string } => {
        if (!repository.length) return { isValid: false, message: REQUIRED_FIELD_MSG }
        return { isValid: true, message: null }
    }

    cmVolumeMountPath = (value: string): { isValid: boolean; message: string } => {
        const re = PATTERNS.ALPHANUMERIC_WITH_SPECIAL_CHAR_AND_SLASH
        const regExp = new RegExp(re)
        const test = regExp.test(value)
        if (!test)
            return {
                isValid: false,
                message: INVALID_VOLUME_MOUNT_PATH_IN_CM_CS,
            }
        else return { isValid: true, message: '' }
    }
}
