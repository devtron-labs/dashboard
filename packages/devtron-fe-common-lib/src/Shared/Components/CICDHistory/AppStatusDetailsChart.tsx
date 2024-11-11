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

import { useEffect, useMemo, useState } from 'react'
import Tippy from '@tippyjs/react'
import { useHistory } from 'react-router-dom'
import { URLS } from '@Common/Constants'
import { ReactComponent as InfoIcon } from '../../../Assets/Icon/ic-info-filled.svg'
import { ReactComponent as Chat } from '../../../Assets/Icon/ic-chat-circle-dots.svg'
import { AppStatusDetailsChartType, AggregatedNodes, STATUS_SORTING_ORDER, NodeFilters } from './types'
import { StatusFilterButtonComponent } from './StatusFilterButtonComponent'
import { DEPLOYMENT_STATUS, APP_STATUS_HEADERS, ComponentSizeType, ALL_RESOURCE_KIND_FILTER } from '../../constants'
import { IndexStore } from '../../Store'
import { aggregateNodes } from '../../Helpers'
import { Button, ButtonStyleType, ButtonVariantType } from '../Button'

const AppStatusDetailsChart = ({
    filterRemoveHealth = false,
    showFooter,
    showConfigDriftInfo = false,
    onClose,
}: AppStatusDetailsChartType) => {
    const history = useHistory()
    const _appDetails = IndexStore.getAppDetails()
    const [currentFilter, setCurrentFilter] = useState<string>(ALL_RESOURCE_KIND_FILTER)
    const [flattenedNodes, setFlattenedNodes] = useState([])

    const { appId, environmentId: envId } = _appDetails

    const handleCompareDesiredManifest = () => {
        onClose()
        history.push(`${URLS.APP}/${appId}${URLS.DETAILS}/${envId}/${URLS.APP_DETAILS_K8}/${URLS.CONFIG_DRIFT}`)
    }

    const nodes: AggregatedNodes = useMemo(
        () => aggregateNodes(_appDetails.resourceTree?.nodes || [], _appDetails.resourceTree?.podMetadata || []),
        [_appDetails],
    )

    useEffect(() => {
        const nodesKeyArray = Object.keys(nodes?.nodes || {})
        let newFlattenedNodes = []
        if (nodesKeyArray.length > 0) {
            for (let index = 0; index < nodesKeyArray.length; index++) {
                const element = nodes.nodes[nodesKeyArray[index]]
                // eslint-disable-next-line no-loop-func
                element.forEach((childElement) => {
                    if (childElement.health) {
                        newFlattenedNodes.push(childElement)
                    }
                })
            }
            newFlattenedNodes.sort(
                (a, b) =>
                    STATUS_SORTING_ORDER[a.health.status?.toLowerCase()] -
                    STATUS_SORTING_ORDER[b.health.status?.toLowerCase()],
            )

            if (filterRemoveHealth) {
                newFlattenedNodes = newFlattenedNodes.filter(
                    (node) => node.health.status?.toLowerCase() !== DEPLOYMENT_STATUS.HEALTHY,
                )
            }

            setFlattenedNodes(newFlattenedNodes)
        }
    }, [`${nodes}`])

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
                            <StatusFilterButtonComponent
                                nodes={flattenedNodes}
                                selectedTab={currentFilter}
                                handleFilterClick={onFilterClick}
                            />
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
                                    currentFilter === ALL_RESOURCE_KIND_FILTER ||
                                    (currentFilter === NodeFilters.drifted && nodeDetails.hasDrift) ||
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
                                    <div className="flexbox-col dc__gap-4">
                                        {showConfigDriftInfo && nodeDetails.hasDrift && (
                                            <div className="flexbox dc__gap-8 dc__align-items-center">
                                                <span className="fs-13 fw-4 lh-20 cy-7">Config drift detected</span>
                                                {onClose && appId && envId && (
                                                    <Button
                                                        dataTestId="show-config-drift"
                                                        text="Compare with desired"
                                                        variant={ButtonVariantType.text}
                                                        style={ButtonStyleType.default}
                                                        onClick={handleCompareDesiredManifest}
                                                        size={ComponentSizeType.small}
                                                    />
                                                )}
                                            </div>
                                        )}
                                        <div>{getNodeMessage(nodeDetails.kind, nodeDetails.name)}</div>
                                    </div>
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
