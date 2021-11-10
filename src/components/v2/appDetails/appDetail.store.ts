import { ENV_DETAILS, ENV_TYPE } from "./appDetail.type";

let envDetails= {} as ENV_DETAILS

const AppDetailsStore = {

    setEnvDetails: (envType: string, appId: number, envId: number) => {
        envDetails.envType = ENV_TYPE[envType]
        envDetails.appId = appId
        envDetails.envId = envId
    },
    getEnvDetails: () => {
        return envDetails
    },
}

export default AppDetailsStore;