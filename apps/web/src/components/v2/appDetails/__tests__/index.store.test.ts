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

import { getPodsRootParentNameAndStatus, getiNodesByKindWithChildNodes } from '../index.store'
import {
    nodesWithPodOnly,
    nodesWithDeployment,
    nodesWithStatefulSet,
    nodesWithMultiDeployment,
    nodesWithMultiDeploymentAndStatefulSet,
    statefulSeWithChildren,
    ndesWithMultiDeploymentResponse,
    nodesWithMultiDeploymentAndStatefulSetAndStatus,
} from '../__mocks__/index.store.mock'
test('get pod root when root missing', () => {
    expect(getPodsRootParentNameAndStatus(nodesWithPodOnly)).toStrictEqual([] as Array<string>)
})

test('get pod root as deployment', () => {
    expect(getPodsRootParentNameAndStatus(nodesWithDeployment)).toStrictEqual([
        ['apps/v1/Deployment/Deployment', ''],
    ] as Array<[string, string]>)
})

test('get pod root as statefulset', () => {
    expect(getPodsRootParentNameAndStatus(nodesWithStatefulSet)).toStrictEqual([
        ['apps/v1/StatefulSet/StatefulSet1', ''],
    ] as Array<[string, string]>)
})

test('get pod root as 2 deployment', () => {
    expect(getPodsRootParentNameAndStatus(nodesWithMultiDeployment)).toStrictEqual([
        ['apps/v1/Deployment/Deployment', ''],
        ['apps/v1/Deployment/Deployment2', ''],
    ] as Array<[string, string]>)
})

test('get pod root as 2 deployment and statefulset', () => {
    expect(getPodsRootParentNameAndStatus(nodesWithMultiDeploymentAndStatefulSet)).toStrictEqual([
        ['apps/v1/Deployment/Deployment', ''],
        ['apps/v1/Deployment/Deployment2', ''],
        ['apps/v1/StatefulSet/StatefulSet1', ''],
    ] as Array<[string, string]>)
})

test('get pod root as 2 deployment and statefulset with status', () => {
    expect(getPodsRootParentNameAndStatus(nodesWithMultiDeploymentAndStatefulSetAndStatus)).toStrictEqual([
        ['apps/v1/Deployment/Deployment', 'degraded'],
        ['apps/v1/Deployment/Deployment2', ''],
        ['apps/v1/StatefulSet/StatefulSet1', ''],
    ] as Array<[string, string]>)
})

test('get tree by kind for statefulset', () => {
    expect(getiNodesByKindWithChildNodes(nodesWithMultiDeploymentAndStatefulSet, 'StatefulSet')).toStrictEqual(
        statefulSeWithChildren,
    )
})

test('get kind tree for nodes with pod only', () => {
    expect(getiNodesByKindWithChildNodes(nodesWithPodOnly, 'Pod')).toStrictEqual(nodesWithPodOnly)
})

test('get kind tree for nodes with multi deployment and statefulset only', () => {
    expect(getiNodesByKindWithChildNodes(nodesWithMultiDeploymentAndStatefulSet, 'Deployment')).toStrictEqual(
        ndesWithMultiDeploymentResponse,
    )
})
