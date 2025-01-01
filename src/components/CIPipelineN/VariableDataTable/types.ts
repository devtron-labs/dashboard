import { PluginVariableType } from '@Components/ciPipeline/types'
import { PipelineContext } from '@Components/workflowEditor/types'
import {
    DynamicDataTableCellErrorType,
    DynamicDataTableRowType,
    InputOutputVariablesHeaderKeys,
    RefVariableStageType,
    RefVariableType,
    SelectPickerOptionType,
    TippyCustomizedProps,
    VariableType,
    VariableTypeFormat,
} from '@devtron-labs/devtron-fe-common-lib'

export interface VariableDataTableProps {
    type: PluginVariableType
    isCustomTask?: boolean
}

export interface VariableDataTableSelectPickerOptionType extends SelectPickerOptionType<string> {
    format?: VariableTypeFormat
    variableType?: RefVariableType
    refVariableStage?: RefVariableStageType
    refVariableName?: string
    refVariableStepIndex?: number
}

export type VariableDataCustomState = {
    defaultValue: string
    variableDescription: string
    isVariableRequired: boolean
    choices: string[]
    askValueAtRuntime: boolean
    blockCustomValue: boolean
    valColumnSelectedValue: VariableDataTableSelectPickerOptionType
    fileInfo: Pick<VariableType, 'fileReferenceId' | 'fileMountDir'> & {
        allowedExtensions: string
        maxUploadSize: string
        sizeUnit: SelectPickerOptionType<number>
    }
}

export type VariableDataRowType = DynamicDataTableRowType<InputOutputVariablesHeaderKeys, VariableDataCustomState>

export enum VariableDataTableActionType {
    // GENERAL ACTIONS
    ADD_ROW = 'add-row',
    UPDATE_ROW = 'update_row',
    DELETE_ROW = 'delete_row',
    UPDATE_VAL_COLUMN = 'update_val_column',
    UPDATE_FORMAT_COLUMN = 'update_format_column',
    UPDATE_FILE_UPLOAD_INFO = 'update_file_upload_info',

    // TABLE ROW ACTIONS
    ADD_CHOICES_TO_VALUE_COLUMN_OPTIONS = 'add_choices_to_value_column_options',
    UPDATE_ASK_VALUE_AT_RUNTIME = 'update_ask_value_at_runtime',
    UPDATE_ALLOW_CUSTOM_INPUT = 'update_allow_custom_input',
    UPDATE_FILE_MOUNT = 'update_file_mount',
    UPDATE_FILE_ALLOWED_EXTENSIONS = 'update_file_allowed_extensions',
    UPDATE_FILE_MAX_SIZE = 'update_file_max_size',

    // VARIABLE COLUMN ACTIONS
    UPDATE_VARIABLE_DESCRIPTION = 'update_variable_description',
    UPDATE_VARIABLE_REQUIRED = 'update_variable_required',
}

type VariableDataTableActionPropsMap = {
    [VariableDataTableActionType.ADD_ROW]: {}
    [VariableDataTableActionType.UPDATE_ROW]: {
        actionValue: string
        headerKey: InputOutputVariablesHeaderKeys
    }
    [VariableDataTableActionType.DELETE_ROW]: {}
    [VariableDataTableActionType.UPDATE_VAL_COLUMN]: {
        actionValue: {
            value: string
            valColumnSelectedValue: VariableDataTableSelectPickerOptionType
        }
    }
    [VariableDataTableActionType.UPDATE_FORMAT_COLUMN]: {
        actionValue: VariableTypeFormat
    }
    [VariableDataTableActionType.UPDATE_FILE_UPLOAD_INFO]: {
        actionValue: Pick<VariableType, 'fileReferenceId'> & {
            fileName: string
        }
    }

    [VariableDataTableActionType.UPDATE_ALLOW_CUSTOM_INPUT]: {
        actionValue: VariableDataCustomState['blockCustomValue']
    }
    [VariableDataTableActionType.UPDATE_ASK_VALUE_AT_RUNTIME]: {
        actionValue: VariableDataCustomState['askValueAtRuntime']
    }
    [VariableDataTableActionType.ADD_CHOICES_TO_VALUE_COLUMN_OPTIONS]: {
        actionValue: string[]
    }
    [VariableDataTableActionType.UPDATE_FILE_MOUNT]: {
        actionValue: VariableDataCustomState['fileInfo']['fileMountDir']
    }
    [VariableDataTableActionType.UPDATE_FILE_ALLOWED_EXTENSIONS]: {
        actionValue: string
    }
    [VariableDataTableActionType.UPDATE_FILE_MAX_SIZE]: {
        actionValue: Pick<VariableDataCustomState['fileInfo'], 'maxUploadSize' | 'sizeUnit'>
    }

    [VariableDataTableActionType.UPDATE_VARIABLE_DESCRIPTION]: {
        actionValue: VariableDataCustomState['variableDescription']
    }
    [VariableDataTableActionType.UPDATE_VARIABLE_REQUIRED]: {
        actionValue: VariableDataCustomState['isVariableRequired']
    }
}

export type VariableDataTableAction<
    T extends keyof VariableDataTableActionPropsMap = keyof VariableDataTableActionPropsMap,
> = T extends keyof VariableDataTableActionPropsMap
    ? { actionType: T; rowId: string | number } & VariableDataTableActionPropsMap[T]
    : never

export type HandleRowUpdateActionProps = VariableDataTableAction

export interface VariableDataTablePopupMenuProps extends Pick<TippyCustomizedProps, 'placement'> {
    heading: string
    showHeaderIcon?: boolean
    showIconDot?: boolean
    disableClose?: boolean
    onClose?: () => void
    children: JSX.Element
}

export interface ConfigOverlayProps {
    row: VariableDataRowType
    handleRowUpdateAction: (props: HandleRowUpdateActionProps) => void
}

export type GetValColumnRowPropsType = Pick<
    PipelineContext,
    | 'activeStageName'
    | 'formData'
    | 'globalVariables'
    | 'isCdPipeline'
    | 'selectedTaskIndex'
    | 'inputVariablesListFromPrevStep'
> &
    Pick<
        VariableType,
        'format' | 'value' | 'refVariableName' | 'refVariableStage' | 'valueConstraint' | 'description' | 'variableType'
    > & { type: PluginVariableType; isFileUploading?: boolean }

export interface GetVariableDataTableInitialRowsProps
    extends Omit<
        GetValColumnRowPropsType,
        | 'description'
        | 'format'
        | 'variableType'
        | 'value'
        | 'refVariableName'
        | 'refVariableStage'
        | 'valueConstraint'
        | 'isFileUploading'
    > {
    ioVariables: VariableType[]
    type: PluginVariableType
    isCustomTask: boolean
    idToIsFileUploadingMap: Record<string | number, boolean>
}

export type GetValidateCellProps = {
    pluginVariableType: PluginVariableType
    row: VariableDataRowType
    value?: string
    key: InputOutputVariablesHeaderKeys
}

export interface ValidateVariableDataTableKeysProps {
    rows: VariableDataRowType[]
    cellError: DynamicDataTableCellErrorType<InputOutputVariablesHeaderKeys>
    rowId?: string | number
    value?: string
}

export interface ValidateInputOutputVariableCellProps {
    variable: Pick<
        VariableType,
        | 'allowEmptyValue'
        | 'isRuntimeArg'
        | 'defaultValue'
        | 'variableType'
        | 'refVariableName'
        | 'value'
        | 'description'
        | 'name'
        | 'refVariableStepIndex'
        | 'refVariableStage'
        | 'format'
    >
    key: InputOutputVariablesHeaderKeys
    type: PluginVariableType
    keysFrequencyMap?: Record<string, number>
}
