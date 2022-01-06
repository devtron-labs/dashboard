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
import { ApplicationObject, NodeType } from '../../appDetails.type';
import AppDetailsStore from '../../appDetails.store';
import { URLS } from '../../../../../config';
import { useSharedState } from '../../../utils/useSharedState';
import MessageUI from '../../../common/message.ui';

function NodeDetailComponent() {
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
    }, []);

    const handleSelectedTab = (_tabName: string, _url: string) => {
        const isTabFound = AppDetailsStore.markAppDetailsTabActive(_url, url);

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

    const currentTab = applicationObjectTabs.filter(
        (tab) => tab.name.toLowerCase() === params.nodeType + '/...' + params.podName.slice(-6),
    );
    const isDeleted = currentTab && currentTab[0] ? currentTab[0].isDeleted : false;
    console.log(isDeleted);
    return (
        <React.Fragment>
            <div className="node-details_tab bcn-0 flex left top w-100 pl-20 border-bottom pr-20 ">
                {isDeleted ? (
                    <MessageUI msg="This resource no longer exists" size={32} />
                ) : (
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
                                                    tab.toLowerCase() === selectedTabName.toLowerCase()
                                                        ? 'cb-5'
                                                        : 'cn-9'
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
                )}
            </div>
            {!isDeleted && <Switch>
                <Route
                    path={`${path}/${NodeDetailTab.MANIFEST}`}
                    render={() => {
                        return <ManifestComponent selectedTab={handleSelectedTab} />;
                    }}
                />
                <Route
                    path={`${path}/${NodeDetailTab.EVENTS}`}
                    render={() => {
                        return <EventsComponent selectedTab={handleSelectedTab} />;
                    }}
                />
                <Route
                    path={`${path}/${NodeDetailTab.LOGS}`}
                    render={() => {
                        return <LogsComponent selectedTab={handleSelectedTab} />;
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
                        return <TerminalComponent selectedTab={handleSelectedTab} />;
                    }}
                />
            </Switch>}
        </React.Fragment>
    );
}

export default NodeDetailComponent;
