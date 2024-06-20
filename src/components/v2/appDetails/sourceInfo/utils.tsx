import { AppType } from '../appDetails.type'

export const getEnvironmentName = (
    appType: AppType,
    clusterName: string,
    namespace: string,
    environmentName: string,
): string => {
    if (appType === AppType.EXTERNAL_ARGO_APP) {
        return `${clusterName}__${namespace}`
    }
    return environmentName || ' '
}
