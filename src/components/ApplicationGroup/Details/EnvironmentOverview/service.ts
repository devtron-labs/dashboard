import { post } from '@devtron-labs/devtron-fe-common-lib'

export const manageApps = async (
    appIds: number[],
    envId: number,
    envName: string,
    action: 'hibernate' | 'unhibernate',
) => post(`batch/v1beta1/${action}`, { appIdIncludes: appIds, envId, envName })
