import { get } from "../../../../../services/api";

// export const getManifestResource = (appName: string, _envId: number) => {
//     return get(`app-store/installed-app/detail?installed-app-id=${_appId}&env-id=${_envId}`)
// }

export const getEvent = () => {
    //http://localhost:3000/orchestrator/api/v1/applications/aviral25nov-devtron-demo/events?resourceNamespace=devtron-demo&resourceUID=925f8545-306c-4470-8256-8c8e4e97efa8&resourceName=secret-cm-472
    return get(`api/v1/applications/aviral25nov-devtron-demo/events?resourceNamespace=devtron-demo&resourceUID=925f8545-306c-4470-8256-8c8e4e97efa8&resourceName=secret-cm-472`)
}

//export const getManifestResource = (appName: string, envName: string, version: string, namespace: string, group: string, kind: string, name: string ) => {
//  if (!group) group = '';
export const getManifestResource = () => {
    //http://localhost:3000/orchestrator/api/v1/applications/aviral25nov-devtron-demo/resource?version=v1&namespace=devtron-demo&group=&kind=Secret&resourceName=secret-cm-472
    //return get(`api/v1/applications/${appName}-${envName}/resource?version=${version}&namespace=${namespace}&group=${group}&kind=${kind}&resourceName=${name}`)
    return get(`api/v1/applications/aviral25nov-devtron-demo/resource?version=v1&namespace=devtron-demo&group=&kind=Secret&resourceName=secret-cm-472`)
}