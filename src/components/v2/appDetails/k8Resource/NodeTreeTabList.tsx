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

import React from 'react'
import { NavLink, useHistory, useParams } from 'react-router-dom'
import ReactGA from 'react-ga4'
import { useSharedState } from '../../utils/useSharedState'
import AppDetailsStore, { AppDetailsTabs } from '../appDetails.store'
import { ApplicationObject, NodeTreeTabListProps, NodeType } from '../appDetails.type'
import { ReactComponent as K8ResourceIcon } from '../../../../assets/icons/ic-object.svg'
import { ReactComponent as LogAnalyzerIcon } from '../../../../assets/icons/ic-logs.svg'
import { ReactComponent as Cross } from '../../../../assets/icons/ic-close.svg'
import Tippy from '@tippyjs/react'
import { ConditionalWrap, useSearchString } from '@devtron-labs/devtron-fe-common-lib'
import './NodeTreeTabList.scss'

export default function NodeTreeTabList({ logSearchTerms, setLogSearchTerms, tabRef }: NodeTreeTabListProps) {
    const { nodeType } = useParams<{ nodeType: string }>()
    const { push } = useHistory()
    const filterType = useSearchString().searchParams.filterType || 'all'
    const [applicationObjectTabs] = useSharedState(
        AppDetailsStore.getAppDetailsTabs(),
        AppDetailsStore.getAppDetailsTabsObservable(),
    )

    const clearLogSearchTerm = (tabIdentifier: string): void => {
        if (logSearchTerms) {
            const identifier = tabIdentifier.toLowerCase()

            if (identifier.startsWith(NodeType.Pod.toLowerCase()) && logSearchTerms[identifier]) {
                setLogSearchTerms({
                    ...logSearchTerms,
                    [identifier]: '',
                })
            }
        }
    }

    const handleCloseTab = (e: any, tabIdentifier: string) => {
        e.stopPropagation()

        // Clear pod related log search term on close tab action
        clearLogSearchTerm(tabIdentifier)

        const pushURL = AppDetailsStore.removeAppDetailsTabByIdentifier(tabIdentifier)
        setTimeout(() => {
            if (pushURL) {
                push(pushURL)
            }
        }, 1)
    }

    const sendLogAnalyserEvent = (tab: ApplicationObject) => {
        if (tab.name === AppDetailsTabs.log_analyzer) {
            ReactGA.event({
                category: 'log analyser',
                action: 'log-analyser-clicked',
                label: '',
            })
        }
    }

    const getTabNavLink = (tab: ApplicationObject) => {
        return (
            <NavLink
                data-testid={`resource-tab-${tab.name.replace(' ', '').toLowerCase()}`}
                to={`${tab.url}?filterType=${filterType}`}
                className="resource-tree__tab-hover tab-list__tab resource-tab__node cursor cn-9 fw-6 dc__no-decor m-0-imp"
            >
                <div
                    onClick={() => sendLogAnalyserEvent(tab)}
                    className={`flex left ${tab.isSelected ? 'cn-9' : ''} ${
                        tab.isDeleted ? 'tab-list__deleted cr-5' : ''
                    }`}
                >
                    {tab.title === AppDetailsTabs.log_analyzer && (
                        <span className="icon-dim-16 resource-tree__tab-hover fcb-9">
                            <LogAnalyzerIcon />
                        </span>
                    )}
                    {tab.title === AppDetailsTabs.k8s_Resources && (
                        <span className="icon-dim-16 resource-tree__tab-hover fcn-9">
                            <K8ResourceIcon />
                        </span>
                    )}
                    <span
                        className={`${
                            tab.name !== AppDetailsTabs.k8s_Resources && tab.name !== AppDetailsTabs.log_analyzer
                                ? 'mr-8'
                                : 'ml-6 dc__capitalize '
                        } fs-12 `}
                    >
                        {tab.name}
                    </span>
                </div>
            </NavLink>
        )
    }

    const handleTabCloseAction = (e) => {
        handleCloseTab(e, e.currentTarget.dataset.title)
    }

    return (
        <div
            data-testid="resource-tree-wrapper"
            className="resource-tree-wrapper flexbox px-12 dc__position-sticky dc__zi-10"
            style={{ outline: 'none', top: '77px' }}
            tabIndex={0}
            ref={tabRef}
        >
            <ul className="tab-list">
                {applicationObjectTabs.map((tab: ApplicationObject, index: number) => {
                    return (
                        <li key={`${index}tab`} id={`${nodeType}_${tab.name}`} className="flex left dc__ellipsis-right">
                            <ConditionalWrap
                                condition={
                                    tab.name !== AppDetailsTabs.log_analyzer &&
                                    tab.name !== AppDetailsTabs.k8s_Resources
                                }
                                wrap={(children) => {
                                    return (
                                        <Tippy
                                            className="default-tt dc_max-width__max-content"
                                            arrow={false}
                                            placement="top"
                                            content={tab.title}
                                        >
                                            {children}
                                        </Tippy>
                                    )
                                }}
                            >
                                <div className="flex">
                                    <div
                                        className={`${
                                            tab.isSelected ? 'resource-tree-tab bcn-0 cn-9' : ''
                                        } flex left pl-12 pt-8 pb-8 pr-12`}
                                    >
                                        {getTabNavLink(tab)}
                                        {tab.name !== AppDetailsTabs.log_analyzer &&
                                            tab.name !== AppDetailsTabs.k8s_Resources && (
                                                <div
                                                    className="resource-tab__close-wrapper flex br-5"
                                                    data-testid={`resource-tab-${index}-cross`}
                                                >
                                                    <Cross
                                                        data-title={tab.title}
                                                        onClick={handleTabCloseAction}
                                                        className="icon-dim-16 cursor"
                                                    />
                                                </div>
                                            )}
                                    </div>
                                    <div
                                        className={` ${
                                            !tab.isSelected || !(tab.isSelected && index - 1)
                                                ? 'resource-tree-tab__border'
                                                : ''
                                        }`}
                                    />
                                </div>
                            </ConditionalWrap>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}
