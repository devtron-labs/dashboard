import { MAX_LENGTH_30 } from '@Config/constantMessaging'
import { PATTERNS } from '@Config/constants'
import { Icon, IconsProps, SelectPickerOptionType, ValidationResponseType } from '@devtron-labs/devtron-fe-common-lib'
import { importComponentFromFELibrary } from '@Components/common'
import { CreateAppFormStateType, CreateAppModalProps, CreationMethodType } from './types'

const isFELibAvailable: boolean = importComponentFromFELibrary('isFELibAvailable', null, 'function')

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
    selectedCreationMethod: CreationMethodType,
): SelectPickerOptionType<CreationMethodType>[] => {
    const labelSuffix = isJobView ? 'job' : 'application'
    const baseIconColor: IconsProps['color'] = 'N800'
    const selectedIconColor: IconsProps['color'] = 'B500'

    return [
        {
            label: `Blank ${labelSuffix}`,
            value: CreationMethodType.blank,
            startIcon: (
                <Icon
                    name="ic-new"
                    color={selectedCreationMethod === CreationMethodType.blank ? selectedIconColor : baseIconColor}
                />
            ),
        },
        {
            label: `Clone ${labelSuffix}`,
            value: CreationMethodType.clone,
            startIcon: (
                <Icon
                    name="ic-copy"
                    color={selectedCreationMethod === CreationMethodType.clone ? selectedIconColor : baseIconColor}
                />
            ),
        },
        ...(isJobView || !window._env_.FEATURE_APPLICATION_TEMPLATES_ENABLE || !isFELibAvailable
            ? []
            : [
                  {
                      label: `From template`,
                      value: CreationMethodType.template,
                      startIcon: (
                          <Icon
                              name="ic-card-stack"
                              color={
                                  selectedCreationMethod === CreationMethodType.template
                                      ? selectedIconColor
                                      : baseIconColor
                              }
                          />
                      ),
                  },
              ]),
    ]
}
