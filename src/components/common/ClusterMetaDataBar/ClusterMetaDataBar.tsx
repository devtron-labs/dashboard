import React from 'react'
import { useHistory } from 'react-router'
import { useMainContext } from '@devtron-labs/devtron-fe-common-lib'
import { ClusterMetaDataBarProps } from './types'
import { URLS } from '../../../config'
import { K8S_EMPTY_GROUP } from '../../ResourceBrowser/Constants'
import { AppDetailsTabs } from '../../v2/appDetails/appDetails.store'
import { ReactComponent as ArrowLeft } from '../../../assets/icons/ic-arrow-left.svg'
import { ReactComponent as AllResourcesIcon } from '../../../assets/icons/ic-resource.svg'
import { ReactComponent as TerminalIcon } from '../../../assets/icons/ic-terminal-fill.svg'

export const ClusterMetaDataBar = ({ clusterName, namespace, clusterId }: ClusterMetaDataBarProps) => {
    const { isSuperAdmin } = useMainContext()
    const history = useHistory()

    const renderNavigationToAllResources = () => {
        const navigateToAllResources = () => {
            history.push(`${URLS.RESOURCE_BROWSER}/${clusterId}/all/node/${K8S_EMPTY_GROUP}`)
        }
        return (
            <div className="cn-9 fw-6 flex left dc__gap-6 cursor" onClick={navigateToAllResources}>
                <AllResourcesIcon />
                All resources in cluster
            </div>
        )
    }

    const renderNavigationToAClusterTerminal = () => {
        const navigateToAClusterTerminal = () => {
            history.push(`${URLS.RESOURCE_BROWSER}/${clusterId}/all/${AppDetailsTabs.terminal}/${K8S_EMPTY_GROUP}`)
        }
        return (
            <div className="cn-9 fw-6 flex left dc__gap-6 cursor" onClick={navigateToAClusterTerminal}>
                <TerminalIcon />
                Cluster Terminal
            </div>
        )
    }

    if (!isSuperAdmin) {
        return null
    }
    return (
        <div className="flex left dc__position-fixed dc__bottom-0 pl-16 w-100 fs-12 dc__border-top bcn-0 dc__gap-6 pt-4 pb-4 lh-20">
            <div className="cn-9">
                Cluster: {clusterName} | Namespace: {namespace}
            </div>
            <ArrowLeft className="rotate dc__gap-6 icon-dim-16 flex" style={{ ['--rotateBy' as string]: '180deg' }} />
            {renderNavigationToAllResources()} | {renderNavigationToAClusterTerminal()}
        </div>
    )
}
