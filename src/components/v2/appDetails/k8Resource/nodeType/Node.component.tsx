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

import React, { useEffect, useRef, useState } from 'react'
import { useRouteMatch, useParams, useHistory } from 'react-router-dom'
import {
    TippyCustomized,
    TippyTheme,
    ClipboardButton,
    stopPropagation,
    ToastManager,
    ToastVariantType,
    SortableTableHeaderCell,
    noop,
    Tooltip,
    TabGroup,
    ComponentSizeType,
} from '@devtron-labs/devtron-fe-common-lib'
import IndexStore from '../../index.store'
import { getElapsedTime, importComponentFromFELibrary } from '../../../../common'
import PodHeaderComponent from './PodHeader.component'
import { Node, iNode, NodeComponentProps, NodeType } from '../../appDetails.type'
import { getNodeDetailTabs } from '../nodeDetail/nodeDetail.util'
import NodeDeleteComponent from './NodeDelete.component'
import AppDetailsStore from '../../appDetails.store'
import { getNodeStatus, nodeRowClassModifierMap } from './nodeType.util'
import { useSharedState } from '../../../utils/useSharedState'
import { getExternalLinkIcon, NodeLevelExternalLinks } from '../../../../externalLinks/ExternalLinks.component'
import { OptionTypeWithIcon } from '../../../../externalLinks/ExternalLinks.type'
import { getMonitoringToolIcon } from '../../../../externalLinks/ExternalLinks.utils'
import { NoPod } from '../../../../app/ResourceTreeNodes'
import './nodeType.scss'
import { ReactComponent as ICExpand } from '@Icons/ic-expand.svg'
import { getPodRestartRBACPayload } from '../nodeDetail/nodeDetail.api'

const PodRestartIcon = importComponentFromFELibrary('PodRestartIcon')
const PodRestart = importComponentFromFELibrary('PodRestart')
const renderConfigDriftDetectedText = importComponentFromFELibrary('renderConfigDriftDetectedText', null, 'function')

const NodeComponent = ({
    handleFocusTabs,
    externalLinks,
    monitoringTools,
    isDevtronApp,
    clusterId,
    isDeploymentBlocked,
}: NodeComponentProps) => {
    const { url } = useRouteMatch()
    const history = useHistory()
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
            let tableHeader: string[]

            switch (params.nodeType) {
                case NodeType.Pod.toLowerCase():
                    tableHeader = ['Name', 'Ready', 'Restarts', 'Age', '', '']
                    if (podLevelExternalLinks.length > 0) {
                        tableHeader = ['Name', 'Ready', 'Restarts', 'Age', 'Links', '']
                    }
                    break
                case NodeType.Service.toLowerCase():
                    tableHeader = ['Name', 'URL', '']
                    break
                default:
                    tableHeader = ['Name', '', '']
                    break
            }

            setTableHeader(tableHeader)

            let [_ignore, _selectedResource] = url.split('group/')
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
                    _healthyNodeCount++
                }
            })
            let podsType = []
            if (isPodAvailable) {
                podsType = _selectedNodes.filter((el) =>
                    podMetaData?.some((f) => {
                        // Set f.isNew to false if it is undefined
                        f.isNew = f.isNew || false
                        return f.name === el.name && f.isNew === podType
                    }),
                )
            }

            setSelectedNodes(isPodAvailable ? [...podsType] : [..._selectedNodes])

            setSelectedHealthyNodeCount(_healthyNodeCount)
        }
    }, [params.nodeType, podType, url, filteredNodes, podLevelExternalLinks])

    const getPodRestartCount = (node: iNode) => {
        let restartCount = '0'
        if (node.info) {
            for (const ele of node.info) {
                if (ele.name === 'Restart Count') {
                    restartCount = ele.value
                    break
                }
            }
        }
        return restartCount
    }

    const markNodeSelected = (nodes: Array<iNode>, nodeName: string) => {
        const updatedNodes = nodes.map((node) => {
            if (node.name === nodeName) {
                node.isSelected = !node.isSelected
                markedNodes.current.set(
                    node.name,
                    markedNodes.current.has(node.name) ? !markedNodes.current.get(node.name) : node.isSelected,
                )
            } else if (node.childNodes?.length > 0) {
                markNodeSelected(node.childNodes, nodeName)
            }

            return node
        })

        setSelectedNodes(updatedNodes)
    }

    const handleActionTabClick = (node: iNode, _tabName: string, containerName?: string) => {
        let [_url, _ignore] = url.split('/group/')
        _url = `${_url.split('/').slice(0, -1).join('/')}/${node.kind.toLowerCase()}/${
            node.name
        }/${_tabName.toLowerCase()}`

        if (containerName) {
            _url = `${_url}?container=${containerName}`
        }

        const isAdded = AppDetailsStore.addAppDetailsTab(node.kind, node.name, _url)

        if (isAdded) {
            history.push(_url)
        } else {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                title: 'Max 5 tabs allowed',
                description: 'Please close an open tab and try again.',
            })
        }
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
                                <div className="flex left cn-9 m-0 dc__no-decore">
                                    <div className="" key={node.name}>
                                        {text}
                                    </div>
                                    <button type="button" className="dc__unset-button-styles" onClick={stopPropagation}>
                                        <div className="ml-0 fs-13 dc__truncate-text pt-4 pl-4">
                                            <ClipboardButton content={text} />
                                        </div>
                                    </button>
                                </div>
                            )
                        }
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
                    handleActionTabClick(node['pNode'], _kind, node.name)
                } else {
                    handleActionTabClick(node, _kind)
                }
                handleFocusTabs()
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
                <React.Fragment key={`grt${index}`}>
                    {showHeader && !!_currentNodeHeader && (
                        <div className="node-row dc__border-bottom-n1 pt-6 pb-5 pl-18 pr-16">
                            <div className="fw-6">
                                <SortableTableHeaderCell
                                    disabled={false}
                                    isSortable={false}
                                    isSorted={null}
                                    sortOrder={null}
                                    triggerSorting={noop}
                                    title={node.kind}
                                />
                            </div>
                            {((node.kind === NodeType.Pod && podLevelExternalLinks.length > 0) ||
                                (node.kind === NodeType.Containers && containerLevelExternalLinks.length > 0)) && (
                                <div className="fw-6">
                                    <SortableTableHeaderCell
                                        disabled={false}
                                        isSortable={false}
                                        isSorted={null}
                                        sortOrder={null}
                                        triggerSorting={noop}
                                        title="Links"
                                    />
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
                                    <Tooltip content={node.name}>
                                        <span data-testid="resource-node-name" className="fs-13 lh-20 dc__truncate">
                                            {node.name}
                                        </span>
                                    </Tooltip>
                                    <div
                                        className={`flex left ${
                                            node.kind.toLowerCase() == NodeType.Pod.toLowerCase() ? 'mw-264' : 'mw-152'
                                        }`}
                                    >
                                        <button
                                            type="button"
                                            className="dc__unset-button-styles"
                                            onClick={stopPropagation}
                                        >
                                            <div className="pl-8 pr-8">
                                                <ClipboardButton content={node.name} />
                                            </div>
                                        </button>
                                        {!appDetails.isVirtualEnvironment && (
                                            <>
                                                <div
                                                    data-testid={`app-node-${index}-resource-tab-wrapper`}
                                                    className={`flex left ${getWidthClassnameForTabs()} ${
                                                        node.kind === NodeType.Containers ? '' : 'node__tabs'
                                                    } dc__border br-4 dc__w-fit-content lh-18`}
                                                >
                                                    {getNodeDetailTabs(node.kind as NodeType).map((kind, index) => {
                                                        return (
                                                            <div
                                                                key={`tab__${index}`}
                                                                data-name={kind}
                                                                data-testid={`${kind.toLowerCase()}-tab`}
                                                                onClick={onClickNodeDetailsTab}
                                                                className={`dc__capitalize flex cn-7 fw-6 cursor bcn-0 ${
                                                                    node.kind === NodeType.Containers
                                                                        ? ''
                                                                        : 'resource-action-tabs__active'
                                                                }  ${
                                                                    index ===
                                                                    getNodeDetailTabs(node.kind as NodeType)?.length - 1
                                                                        ? ''
                                                                        : 'dc__border-right'
                                                                } px-6`}
                                                            >
                                                                {kind.toLowerCase()}
                                                            </div>
                                                        )
                                                    })}
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
                                    {renderConfigDriftDetectedText && renderConfigDriftDetectedText(node)}
                                    {node?.health?.message && (
                                        <>
                                            <span className="dc__bullet mw-4" />
                                            <Tooltip
                                                interactive
                                                content={node.health.message.toLowerCase()}
                                                className="dc__mxw-250--imp"
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
                                        podName={node['pNode']?.name}
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
                                />
                            )}
                    </div>
                    {node.childNodes?.length > 0 && _isSelected && (
                        <div className="ml-17 indent-line">
                            <div>{makeNodeTree(node.childNodes, true)}</div>
                        </div>
                    )}
                </React.Fragment>
            )
        })
    }

    return (
        <>
            {selectedNodes && (
                <div className="node-container-fluid">
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
                        {tableHeader.map((cell, index) => {
                            return (
                                <div
                                    key={`gpt_${index}`}
                                    className={`fw-6 ${index === 0 && selectedNodes[0]?.childNodes?.length ? 'pl-28' : ''} ${index === 0 && !selectedNodes[0]?.childNodes?.length ? 'pl-10' : ''}`}
                                >
                                    <SortableTableHeaderCell
                                        disabled={false}
                                        isSortable={false}
                                        isSorted={null}
                                        sortOrder={null}
                                        triggerSorting={noop}
                                        title={cell}
                                    />
                                </div>
                            )
                        })}
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
