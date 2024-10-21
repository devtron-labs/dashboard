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

import { URLProtocolType } from './types'

export interface ValidationResponseType {
    isValid: boolean
    message?: string
}

export const MESSAGES = {
    PROVIDE_A_NUMBER: 'Please provide a number',
    LOWERCASE_ALPHANUMERIC: 'Only lowercase alphanumeric characters, -, _ or . allowed',
    CAN_NOT_START_END_WITH_SEPARATORS: 'Cannot start/end with -, _ or .',
    getMinMaxCharMessage: (min: number, max: number) => `Minimum ${min} and maximum ${max} characters allowed`,
    getMaxCharMessage: (max: number) => `Maximum ${max} characters are allowed`,
    getMinCharMessage: (min: number) => `Minimum ${min} characters are required`,
    VALID_POSITIVE_NUMBER: 'This field should be a valid positive number',
    VALID_POSITIVE_INTEGER: 'This field should be a valid positive integer',
    MAX_SAFE_INTEGER: `Maximum allowed value is ${Number.MAX_SAFE_INTEGER}`,
    INVALID_SEMANTIC_VERSION: 'Please follow semantic versioning',
}

const MAX_DESCRIPTION_LENGTH = 350
const DISPLAY_NAME_CONSTRAINTS = {
    MAX_LIMIT: 50,
    MIN_LIMIT: 3,
}

export const requiredField = (value: string): ValidationResponseType => {
    if (!value?.trim()) {
        return { message: 'This field is required', isValid: false }
    }
    return { isValid: true }
}

export const validateName = (name: string): ValidationResponseType => {
    if (!/^.{3,50}$/.test(name)) {
        return {
            isValid: false,
            message: MESSAGES.getMinMaxCharMessage(3, 50),
        }
    }

    if (!/^[a-z0-9-._]+$/.test(name)) {
        return {
            isValid: false,
            message: MESSAGES.LOWERCASE_ALPHANUMERIC,
        }
    }

    if (!/^(?![-._]).*[^-._]$/.test(name)) {
        return {
            isValid: false,
            message: MESSAGES.CAN_NOT_START_END_WITH_SEPARATORS,
        }
    }

    return {
        isValid: true,
    }
}

export const validateDescription = (description: string): ValidationResponseType => {
    if (description?.length > MAX_DESCRIPTION_LENGTH) {
        return {
            isValid: false,
            message: MESSAGES.getMaxCharMessage(MAX_DESCRIPTION_LENGTH),
        }
    }

    return {
        isValid: true,
    }
}

export const validateStringLength = (value: string, maxLimit: number, minLimit: number): ValidationResponseType => {
    if (value?.length < minLimit) {
        return {
            isValid: false,
            message: MESSAGES.getMinCharMessage(minLimit),
        }
    }

    if (value?.length > maxLimit) {
        return {
            isValid: false,
            message: MESSAGES.getMaxCharMessage(maxLimit),
        }
    }

    return {
        isValid: true,
    }
}

export const validateRequiredPositiveNumber = (value: string | number): ValidationResponseType => {
    if (!value) {
        return {
            isValid: false,
            message: MESSAGES.PROVIDE_A_NUMBER,
        }
    }

    // 0002 is a valid number
    if (!/^\d+(\.\d+)?$/.test(value.toString())) {
        return {
            isValid: false,
            message: MESSAGES.VALID_POSITIVE_NUMBER,
        }
    }

    const numericValue = Number(value)

    if (numericValue > Number.MAX_SAFE_INTEGER) {
        return {
            isValid: false,
            message: MESSAGES.MAX_SAFE_INTEGER,
        }
    }

    if (numericValue <= 0) {
        return {
            isValid: false,
            message: MESSAGES.VALID_POSITIVE_NUMBER,
        }
    }

    return {
        isValid: true,
    }
}

export const validateRequiredPositiveInteger = (value: string | number): ValidationResponseType => {
    if (!value) {
        return {
            isValid: false,
            message: MESSAGES.PROVIDE_A_NUMBER,
        }
    }

    if (!/^\d+$/.test(value.toString())) {
        return {
            isValid: false,
            message: MESSAGES.VALID_POSITIVE_INTEGER,
        }
    }

    const numericValue = Number(value)

    if (numericValue > Number.MAX_SAFE_INTEGER) {
        return {
            isValid: false,
            message: MESSAGES.MAX_SAFE_INTEGER,
        }
    }

    if (numericValue <= 0) {
        return {
            isValid: false,
            message: MESSAGES.VALID_POSITIVE_INTEGER,
        }
    }

    return {
        isValid: true,
    }
}

/**
 * Check if the URL starts with the base64 URL prefix
 */
const isBase64Url = (url: string): boolean => /^data:.*;base64,/.test(url)

export const validateURL = (url: string, allowBase64Url: boolean = true): ValidationResponseType => {
    try {
        if (!allowBase64Url && isBase64Url(url)) {
            throw new Error('Base64 URLs are not allowed')
        }
        // eslint-disable-next-line no-new
        new URL(url)
    } catch (err) {
        return {
            isValid: false,
            message: err.message || 'Invalid URL',
        }
    }

    return {
        isValid: true,
    }
}

export const validateProtocols = (
    url: string,
    protocols: URLProtocolType[],
    isRequired?: boolean,
): ValidationResponseType => {
    if (isRequired && !url) {
        return {
            isValid: false,
            message: 'This field is required',
        }
    }

    try {
        const { protocol } = new URL(url)
        if (protocol && protocols.includes(protocol as URLProtocolType)) {
            return {
                isValid: true,
            }
        }
    } catch {
        // Do nothing
    }

    return {
        isValid: false,
        message: `Invalid URL/protocol. Supported protocols are: ${protocols.join(', ')}`,
    }
}

export const validateIfImageExist = (url: string): Promise<ValidationResponseType> =>
    new Promise<ValidationResponseType>((resolve) => {
        const img = new Image()

        img.src = url
        img.onload = () => {
            img.onload = null
            img.onerror = null

            return resolve({
                isValid: true,
            })
        }
        img.onerror = () => {
            img.src = ''
            img.onload = null
            img.onerror = null

            return resolve({
                isValid: false,
                message: 'Invalid URL',
            })
        }
    })

export const validateUniqueKeys = (keys: string[]) => {
    const keysMap: Record<string, number> = keys.reduce(
        (acc, key) => {
            if (acc[key]) {
                acc[key] += 1
                return acc
            }

            acc[key] = 1
            return acc
        },
        {} as Record<string, number>,
    )

    const duplicateKeys = Object.keys(keysMap).filter((key) => keysMap[key] > 1)
    if (!duplicateKeys.length) {
        return {
            isValid: true,
        }
    }

    return {
        isValid: false,
        message: `Duplicate variable name: ${duplicateKeys.join(', ')}`,
    }
}

/**
 * Rules for valid semantic version:
 * 1. version.length < 128 and not empty
 * 2. version should follow semantic versioning regex from https://semver.org/
 */
export const validateSemanticVersioning = (version: string): ValidationResponseType => {
    if (!version) {
        return {
            isValid: false,
            message: 'Please provide a version',
        }
    }

    if (version.length > 128) {
        return {
            isValid: false,
            message: MESSAGES.getMaxCharMessage(128),
        }
    }

    if (
        !/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/.test(
            version,
        )
    ) {
        return {
            isValid: false,
            message: MESSAGES.INVALID_SEMANTIC_VERSION,
        }
    }

    return {
        isValid: true,
    }
}

/**
 * A valid display name should be between 3 and 50 characters
 */
export const validateDisplayName = (name: string): ValidationResponseType =>
    validateStringLength(name, DISPLAY_NAME_CONSTRAINTS.MAX_LIMIT, DISPLAY_NAME_CONSTRAINTS.MIN_LIMIT)

export const validateJSON = (json: string): ValidationResponseType => {
    try {
        if (json) {
            JSON.parse(json)
        }
        return {
            isValid: true,
        }
    } catch (err) {
        return {
            isValid: false,
            message: err.message,
        }
    }
}
