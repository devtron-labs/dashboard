import { BehaviorSubject } from "rxjs";
import { AppDetails, Node, EnvDetails, EnvType, NodeType, AggregationKeys, iNode, getAggregator } from "./appDetails.type";

let _envDetails = {} as EnvDetails
let _appDetails = {} as AppDetails
let _nodes = [] as Node[]
let _nodesSubject: BehaviorSubject<Array<Node>> = new BehaviorSubject(_nodes);
let _envDetailsSubject: BehaviorSubject<EnvDetails> = new BehaviorSubject(_envDetails);

let _nodeFilter = {
    filterType: '',
    searchString: ''
}

const publishAppDetails = () => {
    let _nodes = _appDetails.resourceTree.nodes;

    let filteredNodes = _nodes.filter((_node: Node) => {
        if (!_nodeFilter.filterType && !_nodeFilter.searchString) {
            return true
        }

        let _nodeHealth = _node.health?.status || "Healthy"

        if (_nodeFilter.filterType && _nodeFilter.filterType !== "All" && _nodeFilter.filterType.toLowerCase() !== _nodeHealth.toLowerCase()) {
            return false
        }

        if (_node.name.indexOf(_nodeFilter.searchString) === -1) {
            return false
        }

        return true
    });

    _nodesSubject.next([...filteredNodes])
}

const fillChildNodes = (_allParentNodes: Array<iNode>, _nodes: Array<Node>) => {
    return _allParentNodes.map((_pn: iNode) => {
        let childNodes = [];

        _nodes.forEach((_n: Node) => {
            _n.parentRefs?.forEach(_pr => {
                if (_pr.kind === _pn.kind) {
                    childNodes.push(_n as iNode)
                }
            })
        })

        if (childNodes.length > 0) {
            fillChildNodes(childNodes, _nodes)
        }

        _pn.childNodes = childNodes

        return _pn
    })
}

const getAllParentNods = (_nodes: Array<Node>): Array<iNode> => {
    let _allParentNodes = []
    let _allParentNodeTypes = []

    _nodes.forEach(_n => {
        _n.parentRefs?.forEach((_prn: Node) => {
            if (_allParentNodeTypes.indexOf(_prn.kind) === -1) {
                let prn = _prn as iNode;
                _allParentNodes.push(prn)
                _allParentNodeTypes.push(_prn.kind)
            }
        })
    })


    return fillChildNodes(_allParentNodes, _nodes)
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

        publishAppDetails()
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

    getNodesByKind: (_kind: string) => {
        const _nodes = _nodesSubject.getValue()
        const parentNodes = getAllParentNods(_nodes)

        let _filteredNodes = parentNodes.filter((pn) => pn.kind.toLowerCase() === _kind.toLowerCase())

        if (_filteredNodes.length === 0) {
            _filteredNodes = _nodes.filter(_node => _node.kind.toLowerCase() === _kind.toLowerCase()).map(_n => {
                return _n as iNode
            })
        }

        return _filteredNodes
    },

    getAppDetailsPodNodes: () => {
        return _nodesSubject.getValue().filter((node: Node) => node.kind === NodeType.Pod)
    },

    updateFilterType: (filterType: string) => {
        _nodeFilter = { ..._nodeFilter, filterType: filterType }
        publishAppDetails()
    },

    updateFilterSearch: (searchString: string) => {
        if (searchString.length && searchString.length < 4) {
            return
        }
        _nodeFilter = { ..._nodeFilter, searchString: searchString }
        publishAppDetails()
    }
}

export default IndexStore;