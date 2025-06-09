import {
    ComponentSizeType,
    DynamicDataTableCellValidationState,
    DynamicDataTableRowDataType,
    ResourceDetail,
} from '@devtron-labs/devtron-fe-common-lib'

import { NODE_RESOURCE_DEFAULT_THRESHOLD } from '../constants'
import { getIsResourceNamePod, getNodeResourceThreshold } from '../utils'
import { THRESHOLD_TABLE_HEADERS, THRESHOLD_TABLE_OPERATOR_OPTIONS } from './constants'
import {
    EditThresholdDrawerProps,
    SaveNodeThresholdPayload,
    ThresholdTableHeaderKeys,
    ThresholdTableType,
} from './types'

export const getThresholdTableRows =
    ({ cpuData, memoryData, nodeDetail }: Pick<EditThresholdDrawerProps, 'cpuData' | 'memoryData' | 'nodeDetail'>) =>
    (): ThresholdTableType['rows'] =>
        [cpuData, memoryData, ...nodeDetail.resources].map(({ threshold, name }, id) => {
            const isResourceNamePod = getIsResourceNamePod(name)
            const isThresholdLinked = !threshold || threshold.value === NODE_RESOURCE_DEFAULT_THRESHOLD.value

            return {
                id,
                data: {
                    [ThresholdTableHeaderKeys.RESOURCE]: {
                        type: DynamicDataTableRowDataType.TEXT,
                        value: name,
                        disabled: true,
                        props: {},
                    },
                    [ThresholdTableHeaderKeys.INHERITED_THRESHOLD]: {
                        type: DynamicDataTableRowDataType.TEXT,
                        value: getNodeResourceThreshold(null, !isResourceNamePod),
                        disabled: true,
                        props: {},
                    },
                    [ThresholdTableHeaderKeys.OPERATOR]: {
                        type: DynamicDataTableRowDataType.DROPDOWN,
                        value: THRESHOLD_TABLE_OPERATOR_OPTIONS[0].value,
                        disabled: isThresholdLinked,
                        props: {
                            options: THRESHOLD_TABLE_OPERATOR_OPTIONS,
                            menuSize: ComponentSizeType.xs,
                        },
                    },
                    [ThresholdTableHeaderKeys.OVERRIDE_THRESHOLD]: {
                        type: DynamicDataTableRowDataType.TEXT,
                        value: `${!isThresholdLinked ? threshold.value : NODE_RESOURCE_DEFAULT_THRESHOLD.value}${!isResourceNamePod ? '%' : ''}`,
                        disabled: isThresholdLinked,
                        props: {},
                    },
                },
                customState: {
                    isThresholdLinked,
                    isThresholdButtonHovered: false,
                },
            }
        })

export const getInitialThresholdTableCellError =
    (thresholdRows: ThresholdTableType['rows']) => (): ThresholdTableType['cellError'] =>
        thresholdRows.reduce((acc, curr) => {
            if (!acc[curr.id]) {
                acc[curr.id] = THRESHOLD_TABLE_HEADERS.reduce(
                    (headerAcc, { key }) => ({ ...headerAcc, [key]: { isValid: true, errorMessages: [] } }),
                    {},
                )
            }

            return acc
        }, {})

export const getThresholdTableCellValidation = (
    row: ThresholdTableType['rows'][number],
    key: ThresholdTableHeaderKeys,
): DynamicDataTableCellValidationState => {
    if (key === ThresholdTableHeaderKeys.OVERRIDE_THRESHOLD) {
        const resource = row.data[ThresholdTableHeaderKeys.RESOURCE].value
        const thresholdValue = row.data[ThresholdTableHeaderKeys.OVERRIDE_THRESHOLD].value
        const isResourceNamePod = getIsResourceNamePod(resource)

        if (!thresholdValue) {
            return {
                isValid: false,
                errorMessages: ['Value is required'],
            }
        }

        if (isResourceNamePod && !thresholdValue.match(/^[0-9]+$/)) {
            return {
                isValid: false,
                errorMessages: ['Value should be a positive integer'],
            }
        }

        if (!isResourceNamePod && !thresholdValue.match(/^(100|[0-9]{1,2})%$/)) {
            return {
                isValid: false,
                errorMessages: ['Value should be in the range of 0% to 100%'],
            }
        }
    }

    return {
        isValid: true,
        errorMessages: [],
    }
}

export const getThresholdValidation = (
    thresholdRows: ThresholdTableType['rows'],
): { isValid: boolean } & Pick<ThresholdTableType, 'cellError'> => {
    let isValid = true

    const cellError = thresholdRows.reduce<ThresholdTableType['cellError']>((acc, curr) => {
        acc[curr.id] = THRESHOLD_TABLE_HEADERS.reduce((headerAcc, { key }) => {
            const validationState = getThresholdTableCellValidation(curr, key)

            isValid = isValid && validationState.isValid

            return { ...headerAcc, [key]: validationState }
        }, {})

        return acc
    }, {})

    return { isValid, cellError }
}

export const getSaveNodeThresholdPayloadData = (
    thresholdRows: ThresholdTableType['rows'],
): SaveNodeThresholdPayload['data'] =>
    thresholdRows.reduce((acc, { data }) => {
        acc[data[ThresholdTableHeaderKeys.RESOURCE].value] = {
            operator: data[ThresholdTableHeaderKeys.OPERATOR].value as ResourceDetail['threshold']['operator'],
            value: Number(data[ThresholdTableHeaderKeys.OVERRIDE_THRESHOLD].value.replace('%', '')),
        }

        return acc
    }, {})
