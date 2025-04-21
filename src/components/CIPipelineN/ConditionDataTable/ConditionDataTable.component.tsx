import { useContext, useMemo } from 'react'

import {
    ConditionDataTableHeaderKeys,
    ConditionDetails,
    ConditionType,
    DynamicDataTable,
    PluginType,
} from '@devtron-labs/devtron-fe-common-lib'

import { ConditionContainerType } from '@Components/ciPipeline/types'
import { pipelineContext } from '@Components/workflowEditor/workflowEditor'

import { CONDITION_DATA_TABLE_OPERATOR_OPTIONS } from './constants'
import {
    ConditionDataTableActionType,
    ConditionDataTableCustomState,
    ConditionDataTableProps,
    ConditionDataTableType,
    HandleRowUpdateActionProps,
} from './types'
import {
    convertConditionDataTableToFormData,
    getConditionDataTableCellValidateState,
    getConditionDataTableHeaders,
    getConditionDataTableInitialCellError,
    getConditionDataTableRowEmptyValidationState,
    getConditionDataTableRows,
} from './utils'

export const ConditionDataTable = ({ type, conditionType }: ConditionDataTableProps) => {
    // CONTEXTS
    const {
        activeStageName,
        selectedTaskIndex,
        formData,
        formDataErrorObj,
        setFormData,
        setFormDataErrorObj,
        validateTask,
    } = useContext(pipelineContext)

    // CONSTANTS
    const currentStepTypeVariable =
        formData[activeStageName].steps[selectedTaskIndex].stepType === PluginType.INLINE
            ? 'inlineStepDetail'
            : 'pluginRefStepDetail'

    const conditionDetails: ConditionDetails[] =
        formData[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable]?.conditionDetails

    const ioVariables =
        formData[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable][
            type === ConditionContainerType.PASS_FAILURE ? 'outputVariables' : 'inputVariables'
        ]

    const ioVariablesError =
        formDataErrorObj[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable]?.conditionDetails || {}

    const headers = getConditionDataTableHeaders(conditionType)

    // TABLE ROWS
    const rows = useMemo<ConditionDataTableType['rows']>(
        () => getConditionDataTableRows({ ioVariables, conditionDetails, conditionType }),
        [conditionDetails, ioVariables, conditionType],
    )

    // TABLE CELL ERROR
    const cellError: ConditionDataTableType['cellError'] = Object.keys(ioVariablesError).length
        ? ioVariablesError
        : getConditionDataTableInitialCellError(rows)

    // METHODS
    const handleRowUpdateAction = (rowAction: HandleRowUpdateActionProps) => {
        const { actionType, rowId } = rowAction

        let updatedRows = rows
        const updatedCellError = structuredClone(cellError)

        const selectedRowIndex = rows.findIndex((row) => row.id === rowId)
        const selectedRow = rows[selectedRowIndex]

        switch (actionType) {
            case ConditionDataTableActionType.ADD_ROW: {
                let id = +rowId
                let _conditionDetails = conditionDetails || []
                let conditionTypeToRemove: ConditionType

                if (type === ConditionContainerType.PASS_FAILURE) {
                    if (conditionType === ConditionType.PASS) {
                        conditionTypeToRemove = ConditionType.FAIL
                    } else {
                        conditionTypeToRemove = ConditionType.PASS
                    }
                } else if (conditionType === ConditionType.TRIGGER) {
                    conditionTypeToRemove = ConditionType.SKIP
                } else {
                    conditionTypeToRemove = ConditionType.TRIGGER
                }

                _conditionDetails = _conditionDetails.filter((detail) => {
                    if (detail.conditionType === conditionTypeToRemove) {
                        return false
                    }
                    id = Math.max(id, detail.id)
                    return true
                })

                const newCondition: (typeof conditionDetails)[0] = {
                    id,
                    conditionType,
                    conditionOnVariable: '',
                    conditionOperator: CONDITION_DATA_TABLE_OPERATOR_OPTIONS[0].label as string,
                    conditionalValue: '',
                }

                updatedRows = getConditionDataTableRows({
                    conditionDetails: [newCondition, ..._conditionDetails],
                    ioVariables,
                    conditionType,
                })
                updatedCellError[rowId] = getConditionDataTableRowEmptyValidationState()

                break
            }

            case ConditionDataTableActionType.DELETE_ROW: {
                updatedRows = updatedRows.filter((row) => row.id !== rowId)
                delete updatedCellError[rowId]
                break
            }

            case ConditionDataTableActionType.UPDATE_ROW: {
                if (selectedRow) {
                    selectedRow.data[rowAction.headerKey].value = rowAction.actionValue

                    Object.values(ConditionDataTableHeaderKeys).forEach((key: ConditionDataTableHeaderKeys) => {
                        if (key === rowAction.headerKey) {
                            updatedCellError[rowAction.rowId][rowAction.headerKey] =
                                getConditionDataTableCellValidateState({
                                    value: rowAction.actionValue,
                                    row: selectedRow,
                                    key: rowAction.headerKey,
                                })
                        } else {
                            updatedCellError[rowAction.rowId][key] = getConditionDataTableCellValidateState({
                                value: selectedRow.data[key].value,
                                row: selectedRow,
                                key,
                            })
                        }
                    })
                }
                break
            }

            default:
        }

        // Not updating selectedRow for ADD/DELETE row, since these actions update the rows array directly.
        if (
            actionType !== ConditionDataTableActionType.ADD_ROW &&
            actionType !== ConditionDataTableActionType.DELETE_ROW &&
            selectedRowIndex > -1
        ) {
            updatedRows[selectedRowIndex] = selectedRow
        }

        const { updatedFormData, updatedFormDataErrorObj } = convertConditionDataTableToFormData({
            rows: updatedRows,
            cellError: updatedCellError,
            activeStageName,
            formData,
            formDataErrorObj,
            selectedTaskIndex,
            validateTask,
        })

        setFormData(updatedFormData)
        setFormDataErrorObj(updatedFormDataErrorObj)
    }

    const handleRowAdd = () => {
        handleRowUpdateAction({
            actionType: ConditionDataTableActionType.ADD_ROW,
            rowId: Math.floor(new Date().valueOf() * Math.random()),
        })
    }

    const handleRowDelete: ConditionDataTableType['onRowDelete'] = (row) => {
        handleRowUpdateAction({
            actionType: ConditionDataTableActionType.DELETE_ROW,
            rowId: row.id,
        })
    }

    const handleRowEdit: ConditionDataTableType['onRowEdit'] = (row, headerKey, value) => {
        handleRowUpdateAction({
            actionType: ConditionDataTableActionType.UPDATE_ROW,
            rowId: row.id,
            actionValue: value,
            headerKey,
        })
    }

    return (
        <DynamicDataTable<ConditionDataTableHeaderKeys, ConditionDataTableCustomState>
            headers={headers}
            rows={rows}
            onRowAdd={handleRowAdd}
            onRowDelete={handleRowDelete}
            onRowEdit={handleRowEdit}
            cellError={cellError}
        />
    )
}
