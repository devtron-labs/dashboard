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
