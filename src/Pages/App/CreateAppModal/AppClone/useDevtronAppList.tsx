/*
 * Copyright (c) 2024. Devtron Inc.
 */
import { useEffect, useMemo, useRef } from 'react'

import { useAsync } from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as ICAppDevtron } from '@Icons/ic-devtron-app.svg'
import { getAppListMin } from '@Services/service'

import { AppCloneListProps, GenericInfoCardListingProps } from './types'

export const useDevtronAppList = ({ handleCloneAppClick }: AppCloneListProps) => {
    // REFS
    const templateListAbortControllerRef = useRef(new AbortController())

    // ASYNC CALL - Fetch Template List
    const [isAppListLoading, appListResponse, AppListError, reloadAppList] = useAsync(getAppListMin)

    // ABORT API CALL
    useEffect(
        () => () => {
            templateListAbortControllerRef.current.abort()
        },
        [],
    )

    const appList = useMemo(() => {
        if (!isAppListLoading && appListResponse) {
            return appListResponse.result.map<GenericInfoCardListingProps['list'][number]>((template) => {
                const { id, name, ...props } = template

                return {
                    id: String(id),
                    title: name,
                    ...props,
                    Icon: <ICAppDevtron />,
                    onClick: () => handleCloneAppClick({ appId: id, appName: name }),
                }
            })
        }

        return []
    }, [isAppListLoading, appListResponse])

    return {
        isAppListLoading,
        appList,
        AppListError,
        reloadAppList,
    }
}
