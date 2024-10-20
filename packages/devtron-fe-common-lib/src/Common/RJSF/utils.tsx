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

import { TranslatableString, englishStringTranslator } from '@rjsf/utils'
import { HiddenType, MetaHiddenType } from './types'

/**
 * Override for the TranslatableString from RJSF
 */
export const translateString = (stringToTranslate: TranslatableString, params?: string[]): string => {
    switch (stringToTranslate) {
        case TranslatableString.NewStringDefault:
            // Use an empty string for the new additionalProperties string default value
            return ''
        default:
            return englishStringTranslator(stringToTranslate, params)
    }
}

export const getCommonSelectStyle = (styleOverrides = {}) => ({
    menuList: (base) => ({
        ...base,
        paddingTop: 0,
        paddingBottom: 0,
        cursor: 'pointer',
    }),
    control: (base, state) => ({
        ...base,
        minHeight: '32px',
        boxShadow: 'none',
        backgroundColor: 'var(--N50)',
        border: state.isFocused ? '1px solid var(--B500)' : '1px solid var(--N200)',
        cursor: 'pointer',
    }),
    option: (base, state) => ({
        ...base,
        color: 'var(--N900)',
        backgroundColor: state.isFocused ? 'var(--N100)' : 'white',
        padding: '10px 12px',
        cursor: 'pointer',
    }),
    dropdownIndicator: (base, state) => ({
        ...base,
        color: 'var(--N400)',
        padding: '0 8px',
        transition: 'all .2s ease',
        transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
    }),
    valueContainer: (base, state) => ({
        ...base,
        padding: '0 8px',
        fontWeight: '400',
        color: state.selectProps.menuIsOpen ? 'var(--N500)' : base.color,
    }),
    loadingMessage: (base) => ({
        ...base,
        color: 'var(--N600)',
    }),
    noOptionsMessage: (base) => ({
        ...base,
        color: 'var(--N600)',
    }),
    multiValue: (base) => ({
        ...base,
        border: `1px solid var(--N200)`,
        borderRadius: `4px`,
        background: 'white',
        height: '28px',
        marginRight: '8px',
        padding: '2px',
        fontSize: '12px',
    }),
    ...styleOverrides,
})

/**
 * Returns the redirection props for a url
 */
export const getRedirectionProps = (
    url: string,
): React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    url: string
} => {
    try {
        // The URL is validated when added using the form
        const isInternalUrl = new URL(url).origin === window.location.origin
        return {
            href: url,
            target: isInternalUrl ? '_self' : '_blank',
            rel: isInternalUrl ? undefined : 'external noreferrer',
            url,
        }
    } catch {
        return {
            href: url,
            target: '_blank',
            url: `${url} (Invalid URL)`,
        }
    }
}

/**
 * Infers the type for json schema from value type
 */
export const getInferredTypeFromValueType = (value) => {
    const valueType = typeof value

    switch (valueType) {
        case 'boolean':
        case 'string':
        case 'number':
            return valueType
        case 'object':
            if (Array.isArray(value)) {
                return 'array'
            }
            if (value === null) {
                return 'null'
            }
            return valueType
        default:
            // Unsupported or undefined types
            return 'null'
    }
}

const conformPathToPointers = (path: string): string => {
    if (!path) {
        return ''
    }
    const trimmedPath = path.trim()
    const isSlashSeparatedPathMissingBeginSlash = trimmedPath.match(/^\w+(\/\w+)*$/g)
    if (isSlashSeparatedPathMissingBeginSlash) {
        return `/${trimmedPath}`
    }
    const isDotSeparatedPath = trimmedPath.match(/^\w+(\.\w+)*$/g)
    if (isDotSeparatedPath) {
        // NOTE: replacing dots with forward slash (/)
        return `/${trimmedPath.replaceAll(/\./g, '/')}`
    }
    return trimmedPath
}

const emptyMetaHiddenTypeInstance: MetaHiddenType = {
    value: false,
    path: '',
}

export const parseSchemaHiddenType = (hiddenSchema: HiddenType): MetaHiddenType => {
    if (!hiddenSchema) {
        return null
    }
    const clone = structuredClone(hiddenSchema)
    if (typeof clone === 'string') {
        return {
            value: true,
            path: conformPathToPointers(clone),
        }
    }
    if (typeof clone !== 'object') {
        return structuredClone(emptyMetaHiddenTypeInstance)
    }
    if (
        Object.hasOwn(clone, 'condition') &&
        'condition' in clone &&
        Object.hasOwn(clone, 'value') &&
        'value' in clone
    ) {
        return {
            value: clone.condition,
            path: conformPathToPointers(clone.value),
        }
    }
    if (Object.hasOwn(clone, 'value') && 'value' in clone && Object.hasOwn(clone, 'path') && 'path' in clone) {
        return {
            value: clone.value,
            path: conformPathToPointers(clone.path),
        }
    }
    return structuredClone(emptyMetaHiddenTypeInstance)
}
