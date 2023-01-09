import React, { useEffect, useMemo, useRef, useState } from 'react'
import { ReactComponent as InfoIcon } from '../../../../../assets/icons/info-filled.svg'
import { ReactComponent as Chat } from '../../../../../assets/icons/ic-chat-circle-dots.svg'
import { APP_STATUS_HEADERS, DEPLOYMENT_STATUS } from '../../../../../config'
import { StatusFilterButtonComponent } from '../../k8Resource/StatusFilterButton.component'
import IndexStore from '../../index.store'
import { NodeStreamMap } from '../environment.type'
import { AggregatedNodes } from '../../../../app/types'
import { aggregateNodes } from '../../../../app/details/appDetails/utils'
import { STATUS_SORTING_ORDER } from './constants'

export default function AppStatusDetailsChart({ appStreamData, filterRemoveHealth = false, showFooter }) {
    const _appDetails = IndexStore.getAppDetails()
    const [nodeStatusMap, setNodeStatusMap] = useState<Map<string, NodeStreamMap>>()
    const [currentFilter, setCurrentFilter] = useState('')

    useEffect(() => {
        try {
            const stats = appStreamData.result.application.status.operationState.syncResult.resources.reduce(
                (agg, curr) => {
                    agg.set(`${curr.kind}/${curr.name}`, curr)
                    return agg
                },
                new Map(),
            )
            setNodeStatusMap(stats)
        } catch (error) {}
    }, [appStreamData])

    const nodes: AggregatedNodes = useMemo(() => {
        return aggregateNodes(_appDetails.resourceTree?.nodes || [], _appDetails.resourceTree?.podMetadata || [])
    }, [_appDetails])
    const nodesKeyArray = Object.keys(nodes?.nodes || {})
    let flattenedNodes = []
    if (nodesKeyArray.length > 0) {
        for (let index = 0; index < nodesKeyArray.length; index++) {
            const element = nodes.nodes[nodesKeyArray[index]]
            element.forEach((childElement) => {
                childElement.health && flattenedNodes.push(childElement)
            })
        }
        flattenedNodes.sort((a, b) => {
            return (
                STATUS_SORTING_ORDER[a.health.status?.toLowerCase()] -
                STATUS_SORTING_ORDER[b.health.status?.toLowerCase()]
            )
        })

        if (filterRemoveHealth) {
            flattenedNodes = flattenedNodes?.filter((node) => node.health.status?.toLowerCase() !== DEPLOYMENT_STATUS.HEALTHY) || []
        } else {
            flattenedNodes = flattenedNodes || []
        }
    }

    function getNodeMessage(kind: string, name: string) {
        if (nodeStatusMap && nodeStatusMap.has(`${kind}/${name}`)) {
            const { message } = nodeStatusMap.get(`${kind}/${name}`)
            return message
        }
        return ''
    }

    const onFilterClick = (selectedFilter: string): void => {
        if (currentFilter !== selectedFilter.toLowerCase()) {
            setCurrentFilter(selectedFilter.toLowerCase())
        }
    }

    return (
        <div className="pb-12">
            {flattenedNodes.length > 0 && (
                <div className="pt-16 pl-20 pb-8">
                    <div className="flexbox pr-20 w-100">
                        <div>
                            <StatusFilterButtonComponent
                                nodes={flattenedNodes}
                                handleFilterClick={onFilterClick}
                            />
                        </div>
                    </div>
                </div>
            )}
            <div>
                <div className="app-status-row dc__border-bottom pt-8 pr-20 pb-8 pl-20">
                    {APP_STATUS_HEADERS.map((headerKey, index) => (
                        <div className="fs-13 fw-6 cn-7" key={`header_${index}`}>
                            {headerKey}
                        </div>
                    ))}
                </div>
                <div className={`resource-list fs-13 ${showFooter ? 'with-footer' : ''}`}>
                    {flattenedNodes.length > 0 ? (
                        flattenedNodes
                            .filter(
                                (nodeDetails) =>
                                    currentFilter === 'all' ||
                                    nodeDetails.health.status?.toLowerCase() === currentFilter,
                            )
                            .map((nodeDetails) => (
                                <div
                                    className="app-status-row pt-8 pr-20 pb-8 pl-20"
                                    key={`${nodeDetails.kind}/${nodeDetails.name}`}
                                >
                                    <div>{nodeDetails.kind}</div>
                                    <div>{nodeDetails.name}</div>
                                    <div
                                        className={`app-summary__status-name f-${
                                            nodeDetails.health.status ? nodeDetails.health.status.toLowerCase() : ''
                                        }`}
                                    >
                                        {nodeDetails.status ? nodeDetails.status : nodeDetails.health.status}
                                    </div>
                                    <div>{getNodeMessage(nodeDetails.kind, nodeDetails.name)}</div>
                                </div>
                            ))
                    ) : (
                        <div className="flex dc__height-inherit mh-300">
                            <div className="dc__align-center">
                                <InfoIcon className="icon-dim-20" />
                                <div>Checking resources status</div>
                            </div>
                        </div>
                    )}
                </div>
                {showFooter && (
                    <div className="dc__position-fixed bcn-0 flexbox dc__content-space dc__border-top p-16 fs-13 fw-6 footer">
                        <span className="fs-13 fw-6">Facing issues in installing integration?</span>
                        <a
                            className="help-chat cb-5 flex left"
                            href="https://discord.devtron.ai/"
                            target="_blank"
                            rel="noreferrer noopener"
                        >
                            <Chat className="icon-dim-20 mr-8" /> Chat with support
                        </a>
                    </div>
                )}
            </div>
        </div>
    )
}
