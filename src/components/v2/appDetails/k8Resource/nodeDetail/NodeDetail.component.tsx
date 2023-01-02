import React, { useEffect, useState } from 'react'
import EventsComponent from './NodeDetailTabs/Events.component'
import LogsComponent from './NodeDetailTabs/Logs.component'
import ManifestComponent from './NodeDetailTabs/Manifest.component'
import TerminalComponent from './NodeDetailTabs/Terminal.component'
import SummaryComponent from './NodeDetailTabs/Summary.component'
import { NavLink, Route, Switch } from 'react-router-dom'
import { useParams, useRouteMatch } from 'react-router'
import { NodeDetailTab } from './nodeDetail.type'
import { getNodeDetailTabs } from './nodeDetail.util'
import { NodeDetailPropsType, NodeType } from '../../appDetails.type'
import AppDetailsStore from '../../appDetails.store'
import { useSharedState } from '../../../utils/useSharedState'
import IndexStore from '../../index.store'
import './nodeDetail.css'

function NodeDetailComponent({
    isResourceBrowserView,
    selectedResource,
    logSearchTerms,
    setLogSearchTerms,
}: NodeDetailPropsType) {
    const [applicationObjectTabs] = useSharedState(
        AppDetailsStore.getAppDetailsTabs(),
        AppDetailsStore.getAppDetailsTabsObservable(),
    )
    const appDetails = IndexStore.getAppDetails()
    const params = useParams<{ actionName: string; podName: string; nodeType: string }>()
    const [tabs, setTabs] = useState([])
    const [selectedTabName, setSelectedTabName] = useState('')
    const { path, url } = useRouteMatch()

    useEffect(() => {
        const _tabs = getNodeDetailTabs(NodeType.Pod) // (kind as NodeType);
        setTabs(_tabs)
    }, [params.nodeType, selectedResource?.kind])

    const handleSelectedTab = (_tabName: string, _url: string) => {
        const isTabFound =
            isResourceBrowserView && selectedResource
                ? AppDetailsStore.markAppDetailsTabActiveByIdentifier(
                      selectedResource.name,
                      selectedResource.kind,
                      _url,
                  )
                : AppDetailsStore.markAppDetailsTabActiveByIdentifier(params.podName, params.nodeType, _url)

        if (!isTabFound) {
            setTimeout(() => {
                let _urlToCreate = url + '/' + _tabName.toLowerCase()

                const query = new URLSearchParams(window.location.search)

                if (query.get('container')) {
                    _urlToCreate = _urlToCreate + '?container=' + query.get('container')
                }

                if (isResourceBrowserView && selectedResource) {
                    AppDetailsStore.addAppDetailsTab(selectedResource.kind, selectedResource.name, _urlToCreate)
                } else {
                    AppDetailsStore.addAppDetailsTab(params.nodeType, params.podName, _urlToCreate)
                }

                setSelectedTabName(_tabName)
            }, 500)
        } else if (selectedTabName !== _tabName) {
            setSelectedTabName(_tabName)
        }
    }

    const currentTab = applicationObjectTabs.filter((tab) => {
        return (
            tab.name.toLowerCase() ===
            (isResourceBrowserView && selectedResource
                ? selectedResource.kind + '/...' + selectedResource.name.slice(-6)
                : params.nodeType + '/...' + params.podName.slice(-6))
        )
    })
    const isDeleted =
        (currentTab && currentTab[0] ? currentTab[0].isDeleted : false) ||
        (!isResourceBrowserView &&
            (appDetails.resourceTree.nodes?.findIndex(
                (node) => node.name === params.podName && node.kind.toLowerCase() === params.nodeType,
            ) >= 0
                ? false
                : true))

    return (
        <React.Fragment>
            <div className="pl-20 bcn-0 flex left top w-100 pr-20">
                {tabs &&
                    tabs.length > 0 &&
                    tabs.map((tab: string, index: number) => {
                        return (
                            <div
                                key={index + 'resourceTreeTab'}
                                className={`${
                                    tab.toLowerCase() === selectedTabName.toLowerCase()
                                        ? 'default-tab-row cb-5'
                                        : 'cn-7'
                                } pt-6 pb-6 cursor pl-8 pr-8`}
                            >
                                <NavLink to={`${url}/${tab.toLowerCase()}`} className=" dc__no-decor flex left">
                                    <span
                                        className={`${
                                            tab.toLowerCase() === selectedTabName.toLowerCase() ? 'cb-5' : 'cn-9'
                                        } default-tab-cell`}
                                    >
                                        {tab.toLowerCase()}
                                    </span>
                                </NavLink>
                            </div>
                        )
                    })}
            </div>
            <Switch>
                <Route path={`${path}/${NodeDetailTab.MANIFEST}`}>
                    <ManifestComponent
                        selectedTab={handleSelectedTab}
                        isDeleted={isDeleted}
                        isResourceBrowserView={isResourceBrowserView}
                        selectedResource={selectedResource}
                    />
                </Route>
                <Route path={`${path}/${NodeDetailTab.EVENTS}`}>
                    <EventsComponent
                        selectedTab={handleSelectedTab}
                        isDeleted={isDeleted}
                        isResourceBrowserView={isResourceBrowserView}
                        selectedResource={selectedResource}
                    />
                </Route>
                <Route path={`${path}/${NodeDetailTab.LOGS}`}>
                    <div className="resource-node-wrapper">
                        <LogsComponent
                            selectedTab={handleSelectedTab}
                            isDeleted={isDeleted}
                            logSearchTerms={logSearchTerms}
                            setLogSearchTerms={setLogSearchTerms}
                        />
                    </div>
                </Route>
                <Route path={`${path}/${NodeDetailTab.SUMMARY}`}>
                    <SummaryComponent selectedTab={handleSelectedTab} />
                </Route>
                <Route path={`${path}/${NodeDetailTab.TERMINAL}`}>
                    <TerminalComponent
                        selectedTab={handleSelectedTab}
                        isDeleted={isDeleted}
                        isResourceBrowserView={isResourceBrowserView}
                        selectedResource={selectedResource}
                    />
                </Route>
            </Switch>
        </React.Fragment>
    )
}

export default NodeDetailComponent
