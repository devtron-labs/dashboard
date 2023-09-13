import React, { useEffect, useState } from 'react'
import EventsComponent from './NodeDetailTabs/Events.component'
import LogsComponent from './NodeDetailTabs/Logs.component'
import ManifestComponent from './NodeDetailTabs/Manifest.component'
import TerminalComponent from './NodeDetailTabs/Terminal.component'
import SummaryComponent from './NodeDetailTabs/Summary.component'
import { NavLink, Redirect, Route, Switch } from 'react-router-dom'
import { useParams, useRouteMatch } from 'react-router'
import { NodeDetailTab, ParamsType } from './nodeDetail.type'
import { NodeDetailPropsType, NodeType, Options, OptionsBase } from '../../appDetails.type'
import AppDetailsStore from '../../appDetails.store'
import { useSharedState } from '../../../utils/useSharedState'
import IndexStore from '../../index.store'
import { getManifestResource } from './nodeDetail.api'
import { showError, Checkbox, CHECKBOX_VALUE, OptionType, noop } from '@devtron-labs/devtron-fe-common-lib'
import MessageUI, { MsgUIType } from '../../../common/message.ui'
import { Nodes } from '../../../../app/types'
import './nodeDetail.css'
import { K8S_EMPTY_GROUP, SIDEBAR_KEYS } from '../../../../ResourceBrowser/Constants'
import { getContainersData, getNodeDetailTabs } from './nodeDetail.util'
import EphemeralContainerDrawer from './EphemeralContainerDrawer'
import { ReactComponent as EphemeralIcon } from '../../../../../assets/icons/ic-ephemeral.svg'
import { ReactComponent as DeleteIcon } from '../../../../../assets/icons/ic-delete-interactive.svg'
import { EDITOR_VIEW } from '../../../../deploymentConfig/constants'
import { CLUSTER_NODE_ACTIONS_LABELS } from '../../../../ClusterNodes/constants'
import DeleteResourcePopup from '../../../../ResourceBrowser/ResourceList/DeleteResourcePopup'

function NodeDetailComponent({
    loadingResources,
    isResourceBrowserView,
    markTabActiveByIdentifier,
    addTab,
    selectedResource,
    logSearchTerms,
    setLogSearchTerms,
    removeTabByIdentifier,
}: NodeDetailPropsType) {
    const [applicationObjectTabs] = useSharedState(
        AppDetailsStore.getAppDetailsTabs(),
        AppDetailsStore.getAppDetailsTabsObservable(),
    )
    const appDetails = IndexStore.getAppDetails()
    const params = useParams<ParamsType>()
    const [tabs, setTabs] = useState([])
    const [selectedTabName, setSelectedTabName] = useState('')
    const [resourceContainers, setResourceContainers] = useState<OptionsBase[]>([])
    const [isResourceDeleted, setResourceDeleted] = useState(false)
    const [isManagedFields, setManagedFields] = useState(false)
    const [hideManagedFields, setHideManagedFields] = useState(true)
    const [fetchingResource, setFetchingResource] = useState(
        isResourceBrowserView && params.nodeType === Nodes.Pod.toLowerCase(),
    )
    const [selectedContainer, setSelectedContainer] = useState<Map<string, string>>(new Map())
    const [showEphemeralContainerDrawer, setShowEphemeralContainerDrawer] = useState<boolean>(false)
    const [ephemeralContainerType, setEphemeralContainerType] = useState<string>(EDITOR_VIEW.BASIC)
    const [targetContainerOption, setTargetContainerOption] = useState<OptionType[]>([])
    const [imageListOption, setImageListOption] = useState<OptionType[]>([])
    const podMetaData = !isResourceBrowserView && IndexStore.getMetaDataForPod(params.podName)
    const { path, url } = useRouteMatch()
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const toggleManagedFields = (managedFieldsExist: boolean) => {
        if (selectedTabName === NodeDetailTab.MANIFEST && managedFieldsExist) {
            setManagedFields(true)
        } else {
            setManagedFields(false)
        }
    }
    const [containers, setContainers] = useState<Options[]>(
        (isResourceBrowserView ? selectedResource?.containers ?? [] : getContainersData(podMetaData)) as Options[],
    )

    const selectedContainerValue = isResourceBrowserView ? selectedResource?.name : podMetaData?.name
    const _selectedContainer = selectedContainer.get(selectedContainerValue) || containers?.[0]?.name || ''
    const [selectedContainerName, setSelectedContainerName] = useState(_selectedContainer)
    useEffect(() => toggleManagedFields(isManagedFields), [selectedTabName])
    useEffect(() => {
        if (params.nodeType) {
            const _tabs = getNodeDetailTabs(params.nodeType as NodeType, true)
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
    }, [loadingResources, params.node, params.namespace])

    const isExternalEphemeralContainer = (cmds: string[], name: string): boolean => {
        const matchingCmd = `sh ${name}-devtron.sh`
        const internal = cmds?.find((cmd) => cmd.includes(matchingCmd))
        return !internal
    }

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
                            isEphemeralContainer: false,
                        })),
                    )
                }

                if (Array.isArray(result.manifest.spec.initContainers)) {
                    _resourceContainers.push(
                        ...result.manifest.spec.initContainers.map((_container) => ({
                            name: _container.name,
                            isInitContainer: true,
                            isEphemeralContainer: false,
                        })),
                    )
                }

                if (Array.isArray(result.manifest.spec.ephemeralContainers)) {
                    const ephemeralContainerStatusMap = new Map<string, string[]>()
                    result.manifest.spec.ephemeralContainers.forEach((con) => {
                        ephemeralContainerStatusMap.set(con.name, con.command as string[])
                    })
                    let ephemeralContainers = []
                    result.manifest.status.ephemeralContainerStatuses?.forEach((_container) => {
                        //con.state contains three states running,waiting and terminated
                        // at any point of time only one state will be there
                        if (_container.state.running) {
                            ephemeralContainers.push({
                                name: _container.name,
                                isInitContainer: false,
                                isEphemeralContainer: true,
                                isExternal: isExternalEphemeralContainer(
                                    ephemeralContainerStatusMap.get(_container.name),
                                    _container.name,
                                ),
                            })
                        }
                    })
                    _resourceContainers.push(...ephemeralContainers)
                }
            }
            setResourceContainers(_resourceContainers)
            if (isResourceBrowserView) {
                setContainers(_resourceContainers ?? [])
            }
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
        const _idPrefix =
            `${(selectedResource.kind === SIDEBAR_KEYS.eventGVK.Kind
                ? K8S_EMPTY_GROUP
                : selectedResource?.group?.toLowerCase() || K8S_EMPTY_GROUP)}_${params.namespace}`
        const isTabFound = isResourceBrowserView
            ? markTabActiveByIdentifier(_idPrefix, params.node, params.nodeType, _url)
            : AppDetailsStore.markAppDetailsTabActiveByIdentifier(params.podName, params.nodeType, _url)

        if (!isTabFound) {
            setTimeout(() => {
                let _urlToCreate = url + '/' + _tabName.toLowerCase()

                const query = new URLSearchParams(window.location.search)

                if (query.get('container')) {
                    _urlToCreate = _urlToCreate + '?container=' + query.get('container')
                }

                if (isResourceBrowserView) {
                    addTab(_idPrefix, params.nodeType, params.node, _urlToCreate)
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
        (currentTab?.[0] ? currentTab[0].isDeleted : false) ||
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

    const handleChanges = (): void => {
        setHideManagedFields(!hideManagedFields)
    }

    const onClickShowLaunchEphemeral = (): void => {
        setShowEphemeralContainerDrawer(!showEphemeralContainerDrawer)
        if (showEphemeralContainerDrawer) {
            setEphemeralContainerType(EDITOR_VIEW.BASIC)
        }
    }

    const switchSelectedContainer = (containerName: string) => {
        setSelectedContainerName(containerName)
        setSelectedContainer(selectedContainer.set(selectedContainerValue, containerName))
    }

    const toggleDeleteDialog = () => {
        setShowDeleteDialog((prevState) => !prevState)
    }

    return (
        <React.Fragment>
            <div className="w-100 pr-20 pl-20 bcn-0 flex dc__border-bottom dc__content-space">
                <div className="flex left">
                    <div data-testid="app-resource-containor-header" className="flex left">
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
                                                    tab.toLowerCase() === selectedTabName.toLowerCase()
                                                        ? 'cb-5'
                                                        : 'cn-9'
                                                } default-tab-cell`}
                                            >
                                                {tab.toLowerCase()}
                                            </span>
                                        </NavLink>
                                    </div>
                                )
                            })}
                    </div>
                    {selectedTabName === NodeDetailTab.TERMINAL && (
                        <>
                            <div className="ml-12 mr-5 tab-cell-border"></div>
                            <div className="cursor cb-5 fw-6 flex" onClick={onClickShowLaunchEphemeral}>
                                <EphemeralIcon className="mr-4 icon-dim-16 scb-5" />
                                Launch Ephemeral Container
                            </div>
                        </>
                    )}
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
                {isResourceBrowserView && (
                    <span className="flex left fw-6 cr-5 ml-16 fs-12 cursor" onClick={toggleDeleteDialog}>
                        <DeleteIcon className="icon-dim-16 mr-5 scr-5" />
                        {CLUSTER_NODE_ACTIONS_LABELS.delete}
                    </span>
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
                                ephemeralContainerType={ephemeralContainerType}
                                targetContainerOption={targetContainerOption}
                                imageListOption={imageListOption}
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
                            selectedContainer={selectedContainer}
                            setSelectedContainer={setSelectedContainer}
                            containers={containers}
                            setContainers={setContainers}
                            selectedContainerName={selectedContainerName}
                            setSelectedContainerName={setSelectedContainerName}
                            switchSelectedContainer={switchSelectedContainer}
                        />
                    </Route>
                    <Redirect to={`${path}/${NodeDetailTab.MANIFEST.toLowerCase()}`} />
                </Switch>
            )}
            {showEphemeralContainerDrawer && (
                <EphemeralContainerDrawer
                    setShowEphemeralContainerDrawer={setShowEphemeralContainerDrawer}
                    onClickShowLaunchEphemeral={onClickShowLaunchEphemeral}
                    params={params}
                    setResourceContainers={setResourceContainers}
                    setEphemeralContainerType={setEphemeralContainerType}
                    ephemeralContainerType={ephemeralContainerType}
                    setImageListOption={setImageListOption}
                    imageListOption={imageListOption}
                    setTargetContainerOption={setTargetContainerOption}
                    targetContainerOption={targetContainerOption}
                    isResourceBrowserView={isResourceBrowserView}
                    containers={containers}
                    setContainers={setContainers}
                    switchSelectedContainer={switchSelectedContainer}
                    selectedNamespaceByClickingPod={selectedResource?.namespace}
                />
            )}
            {isResourceBrowserView && showDeleteDialog && (
                <DeleteResourcePopup
                    clusterId={`${selectedResource.clusterId}`}
                    resourceData={selectedResource}
                    selectedResource={{
                        gvk: {
                            Group: selectedResource.group,
                            Version: selectedResource.version,
                            Kind: selectedResource.kind as Nodes,
                        },
                        namespaced: false,
                    }}
                    getResourceListData={noop}
                    toggleDeleteDialog={toggleDeleteDialog}
                    removeTabByIdentifier={removeTabByIdentifier}
                />
            )}
        </React.Fragment>
    )
}

export default NodeDetailComponent
