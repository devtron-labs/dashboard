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

/* eslint-disable eqeqeq */
/* eslint-disable array-callback-return */
import { BehaviorSubject } from 'rxjs'
import { AppDetails, AppType, EnvDetails, EnvType, Node, Nodes, PodMetaData, iNode } from '../types'

const _appDetailsSubject: BehaviorSubject<AppDetails> = new BehaviorSubject({} as AppDetails)
const _nodesSubject: BehaviorSubject<Array<Node>> = new BehaviorSubject([] as Node[])
const _nodesFilteredSubject: BehaviorSubject<Array<Node>> = new BehaviorSubject([] as Node[])
const _envDetailsSubject: BehaviorSubject<EnvDetails> = new BehaviorSubject({} as EnvDetails)

let _nodeFilter = {
    filterType: '',
    searchString: '',
}

const publishFilteredNodes = () => {
    const filteredNodes = _nodesSubject.getValue().filter((_node: Node) => {
        if (!_nodeFilter.filterType && !_nodeFilter.searchString) {
            return true
        }

        if (_nodeFilter.filterType === 'ALL') {
            return true
        }

        if (_nodeFilter.filterType.toLowerCase() === _node.health?.status?.toLowerCase()) {
            return true
        }

        return false
    })

    _nodesFilteredSubject.next([...filteredNodes])
}

export function getiNodesByRootNodeWithChildNodes(
    _nodes: Array<Node>,
    rootNodes: Array<iNode>,
    podMetadata?: Array<PodMetaData>,
): Array<iNode> {
    // if any node has childNode we have already processed this node during previous call to this node and there have been no api calls since then
    // hence reusing it. After api call this is unset and we will process again.

    if (rootNodes.some((_node) => _node.childNodes)) {
        return rootNodes
    }
    let matchingNodes = rootNodes

    const _nodesByParent = new Map<string, Array<iNode>>()
    // Create Map with every node listing against its parent
    // structure is <group/kind: <name : [iNode]>>
    _nodes.forEach((_node) => {
        _node.parentRefs?.forEach((_parent) => {
            const _groupKindName = `${_parent.group}/${_parent.kind}/${_parent.name}`
            if (!_nodesByParent.has(_groupKindName)) {
                _nodesByParent.set(_groupKindName, [_node as iNode])
            } else {
                _nodesByParent.get(_groupKindName).push(_node as iNode)
            }
        })
    })

    // Iterating through nodes that have matching nodes as parents repeatedly till we reach nodes
    // which are not parent of any nodes
    while (matchingNodes.length > 0) {
        const _matchingNodes = [] as Array<iNode>
        matchingNodes.forEach((_node) => {
            const _groupKindName = `${_node.group}/${_node.kind}/${_node.name}`
            if (_nodesByParent.get(_groupKindName)) {
                _matchingNodes.push(..._nodesByParent.get(_groupKindName))
                if (!_node.childNodes) {
                    // eslint-disable-next-line no-param-reassign
                    _node.childNodes = [] as Array<iNode>
                }
                _node.childNodes.push(..._nodesByParent.get(_groupKindName))
            }
        })
        matchingNodes = _matchingNodes
    }

    // sort each children array
    let children = rootNodes
    while (children.length > 0) {
        children.forEach((_node) => {
            ;(_node.childNodes ?? []).sort((a, b) => {
                if (a.name < b.name) {
                    return -1
                }
                if (a.name > b.name) {
                    return 1
                }
                return 0
            })
        })

        // Add containers to Pod type nodes
        children
            .filter((_child) => _child.kind.toLowerCase() == Nodes.Pod.toLowerCase())
            .map((_pn) => {
                // eslint-disable-next-line no-param-reassign
                _pn.childNodes = (podMetadata || _appDetailsSubject.getValue().resourceTree?.podMetadata)
                    ?.filter((_pmd) => _pmd.uid === _pn.uid)[0]
                    ?.containers?.map((_c) => {
                        const childNode = {} as iNode
                        childNode.kind = Nodes.Containers
                        // @ts-ignore -- pNode does not exist on iNode
                        childNode.pNode = _pn
                        childNode.name = _c
                        return childNode
                    })
            })
        children = children.flatMap((_node) => _node.childNodes ?? [])
    }
    return rootNodes
}

export const reduceKindStatus = (aggregatedStatus: string, newStatus: string) => {
    if (aggregatedStatus?.toLowerCase() == 'degraded' || newStatus?.toLowerCase() == 'degraded') {
        return 'degraded'
    }
    if (aggregatedStatus?.toLowerCase() == 'progressing' || newStatus?.toLowerCase() == 'progressing') {
        return 'progressing'
    }
    return 'healthy'
}

export function getiNodesByKindWithChildNodes(_nodes: Array<Node>, _kind: string): Array<iNode> {
    const rootNodes = _nodes
        .filter((_node) => _node.kind.toLowerCase() == _kind.toLowerCase())
        .map((_node) => _node as iNode)
    return getiNodesByRootNodeWithChildNodes(_nodes, rootNodes)
}

export function getPodsRootParentNameAndStatus(_nodes: Array<Node>): Array<[string, string]> {
    const podNodes = [..._nodes.filter((_node) => _node.kind.toLowerCase() == Nodes.Pod.toLowerCase())]
    const _nodesById = new Map<string, Node>()

    // Create Map with every node listing against its parent
    // structure is <group/kind: <name : [iNode]>>
    _nodes.forEach((_node) => {
        const _groupKindName = `${_node.group}/${_node.kind}/${_node.name}`
        _nodesById.set(_groupKindName, _node)
    })

    let uniqueParents = podNodes
        .flatMap((_pod) =>
            (_pod.parentRefs ?? []).map((_parent) => [
                `${_parent.group}/${_parent.kind}/${_parent.name}`,
                _pod.health?.status ?? '',
            ]),
        )
        .reduce((acc, val) => {
            if (!acc.get(val[0])) {
                acc.set(val[0], val[1])
            } else {
                acc.set(val[0], reduceKindStatus(acc.get(val[0]), val[1]))
            }
            return acc
        }, new Map<string, string>())

    const rootParents = new Map<string, string>()
    while (uniqueParents.size > 0) {
        const _uniqueParents = new Map<string, string>()
        uniqueParents.forEach((_status, _parent) => {
            ;(_nodesById.get(_parent)?.parentRefs ?? []).forEach((parent) =>
                _uniqueParents.set(`${parent.group}/${parent.kind}/${parent.name}`, _status),
            )
            if ((_nodesById.get(_parent)?.parentRefs ?? []).length == 0) {
                const selfNode = _nodesById.get(_parent)
                if (selfNode) {
                    rootParents.set(`${selfNode.group}/${selfNode.kind}/${selfNode.name}`, _status)
                }
            }
        })
        uniqueParents = _uniqueParents
    }
    // value is status
    return Array.from(rootParents, ([name, value]) => [name, value] as [string, string]).sort(
        (a: [string, string], b: [string, string]) => {
            if (a[0] > b[0]) {
                return 1
            }
            return -1
        },
    )
}

export const getPodsForRootNodeName = (_rootNode: string, _treeNodes: Array<Node>): Array<iNode> => {
    const root = _treeNodes
        .filter((_tn) => _tn.name.toLowerCase() == _rootNode.toLowerCase() && !_tn.parentRefs)
        .map((_tn) => _tn as iNode)
    let rootNodes = getiNodesByRootNodeWithChildNodes(_treeNodes, root)
    let pods = [] as Array<iNode>
    while (rootNodes?.length > 0) {
        pods = pods.concat(rootNodes.filter((_n) => _n.kind.toLowerCase() == Nodes.Pod.toLowerCase()))
        rootNodes = rootNodes.flatMap((_n) => _n.childNodes ?? [])
    }
    return pods
}

export const IndexStore = {
    setEnvDetails: (envType: string, appId: number, envId: number) => {
        const _envDetails = {} as EnvDetails

        _envDetails.envType = envType as EnvType
        _envDetails.appId = appId
        _envDetails.envId = envId

        _nodeFilter = {
            filterType: '',
            searchString: '',
        }

        _envDetailsSubject.next({ ..._envDetails })
    },

    getEnvDetails: () => _envDetailsSubject.getValue(),

    getEnvDetailsObservable: () => _envDetailsSubject.asObservable(),

    publishAppDetails: (data: AppDetails, appType: AppType) => {
        const _nodes = data.resourceTree?.nodes || []

        const podMetadata = data.resourceTree?.podMetadata || []

        getiNodesByRootNodeWithChildNodes(
            _nodes,
            _nodes.filter((_n) => (_n.parentRefs ?? []).length == 0).map((_n) => _n as iNode),
            podMetadata,
        )

        _appDetailsSubject.next({ ...data, appType })

        _nodesSubject.next([..._nodes])

        _nodesFilteredSubject.next([..._nodes])
    },

    getAppDetails: (): AppDetails => _appDetailsSubject.getValue(),

    getAppDetailsObservable: () => _appDetailsSubject.asObservable(),

    getAppDetailsNodes: () => _nodesSubject.getValue(),

    getAppDetailsNodesObservable: () => _nodesSubject.asObservable(),

    getAppDetailsFilteredNodes: () => _nodesFilteredSubject.getValue(),

    getAppDetailsNodesFilteredObservable: () => _nodesFilteredSubject.asObservable(),

    getiNodesByKind: (_kind: string) => {
        const _nodes = _nodesSubject.getValue()

        const rootNodes = getiNodesByKindWithChildNodes(_nodes, _kind)

        return rootNodes
    },

    getNodesByKind: (_kind: string) => {
        const _nodes = _nodesSubject.getValue()
        return _nodes.filter((_node) => _node.kind.toLowerCase() === _kind.toLowerCase())
    },

    getMetaDataForPod: (_name: string) =>
        _appDetailsSubject.getValue().resourceTree?.podMetadata?.filter((pod) => pod.name === _name)[0] ||
        ({} as PodMetaData),

    getPodMetaData: () => _appDetailsSubject.getValue().resourceTree.podMetadata,

    getPodsForRootNode: (rootNode: string): Array<iNode> => {
        const _nodes = _nodesSubject.getValue()
        return getPodsForRootNodeName(rootNode, _nodes)
    },

    getAllPodNames: () =>
        _nodesSubject
            .getValue()
            .filter((node: Node) => node.kind === Nodes.Pod)
            .map((node) => node.name),

    getPodsRootParentNameAndStatus: (): Array<[string, string]> => {
        const _nodes = _nodesSubject.getValue()
        return getPodsRootParentNameAndStatus(_nodes)
    },

    getAllContainersForPod: (_name: string) =>
        _appDetailsSubject.getValue().resourceTree?.podMetadata?.find((pod) => pod.name === _name)?.containers,

    getAllContainers: () => {
        const containers = []

        const pods = _appDetailsSubject.getValue().resourceTree.podMetadata

        pods.forEach((pmd) => {
            pmd.containers.forEach((c) => {
                containers.push(c)
            })
        })

        return { containers, pods }
    },

    getAllNewContainers: () => {
        const containers = []

        const pods = _appDetailsSubject.getValue().resourceTree.podMetadata.filter((p) => p.isNew)

        pods.forEach((pmd) => {
            pmd.containers.forEach((c) => {
                containers.push(c)
            })
        })

        return { containers, pods }
    },

    getAllOldContainers: () => {
        const containers = []

        const pods = _appDetailsSubject.getValue().resourceTree.podMetadata.filter((p) => !p.isNew)

        pods.forEach((pmd) => {
            pmd.containers.forEach((c) => {
                containers.push(c)
            })
        })

        return { containers, pods }
    },

    getAllPods: () => {
        const pods = _appDetailsSubject.getValue().resourceTree?.podMetadata || []

        return pods
    },

    getAllNewPods: () => {
        const pods = _appDetailsSubject.getValue().resourceTree.podMetadata.filter((p) => p.isNew)

        return pods
    },

    getAllOldPods: () => {
        const pods = _appDetailsSubject.getValue().resourceTree.podMetadata.filter((p) => !p.isNew)

        return pods
    },

    getPodForAContainer: (_c: string) => {
        let podeName

        _appDetailsSubject.getValue().resourceTree.podMetadata.forEach((p) => {
            p.containers.find((c) => {
                if (c === _c) {
                    podeName = p.name
                }
            })
        })

        return podeName
    },

    updateFilterType: (filterType: string) => {
        _nodeFilter = { ..._nodeFilter, filterType }
        publishFilteredNodes()
    },

    updateFilterSearch: (searchString: string) => {
        if (searchString.length && searchString.length < 4) {
            return
        }
        _nodeFilter = { ..._nodeFilter, searchString }
        publishFilteredNodes()
    },
}
