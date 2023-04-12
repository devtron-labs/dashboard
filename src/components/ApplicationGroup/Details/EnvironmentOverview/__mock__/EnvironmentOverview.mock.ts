import { MultiValue } from 'react-select'
import { OptionType } from '../../../../app/types'
import { AppGroupListType, EnvDeploymentStatus, EnvDeploymentStatusType } from '../../../AppGroup.types'

const result = (): EnvDeploymentStatus[] => {
    return [
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
}

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
