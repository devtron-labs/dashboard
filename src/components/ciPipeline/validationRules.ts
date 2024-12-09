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

import { RefVariableType } from '@devtron-labs/devtron-fe-common-lib'
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

    inputVariable = (
        value: object,
        availableInputVariables: Map<string, boolean>,
    ): { message: string | null; isValid: boolean } => {
        const re = new RegExp(PATTERNS.VARIABLE)
        const variableValue =
            value['allowEmptyValue'] ||
            (!value['allowEmptyValue'] && value['defaultValue'] && value['defaultValue'] !== '') ||
            (value['variableType'] === RefVariableType.NEW && value['value']) ||
            (value['refVariableName'] &&
                (value['variableType'] === RefVariableType.GLOBAL ||
                    (value['variableType'] === RefVariableType.FROM_PREVIOUS_STEP &&
                        value['refVariableStepIndex'] &&
                        value['refVariableStage'])))

        if (!value['name'] && !variableValue && !value['description']) {
            return { message: 'Please complete or remove this variable', isValid: false }
        }
        if (!value['name'] && !variableValue) {
            return { message: 'Variable name and Value both are required', isValid: false }
        }
        if (!value['name']) {
            return { message: 'Variable name is required', isValid: false }
        }
        if (availableInputVariables.get(value['name'])) {
            return { message: 'Variable name should be unique', isValid: false }
        }
        if (!re.test(value['name'])) {
            return { message: `Invalid name. Only alphanumeric chars and (_) is allowed`, isValid: false }
        }
        if (!variableValue) {
            return { message: 'Variable value is required', isValid: false }
        }
        return { message: null, isValid: true }
    }

    outputVariable = (
        value: object,
        availableInputVariables: Map<string, boolean>,
    ): { message: string | null; isValid: boolean } => {
        const re = new RegExp(PATTERNS.VARIABLE)
        if (!value['name']) {
            return { message: 'Variable name is required', isValid: false }
        }
        if (availableInputVariables.get(value['name'])) {
            return { message: 'Variable name should be unique', isValid: false }
        }
        if (!re.test(value['name'])) {
            return { message: `Invalid name. Only alphanumeric chars and (_) is allowed`, isValid: false }
        }
        return { message: null, isValid: true }
    }

    conditionDetail = (value: object): { message: string | null; isValid: boolean } => {
        if (!value['conditionOnVariable'] && !value['conditionalValue']) {
            return { message: 'Please complete or remove this condition', isValid: false }
        }
        if (!value['conditionOnVariable']) {
            return { message: 'Condition on variable is required', isValid: false }
        }
        if (!value['conditionOperator']) {
            return { message: 'Condition operator is required', isValid: false }
        }
        if (!value['conditionalValue']) {
            return { message: 'Conditional value is required', isValid: false }
        }
        return { message: null, isValid: true }
    }

    sourceValue = (value: string, doRegexValidation = true): { message: string | null; isValid: boolean } => {
        if (!value) {
            return { message: `This is required`, isValid: false }
        }
        if (doRegexValidation) {
            try {
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
