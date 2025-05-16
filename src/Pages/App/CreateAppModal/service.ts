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

import { BaseAppMetaData, GenericInfoCardListingProps, post } from '@devtron-labs/devtron-fe-common-lib'

import { APP_TYPE, Routes } from '@Config/constants'
import { getAppIconWithBackground } from '@Config/utils'

import { DevtronListResponse } from './AppClone/types'

export const createApp = (request) => post(Routes.APP, request)

export const getDevtronAppList = ({
    listResponse,
    handleCloneAppClick,
}: {
    listResponse: DevtronListResponse
    handleCloneAppClick: (app: BaseAppMetaData) => void
}) => {
    if (listResponse.type === APP_TYPE.JOB) {
        const jobContainers = listResponse.data.result?.jobContainers ?? []

        const totalCount = listResponse.data.result.jobCount

        return {
            list: jobContainers.map<GenericInfoCardListingProps['list'][number]>((job) => {
                const { jobId, jobName, description } = job

                return {
                    id: String(jobId),
                    title: jobName,
                    description: description.description,
                    author: description.createdBy,
                    Icon: getAppIconWithBackground(APP_TYPE.JOB, 40),
                    onClick: () => handleCloneAppClick({ appId: jobId, appName: jobName }),
                }
            }),
            totalCount,
        }
    }
    const apps = listResponse.data.result ?? []

    return {
        list: apps.map<GenericInfoCardListingProps['list'][number]>((app) => {
            const { id, name, createdBy, description } = app

            return {
                id: String(id),
                title: name,
                Icon: getAppIconWithBackground(APP_TYPE.DEVTRON_APPS, 40),
                onClick: () => handleCloneAppClick({ appId: id, appName: name }),
                author: createdBy,
                description,
            }
        }),
        totalCount: apps.length,
    }
}
