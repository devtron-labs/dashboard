import { Routes } from '../../config'
import { get, post } from '@devtron-labs/devtron-fe-common-lib'

export function saveCIConfig(request) {
    return post(Routes.CI_CONFIG_GET, request)
}

export function updateCIConfig(request) {
    return post(Routes.CI_CONFIG_UPDATE, request)
}

export function getDockerRegistryMinAuth(appId: string, isStorageActionPush?: boolean) {
    return get(`${Routes.APP}/${appId}/autocomplete/docker${isStorageActionPush ? '?storageType=CHART&storageAction=PUSH' : ''}`)
}

export const getBuildpackMetadata = (): Promise<any> => {
    return fetch(`${window?._env_?.CENTRAL_API_ENDPOINT || 'https://api.devtron.ai'}/buildpackMetadata`).then((res) =>
        res.json(),
    )
}

export const getDockerfileTemplate = (): Promise<any> => {
    return fetch(`${window?._env_?.CENTRAL_API_ENDPOINT || 'https://api.devtron.ai'}/dockerfileTemplate`).then((res) =>
        res.json(),
    )
}