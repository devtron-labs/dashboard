/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
    Icon,
    IconsProps,
    SelectPickerOptionType,
    validateAppName,
    validateDescription,
    ValidationResponseType,
} from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '@Components/common'

import { CreateAppFormStateType, CreateAppModalProps, CreationMethodType } from './types'

const isFELibAvailable: boolean = importComponentFromFELibrary('isFELibAvailable', null, 'function')

export const validateProject = (projectId: CreateAppFormStateType['projectId']): ValidationResponseType => {
    if (projectId) {
        return { isValid: true, message: '' }
    }

    return { isValid: false, message: 'Please select a project' }
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
            label: 'Create from Scratch',
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
                      label: 'From template',
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

export const getNoItemSelectToastText = (selectedCreationMethod: CreationMethodType) => {
    if (selectedCreationMethod === CreationMethodType.template) {
        return 'Please select a template to create app'
    }

    if (selectedCreationMethod === CreationMethodType.clone) {
        return 'Please select an app to clone'
    }

    return null
}

export const validateFormField = (field: keyof CreateAppFormStateType, value) => {
    switch (field) {
        case 'name':
            return validateAppName(value).message
        case 'description':
            return validateDescription(value).message
        case 'projectId':
            return validateProject(value).message
        default:
            throw new Error(`Invalid field: ${field}`)
    }
}
