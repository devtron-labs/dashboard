import { BehaviorSubject } from 'rxjs';
import { AppDetails, Node, EnvDetails, EnvType, NodeType, iNode } from './appDetails.type';

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

    setAppDetails: (data: AppDetails) => {
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

        const rootNodes = _nodes.filter( _node => _node.kind.toLowerCase() == _kind.toLowerCase()).map( _node => _node as iNode)
        //if any node as childNode we have already processed this node and there have been not api calls since then
        //hence reusing it. After api call this is unset
        if (rootNodes.some( _node => _node.childNodes)) {
            return rootNodes
        }
        let matchingNodes = rootNodes
        const _nodesByParent = new Map<String, Map<String, Array<iNode>>>()

        //Create Map with every node listing against its parent
        //structure is <group/kind: <name : [iNode]>>
        _nodes.forEach( _node => {
            _node.parentRefs?.forEach( _parent => {
                const _groupKind = _parent.group + "/" + _parent.kind
                if (!_nodesByParent.has(_groupKind)) {
                    _nodesByParent.set(_groupKind, new Map<String, Array<iNode>>())
                }
                if (!_nodesByParent.get(_groupKind).has(_parent.name)) {
                    _nodesByParent.get(_groupKind).set(_parent.name, [_node as iNode])
                } else {
                    _nodesByParent.get(_groupKind).get(_parent.name).push(_node as iNode)
                }
            })
        })

        //check if matching nodes is parent of some other nodes then add those nodes as children of corresponding matching node
        // and set these children nodes as the matching nodes. Repeat the process till we dont matching nodes as parent as of other nodes.
        while (matchingNodes.length > 0) {
            let _matchingNodes = [] as Array<iNode>
            matchingNodes.forEach( _node => {
                const _groupKind = _node.group + "/" + _node.kind
                const children = _nodesByParent.get(_groupKind)?.get(_node.name) ?? [] as Array<iNode>
                if (children.length > 0) {
                    if (!_node.childNodes) {
                        _node.childNodes = [] as Array<iNode>
                    }
                    _node.childNodes.push(...children)
                    _matchingNodes.push(...children)
                }
            })
            matchingNodes = _matchingNodes
        }

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
    },

    getNodesByKind: (_kind: string) => {
        const _nodes = _nodesSubject.getValue();
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

        const pods = _appDetailsSubject.getValue().resourceTree.podMetadata;

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

export default IndexStore;
