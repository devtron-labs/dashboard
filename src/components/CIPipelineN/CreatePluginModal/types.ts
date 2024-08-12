import {
    CustomInputProps,
    EditImageFormFieldProps,
    InlineStepDetailType,
    ParentPluginDTO,
    PluginDataStoreType,
    PluginDetailType,
    PortMapType,
    SelectPickerOptionType,
    ServerErrors,
    StepType,
    VariableType,
} from '@devtron-labs/devtron-fe-common-lib'

export interface CreatePluginModalURLParamsType {
    appId: string
}

export interface CreatePluginModalProps {
    handleClose: () => void
}

export interface ParentPluginListItemType
    extends Pick<PluginDataStoreType['parentPluginStore'][0], 'id' | 'name' | 'icon'> {}

export enum CreatePluginFormViewType {
    NEW_PLUGIN = 'New plugin',
    EXISTING_PLUGIN = 'New version of existing plugin',
}

export interface CreatePluginFormType
    extends ParentPluginListItemType,
        Pick<PluginDataStoreType['parentPluginStore'][0], 'pluginIdentifier'>,
        Pick<PluginDetailType, 'description' | 'docLink' | 'tags' | 'inputVariables' | 'pluginVersion'> {
    shouldReplaceCustomTask: boolean
    currentTab: CreatePluginFormViewType
}

export enum CreatePluginActionType {
    UPDATE_CURRENT_TAB = 'updateCurrentTab',
    UPDATE_PLUGIN_ICON = 'updatePluginIcon',
    UPDATE_NEW_PLUGIN_NAME = 'updateNewPluginName',
    UPDATE_PARENT_PLUGIN = 'updateParentPlugin',
    UPDATE_PLUGIN_IDENTIFIER = 'updatePluginIdentifier',
    UPDATE_PLUGIN_VERSION = 'updatePluginVersion',
    UPDATE_DOCUMENTATION_LINK = 'updateDocumentationLink',
    UPDATE_DESCRIPTION = 'updateDescription',
    UPDATE_TAGS = 'updateTags',
    TOGGLE_INPUT_VARIABLE_ALLOW_EMPTY_VALUE = 'toggleInputVariableAllowEmptyValue',
    TOGGLE_REPLACE_CUSTOM_TASK = 'toggleReplaceCustomTask',
}

type CreatePluginSingleInputActionType =
    | CreatePluginActionType.UPDATE_PLUGIN_ICON
    | CreatePluginActionType.UPDATE_NEW_PLUGIN_NAME
    | CreatePluginActionType.UPDATE_PLUGIN_IDENTIFIER
    | CreatePluginActionType.UPDATE_PLUGIN_VERSION
    | CreatePluginActionType.UPDATE_DOCUMENTATION_LINK
    | CreatePluginActionType.UPDATE_DESCRIPTION

type CreatePluginHandleChangeParamsType =
    | {
          action: CreatePluginSingleInputActionType
          payload: string
      }
    | {
          action: CreatePluginActionType.TOGGLE_REPLACE_CUSTOM_TASK
          payload?: never
      }
    | {
          action: CreatePluginActionType.UPDATE_PARENT_PLUGIN
          payload: {
              id: number
              name: string
          }
      }
    | {
          action: CreatePluginActionType.UPDATE_CURRENT_TAB
          payload: CreatePluginFormViewType
      }
    | {
          action: CreatePluginActionType.UPDATE_TAGS
          payload: {
              tags: string[]
          }
      }
    | {
          action: CreatePluginActionType.TOGGLE_INPUT_VARIABLE_ALLOW_EMPTY_VALUE
          /**
           * Index of the input variable
           */
          payload: {
              index: number
          }
      }

export type CreatePluginHandleChangeType = (params: CreatePluginHandleChangeParamsType) => void

export interface CreatePluginFormErrorType {
    /**
     * Should be a valid URL or empty
     */
    icon: string
    /**
     * Should be unique with global name validation (mandatory)
     */
    name: string
    /**
     * Should be unique with global name validation (mandatory)
     * Won't be editable for existing plugins
     */
    pluginIdentifier: string
    /**
     * Should follow semantic versioning (mandatory)
     */
    pluginVersion: string
    /**
     * Should be a valid URL or empty
     */
    docLink: string
    /**
     * global description validation
     */
    description: string
    /**
     * Tag length can be maximum of 128 characters
     */
    tags: string
}

export interface CreatePluginFormContentProps {
    pluginForm: CreatePluginFormType
    pluginFormError: CreatePluginFormErrorType
    handleChange: CreatePluginHandleChangeType
    isLoadingParentPluginList: boolean
    parentPluginList: ParentPluginListItemType[]
    parentPluginListError: ServerErrors
    reloadParentPluginList: () => void
    areTagsLoading: boolean
    availableTags: string[]
    availableTagsError: ServerErrors
    reloadAvailableTags: () => void
    handleIconError: EditImageFormFieldProps['handleError']
    arePluginDetailsLoading: boolean
    pluginDetailsError: ServerErrors
    prefillFormOnPluginSelection: (clonedPluginForm: CreatePluginFormType) => Promise<CreatePluginFormType>
    selectedPluginVersions: string[]
}

type PluginTextFieldFieldType =
    | {
          useTextArea: true
          /**
           * Not using helperText, autofocus in textarea as not required as of now
           */
          helperText?: never
          autoFocus?: never
      }
    | ({
          useTextArea?: false
      } & Pick<CustomInputProps, 'helperText' | 'autoFocus'>)

export type CreatePluginFormFieldProps = Pick<CreatePluginFormContentProps, 'handleChange'> &
    Pick<CustomInputProps, 'placeholder' | 'label' | 'value' | 'error' | 'required' | 'disabled' | 'labelClassName'> & {
        action: CreatePluginSingleInputActionType
    } & PluginTextFieldFieldType

export interface CreatePluginInputVariableContainerProps extends Pick<CreatePluginFormContentProps, 'handleChange'> {
    inputVariables: PluginDetailType['inputVariables']
}

export interface InputVariableItemProps
    extends Pick<CreatePluginInputVariableContainerProps, 'handleChange'>,
        Pick<VariableType, 'name' | 'allowEmptyValue'> {
    index: number
}

export interface CreatePluginServiceParamsType {
    stepData: StepType
    appId: number
    pluginForm: CreatePluginFormType
    availableTags?: string[]
}

export interface GetCreatePluginPayloadParamsType
    extends Pick<CreatePluginServiceParamsType, 'stepData' | 'pluginForm' | 'availableTags'> {}

export enum PathPortMappingType {
    PORT = 'PORT',
    FILE_PATH = 'FILE_PATH',
    DOCKER_ARG = 'DOCKER_ARG',
}

type CreatePluginPayloadPathArgPortMappingDTO =
    | ({
          typeOfMapping: PathPortMappingType.PORT
      } & PortMapType)
    | ({
          typeOfMapping: PathPortMappingType.FILE_PATH
      } & InlineStepDetailType['mountPathMap'][0])
    | ({
          typeOfMapping: PathPortMappingType.DOCKER_ARG
      } & InlineStepDetailType['commandArgsMap'][0])

export interface CreatePluginPayloadPipelineScriptDTO
    extends Pick<
        InlineStepDetailType,
        | 'script'
        | 'storeScriptAt'
        | 'dockerFileExists'
        | 'mountPath'
        | 'mountCodeToContainer'
        | 'mountCodeToContainerPath'
        | 'mountDirectoryFromHost'
        | 'containerImagePath'
        | 'imagePullSecret'
    > {
    type: InlineStepDetailType['scriptType']
    pathArgPortMapping: CreatePluginPayloadPathArgPortMappingDTO[]
}

export enum CreatePluginVariableType {
    INPUT = 'INPUT',
    OUTPUT = 'OUTPUT',
}

export interface CreatePluginPayloadPluginStepVariableItemType
    extends Pick<
        VariableType,
        'id' | 'name' | 'format' | 'description' | 'allowEmptyValue' | 'defaultValue' | 'value'
    > {
    variableType: CreatePluginVariableType
    valueType: VariableType['variableType']
    referenceVariableName: VariableType['refVariableName']
    isExposed: true
}

interface CreatePluginPayloadPluginStepsDTO extends Pick<StepType, 'outputDirectoryPath' | 'name' | 'description'> {
    pluginStepVariable: CreatePluginPayloadPluginStepVariableItemType[]
    pluginPipelineScript: CreatePluginPayloadPipelineScriptDTO
}

interface CreatePluginDetailedPluginVersionDataItemDTO
    extends Pick<PluginDetailType, 'tags' | 'description' | 'docLink' | 'pluginVersion'> {
    areNewTagsPresent: boolean
    pluginSteps: [CreatePluginPayloadPluginStepsDTO]
}

interface CreatePluginDetailedPluginVersionDataDTO {
    detailedPluginVersionData: [CreatePluginDetailedPluginVersionDataItemDTO]
}

export interface CreatePluginPayloadType extends Pick<ParentPluginDTO, 'id' | 'name' | 'pluginIdentifier' | 'icon'> {
    pluginVersions: CreatePluginDetailedPluginVersionDataDTO
}

export interface CreatePluginAPIParamsType {
    appId: number
}

export interface CreatePluginSuccessResponseType {
    pluginVersionId: number
}

export interface HandleCreatePluginReturnType extends CreatePluginSuccessResponseType {
    hasError: boolean
}

export interface GetSelectPickerOptionsFromParentPluginListReturnType {
    options: SelectPickerOptionType[]
    selectedOption: SelectPickerOptionType
}
