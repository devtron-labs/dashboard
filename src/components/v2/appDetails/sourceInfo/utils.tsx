import React from 'react'
import { AppType } from '../appDetails.type'

export const getEnvironmentName = (
    appType: AppType,
    clusterName: string,
    namespace: string,
    environmentName: string,
) => (appType === AppType.EXTERNAL_ARGO_APP ? `${clusterName}__${namespace}` : environmentName || <span>&nbsp;</span>)
