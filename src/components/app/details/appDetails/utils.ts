//@ts-nocheck

import {
    Nodes,
    NodeType,
    AggregationKeys,
    AggregatedNodes,
    PodMetadatum,
} from '../../types';
import { mapByKey } from '../../../common'

export function getAggregator(nodeType: NodeType): AggregationKeys {
    switch (nodeType) {
        case Nodes.DaemonSet:
        case Nodes.Deployment:
        case Nodes.Pod:
        case Nodes.ReplicaSet:
        case Nodes.Job:
        case Nodes.CronJob:
        case Nodes.ReplicationController:
        case Nodes.StatefulSet:
            return AggregationKeys.Workloads;
        case Nodes.Ingress:
        case Nodes.Service:
        case Nodes.Endpoints:
            return AggregationKeys.Networking;
        case Nodes.ConfigMap:
        case Nodes.Secret:
        case Nodes.PersistentVolume:
        case Nodes.PersistentVolumeClaim:
            return AggregationKeys["Config & Storage"];
        case Nodes.ServiceAccount:
        case Nodes.ClusterRoleBinding:
        case Nodes.RoleBinding:
        case Nodes.ClusterRole:
        case Nodes.Role:
            return AggregationKeys.RBAC;
        case Nodes.MutatingWebhookConfiguration:
        case Nodes.PodSecurityPolicy:
        case Nodes.ValidatingWebhookConfiguration:
            return AggregationKeys.Administration;
        case Nodes.Alertmanager:
        case Nodes.Prometheus:
        case Nodes.ServiceMonitor:
            return AggregationKeys["Custom Resource"];
        default:
            return AggregationKeys['Custom Resource'];
    }
}
export function aggregateNodes(nodes: any[], podMetadata: PodMetadatum[]): AggregatedNodes {
    const podMetadataMap = mapByKey(podMetadata, 'name');
    // group nodes
    const nodesGroup = nodes.reduce((agg, curr) => {
        agg[curr.kind] = agg[curr.kind] || new Map();
        if (curr.kind === Nodes.Pod) {
            curr.info.forEach(({ name, value }) => {
                if (name === 'Status Reason') {
                    curr.status = value.toLowerCase()
                }
                else if (name === 'Containers') {
                    curr.ready = value
                }
            });
            const podMeta = podMetadataMap.has(curr.name) ? podMetadataMap.get(curr.name) : {};
            agg[curr.kind].set(curr.name, { ...curr, ...podMeta });
        } else if (curr.kind === Nodes.Service) {
            curr.url = `${curr.name}.${curr.namespace}: { portnumber }`;
            agg[curr.kind].set(curr.name, curr);
        } else {
            agg[curr.kind].set(curr.name, curr);
        }
        return agg;
    }, {});

    // populate parents
    return nodes.reduce(
        (agg, curr, idx) => {
            const nodeKind = curr.kind;
            const aggregator: AggregationKeys = getAggregator(nodeKind);
            agg.aggregation[aggregator] = agg.aggregation[aggregator] || {};
            agg.nodes[nodeKind] = nodesGroup[nodeKind];
            if (curr.health && curr.health.status) {
                agg.statusCount[curr.health.status] = (agg.statusCount[curr.health.status] || 0) + 1;

                agg.nodeStatusCount[curr.kind] = agg.nodeStatusCount[curr.kind] || {};
                agg.nodeStatusCount[curr.kind][curr.health.status] =
                    (agg.nodeStatusCount[curr.kind][curr.health.status] || 0) + 1;

                agg.aggregatorStatusCount[aggregator] = agg.aggregatorStatusCount[aggregator] || {};
                agg.aggregatorStatusCount[aggregator][curr.health.status] =
                    (agg.aggregatorStatusCount[aggregator][curr.health.status] || 0) + 1;
            }
            if (Array.isArray(curr.parentRefs)) {
                curr.parentRefs.forEach(({ kind, name }, idx) => {
                    if (nodesGroup[kind] && nodesGroup[kind].has(name)) {
                        const parentRef = nodesGroup[kind].get(name);
                        const children = parentRef.children || {};
                        children[nodeKind] = children[nodeKind] || [];
                        children[nodeKind] = [...children[nodeKind], curr.name];
                        if (!agg.nodes[kind]) {
                            agg.nodes[kind] = new Map();
                        }
                        agg.nodes[kind].set(name, { ...parentRef, children });
                    }
                });
            }

            agg.aggregation[aggregator][nodeKind] = agg.nodes[nodeKind];
            return agg;
        },
        { nodes: {}, aggregation: {}, statusCount: {}, nodeStatusCount: {}, aggregatorStatusCount: {} },
    );
}
