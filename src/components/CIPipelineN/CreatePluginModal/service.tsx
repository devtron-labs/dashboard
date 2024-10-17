import {
    getParentPluginList as getParentPluginListService,
    getUrlWithSearchParams,
    post,
    ResponseType,
    showError,
} from '@devtron-labs/devtron-fe-common-lib'
import { Routes } from '@Config/constants'
import {
    CreatePluginAPIParamsType,
    CreatePluginServiceParamsType,
    CreatePluginSuccessResponseType,
    ParentPluginListItemType,
} from './types'
import { getCreatePluginPayload } from './utils'

export const getParentPluginList = async (appId: number): Promise<ParentPluginListItemType[]> => {
    try {
        const { result } = await getParentPluginListService({ appId })
        if (!result) {
            return []
        }

        const parentPluginList: ParentPluginListItemType[] = []
        result.forEach(({ id, name, icon }) => {
            if (id && name) {
                parentPluginList.push({
                    id,
                    name,
                    icon: icon || '',
                })
            }
        })

        return parentPluginList
    } catch (error) {
        showError(error)
        throw error
    }
}

export const createPlugin = async ({
    stepData,
    appId,
    pluginForm,
    availableTags,
}: CreatePluginServiceParamsType): Promise<ResponseType<CreatePluginSuccessResponseType>> => {
    const queryParams: CreatePluginAPIParamsType = {
        appId,
    }

    return post(
        getUrlWithSearchParams(Routes.PLUGIN_GLOBAL_CREATE, queryParams),
        getCreatePluginPayload({
            stepData,
            pluginForm,
            availableTags,
        }),
    )
}
