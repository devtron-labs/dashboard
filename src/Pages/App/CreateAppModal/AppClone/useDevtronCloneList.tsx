/*
 * Copyright (c) 2024. Devtron Inc.
 */
import { useEffect, useMemo, useRef, useState } from 'react'

import {
    abortPreviousRequests,
    getIsRequestAborted,
    showError,
    useAsync,
    useStateFilters,
} from '@devtron-labs/devtron-fe-common-lib'

import { getJobs } from '@Components/Jobs/Service'
import { APP_TYPE } from '@Config/constants'
import { getAppListMin } from '@Services/service'

import { getDevtronAppList } from '../service'
import { DevtronAppCloneListProps, DevtronListResponse } from './types'

export const useDevtronCloneList = ({ handleCloneAppClick, isJobView }: DevtronAppCloneListProps) => {
    const cloneListAbortControllerRef = useRef(new AbortController())
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [hasError, setHasError] = useState(false)
    const { searchKey } = useStateFilters()

    const fetchDevtronCloneList = (offset = 0): Promise<DevtronListResponse> =>
        abortPreviousRequests(
            () =>
                isJobView
                    ? getJobs(
                          {
                              teams: [],
                              appStatuses: [],
                              appNameSearch: '',
                              offset,
                              size: 20,
                              sortBy: 'appNameSort',
                              sortOrder: 'ASC',
                              searchKey,
                          },
                          {
                              signal: cloneListAbortControllerRef.current.signal,
                          },
                      ).then((res) => ({ type: APP_TYPE.JOB, data: res }))
                    : getAppListMin(null, { signal: cloneListAbortControllerRef.current.signal }).then((res) => ({
                          type: APP_TYPE.DEVTRON_APPS,
                          data: res,
                      })),
            cloneListAbortControllerRef,
        )

    const [isListLoading, listResponse, listError, reloadList, setListResponse] = useAsync<DevtronListResponse>(() =>
        fetchDevtronCloneList(0),
    )

    useEffect(
        () => () => {
            cloneListAbortControllerRef.current.abort()
        },
        [],
    )

    const { list, totalCount } = useMemo(() => {
        if (!listResponse) return { list: [], totalCount: 0 }
        return getDevtronAppList({ listResponse, handleCloneAppClick })
    }, [isListLoading, listResponse, handleCloneAppClick])

    const loadMoreData = async () => {
        if (isLoadingMore || !listResponse) return

        setIsLoadingMore(true)
        try {
            if (listResponse.type === APP_TYPE.JOB) {
                const currentJobContainers = listResponse.data.result?.jobContainers ?? []

                const response: DevtronListResponse = await fetchDevtronCloneList(currentJobContainers.length)

                // Update the list response with the new data
                setListResponse({
                    type: APP_TYPE.JOB,
                    data: {
                        ...response,
                        result: {
                            ...response.data,
                            jobContainers: [
                                ...currentJobContainers,
                                ...('jobContainers' in response.data.result
                                    ? response.data.result.jobContainers || []
                                    : []),
                            ],
                        },
                    },
                })
            }
        } catch (error) {
            setHasError(true)
            showError(error)
        } finally {
            setIsLoadingMore(false)
        }
    }

    return {
        isListLoading: isListLoading ?? getIsRequestAborted(listError),
        list,
        listError,
        reloadList,
        totalCount,
        loadMoreData,
        hasMoreData: listResponse?.type === APP_TYPE.JOB && list.length < totalCount,
        hasError,
        isLoadingMore,
    }
}
