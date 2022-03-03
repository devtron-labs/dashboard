import { getPodsRootParent, getiNodesByKind } from './index.store';
import { nodesWithPodOnly, nodesWithDeployment, nodesWithStatefulSet, nodesWithMultiDeployment, nodesWithMultiDeploymentAndStatefulSet, statefulSeWithChildren, ndesWithMultiDeploymentResponse, nodesWithMultiDeploymentAndStatefulSetAndStatus } from './index.store.data.test';
test('get pod root when root missing', () => {
    expect(getPodsRootParent(nodesWithPodOnly)).toStrictEqual([] as Array<string>)
})

test('get pod root as deployment', () => {
    expect(getPodsRootParent(nodesWithDeployment)).toStrictEqual([["apps/v1/Deployment/Deployment", ""]] as Array<[string, string]>)
})

test('get pod root as statefulset', () => {
    expect(getPodsRootParent(nodesWithStatefulSet)).toStrictEqual([["apps/v1/StatefulSet/StatefulSet1", ""]] as Array<[string, string]>)
})

test('get pod root as 2 deployment', () => {
    expect(getPodsRootParent(nodesWithMultiDeployment)).toStrictEqual([["apps/v1/Deployment/Deployment", ""], ["apps/v1/Deployment/Deployment2", ""]] as Array<[string, string]>)
})

test('get pod root as 2 deployment and statefulset', () => {
    expect(getPodsRootParent(nodesWithMultiDeploymentAndStatefulSet)).toStrictEqual([["apps/v1/Deployment/Deployment", ""], ["apps/v1/Deployment/Deployment2", ""], ["apps/v1/StatefulSet/StatefulSet1", ""]] as Array<[string, string]>)
})

test('get pod root as 2 deployment and statefulset with status', () => {
    expect(getPodsRootParent(nodesWithMultiDeploymentAndStatefulSetAndStatus)).toStrictEqual([["apps/v1/Deployment/Deployment", "degraded"], ["apps/v1/Deployment/Deployment2", ""], ["apps/v1/StatefulSet/StatefulSet1", ""]] as Array<[string, string]>)
})

test('get tree by kind for statefulset', () => {
    expect(getiNodesByKind(nodesWithMultiDeploymentAndStatefulSet, "StatefulSet")).toStrictEqual(statefulSeWithChildren)
})

test('get kind tree for nodes with pod only', () => {
    expect(getiNodesByKind(nodesWithPodOnly, "Pod")).toStrictEqual(nodesWithPodOnly)
})

test('get kind tree for nodes with multi deployment and statefulset only', () => {
    expect(getiNodesByKind(nodesWithMultiDeploymentAndStatefulSet, "Deployment")).toStrictEqual(ndesWithMultiDeploymentResponse)
})