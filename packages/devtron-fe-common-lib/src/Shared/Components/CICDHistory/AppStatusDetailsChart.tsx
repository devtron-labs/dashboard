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

import { useMemo, useState } from 'react'
import Tippy from '@tippyjs/react'
import { ReactComponent as InfoIcon } from '../../../Assets/Icon/ic-info-filled.svg'
import { ReactComponent as Chat } from '../../../Assets/Icon/ic-chat-circle-dots.svg'
import { AppStatusDetailsChartType, AggregatedNodes, STATUS_SORTING_ORDER } from './types'
import { StatusFilterButtonComponent } from './StatusFilterButtonComponent'
import { DEPLOYMENT_STATUS, APP_STATUS_HEADERS } from '../../constants'
import { IndexStore } from '../../Store'
import { aggregateNodes } from '../../Helpers'

const AppStatusDetailsChart = ({ filterRemoveHealth = false, showFooter }: AppStatusDetailsChartType) => {
    const _appDetails = IndexStore.getAppDetails()
    const [currentFilter, setCurrentFilter] = useState('')

    const nodes: AggregatedNodes = useMemo(
        () => aggregateNodes(_appDetails.resourceTree?.nodes || [], _appDetails.resourceTree?.podMetadata || []),
        [_appDetails],
    )
    const nodesKeyArray = Object.keys(nodes?.nodes || {})
    let flattenedNodes = []
    if (nodesKeyArray.length > 0) {
        for (let index = 0; index < nodesKeyArray.length; index++) {
            const element = nodes.nodes[nodesKeyArray[index]]
            // eslint-disable-next-line no-loop-func
            element.forEach((childElement) => {
                if (childElement.health) {
                    flattenedNodes.push(childElement)
                }
            })
        }
        flattenedNodes.sort(
            (a, b) =>
                STATUS_SORTING_ORDER[a.health.status?.toLowerCase()] -
                STATUS_SORTING_ORDER[b.health.status?.toLowerCase()],
        )

        if (filterRemoveHealth) {
            flattenedNodes = flattenedNodes.filter(
                (node) => node.health.status?.toLowerCase() !== DEPLOYMENT_STATUS.HEALTHY,
            )
        }
    }

    function getNodeMessage(kind: string, name: string) {
        if (
            _appDetails.resourceTree?.resourcesSyncResult &&
            // eslint-disable-next-line no-prototype-builtins
            _appDetails.resourceTree?.resourcesSyncResult.hasOwnProperty(`${kind}/${name}`)
        ) {
            return _appDetails.resourceTree.resourcesSyncResult[`${kind}/${name}`]
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
                            <StatusFilterButtonComponent nodes={flattenedNodes} handleFilterClick={onFilterClick} />
                        </div>
                    </div>
                </div>
            )}
            <div>
                <div className="app-status-row dc__border-bottom pt-8 pr-20 pb-8 pl-20">
                    {APP_STATUS_HEADERS.map((headerKey, index) => (
                        // eslint-disable-next-line react/no-array-index-key
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
                                    <Tippy
                                        className="default-tt"
                                        arrow={false}
                                        placement="right"
                                        content={nodeDetails.kind}
                                    >
                                        <div className="dc__ellipsis-right">{nodeDetails.kind}</div>
                                    </Tippy>
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

export default AppStatusDetailsChart
