import { TARGET_K8S_VERSION_SEARCH_KEY } from '../Constants'

export const parseSearchParams = (searchParams: URLSearchParams) => ({
    targetK8sVersion: searchParams.get(TARGET_K8S_VERSION_SEARCH_KEY),
})
