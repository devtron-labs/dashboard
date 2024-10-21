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

import { iNode, Node } from '../appDetails.type'

export const nodesWithPodOnly = [
    {
        name: 'pod1',
        kind: 'Pod',
    } as iNode,
]

export const nodesWithDeployment = [
    {
        name: 'pod1',
        kind: 'Pod',
        parentRefs: [
            {
                name: 'ReplicaSet1',
                kind: 'ReplicaSet',
            } as Node,
        ],
    } as iNode,
    {
        name: 'ReplicaSet1',
        kind: 'ReplicaSet',
        parentRefs: [
            {
                group: 'apps/v1',
                name: 'Deployment',
                kind: 'Deployment',
            } as Node,
        ],
    } as iNode,
    {
        group: 'apps/v1',
        name: 'Deployment',
        kind: 'Deployment',
    } as iNode,
]

export const nodesWithStatefulSet = [
    {
        name: 'pod1',
        kind: 'Pod',
        parentRefs: [
            {
                group: 'apps/v1',
                name: 'StatefulSet1',
                kind: 'StatefulSet',
            } as Node,
        ],
    } as iNode,
    {
        group: 'apps/v1',
        name: 'StatefulSet1',
        kind: 'StatefulSet',
    } as iNode,
    {
        group: 'apps/v1',
        name: 'Deployment',
        kind: 'Deployment',
    } as iNode,
]

const commonReplicaSetMultiDeployment = [
    {
        name: 'ReplicaSet1',
        kind: 'ReplicaSet',
        parentRefs: [
            {
                group: 'apps/v1',
                name: 'Deployment',
                kind: 'Deployment',
            } as Node,
        ],
    } as iNode,
    {
        name: 'ReplicaSet2',
        kind: 'ReplicaSet',
        parentRefs: [
            {
                group: 'apps/v1',
                name: 'Deployment',
                kind: 'Deployment',
            } as Node,
        ],
    } as iNode,
    {
        name: 'ReplicaSet3',
        kind: 'ReplicaSet',
        parentRefs: [
            {
                group: 'apps/v1',
                name: 'Deployment2',
                kind: 'Deployment',
            } as Node,
        ],
    } as iNode,
    {
        group: 'apps/v1',
        name: 'Deployment',
        kind: 'Deployment',
    } as iNode,
    {
        group: 'apps/v1',
        name: 'Deployment2',
        kind: 'Deployment',
    } as iNode,
]

const commonStatefulSetDeployment = {
    group: 'apps/v1',
    name: 'StatefulSet1',
    kind: 'StatefulSet',
} as iNode

export const nodesWithMultiDeployment = [
    {
        name: 'pod1',
        kind: 'Pod',
        parentRefs: [
            {
                name: 'ReplicaSet1',
                kind: 'ReplicaSet',
            } as Node,
        ],
    } as iNode,
    {
        name: 'pod2',
        kind: 'Pod',
        parentRefs: [
            {
                name: 'ReplicaSet2',
                kind: 'ReplicaSet',
            } as Node,
        ],
    } as iNode,
    {
        name: 'pod3',
        kind: 'Pod',
        parentRefs: [
            {
                name: 'ReplicaSet3',
                kind: 'ReplicaSet',
            } as Node,
        ],
    } as iNode,
    ...commonReplicaSetMultiDeployment,
]

export const nodesWithMultiDeploymentAndStatefulSet = [
    ...nodesWithMultiDeployment,
    {
        name: 'pod5',
        kind: 'Pod',
        parentRefs: [
            {
                name: 'ReplicaSet2',
                kind: 'ReplicaSet',
            } as Node,
        ],
    } as iNode,
    {
        name: 'pod4',
        kind: 'Pod',
        parentRefs: [
            {
                group: 'apps/v1',
                name: 'StatefulSet1',
                kind: 'StatefulSet',
            } as Node,
        ],
    } as iNode,
    commonStatefulSetDeployment,
]

export const nodesWithMultiDeploymentAndStatefulSetAndStatus = [
    {
        name: 'pod1',
        kind: 'Pod',
        health: {
            status: 'healthy',
        },
        parentRefs: [
            {
                name: 'ReplicaSet1',
                kind: 'ReplicaSet',
            } as Node,
        ],
    } as iNode,
    {
        name: 'pod2',
        kind: 'Pod',
        health: {
            status: 'healthy',
        },
        parentRefs: [
            {
                name: 'ReplicaSet2',
                kind: 'ReplicaSet',
            } as Node,
        ],
    } as iNode,
    {
        name: 'pod5',
        kind: 'Pod',
        health: {
            status: 'degraded',
        },
        parentRefs: [
            {
                name: 'ReplicaSet2',
                kind: 'ReplicaSet',
            } as Node,
        ],
    } as iNode,
    {
        name: 'pod3',
        kind: 'Pod',
        parentRefs: [
            {
                name: 'ReplicaSet3',
                kind: 'ReplicaSet',
            } as Node,
        ],
    } as iNode,
    {
        name: 'pod4',
        kind: 'Pod',
        parentRefs: [
            {
                group: 'apps/v1',
                name: 'StatefulSet1',
                kind: 'StatefulSet',
            } as Node,
        ],
    } as iNode,
    ...commonReplicaSetMultiDeployment,
    commonStatefulSetDeployment,
]

export const statefulSeWithChildren = [
    {
        group: 'apps/v1',
        name: 'StatefulSet1',
        kind: 'StatefulSet',
        childNodes: [
            {
                childNodes: undefined,
                name: 'pod4',
                kind: 'Pod',
                parentRefs: [
                    {
                        group: 'apps/v1',
                        name: 'StatefulSet1',
                        kind: 'StatefulSet',
                    },
                ],
            },
        ],
    },
]

export const ndesWithMultiDeploymentResponse = [
    {
        group: 'apps/v1',
        name: 'Deployment',
        kind: 'Deployment',
        childNodes: [
            {
                name: 'ReplicaSet1',
                kind: 'ReplicaSet',
                parentRefs: [
                    {
                        group: 'apps/v1',
                        name: 'Deployment',
                        kind: 'Deployment',
                    },
                ],
                childNodes: [
                    {
                        childNodes: undefined,
                        name: 'pod1',
                        kind: 'Pod',
                        parentRefs: [
                            {
                                name: 'ReplicaSet1',
                                kind: 'ReplicaSet',
                            },
                        ],
                    },
                ],
            },
            {
                name: 'ReplicaSet2',
                kind: 'ReplicaSet',
                parentRefs: [
                    {
                        group: 'apps/v1',
                        name: 'Deployment',
                        kind: 'Deployment',
                    },
                ],
                childNodes: [
                    {
                        childNodes: undefined,
                        name: 'pod2',
                        kind: 'Pod',
                        parentRefs: [
                            {
                                name: 'ReplicaSet2',
                                kind: 'ReplicaSet',
                            },
                        ],
                    },
                    {
                        childNodes: undefined,
                        name: 'pod5',
                        kind: 'Pod',
                        parentRefs: [
                            {
                                name: 'ReplicaSet2',
                                kind: 'ReplicaSet',
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        group: 'apps/v1',
        name: 'Deployment2',
        kind: 'Deployment',
        childNodes: [
            {
                name: 'ReplicaSet3',
                kind: 'ReplicaSet',
                parentRefs: [
                    {
                        group: 'apps/v1',
                        name: 'Deployment2',
                        kind: 'Deployment',
                    },
                ],
                childNodes: [
                    {
                        childNodes: undefined,
                        name: 'pod3',
                        kind: 'Pod',
                        parentRefs: [
                            {
                                name: 'ReplicaSet3',
                                kind: 'ReplicaSet',
                            },
                        ],
                    },
                ],
            },
        ],
    },
]
