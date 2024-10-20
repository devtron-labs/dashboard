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

import { iNode } from '../../../appDetails.type'

const commonTreeNodesData = {
    _treeNodes: [
        {
            name: 'Workloads',
            childNodes: [
                {
                    name: 'Deployment',
                },
                {
                    name: 'ReplicaSet',
                },
                {
                    name: 'Pod',
                    childNodes: [{ name: 'Deployment1' }, { name: 'Deployment2' }],
                } as iNode,
            ],
        } as iNode,
    ],
    _node: 'pod',
    parents: ['Workloads'],
}

export const testData1 = {
    arguments: {
        clickedNodes: new Map<string, string>(),
        ...commonTreeNodesData,
    },
    response: {
        clickedNodes: new Map<string, string>([
            ['workloads', ''],
            ['pod', ''],
        ]),
    },
}

export const testData2 = {
    arguments: {
        clickedNodes: new Map<string, string>([
            ['networking', ''],
            ['service', ''],
        ]),
        ...commonTreeNodesData,
    },
    response: {
        clickedNodes: new Map<string, string>([
            ['networking', ''],
            ['service', ''],
            ['workloads', ''],
            ['pod', ''],
        ]),
    },
}

export const testData3 = {
    arguments: {
        clickedNodes: new Map<string, string>([
            ['networking', ''],
            ['service', ''],
        ]),
        _treeNodes: [
            {
                name: 'Workloads',
                childNodes: [
                    {
                        name: 'Deployment',
                    },
                    {
                        name: 'ReplicaSet',
                    },
                    {
                        name: 'Pod',
                        childNodes: [{ name: 'Deployment1' }, { name: 'Deployment2' }],
                    } as iNode,
                ],
            } as iNode,
            {
                name: 'Networking',
                childNodes: [
                    {
                        name: 'Service',
                    } as iNode,
                ],
            } as iNode,
        ],
        _node: 'Deployment1',
        parents: ['Workloads', 'pod'],
    },
    response: {
        clickedNodes: new Map<string, string>([
            ['networking', ''],
            ['workloads', ''],
            ['pod', ''],
            ['deployment1', ''],
        ]),
    },
}
