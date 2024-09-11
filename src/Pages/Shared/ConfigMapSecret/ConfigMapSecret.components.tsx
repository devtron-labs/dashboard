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

import { useState, useEffect } from 'react'
import { Progressing, YAMLStringify } from '@devtron-labs/devtron-fe-common-lib'
import YAML from 'yaml'

import { ReactComponent as WarningIcon } from '@Icons/ic-warning-y6.svg'
import { ReactComponent as InfoIcon } from '@Icons/ic-info-filled.svg'
import { ReactComponent as DeleteIcon } from '@Icons/ic-delete-interactive.svg'
import { PATTERNS } from '@Config/index'

import { CM_SECRET_COMPONENT_NAME } from './ConfigMapSecret.constants'
import { KeyValue, KeyValueValidated, KeyValueYaml, OverrideProps } from './ConfigMapSecret.types'

export const validateKeyValuePair = (arr: KeyValue[]): KeyValueValidated => {
    let isValid = true

    const _arr = arr.reduce((agg, { k, v, ...res }) => {
        if (!k && typeof v !== 'string') {
            // filter when both are missing
            return agg
        }
        let keyError: string
        let valueError: string
        if (k && typeof v !== 'string') {
            valueError = 'value must not be empty'
            isValid = false
        }
        if (typeof v === 'string' && !PATTERNS.CONFIG_MAP_AND_SECRET_KEY.test(k)) {
            keyError = `Key '${k}' must consist of alphanumeric characters, '.', '-' and '_'`
            isValid = false
        }
        return [...agg, { ...res, k, v, keyError, valueError }]
    }, [])

    return { isValid, arr: _arr }
}

export const useKeyValueYaml = (keyValueArray, setKeyValueArray, keyPattern, keyError): KeyValueYaml => {
    // input containing array of [{k, v, keyError, valueError}]
    // return {yaml, handleYamlChange}
    const [yaml, setYaml] = useState('')
    const [error, setError] = useState('')
    useEffect(() => {
        if (!Array.isArray(keyValueArray)) {
            setYaml('')
            setError('')
            return
        }
        setYaml(YAMLStringify(keyValueArray.reduce((agg, { k, v }) => ({ ...agg, [k]: v }), {})))
    }, [keyValueArray])

    const handleYamlChange = (yamlConfig) => {
        if (!yamlConfig) {
            setKeyValueArray([])
            return
        }
        try {
            const obj = YAML.parse(yamlConfig)
            if (typeof obj !== 'object') {
                setError('Could not parse to valid YAML')
                return
            }
            const errorneousKeys = []
            const errorneousValues = []

            const tempArray = Object.keys(obj).reduce((agg, k, id) => {
                if (!k && !obj[k]) {
                    return agg
                }
                const v = obj[k] && typeof obj[k] === 'object' ? YAMLStringify(obj[k]) : obj[k].toString()
                let keyErr: string
                if (k && keyPattern.test(k)) {
                    keyErr = ''
                } else {
                    keyErr = keyError
                    errorneousKeys.push(k)
                }

                if (v && (typeof obj[k] === 'boolean' || typeof obj[k] === 'number')) {
                    errorneousValues.push(v)
                }
                return [...agg, { k, v: v ?? '', keyError: keyErr, valueError: '', id }]
            }, [])
            setKeyValueArray(tempArray)
            let updatedError = ''
            if (errorneousKeys.length > 0) {
                updatedError = `Error: Keys can contain: (Alphanumeric) (-) (_) (.) | Invalid key(s): ${errorneousKeys
                    .map((e) => `"${e}"`)
                    .join(', ')}`
            }
            if (errorneousValues.length > 0) {
                if (updatedError !== '') {
                    updatedError += '\n'
                }
                updatedError += `Error: Boolean and numeric values must be wrapped in double quotes Eg. ${errorneousValues
                    .map((e) => `"${e}"`)
                    .join(', ')}`
            }
            setError(updatedError)
        } catch {
            setError('Could not parse to valid YAML')
        }
    }

    return { yaml, handleYamlChange, error }
}

export const Override = ({
    overridden,
    onClick,
    loading = false,
    type,
    readonlyView,
    isProtectedView,
}: OverrideProps) => {
    const renderButtonContent = (): JSX.Element => {
        if (loading) {
            return <Progressing />
        }
        if (overridden) {
            return (
                <>
                    <DeleteIcon className="icon-dim-16 mr-8" />
                    <span>Delete override{isProtectedView ? '...' : ''}</span>
                </>
            )
        }
        return <>Allow override</>
    }

    return (
        <div
            className={`override-container override-container--revamp-design ${overridden ? 'override-warning override-warning--revamp-design' : ''}`}
        >
            {overridden ? <WarningIcon className="icon-dim-20" /> : <InfoIcon className="icon-dim-20" />}
            <div className="flex column left">
                <div className="override-title" data-testid="env-override-title">
                    {overridden ? 'Base configurations are overridden' : 'Inheriting base configurations'}
                </div>
                {!readonlyView && (
                    <div className="override-subtitle" data-testid="env-override-subtitle">
                        {overridden
                            ? 'Deleting will discard the current overrides and base configuration will be applicable to this environment.'
                            : `Overriding will fork the ${CM_SECRET_COMPONENT_NAME[type]} for this environment. Updating the base values will no longer affect this configuration.`}
                    </div>
                )}
            </div>
            {!readonlyView && (
                <button
                    type="button"
                    data-testid={`button-override-${overridden ? 'delete' : 'allow'}`}
                    className={`cta override-button h-32 lh-20-imp p-6-12-imp ${
                        overridden ? 'delete scr-5' : 'ghosted'
                    }`}
                    onClick={onClick}
                >
                    {renderButtonContent()}
                </button>
            )}
        </div>
    )
}
