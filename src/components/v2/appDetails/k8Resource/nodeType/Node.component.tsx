/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Fragment, useEffect, useRef, useState } from 'react'
import { useHistory, useLocation, useParams, useRouteMatch } from 'react-router-dom'
import { followCursor } from 'tippy.js'

import {
    ClipboardButton,
    ComponentSizeType,
    noop,
    SortableTableHeaderCell,
    TabGroup,
    TippyCustomized,
    TippyTheme,
    Tooltip,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as ICExpand } from '@Icons/ic-expand.svg'

import { getElapsedTime, importComponentFromFELibrary, Pod as PodIcon } from '../../../../common'
import { getExternalLinkIcon, NodeLevelExternalLinks } from '../../../../externalLinks/ExternalLinks.component'
import { OptionTypeWithIcon } from '../../../../externalLinks/ExternalLinks.type'
import { getMonitoringToolIcon } from '../../../../externalLinks/ExternalLinks.utils'
import { useSharedState } from '../../../utils/useSharedState'
import { AppDetailsTabs } from '../../appDetails.store'
import { iNode, Node, NodeComponentProps, NodeType } from '../../appDetails.type'
import IndexStore from '../../index.store'
import { getPodRestartRBACPayload } from '../nodeDetail/nodeDetail.api'
import { getNodeDetailTabs } from '../nodeDetail/nodeDetail.util'
import NodeDeleteComponent from './NodeDelete.component'
import { getNodeStatus, nodeRowClassModifierMap } from './nodeType.util'
import PodHeaderComponent from './PodHeader.component'
import { NoPodProps } from './types'

import './nodeType.scss'

const PodRestartIcon = importComponentFromFELibrary('PodRestartIcon')
const PodRestart = importComponentFromFELibrary('PodRestart')
const renderConfigDriftDetectedText = importComponentFromFELibrary('renderConfigDriftDetectedText', null, 'function')

const NoPod = ({ selectMessage = 'Select a pod to view events', style = {} }: NoPodProps) => (
    <div data-testid="no-pod" className="no-pod no-pod-list no-pod--pod" style={{ ...style }}>
        <PodIcon color="var(--N400)" style={{ width: '48px', height: '48px', marginBottom: '12px' }} />
        <p>{selectMessage}</p>
    </div>
)

const NodeComponent = ({
    externalLinks,
    monitoringTools,
    isDevtronApp,
    clusterId,
    isDeploymentBlocked,
    addTab,
    tabs,
    removeTabByIdentifier,
}: NodeComponentProps) => {
    const { url } = useRouteMatch()
    const history = useHistory()
    const location = useLocation()
    const markedNodes = useRef<Map<string, boolean>>(new Map<string, boolean>())
    const [selectedNodes, setSelectedNodes] = useState<Array<iNode>>()
    const [selectedHealthyNodeCount, setSelectedHealthyNodeCount] = useState<number>(0)
    const [tableHeader, setTableHeader] = useState([])
    const [podType, setPodType] = useState(false)
    const appDetails = IndexStore.getAppDetails()
    const params = useParams<{ nodeType: NodeType; resourceName: string; namespace: string; name: string }>()
    const podMetaData = IndexStore.getPodMetaData()
    const [filteredNodes] = useSharedState(
        IndexStore.getAppDetailsFilteredNodes(),
        IndexStore.getAppDetailsNodesFilteredObservable(),
    )
    const [podLevelExternalLinks, setPodLevelExternalLinks] = useState<OptionTypeWithIcon[]>([])
    const [containerLevelExternalLinks, setContainerLevelExternalLinks] = useState<OptionTypeWithIcon[]>([])
    const isPodAvailable: boolean = params.nodeType === NodeType.Pod.toLowerCase() && isDevtronApp
    const nodeRowClassModifier = nodeRowClassModifierMap[params.nodeType]
        ? `node-row--${nodeRowClassModifierMap[params.nodeType]}`
        : ''

    useEffect(() => {
        if (externalLinks?.length > 0) {
            const _podLevelExternalLinks = []
            const _containerLevelExternalLinks = []

            externalLinks.forEach((link) => {
                if (link.url.includes('{podName}') && !link.url.includes('{containerName}')) {
                    _podLevelExternalLinks.push({
                        label: link.name,
                        value: link.url,
                        description: link.description,
                        startIcon: getExternalLinkIcon(getMonitoringToolIcon(monitoringTools, link.monitoringToolId)),
                    })
                } else if (link.url.includes('{containerName}')) {
                    _containerLevelExternalLinks.push({
                        label: link.name,
                        value: link.url,
                        description: link.description,
                        startIcon: getExternalLinkIcon(getMonitoringToolIcon(monitoringTools, link.monitoringToolId)),
                    })
                }
            })
            setPodLevelExternalLinks(_podLevelExternalLinks)
            setContainerLevelExternalLinks(_containerLevelExternalLinks)
        } else {
            setPodLevelExternalLinks([])
            setContainerLevelExternalLinks([])
        }
    }, [externalLinks])

    useEffect(() => {
        if (params.nodeType) {
            let tableHeaders: string[]

            switch (params.nodeType) {
                case NodeType.Pod.toLowerCase():
                    tableHeaders = ['Name', 'Ready', 'Restarts', 'Age', '', '']
                    if (podLevelExternalLinks.length > 0) {
                        tableHeaders = ['Name', 'Ready', 'Restarts', 'Age', 'Links', '']
                    }
                    break
                case NodeType.Service.toLowerCase():
                    tableHeaders = ['Name', 'URL', '']
                    break
                default:
                    tableHeaders = ['Name', '', '']
                    break
            }

            setTableHeader(tableHeaders)

            let [, _selectedResource] = url.split('/group/')
            let _selectedNodes: Array<iNode>
            if (_selectedResource) {
                _selectedResource = _selectedResource.replace(/\/$/, '')
                _selectedNodes = IndexStore.getPodsForRootNode(_selectedResource).sort((a, b) =>
                    a.name > b.name ? 1 : -1,
                )
            } else {
                _selectedNodes = IndexStore.getiNodesByKind(params.nodeType).sort((a, b) => (a.name > b.name ? 1 : -1))
            }
            let _healthyNodeCount = 0

            _selectedNodes.forEach((node: Node) => {
                if (node.health?.status.toLowerCase() === 'healthy') {
                    _healthyNodeCount += 1
                }
            })
            let podsType = []
            if (isPodAvailable) {
                podsType = _selectedNodes.filter((el) =>
                    podMetaData?.some((f) => f.name === el.name && !!f.isNew === podType),
                )
            }
            setSelectedNodes(isPodAvailable ? [...podsType] : [..._selectedNodes])

            setSelectedHealthyNodeCount(_healthyNodeCount)
        }
    }, [params.nodeType, podType, url, filteredNodes, podLevelExternalLinks])

    const getPodRestartCount = (node: iNode) => {
        let restartCount = '0'
        if (node.info) {
            node.info.forEach((element) => {
                if (element.name === 'Restart Count') {
                    restartCount = element.value
                }
            })
        }
        return restartCount
    }

    const markNodeSelected = (nodes: Array<iNode>, nodeName: string) => {
        const updatedNodes = nodes.map((node) => {
            if (node.name === nodeName) {
                const newSelectionStatus = !node.isSelected

                markedNodes.current.set(
                    node.name,
                    markedNodes.current.has(node.name) ? !markedNodes.current.get(node.name) : newSelectionStatus,
                )

                return {
                    ...node,
                    isSelected: newSelectionStatus,
                }
            }

            if (node.childNodes?.length > 0) {
                markNodeSelected(node.childNodes, nodeName)
            }

            return node
        })

        setSelectedNodes(updatedNodes)
    }

    const handleActionTabClick = (node: iNode, _tabName: string, containerName?: string) => {
        let [_url] = url.split('/group/')
        _url = `${_url.split('/').slice(0, -1).join('/')}/${node.kind.toLowerCase()}/${
            node.name
        }/${_tabName.toLowerCase()}`

        const getSearchString = () => {
            if (containerName) {
                return location.search ? `${location.search}&container=${containerName}` : `?container=${containerName}`
            }
            return location.search
        }
        addTab({
            idPrefix: AppDetailsTabs.k8s_Resources,
            kind: node.kind.toLowerCase(),
            name: node.name.toLowerCase(),
            url: _url,
        })
            .then(() => {
                history.push({ pathname: _url, search: getSearchString() })
            })
            .catch(noop)
    }

    const makeNodeTree = (nodes: Array<iNode>, showHeader?: boolean) => {
        const additionalTippyContent = (node) => {
            const portList = [...new Set(node?.port)]
            return (
                <>
                    {portList.map((val, idx) => {
                        const text = `${node.name}.${node.namespace}:${val}`

                        if (idx > 0) {
                            return (
                                <div className="flex left cn-9 m-0 dc__no-decore" key={node.name}>
                                    <div>{text}</div>
                                    <div className="ml-0 fs-13 dc__truncate-text pt-4 pl-4">
                                        <ClipboardButton content={text} />
                                    </div>
                                </div>
                            )
                        }

                        return null
                    })}
                </>
            )
        }
        const portNumberPlaceHolder = (node) => {
            if (node.port?.length > 1) {
                const text = `${node.name}.${node.namespace}:${node.port[0]}`
                return (
                    <>
                        <div>
                            <span>{text}</span>
                        </div>
                        <span className="pl-4">
                            <ClipboardButton content={text} />
                        </span>
                        <TippyCustomized
                            hideHeading
                            noHeadingBorder
                            theme={TippyTheme.white}
                            className="default-tt p-12"
                            arrow={false}
                            placement="bottom"
                            trigger="click"
                            additionalContent={additionalTippyContent(node)}
                            interactive
                        >
                            <div className="pl-4">
                                <span className="dc__link dc__link_over dc__ellipsis-right cursor" data-key={node.name}>
                                    +{node.port.length - 1} more
                                </span>
                            </div>
                        </TippyCustomized>
                    </>
                )
            }
            if (node.port?.length === 1) {
                return `${node.name}.${node.namespace}:${node.port}`
            }
            return 'Port Number is missing'
        }

        let _currentNodeHeader = ''

        return nodes.map((node, index) => {
            const nodeName = `${node.name}.${node.namespace} : ${node.port}`
            const _isSelected = markedNodes.current.get(node.name)
            // Only render node kind header when it's the first node or it's a different kind header
            _currentNodeHeader = index === 0 || _currentNodeHeader !== node.kind ? node.kind : ''
            const nodeStatus = getNodeStatus(node)

            const onClickNodeDetailsTab = (e) => {
                const _kind = e.target.dataset.name
                if (node.kind === NodeType.Containers) {
                    handleActionTabClick(node.pNode, _kind, node.name)
                } else {
                    handleActionTabClick(node, _kind)
                }
            }

            const getWidthClassnameForTabs = (): string => {
                let _classname = ''
                if (
                    node.kind.toLowerCase() === NodeType.Pod.toLowerCase() ||
                    node.kind.toLowerCase() === NodeType.Containers.toLowerCase()
                ) {
                    _classname = 'node__logs'
                } else {
                    _classname = 'node__manifest'
                }
                return _classname
            }

            return (
                // eslint-disable-next-line react/no-array-index-key
                <Fragment key={`grt${index}`}>
                    {showHeader && !!_currentNodeHeader && (
                        <div className="node-row dc__border-bottom-n1 pt-6 pb-5 pl-18 pr-16">
                            <div className="fw-6">
                                <SortableTableHeaderCell isSortable={false} title={node.kind} />
                            </div>
                            {((node.kind === NodeType.Pod && podLevelExternalLinks.length > 0) ||
                                (node.kind === NodeType.Containers && containerLevelExternalLinks.length > 0)) && (
                                <div className="fw-6">
                                    <SortableTableHeaderCell isSortable={false} title="Links" />
                                </div>
                            )}
                        </div>
                    )}
                    <div
                        className={`node-row resource-row dc__hover-icon py-8 pr-16 ${node.childNodes?.length ? 'pl-8' : 'pl-18'} ${nodeRowClassModifier}`}
                    >
                        <div
                            className="flex left dc__gap-8"
                            onClick={() => {
                                markNodeSelected(selectedNodes, node.name)
                            }}
                        >
                            {node.childNodes?.length > 0 && (
                                <ICExpand
                                    data-testid="resource-child-nodes-dropdown"
                                    className="rotate icon-dim-20 pointer dc__no-shrink fcn-6"
                                    style={{ ['--rotateBy' as string]: !_isSelected ? '0deg' : '90deg' }}
                                />
                            )}
                            <div>
                                <div className="resource__title-name flex left">
                                    <Tooltip content={node.name} followCursor="horizontal" plugins={[followCursor]}>
                                        <span data-testid="resource-node-name" className="fs-13 lh-20 dc__truncate">
                                            {node.name}
                                        </span>
                                    </Tooltip>
                                    <div
                                        className={`flex left ${
                                            node.kind.toLowerCase() === NodeType.Pod.toLowerCase() ? 'mw-264' : 'mw-152'
                                        }`}
                                    >
                                        <div className="px-8">
                                            <ClipboardButton content={node.name} />
                                        </div>
                                        {!appDetails.isVirtualEnvironment && (
                                            <>
                                                <div
                                                    data-testid={`app-node-${index}-resource-tab-wrapper`}
                                                    className={`flex left ${getWidthClassnameForTabs()} ${
                                                        node.kind === NodeType.Containers ? '' : 'node__tabs'
                                                    } dc__border br-4 dc__w-fit-content lh-18`}
                                                >
                                                    {getNodeDetailTabs(node.kind as NodeType).map((kind, idx) => (
                                                        <div
                                                            // eslint-disable-next-line react/no-array-index-key
                                                            key={`tab__${idx}`}
                                                            data-name={kind}
                                                            data-testid={`${kind.toLowerCase()}-tab`}
                                                            onClick={onClickNodeDetailsTab}
                                                            className={`dc__capitalize flex cn-7 fw-6 cursor bg__primary ${
                                                                node.kind === NodeType.Containers
                                                                    ? ''
                                                                    : 'resource-action-tabs__active'
                                                            }  ${
                                                                idx ===
                                                                getNodeDetailTabs(node.kind as NodeType).length - 1
                                                                    ? ''
                                                                    : 'dc__border-right'
                                                            } px-6`}
                                                        >
                                                            {kind.toLowerCase()}
                                                        </div>
                                                    ))}
                                                </div>
                                                {node.kind !== NodeType.Containers && (
                                                    <>
                                                        <div className="bw-1 en-2 dc__right-radius-4 node-empty dc__no-left-border" />
                                                        <div className="bw-1 en-2 dc__right-radius-4 node-empty dc__no-left-border" />
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="flex left dc__gap-4">
                                    {nodeStatus && (
                                        <span
                                            data-testid="node-resource-status"
                                            className={`app-summary__status-name f-${(
                                                node?.status ||
                                                node?.health?.status ||
                                                ''
                                            ).toLowerCase()}`}
                                        >
                                            {nodeStatus}
                                        </span>
                                    )}
                                    {window._env_.FEATURE_CONFIG_DRIFT_ENABLE &&
                                        renderConfigDriftDetectedText &&
                                        renderConfigDriftDetectedText(node)}
                                    {node?.health?.message && (
                                        <>
                                            <span className="dc__bullet mw-4" />
                                            <Tooltip
                                                interactive
                                                content={node.health.message.toLowerCase()}
                                                className="dc__mxw-250--imp"
                                                followCursor="horizontal"
                                                plugins={[followCursor]}
                                            >
                                                <span className="dc__truncate">
                                                    {node.health.message.toLowerCase()}
                                                </span>
                                            </Tooltip>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        {params.nodeType === NodeType.Service.toLowerCase() &&
                            node.kind !== 'Endpoints' &&
                            node.kind !== 'EndpointSlice' && (
                                <div className="flex left dc__hover-icon dc__gap-8">
                                    <span className="fs-13 lh-20 cn-9">{portNumberPlaceHolder(node)}</span>
                                    {node.port > 1 ? <ClipboardButton content={nodeName.split(' ').join('')} /> : null}
                                </div>
                            )}

                        {params.nodeType === NodeType.Pod.toLowerCase() && (
                            <span data-testid="pod-ready-count" className="flex left fs-13 lh-20">
                                {node.info?.filter((_info) => _info.name === 'Containers')[0]?.value}
                            </span>
                        )}

                        {params.nodeType === NodeType.Pod.toLowerCase() && (
                            <span data-testid="pod-restart-count" className="flex left fs-13 lh-20">
                                {node.kind !== 'Containers' && getPodRestartCount(node)}
                                {Number(getPodRestartCount(node)) > 0 && PodRestartIcon && (
                                    <PodRestartIcon clusterId={clusterId} name={node.name} namespace={node.namespace} />
                                )}
                            </span>
                        )}

                        {params.nodeType === NodeType.Pod.toLowerCase() && (
                            <span data-testid="pod-age-count" className="flex left fs-13 lh-20">
                                {getElapsedTime(new Date(node.createdAt))}
                            </span>
                        )}

                        {params.nodeType !== NodeType.Service.toLocaleLowerCase() && (
                            <div className="flex left">
                                {node.kind === NodeType.Pod && podLevelExternalLinks.length > 0 && (
                                    <NodeLevelExternalLinks
                                        helmAppDetails={appDetails}
                                        nodeLevelExternalLinks={podLevelExternalLinks}
                                        podName={node.name}
                                    />
                                )}
                                {node.kind === NodeType.Containers && containerLevelExternalLinks.length > 0 && (
                                    <NodeLevelExternalLinks
                                        helmAppDetails={appDetails}
                                        nodeLevelExternalLinks={containerLevelExternalLinks}
                                        podName={node.pNode?.name}
                                        containerName={node.name}
                                        addExtraSpace
                                    />
                                )}
                            </div>
                        )}
                        {!appDetails.isVirtualEnvironment &&
                            node?.kind !== NodeType.Containers &&
                            node?.kind !== 'Endpoints' &&
                            node?.kind !== 'EndpointSlice' && (
                                <NodeDeleteComponent
                                    nodeDetails={node}
                                    appDetails={appDetails}
                                    isDeploymentBlocked={isDeploymentBlocked}
                                    tabs={tabs}
                                    removeTabByIdentifier={removeTabByIdentifier}
                                />
                            )}
                    </div>
                    {node.childNodes?.length > 0 && _isSelected && (
                        <div className="ml-17 indent-line">
                            <div>{makeNodeTree(node.childNodes, true)}</div>
                        </div>
                    )}
                </Fragment>
            )
        })
    }

    return (
        <>
            {selectedNodes && (
                <div className="node-container-fluid">
                    <div className="dc__position-sticky dc__top-0 dc__zi-1 bg__primary flexbox-col">
                        {isPodAvailable ? (
                            <PodHeaderComponent callBack={setPodType} />
                        ) : (
                            <div className="px-16 dc__border-bottom-n1">
                                <TabGroup
                                    tabs={[
                                        {
                                            id: 'node-detail',
                                            label: selectedNodes?.[0]?.kind || '',
                                            tabType: 'block',
                                            badge: selectedNodes.length,
                                            description: selectedHealthyNodeCount
                                                ? `${selectedHealthyNodeCount} healthy`
                                                : `${selectedNodes.length} resource(s)`,
                                        },
                                    ]}
                                    size={ComponentSizeType.xl}
                                    alignActiveBorderWithContainer
                                />
                            </div>
                        )}

                        <div className={`node-row dc__border-bottom-n1 pt-6 pb-5 pl-8 pr-16 ${nodeRowClassModifier}`}>
                            {tableHeader.map((cell, index) => (
                                <div
                                    // eslint-disable-next-line react/no-array-index-key
                                    key={`${cell}-${index}`} // NOTE: cell can be empty string therefore need to put index in key
                                    className={`fw-6 ${index === 0 && selectedNodes[0]?.childNodes?.length ? 'pl-28' : ''} ${index === 0 && !selectedNodes[0]?.childNodes?.length ? 'pl-10' : ''}`}
                                >
                                    <SortableTableHeaderCell isSortable={false} title={cell} />
                                </div>
                            ))}
                        </div>
                    </div>
                    {params.nodeType === NodeType.Pod.toLowerCase() && containerLevelExternalLinks.length > 0 && (
                        <div className="fs-12 fw-4 cn-9 bcn-1 lh-18 py-4 px-36">
                            Expand pods to view external links for containers.
                        </div>
                    )}
                    {selectedNodes.length > 0 ? (
                        makeNodeTree(selectedNodes)
                    ) : (
                        <div className="w-100 flex" style={{ height: '400px' }}>
                            <NoPod selectMessage="No Available Pods" />
                        </div>
                    )}
                </div>
            )}
            {PodRestart && <PodRestart rbacPayload={getPodRestartRBACPayload(appDetails)} />}
        </>
    )
}

export default NodeComponent
