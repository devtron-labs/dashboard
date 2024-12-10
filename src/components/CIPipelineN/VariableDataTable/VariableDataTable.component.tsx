import { useContext, useState, useEffect, useRef, useMemo } from 'react'

import {
    DynamicDataTable,
    DynamicDataTableProps,
    DynamicDataTableRowDataType,
    PluginType,
    RefVariableType,
    SystemVariableIcon,
    VariableType,
    VariableTypeFormat,
} from '@devtron-labs/devtron-fe-common-lib'

import { pipelineContext } from '@Components/workflowEditor/workflowEditor'
import { PluginVariableType } from '@Components/ciPipeline/types'

import {
    FILE_UPLOAD_SIZE_UNIT_OPTIONS,
    getVariableDataTableHeaders,
    VAL_COLUMN_CHOICES_DROPDOWN_LABEL,
} from './constants'
import {
    HandleRowUpdateActionProps,
    VariableDataCustomState,
    VariableDataKeys,
    VariableDataRowType,
    VariableDataTableActionType,
    VariableDataTableProps,
} from './types'
import {
    checkForSystemVariable,
    convertVariableDataTableToFormData,
    getEmptyVariableDataTableRow,
    getUploadFileConstraints,
    getValColumnRowProps,
    getValColumnRowValue,
    getVariableDataTableInitialRows,
} from './utils'
import { getVariableDataTableValidationSchema } from './validationSchema'

import { VariableDataTablePopupMenu } from './VariableDataTablePopupMenu'
import { VariableConfigOverlay } from './VariableConfigOverlay'
import { ValueConfigOverlay } from './ValueConfigOverlay'

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
    const emptyRowParams = {
        inputVariablesListFromPrevStep,
        activeStageName,
        selectedTaskIndex,
        formData,
        globalVariables,
        isCdPipeline,
        type,
        description: null,
        format: VariableTypeFormat.STRING,
        variableType: RefVariableType.NEW,
        value: '',
        refVariableName: null,
        refVariableStage: null,
        valueConstraint: null,
        id: 0,
    }

    const currentStepTypeVariable =
        formData[activeStageName].steps[selectedTaskIndex].stepType === PluginType.INLINE
            ? 'inlineStepDetail'
            : 'pluginRefStepDetail'

    const ioVariables: VariableType[] =
        formData[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable][
            type === PluginVariableType.INPUT ? 'inputVariables' : 'outputVariables'
        ]

    // STATES
    const [rows, setRows] = useState<VariableDataRowType[]>([])

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
        setRows(getVariableDataTableInitialRows({ emptyRowParams, ioVariables, isCustomTask, type }))
        initialRowsSet.current = 'set'
    }, [])

    // METHODS
    const handleRowUpdateAction = (rowAction: HandleRowUpdateActionProps) => {
        const { actionType } = rowAction

        setRows((prevRows) => {
            let updatedRows = [...prevRows]
            switch (actionType) {
                case VariableDataTableActionType.ADD_CHOICES_TO_VALUE_COLUMN_OPTIONS:
                    updatedRows = updatedRows.map((row) => {
                        const { id, data, customState } = row
                        const choicesOptions = customState.choices
                            .filter(({ value }) => !!value)
                            .map(({ value }) => ({ label: value, value }))

                        if (id === rowAction.rowId && choicesOptions.length > 0) {
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
                                                      options: data.val.props.options.map((option) =>
                                                          option.label === VAL_COLUMN_CHOICES_DROPDOWN_LABEL
                                                              ? {
                                                                    label: VAL_COLUMN_CHOICES_DROPDOWN_LABEL,
                                                                    options: choicesOptions,
                                                                }
                                                              : option,
                                                      ),
                                                  },
                                              }
                                            : getValColumnRowProps({
                                                  ...emptyRowParams,
                                                  valueConstraint: {
                                                      choices: choicesOptions.map(({ label }) => label),
                                                  },
                                              }),
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
                                  data: {
                                      ...row.data,
                                      ...(row.data.val.type === DynamicDataTableRowDataType.SELECT_TEXT
                                          ? {
                                                val: {
                                                    ...row.data.val,
                                                    props: {
                                                        ...row.data.val.props,
                                                        selectPickerProps: {
                                                            isCreatable:
                                                                row.data.format.value !== VariableTypeFormat.BOOL &&
                                                                row.data.format.value !== VariableTypeFormat.DATE &&
                                                                !row.customState?.blockCustomValue,
                                                        },
                                                    },
                                                },
                                            }
                                          : {}),
                                  },
                                  customState: { ...row.customState, blockCustomValue: rowAction.actionValue },
                              }
                            : row,
                    )
                    break

                case VariableDataTableActionType.UPDATE_ASK_VALUE_AT_RUNTIME:
                    updatedRows = updatedRows.map((row) =>
                        row.id === rowAction.rowId
                            ? { ...row, customState: { ...row.customState, askValueAtRuntime: rowAction.actionValue } }
                            : row,
                    )
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
                    updatedRows = updatedRows.map((row) =>
                        row.id === rowAction.rowId
                            ? {
                                  ...row,
                                  data: {
                                      ...row.data,
                                      variable: { ...row.data.variable, required: rowAction.actionValue },
                                  },
                                  customState: { ...row.customState, isVariableRequired: rowAction.actionValue },
                              }
                            : row,
                    )
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

                case VariableDataTableActionType.ADD_ROW:
                    updatedRows = [
                        getEmptyVariableDataTableRow({ ...emptyRowParams, id: rowAction.actionValue }),
                        ...updatedRows,
                    ]
                    break

                case VariableDataTableActionType.DELETE_ROW:
                    updatedRows = updatedRows.filter((row) => row.id !== rowAction.rowId)
                    break

                case VariableDataTableActionType.UPDATE_ROW:
                    updatedRows = rows.map<VariableDataRowType>((row) =>
                        row.id === rowAction.rowId
                            ? {
                                  ...row,
                                  data: {
                                      ...row.data,
                                      [rowAction.headerKey]: {
                                          ...row.data[rowAction.headerKey],
                                          value: rowAction.actionValue,
                                      },
                                  },
                              }
                            : row,
                    )
                    break

                case VariableDataTableActionType.UPDATE_FILE_UPLOAD_INFO:
                    updatedRows = updatedRows.map((row) =>
                        row.id === rowAction.rowId
                            ? {
                                  ...row,
                                  customState: {
                                      ...row.customState,
                                      fileInfo: {
                                          ...row.customState.fileInfo,
                                          id: rowAction.actionValue.fileReferenceId,
                                      },
                                  },
                              }
                            : row,
                    )
                    break

                case VariableDataTableActionType.UPDATE_VAL_COLUMN:
                    updatedRows = updatedRows.map((row) => {
                        if (
                            row.id === rowAction.rowId &&
                            row.data.val.type === DynamicDataTableRowDataType.SELECT_TEXT
                        ) {
                            const { selectedValue, value } = rowAction.actionValue
                            const isSystemVariable = checkForSystemVariable(selectedValue)

                            return {
                                ...row,
                                data: {
                                    ...row.data,
                                    val: {
                                        ...row.data.val,
                                        value: getValColumnRowValue(
                                            row.data.format.value as VariableTypeFormat,
                                            value,
                                            selectedValue,
                                        ),
                                        props: {
                                            ...row.data.val.props,
                                            Icon: value && isSystemVariable ? <SystemVariableIcon /> : null,
                                        },
                                    },
                                },
                                customState: {
                                    ...row.customState,
                                    selectedValue: rowAction.actionValue.selectedValue,
                                },
                            }
                        }

                        return row
                    })
                    break

                case VariableDataTableActionType.UPDATE_FORMAT_COLUMN:
                    updatedRows = updatedRows.map((row) => {
                        if (
                            row.id === rowAction.rowId &&
                            row.data.format.type === DynamicDataTableRowDataType.DROPDOWN
                        ) {
                            return {
                                ...row,
                                data: {
                                    ...row.data,
                                    format: {
                                        ...row.data.format,
                                        value: rowAction.actionValue,
                                    },
                                    val: getValColumnRowProps({
                                        ...emptyRowParams,
                                        format: rowAction.actionValue,
                                        id: rowAction.rowId as number,
                                    }),
                                },
                                customState: {
                                    isVariableRequired: false,
                                    variableDescription: '',
                                    selectedValue: null,
                                    choices: [],
                                    blockCustomValue: false,
                                    askValueAtRuntime: false,
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

            return updatedRows
        })
    }

    const dataTableHandleAddition = () => {
        handleRowUpdateAction({
            actionType: VariableDataTableActionType.ADD_ROW,
            actionValue: Math.floor(new Date().valueOf() * Math.random()),
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
                actionValue: { value, selectedValue: extraData.selectedValue, files: extraData.files },
                rowId: updatedRow.id,
            })
        } else if (
            headerKey === 'val' &&
            updatedRow.data.val.type === DynamicDataTableRowDataType.FILE_UPLOAD &&
            extraData.files.length
        ) {
            // TODO: check this merge with UPDATE_FILE_UPLOAD_INFO after loading state
            handleRowUpdateAction({
                actionType: VariableDataTableActionType.UPDATE_ROW,
                actionValue: value,
                headerKey,
                rowId: updatedRow.id,
            })

            try {
                const { id } = await uploadFile({
                    file: extraData.files,
                    ...getUploadFileConstraints({
                        unit: updatedRow.customState.fileInfo.unit.label as string,
                        allowedExtensions: updatedRow.customState.fileInfo.allowedExtensions,
                        maxUploadSize: updatedRow.customState.fileInfo.maxUploadSize,
                    }),
                })

                handleRowUpdateAction({
                    actionType: VariableDataTableActionType.UPDATE_FILE_UPLOAD_INFO,
                    actionValue: { fileReferenceId: id },
                    rowId: updatedRow.id,
                })
            } catch {
                handleRowUpdateAction({
                    actionType: VariableDataTableActionType.UPDATE_ROW,
                    actionValue: '',
                    headerKey,
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
                row.data.format.value === VariableTypeFormat.FILE && !!row.customState.fileInfo.mountDir.error
            }
        >
            <ValueConfigOverlay row={row} handleRowUpdateAction={handleRowUpdateAction} />
        </VariableDataTablePopupMenu>
    )

    const variableTrailingCellIcon = (row: VariableDataRowType) => (
        <VariableDataTablePopupMenu showIcon heading="Variable configuration">
            <VariableConfigOverlay row={row} handleRowUpdateAction={handleRowUpdateAction} />
        </VariableDataTablePopupMenu>
    )

    const trailingCellIcon: DynamicDataTableProps<VariableDataKeys>['trailingCellIcon'] = {
        variable: isCustomTask && type === PluginVariableType.INPUT ? variableTrailingCellIcon : null,
    }

    return (
        <DynamicDataTable<VariableDataKeys, VariableDataCustomState>
            key={initialRowsSet.current}
            headers={getVariableDataTableHeaders(type)}
            rows={rows}
            readOnly={!isCustomTask && type === PluginVariableType.OUTPUT}
            isAdditionNotAllowed={!isCustomTask}
            isDeletionNotAllowed={!isCustomTask}
            trailingCellIcon={trailingCellIcon}
            onRowEdit={dataTableHandleChange}
            onRowDelete={dataTableHandleDelete}
            onRowAdd={dataTableHandleAddition}
            showError
            validationSchema={getVariableDataTableValidationSchema({ keysFrequencyMap, pluginVariableType: type })}
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
