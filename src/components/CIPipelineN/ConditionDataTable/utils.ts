import {
    ConditionDataTableHeaderKeys,
    ConditionDetails,
    ConditionType,
    DynamicDataTableCellValidationState,
    DynamicDataTableRowDataType,
    PluginType,
    SelectPickerOptionType,
    VariableType,
    VariableTypeFormat,
} from '@devtron-labs/devtron-fe-common-lib'

import { PipelineContext } from '@Components/workflowEditor/types'

import { CONDITION_DATA_TABLE_OPERATOR_OPTIONS, EQUAL_NOT_EQUAL_TO_OPERATOR_OPTIONS } from './constants'
import { ConditionDataTableType } from './types'

// DYNAMIC DATA TABLE UTILS
export const getConditionDataTableHeaders = (conditionType: ConditionType): ConditionDataTableType['headers'] => [
    {
        label: `${conditionType} IF`,
        key: ConditionDataTableHeaderKeys.VARIABLE,
        width: '200px',
    },
    {
        label: 'OPERATOR',
        key: ConditionDataTableHeaderKeys.OPERATOR,
        width: '100px',
    },
    {
        label: 'VALUE',
        key: ConditionDataTableHeaderKeys.VALUE,
        width: '1fr',
    },
]

const getConditionDataTableVariableOptions = (ioVariables: VariableType[]): SelectPickerOptionType<string>[] =>
    (ioVariables || [])
        .filter((variable) => variable.name)
        .map((variable) => ({ label: variable.name, value: variable.name }))

const getOperatorOptionsBasedOnVariableTypeFormat = (
    conditionOnVariable: ConditionDetails['conditionOnVariable'],
    ioVariables: VariableType[],
) => {
    const type = ioVariables.find(({ name }) => name === conditionOnVariable)?.format

    switch (type) {
        case VariableTypeFormat.STRING:
        case VariableTypeFormat.BOOL:
        case VariableTypeFormat.FILE:
            return EQUAL_NOT_EQUAL_TO_OPERATOR_OPTIONS
        case VariableTypeFormat.DATE:
        case VariableTypeFormat.NUMBER:
        default:
            return CONDITION_DATA_TABLE_OPERATOR_OPTIONS
    }
}

export const getConditionDataTableRows = ({
    conditionDetails,
    ioVariables,
    conditionType: parentConditionType,
}: {
    conditionDetails: ConditionDetails[]
    ioVariables: VariableType[]
    conditionType: ConditionType
}): ConditionDataTableType['rows'] =>
    (conditionDetails || [])
        .filter(({ conditionType }) => conditionType === parentConditionType)
        .map<ConditionDataTableType['rows'][number]>(
            ({ conditionOnVariable, conditionOperator, conditionalValue, conditionType, id }) => ({
                data: {
                    variable: {
                        type: DynamicDataTableRowDataType.DROPDOWN,
                        props: {
                            options: getConditionDataTableVariableOptions(ioVariables),
                            placeholder: 'Select variable',
                            isSearchable: false,
                        },
                        value: conditionOnVariable,
                    },
                    operator: {
                        type: DynamicDataTableRowDataType.DROPDOWN,
                        props: {
                            options: getOperatorOptionsBasedOnVariableTypeFormat(conditionOnVariable, ioVariables),
                            isSearchable: false,
                        },
                        value: conditionOperator,
                    },
                    val: {
                        type: DynamicDataTableRowDataType.TEXT,
                        props: {
                            placeholder: 'Enter value',
                        },
                        value: conditionalValue,
                    },
                },
                id,
                customState: {
                    conditionType,
                },
            }),
        )

export const getConditionDataTableInitialCellError = (
    rows: ConditionDataTableType['rows'],
): ConditionDataTableType['cellError'] =>
    rows.reduce((acc, curr) => {
        if (!acc[curr.id]) {
            acc[curr.id] = Object.values(ConditionDataTableHeaderKeys).reduce(
                (headerAcc, key) => ({ ...headerAcc, [key]: { isValid: true, errorMessages: [] } }),
                {},
            )
        }

        return acc
    }, {})

export const getConditionDataTableRowEmptyValidationState = (): Record<
    ConditionDataTableHeaderKeys,
    DynamicDataTableCellValidationState
> => ({
    [ConditionDataTableHeaderKeys.VARIABLE]: {
        isValid: true,
        errorMessages: [],
    },
    [ConditionDataTableHeaderKeys.OPERATOR]: {
        isValid: true,
        errorMessages: [],
    },
    [ConditionDataTableHeaderKeys.VALUE]: {
        isValid: true,
        errorMessages: [],
    },
})

// CONVERSION TO PARENT STATE UTIL
export const convertConditionDataTableToFormData = ({
    rows,
    cellError,
    formData,
    formDataErrorObj,
    activeStageName,
    selectedTaskIndex,
    validateTask,
}: Pick<ConditionDataTableType, 'rows' | 'cellError'> &
    Pick<
        PipelineContext,
        'activeStageName' | 'selectedTaskIndex' | 'formData' | 'formDataErrorObj' | 'validateTask'
    >) => {
    const updatedFormData = structuredClone(formData)
    const updatedFormDataErrorObj = structuredClone(formDataErrorObj)

    const currentStepTypeVariable =
        formData[activeStageName].steps[selectedTaskIndex].stepType === PluginType.INLINE
            ? 'inlineStepDetail'
            : 'pluginRefStepDetail'

    const updatedConditionDetails: ConditionDetails[] = rows.map<ConditionDetails>(({ data, id, customState }) => ({
        conditionalValue: data.val.value,
        conditionOnVariable: data.variable.value,
        conditionOperator: data.operator.value,
        conditionType: customState.conditionType,
        id: +id,
    }))

    updatedFormData[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable].conditionDetails =
        updatedConditionDetails

    const isValid = Object.values(cellError).reduce(
        (acc, curr) => acc && !Object.values(curr).some((item) => !item.isValid),
        true,
    )

    updatedFormDataErrorObj[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable].isConditionDetailsValid =
        isValid

    updatedFormDataErrorObj[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable].conditionDetails =
        cellError

    validateTask(
        updatedFormData[activeStageName].steps[selectedTaskIndex],
        updatedFormDataErrorObj[activeStageName].steps[selectedTaskIndex],
        { validateConditionDetails: false },
    )

    return { updatedFormData, updatedFormDataErrorObj }
}

// VALIDATIONS
export const validateConditionDataCell = ({
    key,
    condition: { conditionOnVariable, conditionOperator, conditionalValue },
}: {
    key: ConditionDataTableHeaderKeys
    condition: Pick<ConditionDetails, 'conditionOnVariable' | 'conditionOperator' | 'conditionalValue'>
}): DynamicDataTableCellValidationState => {
    if (key === ConditionDataTableHeaderKeys.VARIABLE && !conditionOnVariable) {
        return { errorMessages: ['Condition on variable is required'], isValid: false }
    }

    if (key === ConditionDataTableHeaderKeys.VALUE && !conditionalValue) {
        return { errorMessages: ['Conditional value is required'], isValid: false }
    }

    if (key === ConditionDataTableHeaderKeys.OPERATOR && !conditionOperator) {
        return { errorMessages: ['Condition operator is required'], isValid: false }
    }

    return { errorMessages: [], isValid: true }
}

export const getConditionDataTableCellValidateState = ({
    row: { data },
    key,
    value,
}: {
    row: ConditionDataTableType['rows'][number]
    key: ConditionDataTableHeaderKeys
    value: string
}): DynamicDataTableCellValidationState =>
    validateConditionDataCell({
        key,
        condition: {
            conditionalValue: key === ConditionDataTableHeaderKeys.VALUE ? value : data.val.value,
            conditionOnVariable: key === ConditionDataTableHeaderKeys.VARIABLE ? value : data.variable.value,
            conditionOperator: key === ConditionDataTableHeaderKeys.OPERATOR ? value : data.operator.value,
        },
    })
