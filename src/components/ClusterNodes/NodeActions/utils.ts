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
    DynamicDataTableCellValidationState,
    DynamicDataTableRowDataType,
    getUniqueId,
} from '@devtron-labs/devtron-fe-common-lib'

import { PATTERNS } from '@Config/constants'

import { TAINT_OPTIONS, TAINTS_TABLE_HEADERS } from '../constants'
import { EFFECT_TYPE, TaintsTableHeaderKeys, TaintsTableType, TaintType } from '../types'

export const getTaintsTableRow = (taint?: TaintType, id?: number): TaintsTableType['rows'][number] => ({
    id: id ?? getUniqueId(),
    data: {
        [TaintsTableHeaderKeys.KEY]: {
            type: DynamicDataTableRowDataType.TEXT,
            value: taint?.key || '',
            props: {
                placeholder: 'Enter key',
            },
        },
        [TaintsTableHeaderKeys.VALUE]: {
            type: DynamicDataTableRowDataType.TEXT,
            value: taint?.value || '',
            props: {
                placeholder: 'Enter value',
            },
        },
        [TaintsTableHeaderKeys.EFFECT]: {
            type: DynamicDataTableRowDataType.DROPDOWN,
            value: taint?.effect || EFFECT_TYPE.PreferNoSchedule,
            props: {
                options: TAINT_OPTIONS,
            },
        },
    },
})

export const getTaintsTableRows = (taints: TaintType[]): TaintsTableType['rows'] =>
    taints?.length ? taints.map(getTaintsTableRow) : [getTaintsTableRow()]

export const getTaintsRowCellError = () =>
    TAINTS_TABLE_HEADERS.reduce(
        (headerAcc, { key }) => ({ ...headerAcc, [key]: { isValid: true, errorMessages: [] } }),
        {},
    )

export const getTaintsTableCellError = (taintList: TaintsTableType['rows']): TaintsTableType['cellError'] =>
    taintList.reduce((acc, curr) => {
        if (!acc[curr.id]) {
            acc[curr.id] = getTaintsRowCellError()
        }

        return acc
    }, {})

export const getTaintsTableCellValidateState = (
    headerKey: TaintsTableHeaderKeys,
    row: TaintsTableType['rows'][number],
): DynamicDataTableCellValidationState => {
    const keyColumnValue = row.data[TaintsTableHeaderKeys.KEY].value
    const valueColumnValue = row.data[TaintsTableHeaderKeys.VALUE].value

    if (headerKey === TaintsTableHeaderKeys.KEY && valueColumnValue) {
        const keyPrefixRegex = new RegExp(PATTERNS.KUBERNETES_KEY_PREFIX)
        const keyNameRegex = new RegExp(PATTERNS.KUBERNETES_KEY_NAME)

        if (!keyColumnValue) {
            return { errorMessages: ['Key is required'], isValid: false }
        }

        if (keyColumnValue.length > 253) {
            return { errorMessages: ['Maximum 253 chars are allowed'], isValid: false }
        }

        if (keyColumnValue.indexOf('/') !== -1) {
            const keyArr = keyColumnValue.split('/')

            if (keyArr.length > 2 || !keyPrefixRegex.test(keyArr[0])) {
                return {
                    errorMessages: ["The key can begin with a DNS subdomain prefix and a single '/'"],
                    isValid: false,
                }
            }

            if (!keyNameRegex.test(keyArr[1])) {
                return {
                    errorMessages: [
                        'The key must begin with a letter or number, and may contain letters, numbers, hyphens, dots, and underscores',
                    ],
                    isValid: false,
                }
            }
        } else if (!keyNameRegex.test(keyColumnValue)) {
            return {
                errorMessages: [
                    'The key must begin with a letter or number, and may contain letters, numbers, hyphens, dots, and underscores',
                ],
                isValid: false,
            }
        }
    }

    if (headerKey === TaintsTableHeaderKeys.VALUE && valueColumnValue) {
        const valueRegex = new RegExp(PATTERNS.KUBERNETES_VALUE)

        if (valueColumnValue.length > 63) {
            return { errorMessages: ['Maximum 63 chars are allowed'], isValid: false }
        }
        if (!valueRegex.test(valueColumnValue)) {
            return {
                errorMessages: [
                    'The value must begin with a letter or number, and may contain letters, numbers, hyphens, dots, and underscores',
                ],
                isValid: false,
            }
        }
    }

    return {
        errorMessages: [],
        isValid: true,
    }
}

const getTaintUniqueKey = (data: TaintsTableType['rows'][number]['data']) =>
    `${data[TaintsTableHeaderKeys.KEY].value}-${data[TaintsTableHeaderKeys.EFFECT].value}`

export const validateUniqueTaintKey = ({
    taintList,
    taintCellError,
}: {
    taintList: TaintsTableType['rows']
    taintCellError: TaintsTableType['cellError']
}) => {
    const updatedCellError = taintCellError
    const uniqueTaintKeyMap = taintList.reduce((acc, curr) => {
        const key = getTaintUniqueKey(curr.data)
        acc[key] = (acc[key] || 0) + 1

        return acc
    }, {})
    const uniqueKeyErrorMsg = 'Key and effect must be a unique combination'

    taintList.forEach(({ id, data }) => {
        const key = getTaintUniqueKey(data)

        if (data[TaintsTableHeaderKeys.KEY].value && data[TaintsTableHeaderKeys.EFFECT].value) {
            if (
                updatedCellError[id][TaintsTableHeaderKeys.KEY].isValid &&
                updatedCellError[id][TaintsTableHeaderKeys.EFFECT].isValid &&
                uniqueTaintKeyMap[key] > 1
            ) {
                updatedCellError[id][TaintsTableHeaderKeys.KEY] = {
                    errorMessages: [uniqueKeyErrorMsg],
                    isValid: false,
                }
                updatedCellError[id][TaintsTableHeaderKeys.EFFECT] = {
                    errorMessages: [uniqueKeyErrorMsg],
                    isValid: false,
                }
            } else if (uniqueTaintKeyMap[key] < 2) {
                if (updatedCellError[id][TaintsTableHeaderKeys.KEY].errorMessages[0] === uniqueKeyErrorMsg) {
                    updatedCellError[id][TaintsTableHeaderKeys.KEY] = {
                        errorMessages: [],
                        isValid: true,
                    }
                }
                if (updatedCellError[id][TaintsTableHeaderKeys.EFFECT].errorMessages[0] === uniqueKeyErrorMsg) {
                    updatedCellError[id][TaintsTableHeaderKeys.EFFECT] = {
                        errorMessages: [],
                        isValid: true,
                    }
                }
            }
        }
    })
}

export const getTaintTableValidateState = ({ taintList }: { taintList: TaintsTableType['rows'] }) => {
    const taintCellError: TaintsTableType['cellError'] = taintList.reduce((acc, curr) => {
        acc[curr.id] = TAINTS_TABLE_HEADERS.reduce(
            (headerAcc, { key }) => ({
                ...headerAcc,
                [key]: getTaintsTableCellValidateState(key, curr),
            }),
            {},
        )
        return acc
    }, {})

    validateUniqueTaintKey({ taintCellError, taintList })

    const isInvalid = Object.values(taintCellError).some(
        ({ effect, key, value }) => !(effect.isValid && key.isValid && value.isValid),
    )

    return { isValid: !isInvalid, taintCellError }
}

export const getTaintsPayload = (taintList: TaintsTableType['rows']) =>
    taintList
        .map(({ data }) =>
            data.key.value
                ? {
                      key: data.key.value,
                      value: data.value.value,
                      effect: data.effect.value as EFFECT_TYPE,
                  }
                : null,
        )
        .filter(Boolean)
