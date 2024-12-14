import { useContext, useMemo } from 'react'

import {
    Button,
    ButtonVariantType,
    DynamicDataTable,
    DynamicDataTableCellErrorType,
    DynamicDataTableProps,
    DynamicDataTableRowDataType,
    InputOutputVariablesHeaderKeys,
    PluginType,
    RefVariableType,
    VariableType,
    VariableTypeFormat,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as ICAdd } from '@Icons/ic-add.svg'
import { pipelineContext } from '@Components/workflowEditor/workflowEditor'
import { PluginVariableType } from '@Components/ciPipeline/types'

import {
    FILE_UPLOAD_SIZE_UNIT_OPTIONS,
    getVariableDataTableHeaders,
    VARIABLE_DATA_TABLE_EMPTY_ROW_MESSAGE,
} from './constants'
import {
    GetValColumnRowPropsType,
    HandleRowUpdateActionProps,
    VariableDataCustomState,
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
    getVariableDataTableRows,
} from './utils'
import { getVariableDataTableCellValidateState, validateVariableDataTableVariableKeys } from './validations'

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

    const isInputPluginVariable = type === PluginVariableType.INPUT
    const currentStepTypeVariable =
        formData[activeStageName].steps[selectedTaskIndex].stepType === PluginType.INLINE
            ? 'inlineStepDetail'
            : 'pluginRefStepDetail'

    const ioVariables: VariableType[] =
        formData[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable][
            isInputPluginVariable ? 'inputVariables' : 'outputVariables'
        ]

    const ioVariablesError =
        formDataErrorObj[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable][
            isInputPluginVariable ? 'inputVariables' : 'outputVariables'
        ]

    // TABLE ROWS
    const rows = useMemo<VariableDataRowType[]>(
        () =>
            getVariableDataTableRows({
                ioVariables,
                isCustomTask,
                type,
                activeStageName,
                formData,
                globalVariables,
                selectedTaskIndex,
                inputVariablesListFromPrevStep,
                isCdPipeline,
            }),
        [ioVariables],
    )

    // TABLE CELL ERROR
    const cellError = useMemo<DynamicDataTableCellErrorType<InputOutputVariablesHeaderKeys>>(
        () =>
            Object.keys(ioVariablesError).length
                ? ioVariablesError
                : getVariableDataTableInitialCellError(rows, headers),
        [ioVariablesError, rows],
    )

    // METHODS
    const handleRowUpdateAction = (rowAction: HandleRowUpdateActionProps) => {
        const { actionType } = rowAction
        let updatedRows = rows
        const updatedCellError = cellError

        switch (actionType) {
            case VariableDataTableActionType.ADD_CHOICES_TO_VALUE_COLUMN_OPTIONS:
                updatedRows = updatedRows.map((row) => {
                    const { id, data, customState } = row

                    if (id === rowAction.rowId) {
                        const choicesOptions = rowAction.actionValue
                        // RESETTING TO DEFAULT STATE IF CHOICES ARE EMPTY
                        const blockCustomValue = !!choicesOptions.length && row.customState.blockCustomValue

                        const isCurrentValueValid =
                            !blockCustomValue ||
                            ((!customState.valColumnSelectedValue ||
                                !customState.valColumnSelectedValue?.variableType ||
                                customState.valColumnSelectedValue.variableType === RefVariableType.NEW) &&
                                choicesOptions.some((value) => value === data.val.value))

                        updatedCellError[row.id].val = getVariableDataTableCellValidateState({
                            pluginVariableType: type,
                            key: InputOutputVariablesHeaderKeys.VALUE,
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
                                        constraint: {
                                            fileProperty: getUploadFileConstraints({
                                                allowedExtensions: customState.fileInfo.allowedExtensions,
                                                maxUploadSize: customState.fileInfo.maxUploadSize,
                                                unit: customState.fileInfo.unit.label as string,
                                            }),
                                        },
                                        blockCustomValue,
                                        choices: choicesOptions,
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
                            pluginVariableType: type,
                            key: InputOutputVariablesHeaderKeys.VARIABLE,
                            row: updatedRow,
                        })
                        updatedCellError[row.id].val = getVariableDataTableCellValidateState({
                            pluginVariableType: type,
                            key: InputOutputVariablesHeaderKeys.VALUE,
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
                                  fileInfo: { ...row.customState.fileInfo, fileMountDir: rowAction.actionValue },
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
                            pluginVariableType: type,
                            value: rowAction.actionValue.fileName,
                            key: InputOutputVariablesHeaderKeys.VALUE,
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
                                    fileReferenceId: rowAction.actionValue.fileReferenceId,
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
                validateVariableDataTableVariableKeys({
                    rows: updatedRows,
                    cellError: updatedCellError,
                })
                break

            case VariableDataTableActionType.UPDATE_ROW:
                updatedRows = rows.map<VariableDataRowType>((row) => {
                    if (row.id === rowAction.rowId) {
                        updatedCellError[rowAction.rowId][rowAction.headerKey] = getVariableDataTableCellValidateState({
                            pluginVariableType: type,
                            value: rowAction.actionValue,
                            row,
                            key: rowAction.headerKey,
                        })
                        if (rowAction.headerKey === InputOutputVariablesHeaderKeys.VARIABLE) {
                            validateVariableDataTableVariableKeys({
                                rows,
                                cellError: updatedCellError,
                                rowId: rowAction.rowId,
                                value: rowAction.actionValue,
                            })
                        }

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
                            pluginVariableType: type,
                            value: valColumnRowValue,
                            key: InputOutputVariablesHeaderKeys.VALUE,
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
                                        choices: row.customState.choices,
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
                            pluginVariableType: type,
                            key: InputOutputVariablesHeaderKeys.VALUE,
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
                                    fileReferenceId: null,
                                    allowedExtensions: '',
                                    maxUploadSize: '',
                                    fileMountDir: '/devtroncd',
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
    }

    const handleRowAdd = () => {
        handleRowUpdateAction({
            actionType: VariableDataTableActionType.ADD_ROW,
            rowId: Math.floor(new Date().valueOf() * Math.random()),
        })
    }

    const handleRowEdit: DynamicDataTableProps<
        InputOutputVariablesHeaderKeys,
        VariableDataCustomState
    >['onRowEdit'] = async (updatedRow, headerKey, value, extraData) => {
        if (
            headerKey === InputOutputVariablesHeaderKeys.VALUE &&
            updatedRow.data.val.type === DynamicDataTableRowDataType.SELECT_TEXT
        ) {
            handleRowUpdateAction({
                actionType: VariableDataTableActionType.UPDATE_VAL_COLUMN,
                actionValue: { value, valColumnSelectedValue: extraData.selectedValue },
                rowId: updatedRow.id,
            })
        } else if (
            headerKey === InputOutputVariablesHeaderKeys.VALUE &&
            updatedRow.data.val.type === DynamicDataTableRowDataType.FILE_UPLOAD
        ) {
            handleRowUpdateAction({
                actionType: VariableDataTableActionType.UPDATE_FILE_UPLOAD_INFO,
                actionValue: { fileReferenceId: null, isLoading: false, fileName: value },
                rowId: updatedRow.id,
            })

            if (extraData.files.length) {
                try {
                    handleRowUpdateAction({
                        actionType: VariableDataTableActionType.UPDATE_FILE_UPLOAD_INFO,
                        actionValue: { fileReferenceId: null, isLoading: true, fileName: value },
                        rowId: updatedRow.id,
                    })

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
            }
        } else if (
            headerKey === InputOutputVariablesHeaderKeys.FORMAT &&
            updatedRow.data.format.type === DynamicDataTableRowDataType.DROPDOWN
        ) {
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

    const handleRowDelete: DynamicDataTableProps<
        InputOutputVariablesHeaderKeys,
        VariableDataCustomState
    >['onRowDelete'] = (row) => {
        handleRowUpdateAction({
            actionType: VariableDataTableActionType.DELETE_ROW,
            rowId: row.id,
        })
    }

    // RENDERERS
    const actionButtonRenderer = (row: VariableDataRowType) => (
        <ValueConfigOverlay row={row} handleRowUpdateAction={handleRowUpdateAction} />
    )

    const getTrailingCellIconForVariableColumn = (row: VariableDataRowType) =>
        isCustomTask && isInputPluginVariable ? (
            <VariableConfigOverlay row={row} handleRowUpdateAction={handleRowUpdateAction} />
        ) : null

    const getTrailingCellIconForValueColumn = (row: VariableDataRowType) =>
        isInputPluginVariable && row.data.format.value === VariableTypeFormat.FILE ? (
            <ValueConfigFileTippy fileMountDir={row.customState.fileInfo.fileMountDir} />
        ) : null

    const trailingCellIcon: DynamicDataTableProps<InputOutputVariablesHeaderKeys>['trailingCellIcon'] = {
        variable: getTrailingCellIconForVariableColumn,
        val: getTrailingCellIconForValueColumn,
    }

    return (
        <div className="flexbox-col dc__gap-12">
            {isCustomTask && (
                <div className="flexbox dc__align-items-center dc__content-space">
                    <h4 className="m-0 fs-13 lh-20 fw-6">
                        {isInputPluginVariable ? 'Input variables' : 'Output variables'}
                    </h4>
                    {!rows.length && (
                        <Button
                            dataTestId="add-io-variable-row"
                            variant={ButtonVariantType.text}
                            text="Add Variable"
                            startIcon={<ICAdd />}
                            onClick={handleRowAdd}
                        />
                    )}
                </div>
            )}
            {rows.length ? (
                <DynamicDataTable<InputOutputVariablesHeaderKeys, VariableDataCustomState>
                    headers={headers}
                    rows={rows}
                    cellError={cellError}
                    readOnly={!isCustomTask && !isInputPluginVariable}
                    isAdditionNotAllowed={!isCustomTask}
                    isDeletionNotAllowed={!isCustomTask}
                    trailingCellIcon={trailingCellIcon}
                    onRowEdit={handleRowEdit}
                    onRowDelete={handleRowDelete}
                    onRowAdd={handleRowAdd}
                    {...(isInputPluginVariable
                        ? {
                              actionButtonConfig: {
                                  renderer: actionButtonRenderer,
                                  key: InputOutputVariablesHeaderKeys.VALUE,
                                  position: 'end',
                              },
                          }
                        : {})}
                />
            ) : (
                <div className="p-8 bcn-50 dc__border-dashed--n3 br-4">
                    <p className="m-0 fs-12 lh-18 cn-7">{VARIABLE_DATA_TABLE_EMPTY_ROW_MESSAGE[type]}</p>
                </div>
            )}
        </div>
    )
}
