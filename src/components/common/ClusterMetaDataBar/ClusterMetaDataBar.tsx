import React from 'react'
import { useHistory } from 'react-router-dom'
import { useMainContext } from '@devtron-labs/devtron-fe-common-lib'
import { ClusterMetaDataBarProps } from './types'
import { URLS } from '../../../config'
import { K8S_EMPTY_GROUP } from '../../ResourceBrowser/Constants'
import { AppDetailsTabs } from '../../v2/appDetails/appDetails.store'
import { ReactComponent as ArrowLeft } from '../../../assets/icons/ic-arrow-left.svg'
import { ReactComponent as AllResourcesIcon } from '../../../assets/icons/ic-resource.svg'
import { ReactComponent as TerminalIcon } from '../../../assets/icons/ic-terminal-fill.svg'
import './ClusterMetaData.scss'
import { NodeDetailTabs } from '../../app/types'

export const ClusterMetaDataBar = ({ clusterName, namespace, clusterId }: ClusterMetaDataBarProps) => {
    const { isSuperAdmin } = useMainContext()
    const history = useHistory()
    const { pathname } = history.location
    const darkTheme =
        pathname.includes(NodeDetailTabs.MANIFEST.toLowerCase()) ||
        pathname.includes(NodeDetailTabs.EVENTS.toLowerCase()) ||
        pathname.includes(NodeDetailTabs.TERMINAL.toLowerCase()) ||
        pathname.includes(NodeDetailTabs.LOGS.toLowerCase()) ||
        pathname.includes(URLS.APP_DETAILS_LOG)

    const renderNavigationToAllResources = () => {
        return (
            <a
                className={`${darkTheme ? 'scn-0 resource-link__dark-theme' : 'scn-9 cn-9 resource-link__white-theme'} fw-6 flex left dc__gap-6 cursor cn-0`}
                target="_blank"
                href={`${window.__BASE_URL__}${URLS.RESOURCE_BROWSER}/${clusterId}/${namespace}/pod/${K8S_EMPTY_GROUP}`}
                rel="noreferrer"
            >
                <AllResourcesIcon />
                All resources
            </a>
        )
    }

    const renderNavigationToAClusterTerminal = () => {
        return (
            <a
                className={`${darkTheme ? 'resource-link__dark-theme' : 'cn-9 resource-link__white-theme'} fw-6 flex left dc__gap-6 cursor cn-0`}
                target="_blank"
                href={`${window.__BASE_URL__}${URLS.RESOURCE_BROWSER}/${clusterId}/all/${AppDetailsTabs.terminal}/${K8S_EMPTY_GROUP}?namespace=${namespace}`}
                rel="noreferrer"
            >
                <TerminalIcon className="icon-dim-16 fcn-0" />
                Cluster terminal
            </a>
        )
    }

    if (!isSuperAdmin) {
        return null
    }
    return (
        <div
            className={`cluster-meta-data-wrapper ${darkTheme ? 'dark-theme cn-0' : 'cn-9 bcn-0 resource-link__white-theme'} flex left dc__position-fixed dc__bottom-0 pl-16 w-100 fs-12 dc__border-top dc__gap-6 pt-4 pb-4 lh-20 cn-9`}
        >
            <span className="dc__opacity-0_8"> Cluster: {clusterName}</span>
            <div className="dc__border-left h-12 dc__opacity-0_2" />
            <span className="pl-6 dc__opacity-0_8">Namespace: {namespace}</span>
            <ArrowLeft
                className={`${darkTheme ? 'fcn-0 dc__opacity-0_5' : ''} rotate dc__gap-6 icon-dim-16 flex`}
                style={{ ['--rotateBy' as string]: '180deg' }}
            />
            {renderNavigationToAllResources()}
            <div className="dc__border-left h-12 dc__opacity-0_2" />
            {renderNavigationToAClusterTerminal()}
        </div>
    )
}
