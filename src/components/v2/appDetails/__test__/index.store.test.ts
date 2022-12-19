import { getPodsRootParentNameAndStatus, getiNodesByKindWithChildNodes } from '../index.store';
import { nodesWithPodOnly, nodesWithDeployment, nodesWithStatefulSet, nodesWithMultiDeployment, nodesWithMultiDeploymentAndStatefulSet, statefulSeWithChildren, ndesWithMultiDeploymentResponse, nodesWithMultiDeploymentAndStatefulSetAndStatus } from './index.store.mock';
test('get pod root when root missing', () => {
    expect(getPodsRootParentNameAndStatus(nodesWithPodOnly)).toStrictEqual([] as Array<string>)
})

test('get pod root as deployment', () => {
    expect(getPodsRootParentNameAndStatus(nodesWithDeployment)).toStrictEqual([["apps/v1/Deployment/Deployment", ""]] as Array<[string, string]>)
})

test('get pod root as statefulset', () => {
    expect(getPodsRootParentNameAndStatus(nodesWithStatefulSet)).toStrictEqual([["apps/v1/StatefulSet/StatefulSet1", ""]] as Array<[string, string]>)
})

test('get pod root as 2 deployment', () => {
    expect(getPodsRootParentNameAndStatus(nodesWithMultiDeployment)).toStrictEqual([["apps/v1/Deployment/Deployment", ""], ["apps/v1/Deployment/Deployment2", ""]] as Array<[string, string]>)
})

test('get pod root as 2 deployment and statefulset', () => {
    expect(getPodsRootParentNameAndStatus(nodesWithMultiDeploymentAndStatefulSet)).toStrictEqual([["apps/v1/Deployment/Deployment", ""], ["apps/v1/Deployment/Deployment2", ""], ["apps/v1/StatefulSet/StatefulSet1", ""]] as Array<[string, string]>)
})

test('get pod root as 2 deployment and statefulset with status', () => {
    expect(getPodsRootParentNameAndStatus(nodesWithMultiDeploymentAndStatefulSetAndStatus)).toStrictEqual([["apps/v1/Deployment/Deployment", "degraded"], ["apps/v1/Deployment/Deployment2", ""], ["apps/v1/StatefulSet/StatefulSet1", ""]] as Array<[string, string]>)
})

test('get tree by kind for statefulset', () => {
    expect(getiNodesByKindWithChildNodes(nodesWithMultiDeploymentAndStatefulSet, "StatefulSet")).toStrictEqual(statefulSeWithChildren)
})

test('get kind tree for nodes with pod only', () => {
    expect(getiNodesByKindWithChildNodes(nodesWithPodOnly, "Pod")).toStrictEqual(nodesWithPodOnly)
})

test('get kind tree for nodes with multi deployment and statefulset only', () => {
    expect(getiNodesByKindWithChildNodes(nodesWithMultiDeploymentAndStatefulSet, "Deployment")).toStrictEqual(ndesWithMultiDeploymentResponse)
})