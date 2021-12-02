import { node } from "prop-types";
import { BehaviorSubject } from "rxjs";
import { AppDetails, Node, EnvDetails, EnvType, NodeType } from "./appDetails.type";

let _envDetails = {} as EnvDetails
let _appDetails = {} as AppDetails
let _nodes = [] as Node[]
let _nodesSubject: BehaviorSubject<Array<Node>> = new BehaviorSubject(_nodes);
let _envDetailsSubject: BehaviorSubject<EnvDetails> = new BehaviorSubject(_envDetails);

let _nodeFilter = {
    filterType: '',
    searchString: ''
}

const publishAppDetails  = () => {
    let _nodes = _appDetails.resourceTree.nodes;

    let filteredNodes = _nodes.filter((_node: Node) => {
        if(!_nodeFilter.filterType  && !_nodeFilter.searchString){
            return true
        }

        let _nodeHealth = _node.health?.status || "Healthy"

        if(_nodeFilter.filterType && _nodeFilter.filterType !== "All" && _nodeFilter.filterType.toLowerCase() !== _nodeHealth.toLowerCase()){
            return false
        }

        if(_node.name.indexOf(_nodeFilter.searchString) === -1){
            return false
        }

        return true
    });

    _nodesSubject.next([...filteredNodes])
}

const IndexStore = {
    setEnvDetails: (envType: string, appId: number, envId: number) => {
        _envDetails.envType = envType as EnvType
        _envDetails.appId = appId
        _envDetails.envId = envId

        _envDetailsSubject.next({..._envDetails})
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

    updateFilterType: (filterType: string) => {
        _nodeFilter = {..._nodeFilter, filterType: filterType }
        publishAppDetails()
    },

    updateFilterSearch: (searchString: string) => {
        if(searchString.length && searchString.length < 4){
            return
        }
        _nodeFilter = {..._nodeFilter, searchString: searchString }
        publishAppDetails()
    }
}

export default IndexStore;