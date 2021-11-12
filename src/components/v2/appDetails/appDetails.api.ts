import { get } from "../../../services/api";
import AppDetailsStore from "./appDetail.store";

export const getInstalledAppDetail = () => {
    const envDetails = AppDetailsStore.getEnvDetails();

    return get(`app-store/installed-app/detail?installed-app-id=${envDetails.appId}&env-id=${envDetails.envId}`)
}
