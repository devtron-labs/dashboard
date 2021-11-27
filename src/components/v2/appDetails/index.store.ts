import { BehaviorSubject } from "rxjs";
import { AppDetails, Node } from "./appDetails.type";
import { EnvDetails, EnvType } from "./appDetails.type";

let _envDetails = {} as EnvDetails
let _appDetails = {} as AppDetails
let _nodes = [] as Node[]
let _nodesSubject: BehaviorSubject<Array<Node>> = new BehaviorSubject(_nodes);
let _envDetailsSubject: BehaviorSubject<EnvDetails> = new BehaviorSubject(_envDetails);


const IndexStore = {
    setEnvDetails: (envType: string, appId: number, envId: number) => {
        _envDetails.envType = envType as EnvType
        _envDetails.appId = appId
        _envDetails.envId = envId

        _envDetailsSubject.next({..._envDetails})
    },

    // getEnvDetails: () => {
    //     return {..._envDetails}
    // },

    getEnvDetails: () => {
        return _envDetailsSubject.getValue()
    },

    getEnvDetailsObservable: () => {
        return _envDetailsSubject.asObservable()
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

export default IndexStore;