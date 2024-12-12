import { useContext, useState, useEffect, useRef, useMemo } from 'react'

import {
    DynamicDataTable,
    DynamicDataTableCellErrorType,
    DynamicDataTableProps,
    DynamicDataTableRowDataType,
    PluginType,
    RefVariableType,
    VariableType,
    VariableTypeFormat,
} from '@devtron-labs/devtron-fe-common-lib'

import { pipelineContext } from '@Components/workflowEditor/workflowEditor'
import { PluginVariableType } from '@Components/ciPipeline/types'

import { FILE_UPLOAD_SIZE_UNIT_OPTIONS, getVariableDataTableHeaders } from './constants'
import {
    GetValColumnRowPropsType,
    HandleRowUpdateActionProps,
    VariableDataCustomState,
    VariableDataKeys,
    VariableDataRowType,
    VariableDataTableActionType,
    VariableDataTableProps,
} from './types'
import {
    convertVariableDataTableToFormData,
    getEmptyVariableDataTableRow,
    getUploadFileConstraints,
    getValColumnRowProps,
    getValColumnRowValue,
    getVariableDataTableInitialCellError,
    getVariableDataTableInitialRows,
} from './utils'
import { getVariableDataTableCellValidateState, validateVariableDataTable } from './validations'

import { VariableDataTablePopupMenu } from './VariableDataTablePopupMenu'
import { VariableConfigOverlay } from './VariableConfigOverlay'
import { ValueConfigOverlay } from './ValueConfigOverlay'
import { ValueConfigFileTippy } from './ValueConfigFileTippy'

export const VariableDataTable = ({ type, isCustomTask = false }: VariableDataTableProps) => {
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
        calculateLastStepDetail,
        uploadFile,
    } = useContext(pipelineContext)

    // CONSTANTS
    const headers = getVariableDataTableHeaders(type)
    const defaultRowValColumnParams: GetValColumnRowPropsType = {
        inputVariablesListFromPrevStep,
        activeStageName,
        selectedTaskIndex,
        formData,
        globalVariables,
        isCdPipeline,
        type,
        format: VariableTypeFormat.STRING,
        variableType: RefVariableType.NEW,
        value: '',
        description: null,
        refVariableName: null,
        refVariableStage: null,
        valueConstraint: null,
    }

    const currentStepTypeVariable =
        formData[activeStageName].steps[selectedTaskIndex].stepType === PluginType.INLINE
            ? 'inlineStepDetail'
            : 'pluginRefStepDetail'

    const ioVariables: VariableType[] =
        formData[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable][
            type === PluginVariableType.INPUT ? 'inputVariables' : 'outputVariables'
        ]

    const isTableValid =
        formDataErrorObj[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable].isValid ?? true

    // STATES
    const [rows, setRows] = useState<VariableDataRowType[]>([])
    const [cellError, setCellError] = useState<DynamicDataTableCellErrorType<VariableDataKeys>>({})

    // KEYS FREQUENCY MAP
    const keysFrequencyMap: Record<string, number> = useMemo(
        () =>
            rows.reduce(
                (acc, curr) => {
                    const currentKey = curr.data.variable.value
                    if (currentKey) {
                        acc[currentKey] = (acc[currentKey] || 0) + 1
                    }
                    return acc
                },
                {} as Record<string, number>,
            ),
        [rows],
    )

    // REFS
    const initialRowsSet = useRef('')

    useEffect(() => {
        // SETTING INITIAL ROWS & ERROR STATE
        const initialRows = getVariableDataTableInitialRows({
            ioVariables,
            isCustomTask,
            type,
            activeStageName,
            formData,
            globalVariables,
            selectedTaskIndex,
            inputVariablesListFromPrevStep,
            isCdPipeline,
        })
        const updatedCellError = getVariableDataTableInitialCellError(initialRows, headers)

        setRows(initialRows)
        setCellError(updatedCellError)

        initialRowsSet.current = 'set'
    }, [])

    useEffect(() => {
        // Validate the table when:
        // 1. Rows have been initialized (`initialRowsSet.current` is 'set' & rows is not empty).
        // 2. Validation is explicitly triggered (`formDataErrorObj.triggerValidation` is true)
        //    or the table is currently invalid (`!isTableValid` -> this is only triggered on mount)
        if (initialRowsSet.current === 'set' && rows.length && (formDataErrorObj.triggerValidation || !isTableValid)) {
            setCellError(
                validateVariableDataTable({
                    headers,
                    rows,
                    keysFrequencyMap,
                    pluginVariableType: type,
                }),
            )
            // Reset the triggerValidation flag after validation is complete.
            setFormDataErrorObj((prevState) => ({
                ...prevState,
                triggerValidation: false,
            }))
        }
    }, [initialRowsSet.current, formDataErrorObj.triggerValidation])

    // METHODS
    const handleRowUpdateAction = (rowAction: HandleRowUpdateActionProps) => {
        const { actionType } = rowAction
        let updatedRows = rows
        const updatedCellError = structuredClone(cellError)

        switch (actionType) {
            case VariableDataTableActionType.ADD_CHOICES_TO_VALUE_COLUMN_OPTIONS:
                updatedRows = updatedRows.map((row) => {
                    const { id, data, customState } = row

                    if (id === rowAction.rowId) {
                        // FILTERING EMPTY CHOICE VALUES
                        const choicesOptions = customState.choices.filter(({ value }) => !!value)
                        // RESETTING TO DEFAULT STATE IF CHOICES ARE EMPTY
                        const blockCustomValue = !!choicesOptions.length && row.customState.blockCustomValue

                        const isCurrentValueValid =
                            !blockCustomValue ||
                            ((!customState.valColumnSelectedValue ||
                                customState.valColumnSelectedValue?.variableType === RefVariableType.NEW) &&
                                choicesOptions.some(({ value }) => value === data.val.value))

                        updatedCellError[row.id].val = getVariableDataTableCellValidateState({
                            keysFrequencyMap,
                            pluginVariableType: type,
                            key: 'val',
                            row,
                        })

                        return {
                            ...row,
                            data: {
                                ...data,
                                val: getValColumnRowProps({
                                    ...defaultRowValColumnParams,
                                    ...(!blockCustomValue && customState.valColumnSelectedValue
                                        ? {
                                              variableType: customState.valColumnSelectedValue.variableType,
                                              refVariableName: customState.valColumnSelectedValue.value,
                                              refVariableStage: customState.valColumnSelectedValue.refVariableStage,
                                          }
                                        : {}),
                                    value: isCurrentValueValid ? data.val.value : '',
                                    format: data.format.value as VariableTypeFormat,
                                    valueConstraint: {
                                        blockCustomValue,
                                        choices: choicesOptions.map(({ value }) => value),
                                    },
                                }),
                            },
                            customState: {
                                ...customState,
                                valColumnSelectedValue: !blockCustomValue ? customState.valColumnSelectedValue : null,
                                blockCustomValue,
                                choices: choicesOptions,
                            },
                        }
                    }

                    return row
                })
                break

            case VariableDataTableActionType.UPDATE_CHOICES:
                updatedRows = updatedRows.map((row) =>
                    row.id === rowAction.rowId
                        ? {
                              ...row,
                              customState: {
                                  ...row.customState,
                                  choices: rowAction.actionValue(row.customState.choices),
                              },
                          }
                        : row,
                )
                break

            case VariableDataTableActionType.UPDATE_ALLOW_CUSTOM_INPUT:
                updatedRows = updatedRows.map((row) =>
                    row.id === rowAction.rowId
                        ? {
                              ...row,
                              customState: {
                                  ...row.customState,
                                  blockCustomValue: rowAction.actionValue,
                              },
                          }
                        : row,
                )
                break

            case VariableDataTableActionType.UPDATE_ASK_VALUE_AT_RUNTIME:
                updatedRows = updatedRows.map((row) => {
                    if (row.id === rowAction.rowId) {
                        return { ...row, customState: { ...row.customState, askValueAtRuntime: rowAction.actionValue } }
                    }

                    return row
                })
                break

            case VariableDataTableActionType.UPDATE_VARIABLE_DESCRIPTION:
                updatedRows = updatedRows.map((row) =>
                    row.id === rowAction.rowId
                        ? {
                              ...row,
                              customState: { ...row.customState, variableDescription: rowAction.actionValue },
                          }
                        : row,
                )
                break

            case VariableDataTableActionType.UPDATE_VARIABLE_REQUIRED:
                updatedRows = updatedRows.map((row) => {
                    if (row.id === rowAction.rowId) {
                        const updatedRow = {
                            ...row,
                            data: {
                                ...row.data,
                                variable: { ...row.data.variable, required: rowAction.actionValue },
                            },
                            customState: { ...row.customState, isVariableRequired: rowAction.actionValue },
                        }
                        updatedCellError[row.id].variable = getVariableDataTableCellValidateState({
                            keysFrequencyMap,
                            pluginVariableType: type,
                            key: 'variable',
                            row: updatedRow,
                        })
                        updatedCellError[row.id].val = getVariableDataTableCellValidateState({
                            keysFrequencyMap,
                            pluginVariableType: type,
                            key: 'val',
                            row: updatedRow,
                        })

                        return updatedRow
                    }

                    return row
                })
                break

            case VariableDataTableActionType.UPDATE_FILE_MOUNT:
                updatedRows = updatedRows.map((row) =>
                    row.id === rowAction.rowId
                        ? {
                              ...row,
                              customState: {
                                  ...row.customState,
                                  fileInfo: { ...row.customState.fileInfo, mountDir: rowAction.actionValue },
                              },
                          }
                        : row,
                )
                break

            case VariableDataTableActionType.UPDATE_FILE_ALLOWED_EXTENSIONS:
                updatedRows = updatedRows.map((row) =>
                    row.id === rowAction.rowId
                        ? {
                              ...row,
                              data:
                                  row.data.val.type === DynamicDataTableRowDataType.FILE_UPLOAD
                                      ? {
                                            ...row.data,
                                            val: {
                                                ...row.data.val,
                                                props: {
                                                    ...row.data.val.props,
                                                    fileTypes: rowAction.actionValue.split(','),
                                                },
                                            },
                                        }
                                      : row.data,
                              customState: {
                                  ...row.customState,
                                  fileInfo: {
                                      ...row.customState.fileInfo,
                                      allowedExtensions: rowAction.actionValue,
                                  },
                              },
                          }
                        : row,
                )
                break

            case VariableDataTableActionType.UPDATE_FILE_MAX_SIZE:
                updatedRows = updatedRows.map((row) =>
                    row.id === rowAction.rowId
                        ? {
                              ...row,
                              customState: {
                                  ...row.customState,
                                  fileInfo: {
                                      ...row.customState.fileInfo,
                                      maxUploadSize: rowAction.actionValue.size,
                                      unit: rowAction.actionValue.unit,
                                  },
                              },
                          }
                        : row,
                )
                break

            case VariableDataTableActionType.UPDATE_FILE_UPLOAD_INFO:
                updatedRows = updatedRows.map((row) => {
                    if (row.id === rowAction.rowId && row.data.val.type === DynamicDataTableRowDataType.FILE_UPLOAD) {
                        updatedCellError[row.id].val = getVariableDataTableCellValidateState({
                            keysFrequencyMap,
                            pluginVariableType: type,
                            value: rowAction.actionValue.fileName,
                            key: 'val',
                            row,
                        })

                        return {
                            ...row,
                            data: {
                                ...row.data,
                                val: {
                                    ...row.data.val,
                                    value: rowAction.actionValue.fileName,
                                    props: {
                                        ...row.data.val.props,
                                        isLoading: rowAction.actionValue.isLoading,
                                    },
                                },
                            },
                            customState: {
                                ...row.customState,
                                fileInfo: {
                                    ...row.customState.fileInfo,
                                    id: rowAction.actionValue.fileReferenceId,
                                },
                            },
                        }
                    }

                    return row
                })
                break

            case VariableDataTableActionType.ADD_ROW:
                updatedRows = [
                    getEmptyVariableDataTableRow({ ...defaultRowValColumnParams, id: rowAction.rowId }),
                    ...updatedRows,
                ]
                updatedCellError[rowAction.rowId] = {}
                break

            case VariableDataTableActionType.DELETE_ROW:
                updatedRows = updatedRows.filter((row) => row.id !== rowAction.rowId)
                delete updatedCellError[rowAction.rowId]
                break

            case VariableDataTableActionType.UPDATE_ROW:
                updatedRows = rows.map<VariableDataRowType>((row) => {
                    if (row.id === rowAction.rowId) {
                        updatedCellError[row.id][rowAction.headerKey] = getVariableDataTableCellValidateState({
                            keysFrequencyMap,
                            pluginVariableType: type,
                            value: rowAction.actionValue,
                            key: rowAction.headerKey,
                            row,
                        })

                        return {
                            ...row,
                            data: {
                                ...row.data,
                                [rowAction.headerKey]: {
                                    ...row.data[rowAction.headerKey],
                                    value: rowAction.actionValue,
                                },
                            },
                        }
                    }
                    return row
                })
                break

            case VariableDataTableActionType.UPDATE_VAL_COLUMN:
                updatedRows = updatedRows.map((row) => {
                    if (row.id === rowAction.rowId && row.data.val.type === DynamicDataTableRowDataType.SELECT_TEXT) {
                        const { valColumnSelectedValue, value } = rowAction.actionValue
                        const valColumnRowValue = getValColumnRowValue(
                            row.data.format.value as VariableTypeFormat,
                            value,
                            valColumnSelectedValue,
                        )

                        updatedCellError[row.id].val = getVariableDataTableCellValidateState({
                            keysFrequencyMap,
                            pluginVariableType: type,
                            value: valColumnRowValue,
                            key: 'val',
                            row,
                        })

                        return {
                            ...row,
                            data: {
                                ...row.data,
                                val: getValColumnRowProps({
                                    ...defaultRowValColumnParams,
                                    value: valColumnRowValue,
                                    ...(!row.customState.blockCustomValue &&
                                    rowAction.actionValue.valColumnSelectedValue
                                        ? {
                                              variableType: rowAction.actionValue.valColumnSelectedValue.variableType,
                                              refVariableName: rowAction.actionValue.valColumnSelectedValue.value,
                                              refVariableStage:
                                                  rowAction.actionValue.valColumnSelectedValue.refVariableStage,
                                          }
                                        : {}),
                                    format: row.data.format.value as VariableTypeFormat,
                                    valueConstraint: {
                                        blockCustomValue: row.customState.blockCustomValue,
                                        choices: row.customState.choices.map((choice) => choice.value),
                                    },
                                }),
                            },
                            customState: {
                                ...row.customState,
                                valColumnSelectedValue: rowAction.actionValue.valColumnSelectedValue,
                            },
                        }
                    }

                    return row
                })
                break

            case VariableDataTableActionType.UPDATE_FORMAT_COLUMN:
                updatedRows = updatedRows.map((row) => {
                    if (row.id === rowAction.rowId && row.data.format.type === DynamicDataTableRowDataType.DROPDOWN) {
                        updatedCellError[row.id].val = getVariableDataTableCellValidateState({
                            keysFrequencyMap,
                            pluginVariableType: type,
                            key: 'val',
                            row,
                        })

                        return {
                            ...row,
                            data: {
                                ...row.data,
                                format: {
                                    ...row.data.format,
                                    value: rowAction.actionValue,
                                },
                                val: getValColumnRowProps({
                                    ...defaultRowValColumnParams,
                                    format: rowAction.actionValue,
                                }),
                            },
                            customState: {
                                ...row.customState,
                                valColumnSelectedValue: null,
                                choices: [],
                                blockCustomValue: false,
                                fileInfo: {
                                    id: null,
                                    allowedExtensions: '',
                                    maxUploadSize: '',
                                    mountDir: {
                                        value: '/devtroncd',
                                        error: '',
                                    },
                                    unit: FILE_UPLOAD_SIZE_UNIT_OPTIONS[0],
                                },
                            },
                        }
                    }
                    return row
                })
                break

            default:
                break
        }

        const { updatedFormData, updatedFormDataErrorObj } = convertVariableDataTableToFormData({
            rows: updatedRows,
            cellError: updatedCellError,
            activeStageName,
            formData,
            formDataErrorObj,
            selectedTaskIndex,
            type,
            validateTask,
            calculateLastStepDetail,
        })
        setFormDataErrorObj(updatedFormDataErrorObj)
        setFormData(updatedFormData)

        setRows(updatedRows)
        setCellError(updatedCellError)
    }

    const dataTableHandleAddition = () => {
        handleRowUpdateAction({
            actionType: VariableDataTableActionType.ADD_ROW,
            rowId: Math.floor(new Date().valueOf() * Math.random()),
        })
    }

    const dataTableHandleChange: DynamicDataTableProps<VariableDataKeys, VariableDataCustomState>['onRowEdit'] = async (
        updatedRow,
        headerKey,
        value,
        extraData,
    ) => {
        if (headerKey === 'val' && updatedRow.data.val.type === DynamicDataTableRowDataType.SELECT_TEXT) {
            handleRowUpdateAction({
                actionType: VariableDataTableActionType.UPDATE_VAL_COLUMN,
                actionValue: { value, valColumnSelectedValue: extraData.selectedValue },
                rowId: updatedRow.id,
            })
        } else if (
            headerKey === 'val' &&
            updatedRow.data.val.type === DynamicDataTableRowDataType.FILE_UPLOAD &&
            extraData.files.length
        ) {
            handleRowUpdateAction({
                actionType: VariableDataTableActionType.UPDATE_FILE_UPLOAD_INFO,
                actionValue: { fileReferenceId: null, isLoading: true, fileName: value },
                rowId: updatedRow.id,
            })

            try {
                const { id, name } = await uploadFile({
                    file: extraData.files,
                    ...getUploadFileConstraints({
                        unit: updatedRow.customState.fileInfo.unit.label as string,
                        allowedExtensions: updatedRow.customState.fileInfo.allowedExtensions,
                        maxUploadSize: updatedRow.customState.fileInfo.maxUploadSize,
                    }),
                })

                handleRowUpdateAction({
                    actionType: VariableDataTableActionType.UPDATE_FILE_UPLOAD_INFO,
                    actionValue: { fileReferenceId: id, isLoading: false, fileName: name },
                    rowId: updatedRow.id,
                })
            } catch {
                handleRowUpdateAction({
                    actionType: VariableDataTableActionType.UPDATE_FILE_UPLOAD_INFO,
                    actionValue: { fileReferenceId: null, isLoading: false, fileName: '' },
                    rowId: updatedRow.id,
                })
            }
        } else if (headerKey === 'format' && updatedRow.data.format.type === DynamicDataTableRowDataType.DROPDOWN) {
            handleRowUpdateAction({
                actionType: VariableDataTableActionType.UPDATE_FORMAT_COLUMN,
                actionValue: value as VariableTypeFormat,
                rowId: updatedRow.id,
            })
        } else {
            handleRowUpdateAction({
                actionType: VariableDataTableActionType.UPDATE_ROW,
                actionValue: value,
                headerKey,
                rowId: updatedRow.id,
            })
        }
    }

    const dataTableHandleDelete: DynamicDataTableProps<VariableDataKeys, VariableDataCustomState>['onRowDelete'] = (
        row,
    ) => {
        handleRowUpdateAction({
            actionType: VariableDataTableActionType.DELETE_ROW,
            rowId: row.id,
        })
    }

    const onActionButtonPopupClose = (rowId: string | number) => () => {
        handleRowUpdateAction({
            actionType: VariableDataTableActionType.ADD_CHOICES_TO_VALUE_COLUMN_OPTIONS,
            rowId,
        })
    }

    // RENDERERS
    const actionButtonRenderer = (row: VariableDataRowType) => (
        <VariableDataTablePopupMenu
            heading={row.data.variable.value || 'Value configuration'}
            onClose={onActionButtonPopupClose(row.id)}
            disableClose={
                (row.data.format.value === VariableTypeFormat.FILE && !!row.customState.fileInfo.mountDir.error) ||
                (row.data.format.value === VariableTypeFormat.NUMBER &&
                    row.customState.choices.some(({ error }) => !!error))
            }
        >
            <ValueConfigOverlay row={row} handleRowUpdateAction={handleRowUpdateAction} />
        </VariableDataTablePopupMenu>
    )

    const getTrailingCellIconForVariableColumn = (row: VariableDataRowType) =>
        isCustomTask && type === PluginVariableType.INPUT ? (
            <VariableDataTablePopupMenu showIcon heading="Variable configuration">
                <VariableConfigOverlay row={row} handleRowUpdateAction={handleRowUpdateAction} />
            </VariableDataTablePopupMenu>
        ) : null

    const getTrailingCellIconForValueColumn = (row: VariableDataRowType) =>
        row.data.format.value === VariableTypeFormat.FILE ? (
            <ValueConfigFileTippy mountDir={row.customState.fileInfo.mountDir.value} />
        ) : null

    const trailingCellIcon: DynamicDataTableProps<VariableDataKeys>['trailingCellIcon'] = {
        variable: getTrailingCellIconForVariableColumn,
        val: getTrailingCellIconForValueColumn,
    }

    return (
        <DynamicDataTable<VariableDataKeys, VariableDataCustomState>
            key={initialRowsSet.current}
            headers={headers}
            rows={rows}
            cellError={cellError}
            readOnly={!isCustomTask && type === PluginVariableType.OUTPUT}
            isAdditionNotAllowed={!isCustomTask}
            isDeletionNotAllowed={!isCustomTask}
            trailingCellIcon={trailingCellIcon}
            onRowEdit={dataTableHandleChange}
            onRowDelete={dataTableHandleDelete}
            onRowAdd={dataTableHandleAddition}
            {...(type === PluginVariableType.INPUT
                ? {
                      actionButtonConfig: {
                          renderer: actionButtonRenderer,
                          key: 'val',
                          position: 'end',
                      },
                  }
                : {})}
        />
    )
}
