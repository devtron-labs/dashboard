import { BehaviorSubject } from "rxjs";
import { AppDetails, Node, EnvDetails, EnvType, NodeType, iNode } from "./appDetails.type";

let _envDetails = {} as EnvDetails
let _appDetails = {} as AppDetails
const _nodesEmpty = [] as Node[]
let _nodesSubject: BehaviorSubject<Array<Node>> = new BehaviorSubject(_nodesEmpty)
let _nodesFilteredSubject: BehaviorSubject<Array<Node>> = new BehaviorSubject(_nodesEmpty)
let _envDetailsSubject: BehaviorSubject<EnvDetails> = new BehaviorSubject(_envDetails)

let _nodeFilter = {
    filterType: '',
    searchString: ''
}

const publishFilteredNodes = () => {

    let filteredNodes = _nodesSubject.getValue().filter((_node: Node) => {
        if (!_nodeFilter.filterType && !_nodeFilter.searchString) {
            return true
        }

        if (_nodeFilter.filterType === "ALL") {
            return true
        }

        if (_nodeFilter.filterType.toLowerCase() === _node.health?.status?.toLowerCase()) {
            return true
        }
        // let _nodeHealth = _node.health?.status || ""

        // if (_node.name.indexOf(_nodeFilter.searchString) === -1) {
        //     return false
        // }

        return false
    });

    _nodesFilteredSubject.next([...filteredNodes])
}

const fillChildNodes = (_allParentNodes: Array<iNode>, _nodes: Array<Node>, _kind: string) => {
    return _allParentNodes.map((_pn: iNode) => {
        let childNodes = [];
        //let _childNodesTypes = []

        _nodes.forEach((_n: Node) => {
            _n.parentRefs?.forEach(_pr => {
                if (_pr.uid === _pn.uid) {
                    childNodes.push(_n as iNode)
                    //_childNodesTypes.push(_n.name)
                }
            })
        })

        if (childNodes.length > 0) {
            fillChildNodes(childNodes, _nodes, _kind)

            _pn.childNodes = childNodes
        }

        if(_kind.toLowerCase() === NodeType.Pod.toLowerCase()){
            _pn.childNodes = _appDetails.resourceTree.podMetadata.filter(_pmd => {
                return _pmd.uid === _pn.uid
            })[0]?.containers.map(_c => {
                let childNode = {} as iNode
                childNode.kind = NodeType.Containers
                childNode['pNode'] = _pn
                childNode.name = _c
                return childNode
            })
        }

        return _pn
    })
}

const getAllParentNods = (_nodes: Array<Node>, _kind: string): Array<iNode> => {
    let _allParentNodes = []
    let _allParentNodeTypes = []

    _nodes.forEach(_n => {
        _n.parentRefs?.forEach((_prn: Node) => {
            //if (_allParentNodeTypes.indexOf(_n.kind) === -1) {
                let prn = _n as iNode;
                _allParentNodes.push(prn)
                _allParentNodeTypes.push(_prn.kind)
           // }
        })
    })


    return fillChildNodes(_allParentNodes, _nodes, _kind)
}

const IndexStore = {
    setEnvDetails: (envType: string, appId: number, envId: number) => {
        _envDetails.envType = envType as EnvType
        _envDetails.appId = appId
        _envDetails.envId = envId

        _envDetailsSubject.next({ ..._envDetails })
    },

    getEnvDetails: () => {
        return _envDetailsSubject.getValue()
    },

    getEnvDetailsObservable: () => {
        return _envDetailsSubject.asObservable()
    },

    setAppDetails: (data: AppDetails) => {
        _appDetails = data

        console.log("setAppDetails", _appDetails)

        const _nodes = _appDetails.resourceTree.nodes;

        _nodesSubject.next([..._nodes])
        _nodesFilteredSubject.next([..._nodes])
    },

    getAppDetails: () => {
        return _appDetails
    },

    getAppDetailsNodes: () => {
        return _nodesSubject.getValue()
    },

    getAppDetailsNodesObservable: () => {
        return _nodesSubject.asObservable()
    },

    getAppDetailsFilteredNodes: () => {
        return _nodesFilteredSubject.getValue()
    },

    getAppDetailsNodesFilteredObservable: () => {
        return _nodesFilteredSubject.asObservable()
    },

    getiNodesByKind: (_kind: string) => {
        const _nodes = _nodesSubject.getValue()
        const parentNodes = getAllParentNods(_nodes, _kind)

        let _filteredNodes = parentNodes.filter((pn) => pn.kind.toLowerCase() === _kind.toLowerCase())

        if (_filteredNodes.length === 0) {
            _filteredNodes = _nodes.filter(_node => _node.kind.toLowerCase() === _kind.toLowerCase()).map(_n => {
                return _n as iNode
            })
        }

        return _filteredNodes
    },

    getNodesByKind: (_kind: string) => {
        const _nodes = _nodesSubject.getValue()
        return _nodes.filter(_node => _node.kind.toLowerCase() === _kind.toLowerCase())
    },

    getMetaDataForPod: (_name: string) => {
        return _appDetails.resourceTree.podMetadata.filter(pod => pod.name === _name)[0]
    },

    getPodMetaData: () => {
        return _appDetails.resourceTree.podMetadata
    },

    getAppDetailsPodNodesNames: () => {
        return _nodesSubject.getValue().filter((node: Node) => node.kind === NodeType.Pod).map(node => {
            return node.name
        })
    },

    updateFilterType: (filterType: string) => {
        _nodeFilter = { ..._nodeFilter, filterType: filterType }
        publishFilteredNodes()
    },

    updateFilterSearch: (searchString: string) => {
        if (searchString.length && searchString.length < 4) {
            return
        }
        _nodeFilter = { ..._nodeFilter, searchString: searchString }
        publishFilteredNodes()
    }

}

export default IndexStore;