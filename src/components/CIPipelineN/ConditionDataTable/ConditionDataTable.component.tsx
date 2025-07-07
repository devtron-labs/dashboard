import { useContext } from 'react'

import {
    Button,
    ButtonVariantType,
    ConditionDataTableHeaderKeys,
    ConditionDetails,
    ConditionType,
    DynamicDataTable,
    Icon,
    PluginType,
    RadioGroup,
    RadioGroupItem,
} from '@devtron-labs/devtron-fe-common-lib'

import { ConditionContainerType } from '@Components/ciPipeline/types'
import { pipelineContext } from '@Components/workflowEditor/workflowEditor'

import {
    CONDITION_DATA_TABLE_ADD_BUTTON_TIPPY_MAP,
    CONDITION_DATA_TABLE_OPERATOR_OPTIONS,
    CONDITION_TYPE_HELP_TEXT_MAP,
    EQUAL_NOT_EQUAL_TO_OPERATOR_OPTIONS,
} from './constants'
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

export const ConditionDataTable = ({ type, conditionType, handleConditionTypeChange }: ConditionDataTableProps) => {
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

    // TABLE HEADERS & ROWS
    const headers = getConditionDataTableHeaders(conditionType)
    const rows = getConditionDataTableRows({ ioVariables, conditionDetails, conditionType })

    // TABLE CELL ERROR
    const cellError: ConditionDataTableType['cellError'] = Object.keys(ioVariablesError).length
        ? ioVariablesError
        : getConditionDataTableInitialCellError(rows)

    // METHODS
    const handleRowUpdateAction = (rowAction: HandleRowUpdateActionProps) => {
        const { actionType, rowId } = rowAction

        let updatedRows = rows
        const updatedCellError = structuredClone(cellError)
        const _formData = structuredClone(formData)

        const selectedRowIndex = rows.findIndex((row) => row.id === rowId)
        const selectedRow = rows[selectedRowIndex]

        switch (actionType) {
            case ConditionDataTableActionType.ADD_ROW: {
                const id = +rowId
                let conditionTypeToRemove: ConditionType = null

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

                const filteredConditionDetails = (conditionDetails || []).filter(
                    (detail) => detail.conditionType !== conditionTypeToRemove,
                )

                _formData[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable].conditionDetails =
                    filteredConditionDetails

                const newCondition: (typeof conditionDetails)[0] = {
                    id,
                    conditionType,
                    conditionOnVariable: '',
                    conditionOperator: CONDITION_DATA_TABLE_OPERATOR_OPTIONS[0].label as string,
                    conditionalValue: '',
                }

                updatedRows = getConditionDataTableRows({
                    conditionDetails: [newCondition, ...filteredConditionDetails],
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

                    if (rowAction.headerKey === ConditionDataTableHeaderKeys.VARIABLE) {
                        selectedRow.data.operator.value = EQUAL_NOT_EQUAL_TO_OPERATOR_OPTIONS[0].value
                    }

                    Object.values(ConditionDataTableHeaderKeys).forEach((key: ConditionDataTableHeaderKeys) => {
                        if (!updatedCellError[rowAction.rowId]) {
                            updatedCellError[rowAction.rowId] = getConditionDataTableRowEmptyValidationState()
                        }

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
            formData: _formData,
            formDataErrorObj,
            selectedTaskIndex,
            conditionType,
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
        <>
            <div className="flex dc__content-space">
                <RadioGroup
                    className="no-border mb-10"
                    value={conditionType}
                    name={`${type}-Condition${activeStageName}`}
                    onChange={handleConditionTypeChange}
                >
                    <RadioGroupItem
                        value={
                            type === ConditionContainerType.PASS_FAILURE ? ConditionType.PASS : ConditionType.TRIGGER
                        }
                    >
                        Set {type === ConditionContainerType.PASS_FAILURE ? 'pass' : 'trigger'} conditions
                    </RadioGroupItem>
                    <RadioGroupItem
                        value={type === ConditionContainerType.PASS_FAILURE ? ConditionType.FAIL : ConditionType.SKIP}
                    >
                        Set {type === ConditionContainerType.PASS_FAILURE ? 'failure' : 'skip'} conditions
                    </RadioGroupItem>
                </RadioGroup>
                {!rows.length && (
                    <Button
                        dataTestId="add-condition-row"
                        variant={ButtonVariantType.text}
                        text="Add Condition"
                        startIcon={<Icon name="ic-add" color={null} />}
                        onClick={handleRowAdd}
                    />
                )}
            </div>
            {rows.length ? (
                <DynamicDataTable<ConditionDataTableHeaderKeys, ConditionDataTableCustomState>
                    headers={headers}
                    rows={rows}
                    addBtnTooltip={CONDITION_DATA_TABLE_ADD_BUTTON_TIPPY_MAP[conditionType]}
                    onRowAdd={handleRowAdd}
                    onRowDelete={handleRowDelete}
                    onRowEdit={handleRowEdit}
                    cellError={cellError}
                />
            ) : (
                <div className="p-8 bg__secondary dc__border-dashed--n3 br-4">
                    <p className="m-0 fs-12 lh-18 cn-7">{CONDITION_TYPE_HELP_TEXT_MAP[conditionType]}</p>
                </div>
            )}
        </>
    )
}
