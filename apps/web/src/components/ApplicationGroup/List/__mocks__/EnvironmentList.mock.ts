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

import { EnvApp, EnvAppType } from '../../AppGroup.types'

const result = (isEmpty = false): EnvApp => {
    if (isEmpty) {
        return {
            envList: [],
            envCount: 1,
        }
    }

    return {
        envList: [
            {
                id: 11,
                environment_name: 'a',
                cluster_name: 'shubham',
                active: false,
                default: false,
                namespace: 'a',
                isClusterCdActive: false,
                environmentIdentifier: 'shubham__a',
                appCount: 0,
            },
            {
                id: 14,
                environment_name: 'default-ks',
                cluster_name: 'default_cluster',
                active: false,
                default: false,
                namespace: 'kube-system',
                isClusterCdActive: false,
                environmentIdentifier: 'default_cluster__kube-system',
                appCount: 1,
            },
            {
                id: 28,
                environment_name: 'demo-prod-noti',
                cluster_name: 'default_cluster',
                active: false,
                default: false,
                namespace: 'demo-prod-noti',
                isClusterCdActive: false,
                environmentIdentifier: 'default_cluster__demo-prod-noti',
                appCount: 5,
            },
            {
                id: 1,
                environment_name: 'devtron-demo',
                cluster_name: 'default_cluster',
                active: false,
                default: false,
                namespace: 'devtron-demo',
                isClusterCdActive: false,
                environmentIdentifier: 'devtron-demo',
                appCount: 62,
            },
            {
                id: 2,
                environment_name: 'devtron-demo1',
                cluster_name: 'default_cluster',
                active: false,
                default: false,
                namespace: 'devtron-demo1',
                isClusterCdActive: false,
                environmentIdentifier: 'default_cluster__devtron-demo1',
                appCount: 15,
            },
            {
                id: 55,
                environment_name: 'dsfsa',
                cluster_name: 'default_cluster',
                active: false,
                default: false,
                namespace: 'fafd',
                isClusterCdActive: false,
                environmentIdentifier: 'default_cluster__fafd',
                appCount: 0,
            },
            {
                id: 3,
                environment_name: 'env-1',
                cluster_name: 'default_cluster',
                active: false,
                default: false,
                namespace: 'ns-1',
                isClusterCdActive: false,
                environmentIdentifier: 'default_cluster__ns-1',
                appCount: 12,
            },
            {
                id: 4,
                environment_name: 'env-2',
                cluster_name: 'default_cluster',
                active: false,
                default: false,
                namespace: 'ns-2',
                isClusterCdActive: false,
                environmentIdentifier: 'default_cluster__ns-2',
                appCount: 6,
            },
            {
                id: 93,
                environment_name: 'envtest1',
                cluster_name: 'default_cluster',
                active: false,
                default: false,
                namespace: 'pbrr3ecjbk',
                isClusterCdActive: false,
                environmentIdentifier: 'default_cluster__pbrr3ecjbk',
                appCount: 1,
            },
            {
                id: 60,
                environment_name: 'envtest10',
                cluster_name: 'default_cluster',
                active: false,
                default: false,
                namespace: '8q8c5yh6mp',
                isClusterCdActive: false,
                environmentIdentifier: 'default_cluster__8q8c5yh6mp',
                appCount: 1,
            },
            {
                id: 61,
                environment_name: 'envtest14',
                cluster_name: 'default_cluster',
                active: false,
                default: false,
                namespace: '5bvf5fz83q',
                isClusterCdActive: false,
                environmentIdentifier: 'default_cluster__5bvf5fz83q',
                appCount: 1,
            },
            {
                id: 56,
                environment_name: 'envtest20',
                cluster_name: 'default_cluster',
                active: false,
                default: false,
                namespace: 'dhdwg3bct7',
                isClusterCdActive: false,
                environmentIdentifier: 'default_cluster__dhdwg3bct7',
                appCount: 0,
            },
            {
                id: 57,
                environment_name: 'envtest21',
                cluster_name: 'default_cluster',
                active: false,
                default: false,
                namespace: 'gk7ac1chej',
                isClusterCdActive: false,
                environmentIdentifier: 'default_cluster__gk7ac1chej',
                appCount: 0,
            },
            {
                id: 58,
                environment_name: 'envtest22',
                cluster_name: 'default_cluster',
                active: false,
                default: false,
                namespace: 'cu4a9odpbr',
                isClusterCdActive: false,
                environmentIdentifier: 'default_cluster__cu4a9odpbr',
                appCount: 1,
            },
            {
                id: 62,
                environment_name: 'envtest34',
                cluster_name: 'default_cluster',
                active: false,
                default: false,
                namespace: '71kpnnb482',
                isClusterCdActive: false,
                environmentIdentifier: 'default_cluster__71kpnnb482',
                appCount: 0,
            },
            {
                id: 63,
                environment_name: 'envtest35',
                cluster_name: 'default_cluster',
                active: false,
                default: false,
                namespace: 'dup0jr6378',
                isClusterCdActive: false,
                environmentIdentifier: 'default_cluster__dup0jr6378',
                appCount: 0,
            },
            {
                id: 64,
                environment_name: 'envtest39',
                cluster_name: 'default_cluster',
                active: false,
                default: false,
                namespace: 'bzdwewiqsv',
                isClusterCdActive: false,
                environmentIdentifier: 'default_cluster__bzdwewiqsv',
                appCount: 0,
            },
            {
                id: 65,
                environment_name: 'envtest40',
                cluster_name: 'default_cluster',
                active: false,
                default: false,
                namespace: 'rlpf4300el',
                isClusterCdActive: false,
                environmentIdentifier: 'default_cluster__rlpf4300el',
                appCount: 0,
            },
            {
                id: 66,
                environment_name: 'envtest41',
                cluster_name: 'default_cluster',
                active: false,
                default: false,
                namespace: 'x1oil3n0ax',
                isClusterCdActive: false,
                environmentIdentifier: 'default_cluster__x1oil3n0ax',
                appCount: 0,
            },
            {
                id: 67,
                environment_name: 'envtest46',
                cluster_name: 'default_cluster',
                active: false,
                default: false,
                namespace: '86cujagh5q',
                isClusterCdActive: false,
                environmentIdentifier: 'default_cluster__86cujagh5q',
                appCount: 0,
            },
        ],
        envCount: 69,
    }
}

export async function mockFetch(): Promise<EnvAppType> {
    const response = {
        code: 200,
        status: 'OK',
        result: result(),
    }
    const mockJsonPromise = response
    return mockJsonPromise
}

export async function mockEmptyFetch(): Promise<EnvAppType> {
    const response = {
        code: 200,
        status: 'OK',
        result: result(true),
    }
    const mockJsonPromise = response
    return mockJsonPromise
}
