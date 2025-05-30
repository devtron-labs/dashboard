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

import { PATTERNS } from '../../config'
import {
    CHARACTER_ERROR_MIN,
    CHARACTER_ERROR_MAX,
    REQUIRED_FIELD_MSG,
    ERROR_MESSAGE_FOR_VALIDATION,
    CustomErrorMessage,
    MAX_LENGTH_30,
    REPO_NAME_VALIDATION,
} from '../../config/constantMessaging'
import { validateInputOutputVariableCell } from '@Components/CIPipelineN/VariableDataTable/validations'
import { validateConditionDataCell } from '@Components/CIPipelineN/ConditionDataTable/utils'
import { ValidationRulesType } from './types'

export class ValidationRules {
    name = (value: string): { message: string | null; isValid: boolean } => {
        const regExp = new RegExp(PATTERNS.APP_NAME)
        if (!value?.length) {
            return { isValid: false, message: REQUIRED_FIELD_MSG }
        }
        if (value.length < 2) {
            return { isValid: false, message: CHARACTER_ERROR_MIN }
        }
        if (value.length > 50) {
            return { isValid: false, message: CHARACTER_ERROR_MAX }
        }
        if (!regExp.test(value)) {
            return {
                isValid: false,
                message: ERROR_MESSAGE_FOR_VALIDATION,
            }
        }
        return { isValid: true, message: '' }
    }

    namespace = (name: string): { isValid: boolean; message: string } => {
        const regExp = new RegExp(PATTERNS.NAMESPACE)
        if (!name?.length) {
            return { isValid: false, message: REQUIRED_FIELD_MSG }
        }
        if (name.length > 50) {
            return { isValid: false, message: CHARACTER_ERROR_MAX }
        }
        if (!regExp.test(name)) {
            return {
                isValid: false,
                message: ERROR_MESSAGE_FOR_VALIDATION,
            }
        }
        return { isValid: true, message: '' }
    }

    environment = (id: number): { isValid: boolean; message: string } => {
        if (!id) {
            return { isValid: false, message: REQUIRED_FIELD_MSG }
        }
        return { isValid: true, message: null }
    }

    requiredField = (value: string): { message: string | null; isValid: boolean } => {
        if (!value) {
            return { message: REQUIRED_FIELD_MSG, isValid: false }
        }
        return { message: null, isValid: true }
    }

    validateInputOutputVariableCell = validateInputOutputVariableCell

    validateConditionDataCell = validateConditionDataCell

    sourceValue: ValidationRulesType['sourceValue'] = (value, doRegexValidation) => {
        if (!value) {
            return { message: `This is required`, isValid: false }
        }
        if (doRegexValidation) {
            try {
                // Regex must be less than 250 characters
                if (value.length > 250) {
                    return { message: 'Regex must be less than 250 characters.', isValid: false }
                }

                new RegExp(value)
                return { message: null, isValid: true }
            } catch (err) {
                return { message: 'This is not a valid regular expression.', isValid: false }
            }
        } else {
            return { message: null, isValid: true }
        }
    }

    mountPathMap = (value: object): { message: string | null; isValid: boolean } => {
        if (!value['filePathOnDisk'] && !value['filePathOnContainer']) {
            return { message: 'File path on disk and File path on container, both are required', isValid: false }
        }
        if (!value['filePathOnDisk']) {
            return { message: 'File path on disk is required', isValid: false }
        }
        if (!value['filePathOnContainer']) {
            return { message: `File path on container is required`, isValid: false }
        }
        return { message: null, isValid: true }
    }

    containerRegistry = (containerRegistry: string): { isValid: boolean; message: string } => {
        if (!containerRegistry.length) {
            return { isValid: false, message: REQUIRED_FIELD_MSG }
        }
        return { isValid: true, message: null }
    }

    repository = (repository: string): { isValid: boolean; message: string } => {
        if (!repository.length) {
            return { isValid: false, message: REQUIRED_FIELD_MSG }
        }
        if (repository.split('/').slice(-1)[0].length > 30) {
            return { isValid: false, message: MAX_LENGTH_30 }
        }
        if (repository.split('/').slice(-1)[0].includes('_')) {
            return { isValid: false, message: REPO_NAME_VALIDATION }
        }
        return { isValid: true, message: null }
    }

    customTag = (value: string): { message: string[] | []; isValid: boolean } => {
        const _message = []
        const regExp = new RegExp(PATTERNS.CUSTOM_TAG)
        function checkIfOne(string) {
            return string.split('{x}').length === 2
        }

        if (!value?.length) {
            return { isValid: false, message: [REQUIRED_FIELD_MSG] }
        }

        if (value.length >= 128) {
            _message.push(CustomErrorMessage.CUSTOM_TAG_LIMIT)
        }
        if (!(value.includes('{x}') || value.includes('{X}'))) {
            _message.push(CustomErrorMessage.CUSTOM_TAG_MANDATORY_X)
        } else if (!checkIfOne(value)) {
            _message.push(CustomErrorMessage.VARIABLE_X_ONLY_ONCE)
        }
        if (!regExp.test(value)) {
            _message.push(CustomErrorMessage.CUSTOM_TAG_ERROR_MSG)
        }

        if (_message.length) {
            return { isValid: false, message: _message }
        }
        return { isValid: true, message: [] }
    }

    counterX = (value: string): { message: string; isValid: boolean } => {
        if (!value.length) {
            return { isValid: false, message: REQUIRED_FIELD_MSG }
        }
        if (value.includes('-') || value.includes('+')) {
            return { isValid: false, message: CustomErrorMessage.USE_ONLY_NON_NEGATIVE_INTERGER }
        }
        return { isValid: true, message: '' }
    }
}
