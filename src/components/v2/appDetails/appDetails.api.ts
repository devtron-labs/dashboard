import { Routes } from "../../../config/constants";
import { get, trash } from "../../../services/api";

export const getInstalledChartDetail = (_appId: number, _envId: number) => {
    return get(`app-store/installed-app/detail?installed-app-id=${_appId}&env-id=${_envId}`)
}

export const getInstalledAppDetail = (_appId: number, _envId: number) => {
    return get(`app/detail?app-id=${_appId}&env-id=${_envId}`)
}

export const deleteResource = ({ appName, env, name, kind, group, namespace, version, appId, envId }) => {
    if (!group) group = '';
    const URL = `${Routes.APPLICATIONS}/${appName}-${env}/resource?name=${name}&namespace=${namespace}&resourceName=${name}&version=${version}&group=${group}&kind=${kind}&force=true&appId=${appId}&envId=${envId}`;
    return trash(URL);
}