import { getParentPluginList as getParentPluginListService, showError } from '@devtron-labs/devtron-fe-common-lib'
import { ParentPluginListItemType } from './types'

export const getParentPluginList = async (appId: number): Promise<ParentPluginListItemType[]> => {
    try {
        const { result } = await getParentPluginListService(appId)
        if (!result) {
            return []
        }

        const parentPluginList: ParentPluginListItemType[] = []
        result.forEach((plugin) => {
            if (plugin.id && plugin.pluginName) {
                parentPluginList.push({
                    id: plugin.id,
                    name: plugin.pluginName,
                    icon: plugin.icon || '',
                })
            }
        })

        return parentPluginList
    } catch (error) {
        showError(error)
        throw error
    }
}
