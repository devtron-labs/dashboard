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

import { BASIC_FIELDS } from './constants'

export class ValidationRules {
    port = (value: number): { isValid: boolean; message: string } => {
        if (!value || value === 0) {
            return { message: 'This is required field', isValid: false }
        }
        return { message: null, isValid: true }
    }

    envVariable = (value: Object): { message: string | null; isValid: boolean } => {
        if (!value[BASIC_FIELDS.NAME] && value[BASIC_FIELDS.VALUE]) {
            return { message: 'Name is required field', isValid: false }
        }
        if (value[BASIC_FIELDS.NAME] && !value[BASIC_FIELDS.VALUE]) {
            return { message: 'Value is required field', isValid: false }
        }
        return { message: null, isValid: true }
    }
}
