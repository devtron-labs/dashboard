import React, { useEffect, useState } from 'react'
import EventsComponent from './NodeDetailTabs/Events.component'
import LogsComponent from './NodeDetailTabs/Logs.component'
import ManifestComponent from './NodeDetailTabs/Manifest.component'
import TerminalComponent from './NodeDetailTabs/Terminal.component'
import SummaryComponent from './NodeDetailTabs/Summary.component'
import { NavLink, Redirect, Route, Switch } from 'react-router-dom'
import { useParams, useRouteMatch } from 'react-router'
import { NodeDetailTab } from './nodeDetail.type'
import { getNodeDetailTabs } from './nodeDetail.util'
import { NodeDetailPropsType, NodeType } from '../../appDetails.type'
import AppDetailsStore from '../../appDetails.store'
import { useSharedState } from '../../../utils/useSharedState'
import IndexStore from '../../index.store'
import { getManifestResource } from './nodeDetail.api'
import { showError, Checkbox, CHECKBOX_VALUE } from '@devtron-labs/devtron-fe-common-lib'
import MessageUI, { MsgUIType } from '../../../common/message.ui'
import { Nodes } from '../../../../app/types'
import './nodeDetail.css'
import { K8S_EMPTY_GROUP } from '../../../../ResourceBrowser/Constants'

function NodeDetailComponent({
    loadingResources,
    isResourceBrowserView,
    markTabActiveByIdentifier,
    addTab,
    selectedResource,
    logSearchTerms,
    setLogSearchTerms,
}: NodeDetailPropsType) {
    const [applicationObjectTabs] = useSharedState(
        AppDetailsStore.getAppDetailsTabs(),
        AppDetailsStore.getAppDetailsTabsObservable(),
    )
    const appDetails = IndexStore.getAppDetails()
    const params = useParams<{ actionName: string; podName: string; nodeType: string; node: string }>()
    const [tabs, setTabs] = useState([])
    const [selectedTabName, setSelectedTabName] = useState('')
    const [resourceContainers, setResourceContainers] = useState([])
    const [isResourceDeleted, setResourceDeleted] = useState(false)
    const [isManagedFields, setManagedFields] = useState(false)
    const [hideManagedFields, setHideManagedFields] = useState(false)
    const [fetchingResource, setFetchingResource] = useState(
        isResourceBrowserView && params.nodeType === Nodes.Pod.toLowerCase(),
    )
    const { path, url } = useRouteMatch()
    const toggleManagedFields = (managedFieldsExist: boolean) => {
        if (selectedTabName === NodeDetailTab.MANIFEST && managedFieldsExist) {
            setManagedFields(true)
        } else {
            setManagedFields(false)
        }
    }

    useEffect(() => toggleManagedFields(isManagedFields), [selectedTabName])

    useEffect(() => {
        if (params.nodeType) {
            const _tabs = getNodeDetailTabs(params.nodeType as NodeType)
            setTabs(_tabs)
        }
    }, [params.nodeType])

    useEffect(() => {
        if (
            isResourceBrowserView &&
            !loadingResources &&
            selectedResource &&
            params.node &&
            params.nodeType === Nodes.Pod.toLowerCase()
        ) {
            getContainersFromManifest()
        }
    }, [loadingResources, params.node])

    const getContainersFromManifest = async () => {
        try {
            const { result } = await getManifestResource(
                appDetails,
                params.podName,
                params.nodeType,
                isResourceBrowserView,
                selectedResource,
            )

            const _resourceContainers = []
            if (result?.manifest?.spec) {
                if (Array.isArray(result.manifest.spec.containers)) {
                    _resourceContainers.push(
                        ...result.manifest.spec.containers.map((_container) => ({
                            name: _container.name,
                            isInitContainer: false,
                        })),
                    )
                }

                if (Array.isArray(result.manifest.spec.initContainers)) {
                    _resourceContainers.push(
                        ...result.manifest.spec.initContainers.map((_container) => ({
                            name: _container.name,
                            isInitContainer: true,
                        })),
                    )
                }
            }
            setResourceContainers(_resourceContainers)

            // Clear out error on node change
            if (isResourceDeleted) {
                setResourceDeleted(false)
            }
        } catch (err) {
            if (Array.isArray(err['errors']) && err['errors'].some((_err) => _err.code === '404')) {
                setResourceDeleted(true)
            } else {
                showError(err)

                // Clear out error on node change
                if (isResourceDeleted) {
                    setResourceDeleted(false)
                }
            }
        } finally {
            setFetchingResource(false)
        }
    }

    const handleSelectedTab = (_tabName: string, _url: string) => {
        const isTabFound = isResourceBrowserView
            ? markTabActiveByIdentifier(
                  selectedResource?.group?.toLowerCase() || K8S_EMPTY_GROUP,
                  params.node,
                  params.nodeType,
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

                if (isResourceBrowserView) {
                    addTab(
                        selectedResource?.group?.toLowerCase() || K8S_EMPTY_GROUP,
                        params.nodeType,
                        params.node,
                        _urlToCreate,
                    )
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
            params.nodeType + '/...' + (isResourceBrowserView ? params.node : params.podName)?.slice(-6)
        )
    })
    const isDeleted =
        (currentTab && currentTab[0] ? currentTab[0].isDeleted : false) ||
        (isResourceBrowserView && isResourceDeleted) ||
        (!isResourceBrowserView &&
            (appDetails.resourceTree.nodes?.findIndex(
                (node) => node.name === params.podName && node.kind.toLowerCase() === params.nodeType,
            ) >= 0
                ? false
                : true))

    // Assign extracted containers to selected resource before passing further
    if (selectedResource) {
        selectedResource.containers = resourceContainers
    }

    const handleChanges = ():void => {
        setHideManagedFields(!hideManagedFields)
    }

    return (
        <React.Fragment>
            <div data-testid="app-resource-containor-header" className="pl-20 bcn-0 flex left w-100 pr-20">
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
                                } pt-6 pb-6 cursor pl-8 pr-8 top`}
                            >
                                <NavLink to={`${url}/${tab.toLowerCase()}`} className=" dc__no-decor flex left">
                                    <span
                                        data-testid={`${tab.toLowerCase()}-nav-link`}
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
                {isManagedFields && (
                    <>
                        <div className="ml-12 mr-5 tab-cell-border"></div>
                        <div className="pt-6 pb-6 pl-8 pr-8 top">
                            <Checkbox
                                rootClassName="mb-0-imp h-20"
                                isChecked={hideManagedFields}
                                value={CHECKBOX_VALUE.CHECKED}
                                onChange={handleChanges}
                            >
                                <span className="mr-5 cn-9 fs-12" data-testid="hide-managed-fields">
                                    Hide Managed Fields
                                </span>
                            </Checkbox>
                        </div>
                    </>
                )}
            </div>
            {fetchingResource || (isResourceBrowserView && (loadingResources || !selectedResource)) ? (
                <MessageUI
                    msg=""
                    icon={MsgUIType.LOADING}
                    size={24}
                    minHeight={isResourceBrowserView ? 'calc(100vh - 116px)' : ''}
                />
            ) : (
                <Switch>
                    <Route path={`${path}/${NodeDetailTab.MANIFEST}`}>
                        <ManifestComponent
                            selectedTab={handleSelectedTab}
                            isDeleted={isDeleted}
                            toggleManagedFields={toggleManagedFields}
                            hideManagedFields={hideManagedFields}
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
                        <div
                            className="resource-node-wrapper"
                            style={{
                                minHeight: isResourceBrowserView ? '200px' : '',
                            }}
                        >
                            <LogsComponent
                                selectedTab={handleSelectedTab}
                                isDeleted={isDeleted}
                                logSearchTerms={logSearchTerms}
                                setLogSearchTerms={setLogSearchTerms}
                                isResourceBrowserView={isResourceBrowserView}
                                selectedResource={selectedResource}
                            />
                        </div>
                    </Route>
                    {!isResourceBrowserView && (
                        <Route path={`${path}/${NodeDetailTab.SUMMARY}`}>
                            <SummaryComponent selectedTab={handleSelectedTab} />
                        </Route>
                    )}
                    <Route path={`${path}/${NodeDetailTab.TERMINAL}`}>
                        <TerminalComponent
                            selectedTab={handleSelectedTab}
                            isDeleted={isDeleted}
                            isResourceBrowserView={isResourceBrowserView}
                            selectedResource={selectedResource}
                        />
                    </Route>
                    <Redirect to={`${path}/${NodeDetailTab.MANIFEST.toLowerCase()}`} />
                </Switch>
            )}
        </React.Fragment>
    )
}

export default NodeDetailComponent
