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

import { MultiValue } from '@devtron-labs/devtron-fe-common-lib'
import { OptionType } from '../../../../app/types'
import { AppGroupListType, EnvDeploymentStatus, EnvDeploymentStatusType } from '../../../AppGroup.types'

const result = (): EnvDeploymentStatus[] => [
    {
        appId: 374,
        pipelineId: 305,
        deployStatus: 'Succeeded',
    },
    {
        appId: 19,
        pipelineId: 19,
        deployStatus: 'Succeeded',
    },
    {
        appId: 81,
        pipelineId: 74,
        deployStatus: 'Succeeded',
    },
    {
        appId: 23,
        pipelineId: 21,
        deployStatus: 'Failed',
    },
    {
        appId: 1,
        pipelineId: 63,
        deployStatus: 'Not Deployed',
    },
    {
        appId: 101,
        pipelineId: 238,
        deployStatus: 'Not Deployed',
    },
]

export const appListResult: AppGroupListType = {
    environmentId: 41,
    environmentName: 'devtron-demo',
    namespace: 'devtron-ns',
    clusterName: 'default_cluster',
    apps: [
        {
            appId: 374,
            appName: 'prakash-1mar',
            appStatus: 'Healthy',
            lastDeployedTime: '2023-04-10 10:17:59.14012+00',
        },
        {
            appId: 101,
            appName: 'aravind-child',
            appStatus: 'Healthy',
            lastDeployedTime: '2023-04-10 10:17:59.14012+00',
        },
        {
            appId: 19,
            appName: 'testing-app',
            appStatus: 'Failed',
            lastDeployedTime: '2023-04-10 10:17:59.14012+00',
        },
        {
            appId: 81,
            appName: 'docker-hub-test',
            appStatus: 'Healthy',
            lastDeployedTime: '2023-04-10 10:17:59.14012+00',
        },
        {
            appId: 1,
            appName: 'ajay-app',
            appStatus: 'Failed',
            lastDeployedTime: '2023-04-10 10:17:59.14012+00',
        },
        {
            appId: 23,
            appName: 'testing-4',
            appStatus: 'Healthy',
            lastDeployedTime: '2023-04-10 10:17:59.14012+00',
        },
    ],
}

export const filteredData: MultiValue<OptionType> = [
    {
        value: '1',
        label: 'ajay-app',
    },
    {
        value: '101',
        label: 'aravind-child',
    },
    {
        value: '81',
        label: 'docker-hub-test',
    },
    {
        value: '374',
        label: 'prakash-1mar',
    },
    {
        value: '23',
        label: 'testing-4',
    },
    {
        value: '19',
        label: 'testing-app',
    },
]

export async function mockStatusFetch(): Promise<EnvDeploymentStatusType> {
    const response = {
        code: 200,
        status: 'OK',
        result: result(),
    }
    const mockJsonPromise = response
    return mockJsonPromise
}
