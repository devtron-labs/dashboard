import { BehaviorSubject } from "rxjs";
import { AppDetails, EnvDetails, EnvType, Node } from "./appDetail.type";

let _envDetails = {} as EnvDetails
let _appDetails = {} as AppDetails
let _nodesSubject: BehaviorSubject<Array<Node>> = new BehaviorSubject(_appDetails.resourceTree?.nodes || []);


const AppDetailsStore = {

    setEnvDetails: (envType: string, appId: number, envId: number) => {
        _envDetails.envType = envType as EnvType
        _envDetails.appId = appId
        _envDetails.envId = envId
    },

    getEnvDetails: () => {
        return {..._envDetails}
    },

    setAppDetails: (data: AppDetails) => {
        console.log("setting app details", data)
        _appDetails = data
        _nodesSubject.next([...data.resourceTree.nodes])
    },

    getAppDetails: () => {
        return _appDetails
    },

    getAppDetailsNodes: () => {
        return _nodesSubject.getValue()
    },

    getAppDetailsNodesObservable: () => {
        return _nodesSubject.asObservable()
    }
}

export default AppDetailsStore;