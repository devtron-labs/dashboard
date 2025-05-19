/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { abortPreviousRequests, BaseAppMetaData, post } from '@devtron-labs/devtron-fe-common-lib'

import { getJobs } from '@Components/Jobs/Service'
import { APP_TYPE, Routes } from '@Config/constants'
import { getAppIconWithBackground } from '@Config/utils'
import { getAppListMin } from '@Services/service'

import { CloneListResponse } from './AppClone/types'

export const createApp = (request) => post(Routes.APP, request)

export const fetchDevtronCloneList = async ({
    offset = 0,
    isJobView = false,
    searchKey = '',
    cloneListAbortControllerRef,
    handleCloneAppClick,
}: {
    offset?: number
    isJobView?: boolean
    searchKey?: string
    cloneListAbortControllerRef: React.MutableRefObject<AbortController>
    handleCloneAppClick: (app: BaseAppMetaData) => void
}): Promise<CloneListResponse> =>
    abortPreviousRequests(async () => {
        if (isJobView) {
            const res = await getJobs({
                teams: [],
                appStatuses: [],
                appNameSearch: '',
                offset,
                size: 20,
                sortBy: 'appNameSort',
                sortOrder: 'ASC',
                searchKey,
            })

            const jobContainers = res.result?.jobContainers ?? []
            const totalCount = res.result?.jobCount ?? 0

            const list = jobContainers.map((job) => ({
                id: String(job.jobId),
                title: job.jobName,
                description: job.description.description,
                author: job.description.createdBy,
                Icon: getAppIconWithBackground(APP_TYPE.JOB, 40),
                onClick: () => handleCloneAppClick({ appId: job.jobId, appName: job.jobName }),
            }))

            return { type: APP_TYPE.JOB, list, totalCount }
        }
        const res = await getAppListMin(
            null,
            { signal: cloneListAbortControllerRef.current.signal },
            searchKey,
            isJobView,
            offset,
        )

        const apps = res.result ?? []

        const list = apps.map((app) => ({
            id: String(app.id),
            title: app.name,
            description: app.description,
            author: app.createdBy,
            Icon: getAppIconWithBackground(APP_TYPE.DEVTRON_APPS, 40),
            onClick: () => handleCloneAppClick({ appId: app.id, appName: app.name }),
        }))

        return { type: APP_TYPE.DEVTRON_APPS, list, totalCount: apps.length }
    }, cloneListAbortControllerRef)
