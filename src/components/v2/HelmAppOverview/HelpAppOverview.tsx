import React, { useEffect, useState } from 'react'
import { AppMetaInfo } from '../../app/types'
import { getHelmAppOverviewInfo } from '../../app/service'
import { Progressing } from '@devtron-labs/devtron-fe-common-lib'
import AppOverview from '../../app/Overview/Overview'

export const HelmAppOverview = (props: { appId: string; setErrorResponseCode: (code) => void }) => {
    const { appId, setErrorResponseCode } = props
    const [appOverviewInfo, setAppOverviewInfo] = useState<AppMetaInfo>()
    const [isLoading, setIsLoading] = useState<boolean>(true)

    const getInstalledAppOverview = async (): Promise<AppMetaInfo> => {
        try {
            const { result } = await getHelmAppOverviewInfo(appId)
            if (result) {
                setAppOverviewInfo(result)
                setIsLoading(false)
                return result
            }
        } catch (err: any) {
            if (err.code) {
                setErrorResponseCode(err)
            }
        }
    }

    useEffect(() => {
        getInstalledAppOverview()
    }, [])

    return isLoading ? (
        <Progressing />
    ) : (
        <AppOverview appType="helm-chart" appMetaInfo={appOverviewInfo} getAppMetaInfoRes={getInstalledAppOverview} />
    )
}
