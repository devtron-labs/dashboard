import React, { useEffect, useState } from 'react';
import EventsComponent from './NodeDetailTabs/Events.component';
import LogsComponent from './NodeDetailTabs/Logs.component';
import ManifestComponent from './NodeDetailTabs/Manifest.component';
import TerminalComponent from './NodeDetailTabs/Terminal.component';
import './nodeDetail.css';
import SummaryComponent from './NodeDetailTabs/Summary.component';
import { NavLink, Route, Switch } from 'react-router-dom';
import { useParams, useRouteMatch, useHistory } from 'react-router';
import { NodeDetailTab } from './nodeDetail.type';
import { getNodeDetailTabs } from './nodeDetail.util';
import { LogSearchTermType, NodeType } from '../../appDetails.type';
import AppDetailsStore from '../../appDetails.store';
import { useSharedState } from '../../../utils/useSharedState';

function NodeDetailComponent({ logSearchTerms, setLogSearchTerms }: LogSearchTermType) {
    const [applicationObjectTabs] = useSharedState(
        AppDetailsStore.getAppDetailsTabs(),
        AppDetailsStore.getAppDetailsTabsObservable(),
    );
    const params = useParams<{ actionName: string; podName: string; nodeType: string }>();
    const [tabs, setTabs] = useState([]);
    const [selectedTabName, setSelectedTabName] = useState('');
    const { path, url } = useRouteMatch();
    const history = useHistory();

    useEffect(() => {
        const _tabs = getNodeDetailTabs(params.nodeType as NodeType);
        setTabs(_tabs);
    }, [params.nodeType]);

    const handleSelectedTab = (_tabName: string, _url: string) => {
        const isTabFound = AppDetailsStore.markAppDetailsTabActiveByIdentifier(params.podName, params.nodeType, _url);

        if (!isTabFound) {
            setTimeout(() => {
                let _urlToCreate = url + '/' + _tabName.toLowerCase();

                const query = new URLSearchParams(window.location.search);

                if (query.get('container')) {
                    _urlToCreate = _urlToCreate + '?container=' + query.get('container');
                }

                AppDetailsStore.addAppDetailsTab(params.nodeType, params.podName, _urlToCreate);

                setSelectedTabName(_tabName);
            }, 500);
        } else {
            setSelectedTabName(_tabName);
        }
    };

    const currentTab = applicationObjectTabs.filter((tab) => {
        return tab.name.toLowerCase() === params.nodeType + '/...' + params.podName.slice(-6);
    });
    const isDeleted = currentTab && currentTab[0] ? currentTab[0].isDeleted : false;

    return (
        <React.Fragment>
            <div className="pl-20 bcn-0 flex left top w-100 pr-20 ">
                <>
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
                                    <NavLink to={`${url}/${tab.toLowerCase()}`} className=" no-decor flex left">
                                        <span
                                            className={`${
                                                tab.toLowerCase() === selectedTabName.toLowerCase() ? 'cb-5' : 'cn-9'
                                            } default-tab-cell `}
                                        >
                                            {' '}
                                            {tab.toLowerCase()}
                                        </span>
                                    </NavLink>
                                </div>
                            );
                        })}{' '}
                </>
            </div>
            <Switch>
                <Route
                    path={`${path}/${NodeDetailTab.MANIFEST}`}
                    render={() => {
                        return <ManifestComponent selectedTab={handleSelectedTab} isDeleted={isDeleted} />;
                    }}
                />
                <Route
                    path={`${path}/${NodeDetailTab.EVENTS}`}
                    render={() => {
                        return <EventsComponent selectedTab={handleSelectedTab} isDeleted={isDeleted} />;
                    }}
                />
                <Route
                    path={`${path}/${NodeDetailTab.LOGS}`}
                    render={() => {
                        return (
                            <LogsComponent
                                selectedTab={handleSelectedTab}
                                isDeleted={isDeleted}
                                logSearchTerms={logSearchTerms}
                                setLogSearchTerms={setLogSearchTerms}
                            />
                        );
                    }}
                />
                <Route
                    path={`${path}/${NodeDetailTab.SUMMARY}`}
                    render={() => {
                        return <SummaryComponent selectedTab={handleSelectedTab} />;
                    }}
                />
                <Route
                    path={`${path}/${NodeDetailTab.TERMINAL}`}
                    render={() => {
                        return <TerminalComponent selectedTab={handleSelectedTab} isDeleted={isDeleted} />;
                    }}
                />
            </Switch>
        </React.Fragment>
    );
}

export default NodeDetailComponent;
