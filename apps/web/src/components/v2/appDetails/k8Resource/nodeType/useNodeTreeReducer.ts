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

import { AggregationKeys, getAggregator, iNode, Node, NodeType } from '../../appDetails.type'
import { getPodsRootParentNameAndStatus, reduceKindStatus } from '../../index.store'

export const getTreeNodesWithChild = (_nodes: Node[]): iNode[] => {
    const podParents = getPodsRootParentNameAndStatus(_nodes)
    const _inodes: iNode[] = []

    const nodesByAggregator = _nodes.reduce(
        (nodesByAggregator: Map<string, Map<string, string | [string, string][]>>, node: Node) => {
            const agg = getAggregator(node.kind as NodeType)
            if (!nodesByAggregator.get(agg)) {
                nodesByAggregator.set(agg, new Map<string, string | [string, string][]>())
            }
            if (!nodesByAggregator.get(agg).get(node.kind)) {
                nodesByAggregator.get(agg).set(node.kind, node.health?.status ?? '')
            } else {
                // At this stage we know status in string therefore we can safely cast it to string
                nodesByAggregator
                    .get(agg)
                    .set(
                        node.kind,
                        reduceKindStatus(nodesByAggregator.get(agg).get(node.kind) as string, node.health?.status),
                    )
            }
            return nodesByAggregator
        },
        new Map<string, Map<string, string | [string, string][]>>(),
    )

    Object.keys(AggregationKeys).map((key) => {
        if (nodesByAggregator.get(AggregationKeys[key])?.size > 0) {
            const _inode = {} as iNode
            _inode.name = AggregationKeys[key]
            _inode.childNodes = Array.from(nodesByAggregator.get(AggregationKeys[key]), ([name, value]) => {
                const _node = { name, status: value, isSelected: false } as iNode
                if (name.toLowerCase() == NodeType.Pod.toLowerCase() && podParents.length > 0) {
                    _node.childNodes = podParents.map((_podParent) => {
                        const pParts = _podParent[0].split('/')
                        return { name: pParts[pParts.length - 1], status: _podParent[1], isSelected: false } as iNode
                    })
                }
                return _node
            }).sort((a, b) => (a.name < b.name ? -1 : 1))
            _inodes.push(_inode)
        }
    })
    return _inodes
}
