import {
    EditImageFormFieldProps,
    PluginDataStoreType,
    PluginDetailType,
    ServerErrors,
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
    NEW_PLUGIN = 'New Plugin',
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
    UPDATE_PLUGIN_ID = 'updatePluginId',
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
    | CreatePluginActionType.UPDATE_PLUGIN_ID
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
          payload: string[]
      }
    | {
          action: CreatePluginActionType.TOGGLE_INPUT_VARIABLE_ALLOW_EMPTY_VALUE
          /**
           * Index of the input variable
           */
          payload: number
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
}

export interface CreatePluginFormFieldProps extends Pick<CreatePluginFormContentProps, 'handleChange'> {
    label: string
    value: string
    error: string
    action: CreatePluginSingleInputActionType
    placeholder: string
    isRequired?: boolean
    isDisabled?: boolean
    useTextArea?: boolean
    autoFocus?: boolean
}

export interface CreatePluginInputVariableContainerProps extends Pick<CreatePluginFormContentProps, 'handleChange'> {
    inputVariables: PluginDetailType['inputVariables']
}

export interface InputVariableItemProps
    extends Pick<CreatePluginInputVariableContainerProps, 'handleChange'>,
        Pick<VariableType, 'name' | 'allowEmptyValue'> {
    index: number
}
