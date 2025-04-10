/*
 * Copyright (c) 2024. Devtron Inc.
 */

import { GroupBase } from 'react-select'

import { getCookie, SelectPickerOptionType, TOKEN_COOKIE_NAME } from '@devtron-labs/devtron-fe-common-lib'

import { DefaultSelectPickerOptionType } from './constants'

export const getKubeConfigUseContextCommand = (clusterName: string) =>
    `kubectl config use-context devtron-${clusterName}`

export const getKubeConfigCommand = (clusterName: string, context: string) => {
    const token = getCookie(TOKEN_COOKIE_NAME)

    // NOTE: please don't modify spacing in the following template string
    return `kubectl config set-cluster devtron-${clusterName} --server=https://${window.location.host}/orchestrator/k8s/proxy/cluster/${clusterName} --insecure-skip-tls-verify
kubectl config set-credentials devtron-${clusterName} --token=${token}
kubectl config set-context devtron-${clusterName} --cluster=devtron-${clusterName} --user=devtron-${clusterName}
${context ? getKubeConfigUseContextCommand(context) : ''}`
}

export const getKubeConfigCommandWithContext = (clusterNames: string[] | string, context?: string) => {
    // for single selection of cluster, use context will save always by default as clusterName
    const normalizedClusters = Array.isArray(clusterNames) ? clusterNames : [clusterNames]
    return clusterNames.length === 1
        ? getKubeConfigCommand(normalizedClusters[0], context || normalizedClusters[0])
        : normalizedClusters.map((clusterName) => `${getKubeConfigCommand(clusterName, context)}`)
}

export const getOptions = (
    clusterNames: string[],
): Array<GroupBase<SelectPickerOptionType<string>> | SelectPickerOptionType<string>> => [
    DefaultSelectPickerOptionType,
    {
        label: 'Set Context of',
        options: clusterNames?.map((_cluster) => ({
            label: _cluster,
            value: _cluster,
        })),
    },
]
