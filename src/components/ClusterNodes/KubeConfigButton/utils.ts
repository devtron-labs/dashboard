/*
 * Copyright (c) 2024. Devtron Inc.
 */

import { getCookie, TOKEN_COOKIE_NAME } from '@devtron-labs/devtron-fe-common-lib'

export const getKubeConfigContextCommand = (clusterName: string) => `kubectl config use-context devtron-${clusterName}`

export const getKubeConfigCommand = (clusterName: string) => {
    const token = getCookie(TOKEN_COOKIE_NAME)

    // NOTE: please don't modify spacing in the following template string
    return `kubectl config set-cluster devtron-${clusterName} --server=https://${window.location.host}/orchestrator/k8s/proxy/cluster/${clusterName} --insecure-skip-tls-verify
kubectl config set-credentials devtron-${clusterName} --token=${token}
kubectl config set-context devtron-${clusterName} --cluster=devtron-${clusterName} --user=devtron-${clusterName}`
}

export const getKubeConfigCommandWithContext = (clusterNames: string[], context?: string) => {
    const commands = clusterNames.map((clusterName) => `${getKubeConfigCommand(clusterName)}`)
    const contextCommand = context ? getKubeConfigContextCommand(context) : null

    return [...commands, contextCommand].join('\n')
}
