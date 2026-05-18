import { get, showError } from '@devtron-labs/devtron-fe-common-lib'

import { AuthorizationGlobalConfig, AuthorizationGlobalConfigRes } from './types'

import { Routes } from '@Config/constants'

export const getAuthorizationGlobalConfig = async () => {
    try {
        const { result } = (await get(Routes.AUTHORISATION_GLOBAL_CONFIG)) as AuthorizationGlobalConfigRes
        return (result ?? []).reduce((res, { configType, active }) => {
            res[configType] = active
            return res
        }, {} as AuthorizationGlobalConfig)
    } catch (err) {
        showError(err)
        throw err
    }
}
