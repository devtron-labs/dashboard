import React, { useEffect, useState } from 'react'
import { NavLink, Route, Switch, useParams, useRouteMatch } from 'react-router-dom'
import AppDetailsStore from '../../v2/appDetails/appDetails.store'
import { NodeType } from '../../v2/appDetails/appDetails.type'
import { NodeDetailTab } from '../../v2/appDetails/k8Resource/nodeDetail/nodeDetail.type'
import { getNodeDetailTabs } from '../../v2/appDetails/k8Resource/nodeDetail/nodeDetail.util'
import EventsComponent from '../../v2/appDetails/k8Resource/nodeDetail/NodeDetailTabs/Events.component'
import LogsComponent from '../../v2/appDetails/k8Resource/nodeDetail/NodeDetailTabs/Logs.component'
import ManifestComponent from '../../v2/appDetails/k8Resource/nodeDetail/NodeDetailTabs/Manifest.component'
import TerminalComponent from '../../v2/appDetails/k8Resource/nodeDetail/NodeDetailTabs/Terminal.component'
import { useSharedState } from '../../v2/utils/useSharedState'
import { ResourceDetailsPropType } from '../Types'
import './ResourceDetails.scss'

export default function ResourceDetails({
    selectedResource,
    logSearchTerms,
    setLogSearchTerms,
}: ResourceDetailsPropType) {
    const [applicationObjectTabs] = useSharedState(
        AppDetailsStore.getAppDetailsTabs(),
        AppDetailsStore.getAppDetailsTabsObservable(),
    )
    const [tabs, setTabs] = useState([])
    const [selectedTabName, setSelectedTabName] = useState('')
    const { path, url } = useRouteMatch()

    useEffect(() => {
        const _tabs = getNodeDetailTabs(NodeType.Pod) // (kind as NodeType);
        setTabs(_tabs)
    }, [selectedResource.kind])

    const handleSelectedTab = (_tabName: string, _url: string) => {
        const isTabFound = AppDetailsStore.markAppDetailsTabActiveByIdentifier(
            selectedResource.name,
            selectedResource.kind,
            _url,
        )

        if (!isTabFound) {
            setTimeout(() => {
                let _urlToCreate = url + '/' + _tabName.toLowerCase()

                const query = new URLSearchParams(window.location.search)

                if (query.get('container')) {
                    _urlToCreate = _urlToCreate + '?container=' + query.get('container')
                }

                AppDetailsStore.addAppDetailsTab(selectedResource.kind, selectedResource.name, _urlToCreate)

                setSelectedTabName(_tabName)
            }, 500)
        } else {
            setSelectedTabName(_tabName)
        }
    }

    const currentTab = applicationObjectTabs.filter((tab) => {
        return tab.name.toLowerCase() === selectedResource.kind + '/...' + selectedResource.name.slice(-6)
    })
    const isDeleted = currentTab && currentTab[0] ? currentTab[0].isDeleted : false

    return (
        <div className="resource-details-container">
            <div className="pl-20 bcn-0 flex left top w-100 pr-20 ">
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
                                        } default-tab-cell `}
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
                    <ManifestComponent selectedTab={handleSelectedTab} isDeleted={isDeleted} />
                </Route>
                <Route path={`${path}/${NodeDetailTab.EVENTS}`}>
                    <EventsComponent
                        selectedTab={handleSelectedTab}
                        isDeleted={isDeleted}
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
                <Route path={`${path}/${NodeDetailTab.TERMINAL}`}>
                    <TerminalComponent selectedTab={handleSelectedTab} isDeleted={isDeleted} />
                </Route>
            </Switch>
        </div>
    )
}
