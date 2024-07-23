import { VariableType } from '@devtron-labs/devtron-fe-common-lib'
import { CreatePluginFormType } from './types'
import { CREATE_PLUGIN_DEFAULT_FORM } from './constants'

export const getDefaultPluginFormData = (currentInputVariables: VariableType[]): CreatePluginFormType => {
    return {
        ...structuredClone(CREATE_PLUGIN_DEFAULT_FORM),
        inputVariables: currentInputVariables,
    }
}
