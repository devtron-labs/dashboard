import React from 'react'

export const getEnvironmentName = (
    clusterName: string,
    namespace: string,
    environmentName: string,
): string | JSX.Element => environmentName || `${clusterName}__${namespace}` || <span>&nbsp;</span>
