import { AppType, post, ROUTES, showError, getUrlWithSearchParams, get } from '@devtron-labs/devtron-fe-common-lib'
import { BaseAppMetaData } from '../types'

export const updateRecentlyVisitedDevtronApps = async (recentAppMetaData: BaseAppMetaData[]): Promise<boolean> => {
    try {
        const payload = {
            key: AppType.DEVTRON_APP,
            value: JSON.stringify(recentAppMetaData),
        }

        await post(`${ROUTES.ATTRIBUTES_USER}/${ROUTES.UPDATE}`, payload)
        return true
    } catch (error) {
        showError(error)
        return false
    }
}

export const getRecentlyVisitedDevtronApps = async (): Promise<BaseAppMetaData[]> => {
    try {
        const { result } = await get<{ value: string }>(
            getUrlWithSearchParams(`${ROUTES.ATTRIBUTES_USER}/${ROUTES.GET}`, {
                key: AppType.DEVTRON_APP,
            }),
        )

        if (!result?.value) {
            return null
        }

        return result?.value ? JSON.parse(result.value) : []
    } catch (error) {
        showError(error)
        return []
    }
}
