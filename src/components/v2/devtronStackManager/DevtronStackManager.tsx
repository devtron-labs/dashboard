import React, { Suspense, useCallback, useEffect, useRef, useState, useContext } from 'react'
import { Redirect, Route, RouteComponentProps, Router, Switch, useHistory, useLocation } from 'react-router-dom'
import { SERVER_MODE, URLS } from '../../../config'
import { ErrorBoundary, ErrorScreenManager, Progressing, showError } from '../../common'
import AboutDevtronView from './AboutDevtronView'
import {
    handleError,
    ManagedByDialog,
    ModuleDetailsView,
    ModulesListingView,
    NavItem,
    PageHeader,
} from './DevtronStackManager.component'
import { getAllModules, getLogPodName, getModuleInfo, getReleasesNotes } from './DevtronStackManager.service'
import {
    AllModuleInfoResponse,
    LogPodNameResponse,
    ModuleDetails,
    ModuleInfo,
    ModuleStatus,
    ReleaseNotesResponse,
    ServerInfo,
    StackDetailsType,
} from './DevtronStackManager.type'
import { mainContext } from '../../common/navigation/NavigationRoutes'
import './devtronStackManager.scss'

let modulesPollingInterval = null

export default function DevtronStackManager({
    serverInfo,
    getCurrentServerInfo,
}: {
    serverInfo: ServerInfo
    getCurrentServerInfo: () => Promise<void>
}) {
    const { serverMode } = useContext(mainContext)
    const history: RouteComponentProps['history'] = useHistory()
    const location: RouteComponentProps['location'] = useLocation()
    const [showManagedByDialog, setShowManagedByDialog] = useState(false)
    const [stackDetails, setStackDetails] = useState<StackDetailsType>({
        isLoading: false,
        discoverModulesList: [],
        installedModulesList: [],
        releaseNotes: [],
        logPodName: '',
        errorStatusCode: 0,
    })
    const [selectedModule, setSelectedModule] = useState<ModuleDetails>()
    const [actionTriggered, setActionTriggered] = useState<Record<string, boolean>>({
        serverAction: false,
    })
    const [detailsMode, setDetailsMode] = useState('')
    const [selectedTabIndex, setSelectedTabIndex] = useState(
        location.pathname.includes(URLS.STACK_MANAGER_ABOUT_RELEASES) ? 1 : 0,
    )
    const stackManagerRef = useRef<HTMLElement>()
    const queryParams = new URLSearchParams(location.search)

    useEffect(() => {
        getModuleDetails()

        // Clearing out 30s interval/polling on component unmount
        return (): void => {
            clearInterval(modulesPollingInterval)
        }
    }, [])

    /**
     * To reset detailsMode when switching to "About devtron" using "Help option" (side nav)
     * or "Check for updates" after successful installtion from module details view/page
     */
    useEffect(() => {
        if (location.pathname.includes('/stack-manager') && !queryParams.has('id')) {
            setDetailsMode('')
        }
    }, [location.pathname])

    // To fetch the latest module/server details, right after triggering the install/update action.
    useEffect(() => {
        if (queryParams.get('actionTriggered') === 'true') {
            getLatestInfo()
            queryParams.delete('actionTriggered')
            history.push(`${location.pathname}?${queryParams.toString()}`)
        }
    }, [location.search])

    /**
     * To update the installation status for seleted module after fetching latest details
     * when on module details view
     */
    useEffect(() => {
        if (stackDetails.discoverModulesList.length > 0) {
            if (
                location.pathname.includes(URLS.STACK_MANAGER_INSTALLED_MODULES_DETAILS) &&
                stackDetails.installedModulesList.length === 0
            ) {
                history.push(URLS.STACK_MANAGER_INSTALLED_MODULES)
            } else if (location.pathname.includes('/details') && queryParams.get('id')) {
                const _selectedModule = stackDetails.discoverModulesList.find(
                    (module) => module.name.toLowerCase() === queryParams.get('id').toLowerCase(),
                )

                if (!_selectedModule) {
                    history.push(
                        location.pathname.includes(URLS.STACK_MANAGER_DISCOVER_MODULES_DETAILS)
                            ? URLS.STACK_MANAGER_DISCOVER_MODULES
                            : URLS.STACK_MANAGER_INSTALLED_MODULES,
                    )
                }

                setSelectedModule(_selectedModule)
                if (!detailsMode) {
                    setDetailsMode(
                        location.pathname.includes(URLS.STACK_MANAGER_DISCOVER_MODULES_DETAILS)
                            ? 'discover'
                            : 'installed',
                    )
                }
            }
        }
    }, [stackDetails.discoverModulesList])

    /**
     * 1. If query params has 'id' then module installation action has been triggered
     * so fetch the specific module info.
     * 2. Else it's the server/stack upgrade action so fetch the server info
     */
    const getLatestInfo = async () => {
        try {
            if (queryParams.has('id')) {
                const { result } = await getModuleInfo(queryParams.get('id'))

                if (result) {
                    const currentModule = stackDetails.discoverModulesList.find(
                        (_module) => _module.name === result.name,
                    )
                    setSelectedModule({
                        ...currentModule,
                        installationStatus: result.status,
                    })
                }
            } else {
                getCurrentServerInfo()
            }
        } catch (e) {
            showError(e)
        } finally {
            setActionTriggered({
                ...actionTriggered,
                [location.pathname.includes(URLS.STACK_MANAGER_DISCOVER_MODULES_DETAILS)
                    ? `moduleAction-${queryParams.get('id')?.toLowerCase()}`
                    : 'serverAction']: false,
            })
        }
    }

    const _getLogPodName = async (): Promise<void> => {
        try {
            const { result } = await getLogPodName()
            setStackDetails({
                ...stackDetails,
                logPodName: result?.podName,
            })
        } catch (e) {
            console.error(e)
        }
    }

    const _getDetailsForAllModules = (_modulesList: ModuleDetails[], _stackDetails: StackDetailsType): void => {
        // 1. Create array of promises to fetch module details
        const _moduleDetailsPromiseList = _modulesList?.map((module: ModuleDetails) =>
            serverMode === SERVER_MODE.FULL && module.isIncludedInLegacyFullPackage
                ? { result: { name: module.name, status: ModuleStatus.INSTALLED } }
                : getModuleInfo(module.name),
        )

        const _discoverModulesList: ModuleDetails[] = []
        const _installedModulesList: ModuleDetails[] = []

        Promise.allSettled(_moduleDetailsPromiseList)
            .then((responses: { status: string; value?: any; reason?: any }[]) => {
                responses.forEach((res, idx) => {
                    if (!res.reason) {
                        const result: ModuleInfo = res.value?.result
                        const currentModule = _modulesList?.find((_module) => _module.name === result?.name)
                        // 2. Populate the module details using current module details & new installation status
                        const _moduleDetails: ModuleDetails = {
                            ...currentModule,
                            installationStatus: result?.status,
                        }

                        /**
                         * 3. Push all modules details to discoverModulesList & only modules whose status is "installed" to installedModulesList
                         */
                        _discoverModulesList.push(_moduleDetails)

                        if (_moduleDetails.installationStatus === ModuleStatus.INSTALLED) {
                            _installedModulesList.push(_moduleDetails)
                        }
                    }
                })

                _stackDetails.discoverModulesList = _discoverModulesList
                _stackDetails.installedModulesList = _installedModulesList

                // 6. Update the stackDetails
                setStackDetails(_stackDetails)
            })
            .catch((e) => {
                console.error(e)
            })
    }

    const getModuleDetails = () => {
        setStackDetails({
            ...stackDetails,
            isLoading: true,
        })

        // 1. Execute all APIs - get all modules, get logPodName & releaseNotes
        Promise.allSettled([getAllModules(), getLogPodName(), getReleasesNotes()])
            .then((responses: { status: string; value?: any; reason?: any }[]) => {
                const allModulesRes: AllModuleInfoResponse = responses[0].value
                const allModulesErrorRes = responses[0].reason

                /**
                 * 2. If get all modules API fails then set the error code to be used by
                 * ErrorScreenManager to handle & show an appropriate error & return
                 */
                if (allModulesErrorRes?.code >= 0) {
                    setStackDetails({
                        ...stackDetails,
                        isLoading: false,
                        errorStatusCode: allModulesErrorRes.code,
                    })
                    return
                }

                const logPodNameRes: LogPodNameResponse = responses[1].value
                const releaseNotesRes: ReleaseNotesResponse = responses[2].value

                const _stackDetails: StackDetailsType = {
                    ...stackDetails,
                    isLoading: false,
                    releaseNotes: releaseNotesRes?.result,
                    logPodName: logPodNameRes?.result?.podName,
                }

                _getDetailsForAllModules(allModulesRes?.result, _stackDetails)
                pollForLatestDetails(allModulesRes?.result, _stackDetails)
            })
            .catch((err) => {
                handleError(err)
                setStackDetails({
                    ...stackDetails,
                    isLoading: false,
                })
            })
    }

    // Activate polling for latest server info, module details & logPodName only on stack manager page.
    const pollForLatestDetails = (modulesList: ModuleDetails[], _stackDetails: StackDetailsType) => {
        // Fetching latest details/status every 30s
        modulesPollingInterval = setInterval(() => {
            getCurrentServerInfo()
            _getDetailsForAllModules(
                modulesList || stackDetails.discoverModulesList,
                _stackDetails || { ...stackDetails },
            )
            _getLogPodName()
        }, 30000)
    }

    /**
     * This is to handle the module selection
     */
    const handleModuleSelection = (moduleDetails: ModuleDetails, fromDiscoverModules?: boolean) => {
        queryParams.set('id', moduleDetails.name)
        setDetailsMode(fromDiscoverModules ? 'discover' : 'installed')
        setSelectedModule(moduleDetails)

        history.push(
            `${
                fromDiscoverModules
                    ? URLS.STACK_MANAGER_DISCOVER_MODULES_DETAILS
                    : URLS.STACK_MANAGER_INSTALLED_MODULES_DETAILS
            }?${queryParams.toString()}`,
        )
    }

    const handleBreadcrumbClick = () => {
        setDetailsMode('')
        setSelectedModule(undefined)
    }

    const handleTabChange = useCallback(
        (tabIndex: number) => {
            setSelectedTabIndex(tabIndex)
        },
        [selectedTabIndex],
    )

    const handleActionTrigger = useCallback(
        (actionName: string, actionState: boolean) => {
            setActionTriggered({
                ...actionTriggered,
                [actionName]: actionState,
            })
        },
        [actionTriggered],
    )

    const checkIfCICDIsInstalled = () => {
        return stackDetails.installedModulesList.findIndex((module) => module.name.toLowerCase() === 'cicd') !== -1
    }

    const Body = () => {
        return (
            <Switch location={location}>
                <Route path={URLS.STACK_MANAGER_DISCOVER_MODULES_DETAILS}>
                    <ModuleDetailsView
                        moduleDetails={selectedModule}
                        setDetailsMode={setDetailsMode}
                        setShowManagedByDialog={setShowManagedByDialog}
                        serverInfo={serverInfo}
                        upgradeVersion={stackDetails.releaseNotes[0]?.releaseName}
                        logPodName={stackDetails.logPodName}
                        fromDiscoverModules={true}
                        isActionTriggered={actionTriggered[`moduleAction-${selectedModule?.name?.toLowerCase()}`]}
                        handleActionTrigger={handleActionTrigger}
                        history={history}
                        location={location}
                    />
                </Route>
                <Route path={URLS.STACK_MANAGER_INSTALLED_MODULES_DETAILS}>
                    <ModuleDetailsView
                        moduleDetails={selectedModule}
                        setDetailsMode={setDetailsMode}
                        setShowManagedByDialog={setShowManagedByDialog}
                        serverInfo={serverInfo}
                        upgradeVersion={stackDetails.releaseNotes[0]?.releaseName}
                        logPodName={stackDetails.logPodName}
                        isActionTriggered={actionTriggered[`moduleAction-${selectedModule?.name?.toLowerCase()}`]}
                        handleActionTrigger={handleActionTrigger}
                        history={history}
                        location={location}
                    />
                </Route>
                <Route path={URLS.STACK_MANAGER_DISCOVER_MODULES}>
                    <ModulesListingView
                        modulesList={stackDetails.discoverModulesList}
                        isDiscoverModulesView={true}
                        handleModuleCardClick={handleModuleSelection}
                        history={history}
                    />
                </Route>
                <Route path={URLS.STACK_MANAGER_INSTALLED_MODULES}>
                    <ModulesListingView
                        modulesList={stackDetails.installedModulesList}
                        handleModuleCardClick={handleModuleSelection}
                        history={history}
                    />
                </Route>
                <Route path={URLS.STACK_MANAGER_ABOUT}>
                    <AboutDevtronView
                        parentRef={stackManagerRef}
                        releaseNotes={stackDetails.releaseNotes}
                        serverInfo={serverInfo}
                        setShowManagedByDialog={setShowManagedByDialog}
                        isCICDInstalled={checkIfCICDIsInstalled()}
                        logPodName={stackDetails.logPodName}
                        selectedTabIndex={selectedTabIndex}
                        handleTabChange={handleTabChange}
                        isActionTriggered={actionTriggered.serverAction}
                        handleActionTrigger={handleActionTrigger}
                        history={history}
                        location={location}
                    />
                </Route>
                <Route path={URLS.STACK_MANAGER_ABOUT_RELEASES}>
                    <AboutDevtronView
                        parentRef={stackManagerRef}
                        releaseNotes={stackDetails.releaseNotes}
                        serverInfo={serverInfo}
                        setShowManagedByDialog={setShowManagedByDialog}
                        isCICDInstalled={checkIfCICDIsInstalled()}
                        logPodName={stackDetails.logPodName}
                        selectedTabIndex={selectedTabIndex}
                        handleTabChange={handleTabChange}
                        isActionTriggered={actionTriggered.serverAction}
                        handleActionTrigger={handleActionTrigger}
                        history={history}
                        location={location}
                    />
                </Route>
                <Redirect to={URLS.STACK_MANAGER_DISCOVER_MODULES} />
            </Switch>
        )
    }

    return (
        <main
            ref={stackManagerRef}
            className={`stack-manager ${
                stackDetails.isLoading || detailsMode || stackDetails.errorStatusCode > 0
                    ? `full-view-mode ${stackDetails.errorStatusCode > 0 ? '' : 'white-background'}`
                    : ''
            }`}
        >
            <PageHeader
                detailsMode={detailsMode}
                selectedModule={selectedModule}
                handleBreadcrumbClick={handleBreadcrumbClick}
            />
            {stackDetails.isLoading ? (
                <Progressing pageLoader />
            ) : stackDetails.errorStatusCode > 0 ? (
                <div className="flex">
                    <ErrorScreenManager code={stackDetails.errorStatusCode} />
                </div>
            ) : (
                <Router history={history}>
                    {!detailsMode && (
                        <section className="stack-manager__navigation">
                            <NavItem
                                installedModulesCount={stackDetails.installedModulesList.length}
                                installationStatus={serverInfo?.status}
                                currentVersion={serverInfo?.currentVersion}
                                newVersion={stackDetails.releaseNotes[0]?.releaseName}
                            />
                        </section>
                    )}
                    <section
                        className={`stack-manager__component-wrapper ${
                            detailsMode ? `flex column top ${detailsMode}` : ''
                        }`}
                    >
                        <Suspense fallback={<Progressing pageLoader />}>
                            <ErrorBoundary>
                                <Body />
                            </ErrorBoundary>
                        </Suspense>
                    </section>
                    {showManagedByDialog && <ManagedByDialog setShowManagedByDialog={setShowManagedByDialog} />}
                </Router>
            )}
        </main>
    )
}
