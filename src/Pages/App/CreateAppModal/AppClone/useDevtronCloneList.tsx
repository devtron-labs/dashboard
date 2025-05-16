/*
 * Copyright (c) 2024. Devtron Inc.
 */
import { useEffect, useMemo, useRef, useState } from 'react'

import {
    abortPreviousRequests,
    GenericInfoCardListingProps,
    getIsRequestAborted,
    useAsync,
} from '@devtron-labs/devtron-fe-common-lib'

import { getJobs } from '@Components/Jobs/Service'
import { APP_TYPE } from '@Config/constants'
import { getAppIconWithBackground } from '@Config/utils'
import { getAppListMin } from '@Services/service'

import { AppCloneListProps, DevtronListResponse } from './types'

export const useDevtronCloneList = ({ handleCloneAppClick, isJobView }: AppCloneListProps) => {
    const cloneListAbortControllerRef = useRef(new AbortController())
    const [isLoadingMore, setIsLoadingMore] = useState(false)

    const [isListLoading, listResponse, listError, reloadList, setListResponse] = useAsync<DevtronListResponse>(() =>
        abortPreviousRequests(
            () =>
                isJobView
                    ? getJobs(
                          {
                              teams: [],
                              appStatuses: [],
                              appNameSearch: '',
                              offset: 0,
                              size: 20,
                              sortBy: 'appNameSort',
                              sortOrder: 'ASC',
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
        ),
    )

    useEffect(
        () => () => {
            cloneListAbortControllerRef.current.abort()
        },
        [],
    )
    let totalCount = 0

    if (listResponse?.type === APP_TYPE.JOB) {
        totalCount = listResponse.data.result.jobCount
    }

    const loadMoreData = async () => {
        if (isLoadingMore || !listResponse) return

        setIsLoadingMore(true)
        try {
            if (listResponse.type === APP_TYPE.JOB) {
                const currentJobContainers = listResponse.data.result?.jobContainers || []

                const response = await getJobs(
                    {
                        teams: [],
                        appStatuses: [],
                        appNameSearch: '',
                        offset: currentJobContainers.length,
                        size: 20,
                        sortBy: 'appNameSort',
                        sortOrder: 'ASC',
                    },
                    {
                        signal: cloneListAbortControllerRef.current.signal,
                    },
                )

                const newJobContainers = response.result?.jobContainers || []

                // Update the list response with the new data
                setListResponse({
                    type: APP_TYPE.JOB,
                    data: {
                        ...response,
                        result: {
                            ...response.result,
                            jobContainers: [...currentJobContainers, ...newJobContainers],
                        },
                    },
                })
            }
        } finally {
            setIsLoadingMore(false)
        }
    }

    const list = useMemo(() => {
        if (isListLoading || !listResponse) return []

        if (listResponse.type === APP_TYPE.JOB) {
            const jobContainers = listResponse.data.result?.jobContainers || []

            totalCount = listResponse.data.result.jobCount

            return jobContainers.map<GenericInfoCardListingProps['list'][number]>((job) => {
                const { jobId, jobName, description } = job

                return {
                    id: String(jobId),
                    title: jobName,
                    description: description.description,
                    author: description.createdBy,
                    Icon: getAppIconWithBackground(APP_TYPE.JOB, 20),
                    onClick: () => handleCloneAppClick({ appId: jobId, appName: jobName }),
                }
            })
        }
        const apps = listResponse.data.result || []

        return apps.map<GenericInfoCardListingProps['list'][number]>((app) => {
            const { id, name, createdBy, description } = app

            return {
                id: String(id),
                title: name,
                Icon: getAppIconWithBackground(APP_TYPE.DEVTRON_APPS, 20),
                onClick: () => handleCloneAppClick({ appId: id, appName: name }),
                author: createdBy,
                description,
            }
        })
    }, [isListLoading, listResponse])

    return {
        isListLoading: isListLoading || getIsRequestAborted(listError),
        list,
        listError,
        reloadList,
        totalCount,
        loadMoreData,
        hasMoreData: listResponse?.type === APP_TYPE.JOB && list.length < totalCount,
    }
}
