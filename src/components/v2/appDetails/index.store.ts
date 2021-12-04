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

const getAllParentNods = (_nodes: Array<Node>): Array<iNode>  => {
    let _allNodes: Set<iNode> = new Set()

    _nodes.forEach(_n => {
        //_allNodes.add(_n as iNode)
        _n.parentRefs?.forEach(_prn => {
            _allNodes.add(_prn as iNode)
        })
    })

    return Array.from(_allNodes)
}

const prepareNodeTreeForKind = (_nodes: Array<Node>, _kind: string ) : Array<iNode> => {

    let _filteredNodes = _nodes.filter(_node => _node.kind.toLowerCase() === _kind.toLowerCase()).map(_n => {
        return _n as iNode
    })


    const filteredParentNodes =  getAllParentNods(_nodes).filter(_node => _node.kind.toLowerCase() === _kind.toLowerCase())
    

    filteredParentNodes.map(_fpn => {
        _fpn.childNodes = _nodes.filter(_n => _n.kind.toLowerCase() === _kind.toLowerCase()).map(_n => {
            return _n as iNode
        })
    })
    
    // return filteredNodes.map((_node: Node) => {
    //     let iNode = _node as iNode

    //     //let _childNodes  = [] as Array<Node>

       

    //     //if(_childNodes.length > 0){
    //         iNode.childNodes = prepareNodeTreeForKind(getAllNod(_nodes), _kind)
    //     //}

    //     return iNode
    // })


    return _filteredNodes
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
        return prepareNodeTreeForKind(IndexStore.getAppDetailsNodes(), _kind)
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