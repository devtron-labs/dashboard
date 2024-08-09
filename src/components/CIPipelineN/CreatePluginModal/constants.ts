import { CreatePluginFormErrorType, CreatePluginFormType, CreatePluginFormViewType } from './types'

export const CREATE_PLUGIN_DEFAULT_FORM: CreatePluginFormType = {
    icon: '',
    id: 0,
    name: '',
    pluginIdentifier: '',
    pluginVersion: '',
    docLink: '',
    description: '',
    tags: [],
    inputVariables: [],
    currentTab: CreatePluginFormViewType.NEW_PLUGIN,
    shouldReplaceCustomTask: false,
}

export const CREATE_PLUGIN_DEFAULT_FORM_ERROR: CreatePluginFormErrorType = {
    icon: '',
    name: '',
    pluginIdentifier: '',
    pluginVersion: '',
    docLink: '',
    description: '',
    tags: '',
}

export const MAX_TAG_LENGTH = 128
