import { ScopedVariablesDataInterface } from './types'
import { get, post } from '@devtron-labs/devtron-fe-common-lib'
import { Routes } from '../../config'

// Services
export const getScopedVariablesJSON = () => {
    return get(Routes.SCOPED_GLOBAL_VARIABLES_DETAIL)
}

export const postScopedVariables = (scopedVariables: ScopedVariablesDataInterface) => {
    const payload = {
        manifest: scopedVariables,
    }
    return post(Routes.SCOPED_GLOBAL_VARIABLES, payload)
}
