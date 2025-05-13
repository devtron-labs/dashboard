/*
 * Copyright (c) 2024. Devtron Inc.
 */
import { useEffect, useMemo, useRef } from 'react'

import { abortPreviousRequests, GenericInfoCardListingProps, useAsync } from '@devtron-labs/devtron-fe-common-lib'

import { getJobs } from '@Components/Jobs/Service'
import { JobList } from '@Components/Jobs/Types'
import { APP_TYPE } from '@Config/constants'
import { getAppIconWithBackground } from '@Config/utils'
import { getAppListMin } from '@Services/service'
import { AppListMin } from '@Services/service.types'

import { AppCloneListProps } from './types'

type DevtronlistResponse = { type: 'job'; data: JobList } | { type: 'app'; data: AppListMin }

export const useDevtronCloneList = ({ handleCloneAppClick, isJobView }: AppCloneListProps) => {
    const cloneListAbortControllerRef = useRef(new AbortController())

    const [isListLoading, listResponse, listError, reloadList] = useAsync<DevtronlistResponse>(() =>
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

    const list = useMemo(() => {
        if (isListLoading || !listResponse) return []

        if (listResponse.type === APP_TYPE.JOB) {
            const jobContainers = listResponse.data.result?.jobContainers || []

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
        isListLoading,
        list,
        listError,
        reloadList,
    }
}
