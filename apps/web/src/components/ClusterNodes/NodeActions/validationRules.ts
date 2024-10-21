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

export class ValidationRules {
    taintKey = (key: string): { message: string | null; isValid: boolean } => {
        const keyPrefixRegex = new RegExp(PATTERNS.KUBERNETES_KEY_PREFIX)
        const keyNameRegex = new RegExp(PATTERNS.KUBERNETES_KEY_NAME)

        if (!key) {
            return { message: 'Key is required', isValid: false }
        }
        if (key.length > 253) {
            return { message: 'Maximum 253 chars are allowed', isValid: false }
        }
        if (key.indexOf('/') !== -1) {
            const keyArr = key.split('/')
            if (keyArr.length > 2) {
                return { message: 'Maximum one ( / ) allowed', isValid: false }
            }
            if (!keyPrefixRegex.test(keyArr[0])) {
                return { message: 'Invalid prefix in key', isValid: false }
            }
            if (!keyNameRegex.test(keyArr[1])) {
                return { message: 'Invalid name in key', isValid: false }
            }
        } else if (!keyNameRegex.test(key)) {
            return { message: 'Invalid key', isValid: false }
        }

        return { message: null, isValid: true }
    }

    taintValue = (value: string) => {
        const valueRegex = new RegExp(PATTERNS.KUBERNETES_VALUE)
        if (value) {
            if (value.length > 63) {
                return { message: 'Maximum 63 chars are allowed', isValid: false }
            }
            if (!valueRegex.test(value)) {
                return { message: 'Invalid value', isValid: false }
            }
        }
        return { message: null, isValid: true }
    }
}
