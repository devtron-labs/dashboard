import { MAX_LENGTH_30 } from '@Config/constantMessaging'
import { PATTERNS } from '@Config/constants'
import { SelectPickerOptionType, ValidationResponseType } from '@devtron-labs/devtron-fe-common-lib'
import { CreateAppFormStateType, CreateAppModalProps, CreationMethodType } from './types'

export const validateAppName = (value: CreateAppFormStateType['name']): Required<ValidationResponseType> => {
    const re = PATTERNS.APP_NAME
    const regExp = new RegExp(re)
    const test = regExp.test(value)

    if (value.length === 0) {
        return { isValid: false, message: 'Please provide app name' }
    }

    if (value.length < 3) {
        return { isValid: false, message: 'Atleast 3 characters required' }
    }

    if (value.length > 30) {
        return { isValid: false, message: MAX_LENGTH_30 }
    }

    if (!test) {
        return {
            isValid: false,
            message:
                "Min 3 chars; Start with alphabet; End with alphanumeric; Use only lowercase; Allowed:(-); Do not use 'spaces'",
        }
    }

    return { isValid: true, message: '' }
}

export const validateProject = (projectId: CreateAppFormStateType['projectId']): ValidationResponseType => {
    if (projectId) {
        return { isValid: true, message: '' }
    }

    return { isValid: false, message: 'Please select a project' }
}

export const validateCloneApp = (cloneAppId: CreateAppFormStateType['cloneAppId']): ValidationResponseType => {
    if (cloneAppId) {
        return { isValid: true, message: '' }
    }

    return { isValid: false, message: 'Please select an application to clone' }
}

export const getCreateMethodConfig = (
    isJobView: CreateAppModalProps['isJobView'],
): SelectPickerOptionType<CreationMethodType>[] => {
    const labelSuffix = isJobView ? 'job' : 'application'

    return [
        {
            label: `Blank ${labelSuffix}`,
            value: CreationMethodType.blank,
        },
        {
            label: `Clone ${labelSuffix}`,
            value: CreationMethodType.clone,
        },
        ...(isJobView ? [] : [{ label: `From template`, value: CreationMethodType.template }]),
    ]
}
