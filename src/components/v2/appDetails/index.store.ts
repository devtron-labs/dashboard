import { func, node, string } from 'prop-types';
import { BehaviorSubject } from 'rxjs';
import { AppDetails, Node, EnvDetails, EnvType, NodeType, iNode } from './appDetails.type';
import { mapByKey } from '../../common/helpers/Helpers';
import { Filter } from '../../common/filter/filters';

let _appDetailsSubject: BehaviorSubject<AppDetails> = new BehaviorSubject({} as AppDetails);
let _nodesSubject: BehaviorSubject<Array<Node>> = new BehaviorSubject([] as Node[]);
let _nodesFilteredSubject: BehaviorSubject<Array<Node>> = new BehaviorSubject([] as Node[]);
let _envDetailsSubject: BehaviorSubject<EnvDetails> = new BehaviorSubject({} as EnvDetails);

let _nodeFilter = {
    filterType: '',
    searchString: '',
};

const publishFilteredNodes = () => {
    let filteredNodes = _nodesSubject.getValue().filter((_node: Node) => {
        if (!_nodeFilter.filterType && !_nodeFilter.searchString) {
            return true;
        }

        if (_nodeFilter.filterType === 'ALL') {
            return true;
        }

        if (_nodeFilter.filterType.toLowerCase() === _node.health?.status?.toLowerCase()) {
            return true;
        }

        return false;
    });

    _nodesFilteredSubject.next([...filteredNodes]);
};

const IndexStore = {
    setEnvDetails: (envType: string, appId: number, envId: number) => {
        let _envDetails = {} as EnvDetails;

        _envDetails.envType = envType as EnvType;
        _envDetails.appId = appId;
        _envDetails.envId = envId;

        _nodeFilter = {
            filterType: '',
            searchString: '',
        };

        _envDetailsSubject.next({ ..._envDetails });
    },

    getEnvDetails: () => {
        return _envDetailsSubject.getValue();
    },

    getEnvDetailsObservable: () => {
        return _envDetailsSubject.asObservable();
    },

    publishAppDetails: (data: AppDetails) => {
        console.log('setAppDetails', data);

        const _nodes = data.resourceTree.nodes;

        _appDetailsSubject.next({ ...data });

        _nodesSubject.next([..._nodes]);

        _nodesFilteredSubject.next([..._nodes]);
    },

    getAppDetails: () : AppDetails => {
        return _appDetailsSubject.getValue();
    },

    getAppDetailsObservable: () => {
        return _appDetailsSubject.asObservable();
    },

    getAppDetailsNodes: () => {
        return _nodesSubject.getValue();
    },

    getAppDetailsNodesObservable: () => {
        return _nodesSubject.asObservable();
    },

    getAppDetailsFilteredNodes: () => {
        return _nodesFilteredSubject.getValue();
    },

    getAppDetailsNodesFilteredObservable: () => {
        return _nodesFilteredSubject.asObservable();
    },

    getiNodesByKind: (_kind: string) => {
        const _nodes = _nodesSubject.getValue()

        let rootNodes = getiNodesByKind(_nodes, _kind)

        return rootNodes
    },

    getNodesByKind: (_kind: string) => {
        let _nodes = _nodesSubject.getValue()
        return _nodes.filter((_node) => _node.kind.toLowerCase() === _kind.toLowerCase());
    },

    getMetaDataForPod: (_name: string) => {
        return _appDetailsSubject.getValue().resourceTree.podMetadata.filter((pod) => pod.name === _name)[0];
    },

    getPodMetaData: () => {
        return _appDetailsSubject.getValue().resourceTree.podMetadata;
    },

    getAllPodNames: () => {
        return _nodesSubject
            .getValue()
            .filter((node: Node) => node.kind === NodeType.Pod)
            .map((node) => {
                return node.name;
            });
    },

    getAllContainersForPod: (_name: string) => {
        return _appDetailsSubject.getValue().resourceTree?.podMetadata?.find((pod) => pod.name === _name)?.containers;
    },

    getAllContainers: () => {
        let containers = [];

        const pods = _appDetailsSubject.getValue().resourceTree.podMetadata;

        pods.forEach((pmd) => {
            pmd.containers.forEach((c) => {
                containers.push(c);
            });
        });

        return { containers: containers, pods: pods };
    },

    getAllNewContainers: () => {
        let containers = [];

        const pods = _appDetailsSubject.getValue().resourceTree.podMetadata.filter((p) => p.isNew);

        pods.forEach((pmd) => {
            pmd.containers.forEach((c) => {
                containers.push(c);
            });
        });

        return { containers: containers, pods: pods };
    },

    getAllOldContainers: () => {
        let containers = [];

        const pods = _appDetailsSubject.getValue().resourceTree.podMetadata.filter((p) => !p.isNew);

        pods.forEach((pmd) => {
            pmd.containers.forEach((c) => {
                containers.push(c);
            });
        });

        return { containers: containers, pods: pods };
    },

    getAllPods: () => {
        let containers = [];

        const pods = _appDetailsSubject.getValue().resourceTree?.podMetadata;

        return pods;
    },

    getAllNewPods: () => {
        let containers = [];

        const pods = _appDetailsSubject.getValue().resourceTree.podMetadata.filter((p) => p.isNew);

        return pods;
    },

    getAllOldPods: () => {
        let containers = [];

        const pods = _appDetailsSubject.getValue().resourceTree.podMetadata.filter((p) => !p.isNew);

        return pods;
    },

    getPodForAContainer: (_c: string) => {
        let podeName;

        _appDetailsSubject.getValue().resourceTree.podMetadata.forEach((p) => {
            p.containers.find((c) => {
                if (c === _c) {
                    podeName = p.name;
                }
            });
        });

        return podeName;
    },

    updateFilterType: (filterType: string) => {
        _nodeFilter = { ..._nodeFilter, filterType: filterType };
        publishFilteredNodes();
    },

    updateFilterSearch: (searchString: string) => {
        if (searchString.length && searchString.length < 4) {
            return;
        }
        _nodeFilter = { ..._nodeFilter, searchString: searchString };
        publishFilteredNodes();
    },
};

export function getiNodesByKind(_nodes: Array<Node>, _kind: string): Array<iNode> {
    const rootNodes = _nodes.filter( _node => _node.kind.toLowerCase() == _kind.toLowerCase()).map( _node => _node as iNode)
    //if any node has childNode we have already processed this node during previous call to this node and there have been no api calls since then
    //hence reusing it. After api call this is unset and we will process again.
    if (rootNodes.some( _node => _node.childNodes)) {
        return rootNodes
    }
    let matchingNodes = rootNodes

    const _nodesByParent = new Map<String, Array<iNode>>()
    //Create Map with every node listing against its parent
    //structure is <group/kind: <name : [iNode]>>
    _nodes.forEach( _node => {
        _node.parentRefs?.forEach( _parent => {
            const _groupKindName = _parent.group + "/" + _parent.kind + "/" + _parent.name
            if (!_nodesByParent.has(_groupKindName)) {
                _nodesByParent.set(_groupKindName, [_node as iNode])
            } else {
                _nodesByParent.get(_groupKindName).push(_node as iNode)
            }
        })
    })

    //Iterating through nodes that have matching nodes as parents repeatedly till we reach nodes
    //which are not parent of any nodes
    while(matchingNodes.length > 0) {
        let _matchingNodes = [] as Array<iNode>
        matchingNodes.forEach( _node => {
            const _groupKindName = _node.group + "/" + _node.kind + "/" + _node.name
            if(_nodesByParent.get(_groupKindName)) {
                _matchingNodes.push(..._nodesByParent.get(_groupKindName))
                if (!_node.childNodes) {
                    _node.childNodes = [] as Array<iNode>
                }
                _node.childNodes.push(..._nodesByParent.get(_groupKindName))
            }
        })
        matchingNodes = _matchingNodes
    }

    //sort each children array
    let children = rootNodes
    while (children.length > 0) {
        children.forEach( _node => {
            (_node.childNodes ?? []).sort((a, b) => {
                if(a.name < b.name) { return -1; }
                if(a.name > b.name) { return 1; }
                return 0;
            })
        })

        //Add containers to Pod type nodes
        children
        .filter( _child => _child.kind.toLowerCase() == NodeType.Pod.toLowerCase())
        .map( _pn => {
            _pn.childNodes = _appDetailsSubject
            .getValue()
            .resourceTree?.podMetadata?.filter((_pmd) => {
                return _pmd.uid === _pn.uid;
            })[0]
            ?.containers?.map((_c) => {
                let childNode = {} as iNode;
                childNode.kind = NodeType.Containers;
                childNode['pNode'] = _pn;
                childNode.name = _c;
                return childNode;
            });
        })
        children = children.flatMap(_node => (_node.childNodes ?? []))
    }
    return rootNodes
}

export function getPodsRootParent(_nodes: Array<Node>): Array<string> {
    let podNodes = [..._nodes.filter(_node => _node.kind.toLowerCase() == NodeType.Pod.toLowerCase())]
    const _nodesById = new Map<String, Node>()

    //Create Map with every node listing against its parent
    //structure is <group/kind: <name : [iNode]>>
    _nodes.forEach( _node => {
            const _groupKindName = _node.group + "/" + _node.kind + "/" + _node.name
            _nodesById.set(_groupKindName, _node)
    })

    let uniqueParents = new Set ( podNodes.flatMap( _pod => (_pod.parentRefs ?? []).map( _parent =>  _parent.group + "/" + _parent.kind + "/" + _parent.name )))
    let rootParents = new Set<string>()
    while (uniqueParents.size > 0) {
        let _uniqueParents = new Set<string>()
        uniqueParents.forEach(_parent => {
            (_nodesById.get(_parent)?.parentRefs ?? []).forEach(_parent => _uniqueParents.add(_parent.group + "/" + _parent.kind + "/" + _parent.name))
            if ((_nodesById.get(_parent)?.parentRefs ?? []).length == 0) {
                let selfNode = _nodesById.get(_parent)
                if (selfNode) {
                    rootParents.add(selfNode.group + "/" + selfNode.kind + "/" + selfNode.name)
                }
            }
        })
        uniqueParents = _uniqueParents
    }
    return [...rootParents].sort()
}

export default IndexStore;
