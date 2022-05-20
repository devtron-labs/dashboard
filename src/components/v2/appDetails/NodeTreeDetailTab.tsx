import React, { useState, useEffect, useRef } from 'react';
import K8ResourceComponent from './k8Resource/K8Resource.component';
import './appDetails.scss';
import { ReactComponent as K8ResourceIcon } from '../../../assets/icons/ic-object.svg';
import { ReactComponent as LogAnalyzerIcon } from '../../../assets/icons/ic-logs.svg';
import { ReactComponent as Cross } from '../../../assets/icons/ic-close.svg';
import LogAnalyzerComponent from './logAnalyzer/LogAnalyzer.component';
import { NavLink, Route, Switch } from 'react-router-dom';
import { useRouteMatch, Redirect, useParams, useHistory } from 'react-router';
import { URLS } from '../../../config';
import AppDetailsStore, { AppDetailsTabs } from './appDetails.store';
import { useSharedState } from '../utils/useSharedState';
import { ApplicationObject, NodeType, AppDetails } from './appDetails.type';
import NodeDetailComponent from './k8Resource/nodeDetail/NodeDetail.component';
import Tippy from '@tippyjs/react';
import IndexStore from './index.store';
import { ExternalLink, OptionTypeWithIcon } from '../../externalLinks/ExternalLinks.type';
import '../../common/nodeTreeDetails.scss';
import '../lib/bootstrap-grid.min.css'

function NodeTreeDetailTab({
    appDetails,
    externalLinks,
    monitoringTools,
    isDevtronApp = false,
}: {
    appDetails: AppDetails
    externalLinks: ExternalLink[]
    monitoringTools: OptionTypeWithIcon[]
    isDevtronApp?: boolean
}) {
    const params = useParams<{ appId: string; envId: string; nodeType: string }>()
    const { path, url } = useRouteMatch()
    const history = useHistory()
    const [clickedNodes, registerNodeClick] = useState<Map<string, string>>(new Map<string, string>())
    const [applicationObjectTabs] = useSharedState(
        AppDetailsStore.getAppDetailsTabs(),
        AppDetailsStore.getAppDetailsTabsObservable(),
    )
    const tabRef = useRef<HTMLDivElement>(null)
    const [logSearchTerms, setLogSearchTerms] = useState<Record<string, string>>()

    useEffect(() => {
        const _pods = IndexStore.getNodesByKind(NodeType.Pod)
        const isLogAnalyserURL = window.location.href.indexOf(URLS.APP_DETAILS_LOG) > 0
        AppDetailsStore.initAppDetailsTabs(url, _pods.length > 0, isLogAnalyserURL)
    }, [params.appId, params.envId])

    const handleCloseTab = (e: any, tabIdentifier: string) => {
        e.stopPropagation()

        // Clear pod related log search term on close tab action
        clearLogSearchTerm(tabIdentifier)

        const pushURL = AppDetailsStore.removeAppDetailsTabByIdentifier(tabIdentifier)
        setTimeout(() => {
            if (pushURL) {
                history.push(pushURL)
            }
        }, 1)
    }

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

    const handleFocusTabs = () => {
        if (tabRef?.current) {
            tabRef.current.focus()
        }
    }

    return (
        <>
            {appDetails.resourceTree?.nodes?.length > 0 && (
                <>
                    <div
                        className="resource-tree-wrapper flexbox pl-20 pr-20"
                        style={{ outline: 'none' }}
                        tabIndex={0}
                        ref={tabRef}
                    >
                        <ul className="tab-list">
                            {applicationObjectTabs.map((tab: ApplicationObject, index: number) => {
                                return (
                                    <>
                                        <li
                                            key={index + 'tab'}
                                            id={`${params.nodeType}_${tab.name}`}
                                            className="flex left ellipsis-right "
                                        >
                                            <Tippy
                                                className={`${
                                                    tab.name === AppDetailsTabs.log_analyzer ||
                                                    tab.name === AppDetailsTabs.k8s_Resources
                                                        ? 'hide-section'
                                                        : ''
                                                } default-tt `}
                                                arrow={false}
                                                placement="top"
                                                content={
                                                    tab.name !== AppDetailsTabs.log_analyzer &&
                                                    tab.name !== AppDetailsTabs.k8s_Resources &&
                                                    tab.title
                                                }
                                            >
                                                <div className="flex">
                                                    <div
                                                        className={`${
                                                            tab.isSelected ? 'resource-tree-tab bcn-0 cn-9' : ''
                                                        } flex left pl-12 pt-8 pb-8 pr-12 `}
                                                    >
                                                        <NavLink
                                                            to={`${tab.url}`}
                                                            className={`resource-tree__tab-hover tab-list__tab resource-tab__node cursor cn-9 fw-6 no-decor `}
                                                        >
                                                            <div
                                                                className={`flex left ${tab.isSelected ? 'cn-9' : ''} ${
                                                                    tab.isDeleted && 'tab-list__deleted cr-5'
                                                                }`}
                                                            >
                                                                {tab.title === AppDetailsTabs.log_analyzer ? (
                                                                    <span className="icon-dim-16 resource-tree__tab-hover fcb-9">
                                                                        {' '}
                                                                        <LogAnalyzerIcon />
                                                                    </span>
                                                                ) : (
                                                                    ''
                                                                )}
                                                                {tab.title === AppDetailsTabs.k8s_Resources ? (
                                                                    <span className="icon-dim-16 resource-tree__tab-hover fcn-9 ">
                                                                        {' '}
                                                                        <K8ResourceIcon />
                                                                    </span>
                                                                ) : (
                                                                    ''
                                                                )}
                                                                <span
                                                                    className={`${
                                                                        tab.name !== AppDetailsTabs.k8s_Resources &&
                                                                        tab.name !== AppDetailsTabs.log_analyzer
                                                                            ? 'mr-8'
                                                                            : 'ml-8 text-capitalize '
                                                                    } fs-12 `}
                                                                >
                                                                    {tab.name}
                                                                </span>
                                                            </div>
                                                        </NavLink>

                                                        {tab.name !== AppDetailsTabs.log_analyzer &&
                                                            tab.name !== AppDetailsTabs.k8s_Resources && (
                                                                <div className="resource-tab__close-wrapper flex br-5">
                                                                    <Cross
                                                                        onClick={(e) => handleCloseTab(e, tab.title)}
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
                                                    ></div>
                                                </div>
                                            </Tippy>
                                        </li>
                                    </>
                                )
                            })}
                        </ul>
                    </div>
                    <Switch>
                        <Route
                            path={`${path}/${URLS.APP_DETAILS_K8}/:nodeType/group/:resourceName`}
                            render={() => {
                                return (
                                    <K8ResourceComponent
                                        clickedNodes={clickedNodes}
                                        registerNodeClick={registerNodeClick}
                                        handleFocusTabs={handleFocusTabs}
                                        externalLinks={externalLinks}
                                        monitoringTools={monitoringTools}
                                        isDevtronApp={isDevtronApp}
                                    />
                                )
                            }}
                        />
                        <Route
                            path={`${path}/${URLS.APP_DETAILS_K8}/:nodeType/:podName`}
                            render={() => {
                                return (
                                    <NodeDetailComponent
                                        logSearchTerms={logSearchTerms}
                                        setLogSearchTerms={setLogSearchTerms}
                                    />
                                )
                            }}
                        />
                        <Route
                            path={`${path}/${URLS.APP_DETAILS_K8}/:nodeType`}
                            render={() => {
                                return (
                                    <K8ResourceComponent
                                        clickedNodes={clickedNodes}
                                        registerNodeClick={registerNodeClick}
                                        handleFocusTabs={handleFocusTabs}
                                        externalLinks={externalLinks}
                                        monitoringTools={monitoringTools}
                                        isDevtronApp={isDevtronApp}
                                    />
                                )
                            }}
                        />
                        <Route
                            path={`${path}/${URLS.APP_DETAILS_K8}`}
                            render={() => {
                                return (
                                    <K8ResourceComponent
                                        clickedNodes={clickedNodes}
                                        registerNodeClick={registerNodeClick}
                                        handleFocusTabs={handleFocusTabs}
                                        externalLinks={externalLinks}
                                        monitoringTools={monitoringTools}
                                        isDevtronApp={isDevtronApp}
                                    />
                                )
                            }}
                        />
                        <Route
                            exact
                            path={`${path}/${URLS.APP_DETAILS_LOG}`}
                            render={() => {
                                return (
                                    <LogAnalyzerComponent
                                        logSearchTerms={logSearchTerms}
                                        setLogSearchTerms={setLogSearchTerms}
                                    />
                                )
                            }}
                        />
                        <Redirect to={`${path}/${URLS.APP_DETAILS_K8}`} />
                    </Switch>
                </>
            )}
        </>
    )
}


export default NodeTreeDetailTab;