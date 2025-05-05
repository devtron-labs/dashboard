import { APIOptions } from '@devtron-labs/devtron-fe-common-lib'

export interface GetArgoAppDetailParamsType extends Pick<APIOptions, 'abortControllerRef'> {
    appName: string
    clusterId: string
    namespace: string
}
