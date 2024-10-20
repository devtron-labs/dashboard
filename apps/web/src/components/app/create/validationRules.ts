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

import { PATTERNS } from '../../../config'
import { MAX_LENGTH_30, MAX_LENGTH_350 } from '../../../config/constantMessaging'

const validateTagValue = (value: string): string[] => {
    const errorList = []
    if (value.length > 63) {
        errorList.push('Can be max 63 characters')
    }
    const firstLastAlphanumeric = PATTERNS.START_END_ALPHANUMERIC.test(value)
    if (!firstLastAlphanumeric) {
        errorList.push('Must start and end with an alphanumeric character')
    }
    const validValue = PATTERNS.ALPHANUMERIC_WITH_SPECIAL_CHAR.test(value)
    if (!validValue) {
        errorList.push('Can only contain alphanumeric chars and (-), (_), (.)')
    }
    return errorList
}
export class ValidationRules {
    appName = (value: string): { isValid: boolean; message: string } => {
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

    team = (projectId: number): { isValid: boolean; message: string } => {
        const found = !!projectId
        if (found) {
            return { isValid: true, message: '' }
        }
        return { isValid: false, message: 'Please select a project' }
    }

    cloneApp = (cloneAppId: number): { isValid: boolean; message: string } => {
        const found = !!cloneAppId
        if (found) {
            return { isValid: true, message: '' }
        }
        return { isValid: false, message: 'Please select an application to clone' }
    }

    description = (description: string = ''): { isValid: boolean; message: string } => {
        const trimmedDescription = description.trim()
        if (trimmedDescription && trimmedDescription.length > 350) {
            return { isValid: false, message: MAX_LENGTH_350 }
        }
        return { isValid: true, message: '' }
    }

    propagateTagKey = (key: string): { isValid: boolean; messages: string[] } => {
        const errorList = []
        if (!key) {
            errorList.push('Key is required')
        } else {
            const re = new RegExp('/', 'g')
            const noOfSlashInKey = key.match(re)?.length
            if (noOfSlashInKey > 1) {
                errorList.push('Key: Max 1 ( / ) allowed')
            } else if (noOfSlashInKey === 1) {
                const [prefix, name] = key.split('/')
                errorList.push(...validateTagValue(name).map((error) => `Name: ${error}`))
                if (prefix.length > 253) {
                    errorList.push('Prefix: Can be max 253 characters')
                }
                const validPrefix = PATTERNS.KUBERNETES_KEY_PREFIX.test(prefix)
                if (!validPrefix) {
                    errorList.push('Prefix: Must be a DNS subdomain (a series of DNS labels separated by dots (.)')
                }
            } else {
                errorList.push(...validateTagValue(key).map((error) => `Name: ${error}`))
            }
        }
        return { isValid: errorList.length === 0, messages: errorList }
    }

    propagateTagValue = (value: string): { isValid: boolean; messages: string[] } => {
        const errorList = []
        if (!value) {
            errorList.push('Value is required')
        } else {
            errorList.push(...validateTagValue(value))
        }
        return { isValid: errorList.length === 0, messages: errorList }
    }
}
