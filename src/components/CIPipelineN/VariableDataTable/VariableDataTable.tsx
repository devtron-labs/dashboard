import { useContext, useState, useEffect } from 'react'

import {
    DynamicDataTable,
    DynamicDataTableProps,
    DynamicDataTableRowDataType,
    PluginType,
    RefVariableType,
    VariableType,
} from '@devtron-labs/devtron-fe-common-lib'

import { pipelineContext } from '@Components/workflowEditor/workflowEditor'
import { PluginVariableType } from '@Components/ciPipeline/types'

import { ExtendedOptionType } from '@Components/app/types'
import { getVariableDataTableHeaders } from './constants'
import { getSystemVariableIcon } from './helpers'
import { HandleRowUpdateActionProps, VariableDataKeys, VariableDataRowType, VariableDataTableActionType } from './types'
import {
    getEmptyVariableDataTableRow,
    getFormatColumnRowProps,
    getValColumnRowProps,
    getVariableColumnRowProps,
} from './utils'

import { VariableDataTableRowAction } from './VariableDataTableRowAction'

export const VariableDataTable = ({ type }: { type: PluginVariableType }) => {
    // CONTEXTS
    const {
        inputVariablesListFromPrevStep,
        activeStageName,
        selectedTaskIndex,
        formData,
        globalVariables,
        isCdPipeline,
        formDataErrorObj,
        validateTask,
        setFormData,
        setFormDataErrorObj,
    } = useContext(pipelineContext)

    // CONSTANTS
    const emptyRowParams = {
        inputVariablesListFromPrevStep,
        activeStageName,
        selectedTaskIndex,
        formData,
        globalVariables,
        isCdPipeline,
        type,
    }
    const currentStepTypeVariable =
        formData[activeStageName].steps[selectedTaskIndex].stepType === PluginType.INLINE
            ? 'inlineStepDetail'
            : 'pluginRefStepDetail'

    const ioVariables: VariableType[] =
        formData[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable][
            type === PluginVariableType.INPUT ? 'inputVariables' : 'outputVariables'
        ]

    const ioVariablesError: { isValid: boolean; message: string }[] =
        formDataErrorObj[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable][
            type === PluginVariableType.INPUT ? 'inputVariables' : 'outputVariables'
        ]

    // STATES
    const [rows, setRows] = useState<VariableDataRowType[]>([])

    // INITIAL ROWS
    const getInitialRows = (): VariableDataRowType[] =>
        ioVariables.map(
            (
                {
                    name,
                    allowEmptyValue,
                    description,
                    format,
                    variableType,
                    value,
                    refVariableName,
                    refVariableStage,
                    valueConstraint,
                    isRuntimeArg,
                },
                id,
            ) => {
                const isInputVariableRequired = type === PluginVariableType.INPUT && !allowEmptyValue

                return {
                    data: {
                        variable: {
                            ...getVariableColumnRowProps(),
                            value: name,
                            required: isInputVariableRequired,
                            disabled: true,
                        },
                        format: {
                            ...getFormatColumnRowProps(),
                            type: DynamicDataTableRowDataType.TEXT,
                            value: format,
                            disabled: true,
                            props: {},
                        },
                        val:
                            type === PluginVariableType.INPUT
                                ? {
                                      type: DynamicDataTableRowDataType.SELECT_TEXT,
                                      value: variableType === RefVariableType.NEW ? value : refVariableName || '',
                                      props: {
                                          ...getValColumnRowProps(emptyRowParams, id).props,
                                          Icon:
                                              refVariableStage || variableType !== RefVariableType.NEW
                                                  ? getSystemVariableIcon()
                                                  : null,
                                      },
                                  }
                                : {
                                      type: DynamicDataTableRowDataType.TEXT,
                                      value: description,
                                      disabled: true,
                                      props: {},
                                  },
                    },
                    customState: {
                        choices: (valueConstraint?.choices || []).map((choiceValue, index) => ({
                            id: index,
                            value: choiceValue,
                            error: '',
                        })),
                        askValueAtRuntime: isRuntimeArg ?? false,
                        blockCustomValue: valueConstraint?.blockCustomValue ?? false,
                        selectedValue: null,
                    },
                    id,
                }
            },
        )

    useEffect(() => {
        setRows(getInitialRows())
    }, [JSON.stringify(ioVariables)])

    useEffect(() => {
        if (rows.length) {
            const updatedFormData = structuredClone(formData)
            const updatedFormDataErrorObj = structuredClone(formDataErrorObj)

            const updatedIOVariables: VariableType[] = rows.map<VariableType>(({ customState }, index) => {
                const { askValueAtRuntime, blockCustomValue, choices, selectedValue } = customState
                let variableDetail

                if (selectedValue) {
                    if (selectedValue.refVariableStepIndex) {
                        variableDetail = {
                            value: '',
                            variableType: RefVariableType.FROM_PREVIOUS_STEP,
                            refVariableStepIndex: selectedValue.refVariableStepIndex,
                            refVariableName: selectedValue.label,
                            format: selectedValue.format,
                            refVariableStage: selectedValue.refVariableStage,
                        }
                    } else if (selectedValue.variableType === RefVariableType.GLOBAL) {
                        variableDetail = {
                            variableType: RefVariableType.GLOBAL,
                            refVariableStepIndex: 0,
                            refVariableName: selectedValue.label,
                            format: selectedValue.format,
                            value: '',
                            refVariableStage: '',
                        }
                    } else {
                        variableDetail = {
                            variableType: RefVariableType.NEW,
                            value: selectedValue.label,
                            refVariableName: '',
                            refVariableStage: '',
                        }
                    }
                    if (formData[activeStageName].steps[selectedTaskIndex].stepType === PluginType.PLUGIN_REF) {
                        variableDetail.format = ioVariables[index].format
                    }
                }

                return {
                    ...ioVariables[index],
                    ...variableDetail,
                    isRuntimeArg: askValueAtRuntime,
                    valueConstraint: {
                        choices: choices.map(({ value }) => value),
                        blockCustomValue,
                        constraint: null,
                    },
                }
            })

            updatedFormData[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable][
                type === PluginVariableType.INPUT ? 'inputVariables' : 'outputVariables'
            ] = updatedIOVariables

            validateTask(
                updatedFormData[activeStageName].steps[selectedTaskIndex],
                updatedFormDataErrorObj[activeStageName].steps[selectedTaskIndex],
            )
            setFormDataErrorObj(updatedFormDataErrorObj)
            setFormData(updatedFormData)
        }
    }, [rows])

    // METHODS
    const handleRowUpdateAction = ({ actionType, actionValue, headerKey, rowId }: HandleRowUpdateActionProps) => {
        let updatedRows = [...rows]

        switch (actionType) {
            case VariableDataTableActionType.ADD_CHOICES_TO_VALUE_COLUMN_OPTIONS:
                updatedRows = updatedRows.map((row) => {
                    const { id, data, customState } = row

                    if (id === rowId) {
                        return {
                            ...row,
                            data: {
                                ...data,
                                val:
                                    data.val.type === DynamicDataTableRowDataType.SELECT_TEXT
                                        ? {
                                              ...data.val,
                                              props: {
                                                  ...data.val.props,
                                                  options: [
                                                      {
                                                          label: 'Default variables',
                                                          options: customState.choices.map(({ value }) => ({
                                                              label: value,
                                                              value,
                                                          })),
                                                      },
                                                      ...data.val.props.options.filter(
                                                          ({ label }) => label !== 'Default variables',
                                                      ),
                                                  ],
                                              },
                                          }
                                        : data.val,
                            },
                        }
                    }

                    return row
                })
                break

            case VariableDataTableActionType.UPDATE_CHOICES:
                updatedRows = updatedRows.map((row) =>
                    row.id === rowId
                        ? { ...row, customState: { ...row.customState, choices: actionValue(row.customState.choices) } }
                        : row,
                )
                break

            case VariableDataTableActionType.UPDATE_ALLOW_CUSTOM_INPUT:
                updatedRows = updatedRows.map((row) =>
                    row.id === rowId
                        ? { ...row, customState: { ...row.customState, blockCustomValue: actionValue } }
                        : row,
                )
                break

            case VariableDataTableActionType.UPDATE_ASK_VALUE_AT_RUNTIME:
                updatedRows = updatedRows.map((row) =>
                    row.id === rowId
                        ? { ...row, customState: { ...row.customState, askValueAtRuntime: actionValue } }
                        : row,
                )
                break

            case VariableDataTableActionType.UPDATE_ROW:
                updatedRows = rows.map<VariableDataRowType>((row) =>
                    row.id === rowId
                        ? {
                              ...row,
                              data: {
                                  ...row.data,
                                  [headerKey]: {
                                      ...row.data[headerKey],
                                      value: actionValue,
                                  },
                              },
                          }
                        : row,
                )
                break

            case VariableDataTableActionType.UPDATE_VAL_COLUMN:
                updatedRows = updatedRows.map((row) => {
                    if (row.id === rowId && row.data.val.type === DynamicDataTableRowDataType.SELECT_TEXT) {
                        return {
                            ...row,
                            data: {
                                ...row.data,
                                val: {
                                    ...row.data.val,
                                    value: actionValue.value,
                                    props: {
                                        ...row.data.val.props,
                                        Icon:
                                            actionValue.value &&
                                            ((actionValue.selectedValue as ExtendedOptionType).refVariableStage ||
                                                ((actionValue.selectedValue as ExtendedOptionType)?.variableType &&
                                                    (actionValue.selectedValue as ExtendedOptionType).variableType !==
                                                        RefVariableType.NEW))
                                                ? getSystemVariableIcon()
                                                : null,
                                    },
                                },
                            },
                            customState: {
                                ...row.customState,
                                selectedValue: actionValue.selectedValue,
                            },
                        }
                    }
                    return row
                })
                break

            default:
                break
        }

        setRows(updatedRows)
    }

    const dataTableHandleAddition = () => {
        const data = getEmptyVariableDataTableRow(emptyRowParams)
        const editedRows = [data, ...rows]
        setRows(editedRows)
    }

    const dataTableHandleChange = (
        updatedRow: VariableDataRowType,
        headerKey: VariableDataKeys,
        value: string,
        extraData,
    ) => {
        if (headerKey !== 'val') {
            handleRowUpdateAction({
                actionType: VariableDataTableActionType.UPDATE_ROW,
                actionValue: value,
                headerKey,
                rowId: updatedRow.id,
            })
        } else if (headerKey === 'val') {
            handleRowUpdateAction({
                actionType: VariableDataTableActionType.UPDATE_VAL_COLUMN,
                actionValue: { value, selectedValue: extraData.selectedValue },
                headerKey,
                rowId: updatedRow.id,
            })
        }
    }

    const dataTableHandleDelete = (row: VariableDataRowType) => {
        const remainingRows = rows.filter(({ id }) => id !== row.id)

        if (remainingRows.length === 0) {
            const emptyRowData = getEmptyVariableDataTableRow(emptyRowParams)
            setRows([emptyRowData])
            return
        }

        setRows(remainingRows)
    }

    const handleChoicesAddToValColumn = (rowId: string | number) => () => {
        handleRowUpdateAction({
            actionType: VariableDataTableActionType.ADD_CHOICES_TO_VALUE_COLUMN_OPTIONS,
            rowId,
            headerKey: null,
            actionValue: null,
        })
    }

    const validationSchema: DynamicDataTableProps<VariableDataKeys>['validationSchema'] = (_, key, { id }) => {
        if (key === 'val') {
            const index = rows.findIndex((row) => row.id === id)
            if (index > -1 && ioVariablesError[index]) {
                const { isValid, message } = ioVariablesError[index]
                return { isValid, errorMessages: [message] }
            }
        }

        return { isValid: true, errorMessages: [] }
    }

    const actionButtonRenderer = (row: VariableDataRowType) => (
        <VariableDataTableRowAction
            row={row}
            handleRowUpdateAction={handleRowUpdateAction}
            onClose={handleChoicesAddToValColumn(row.id)}
        />
    )

    const getActionButtonConfig = (): DynamicDataTableProps<VariableDataKeys>['actionButtonConfig'] => {
        if (type === PluginVariableType.INPUT) {
            return {
                renderer: actionButtonRenderer,
                key: 'val',
                position: 'end',
            }
        }
        return null
    }

    return (
        <DynamicDataTable
            headers={getVariableDataTableHeaders(type)}
            rows={rows}
            isAdditionNotAllowed
            isDeletionNotAllowed
            onRowEdit={dataTableHandleChange}
            onRowDelete={dataTableHandleDelete}
            onRowAdd={dataTableHandleAddition}
            showError
            validationSchema={validationSchema}
            actionButtonConfig={getActionButtonConfig()}
        />
    )
}
