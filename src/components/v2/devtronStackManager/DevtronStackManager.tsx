import React, { Suspense, useCallback, useEffect, useRef, useState, useContext } from 'react'
import { Redirect, Route, Router, Switch, useHistory, useLocation } from 'react-router-dom'
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
import {
    getAllModules,
    getLogPodName,
    getModuleInfo,
    getReleasesNotes,
    getServerInfo,
} from './DevtronStackManager.service'
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
import { isLatestVersionAvailable, MODULE_DETAILS_MAP } from './DevtronStackManager.utils'
import './devtronStackManager.scss'
import { mainContext } from '../../common/navigation/NavigationRoutes'

let modulesPollingInterval = null

export default function DevtronStackManager({
    serverInfo,
    handleServerInfoUpdate,
}: {
    serverInfo: ServerInfo
    handleServerInfoUpdate: (serverInfo: ServerInfo) => void
}) {
    const { serverMode } = useContext(mainContext)
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
    const [detailsMode, setDetailsMode] = useState('')
    const [selectedTabIndex, setSelectedTabIndex] = useState(0)
    const history = useHistory()
    const location = useLocation()
    const stackManagerRef = useRef<HTMLElement>()
    const queryParams = new URLSearchParams(location.search)

    useEffect(() => {
        setStackDetails({
            ...stackDetails,
            isLoading: true,
        })
        getModuleAndServerInfo()

        // Fetching latest details/status every 30s
        modulesPollingInterval = setInterval(() => {
            getModuleAndServerInfo()
        }, 30000)

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
            getLatestModuleInfo()
            queryParams.delete('actionTriggered')
            history.push(`${location.pathname}?${queryParams.toString()}`)
        }
    }, [location.search])

    /**
     * To update the installation status for seleted module after fetching latest details
     * when on module details view
     */
    useEffect(() => {
        if (location.pathname.includes('/details') && queryParams.get('id')) {
            setSelectedModule(
                stackDetails.discoverModulesList.find(
                    (module) => module.name.toLowerCase() === queryParams.get('id').toLowerCase(),
                ),
            )

            if (!detailsMode) {
                setDetailsMode(location.pathname.includes('/discover') ? 'discover' : 'installed')
            }
        }
    }, [stackDetails.discoverModulesList])

    /**
     * 1. If query params has 'id' then module installation action has been triggered
     * so fetch the specific module info.
     * 2. Else it's the server/stack upgrade action so fetch the server info
     */
    const getLatestModuleInfo = async () => {
        try {
            if (queryParams.has('id')) {
                const { result } = await getModuleInfo(queryParams.get('id'))

                if (result) {
                    const currentModule = stackDetails.discoverModulesList.find((_module) => _module.id === result.name)
                    setSelectedModule({
                        ...currentModule,
                        installationStatus: result.status,
                    })
                }
            } else {
                const { result } = await getServerInfo()
                handleServerInfoUpdate(result)
            }
        } catch (e) {
            showError(e)
        }
    }

    const getModuleAndServerInfo = () => {
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

                const _discoverModulesList: ModuleDetails[] = []
                const _installedModulesList: ModuleDetails[] = []

                /**
                 * 3. Create array of get moduleDetails promises to trigger API calls
                 * to fetch all module details at once
                 */
                const _getModuleInfoList = allModulesRes?.result?.map((module: ModuleDetails) =>
                    serverMode === SERVER_MODE.FULL && module.isIncludedInLegacyFullPackage
                        ? { result: { name: module.name, status: ModuleStatus.INSTALLED } }
                        : getModuleInfo(module.name),
                )

                Promise.allSettled(_getModuleInfoList).then(
                    (responses: { status: string; value?: any; reason?: any }[]) => {
                        responses.forEach((res, idx) => {
                            const result: ModuleInfo = res.value?.result
                            const currentModule = allModulesRes?.result?.find(
                                (_module) => _module.name === result?.name,
                            )
                            // 4. Get the module details from MODULE_DETAILS_MAP if available else fetch the default/unknown
                            const _moduleDetails = {
                                ...currentModule,
                                installationStatus: result?.status,
                            }

                            /**
                             * 5. Push all modules details to discoverModulesList &
                             * only modules which status is "installed", is not greater than current server version
                             * & is not unknown to installedModulesList
                             */
                            _discoverModulesList.push(_moduleDetails)

                            if (
                                _moduleDetails.installationStatus === ModuleStatus.INSTALLED &&
                                !isLatestVersionAvailable(
                                    serverInfo?.currentVersion,
                                    _moduleDetails.baseMinVersionSupported,
                                ) &&
                                _moduleDetails.id !== 'unknown'
                            ) {
                                _installedModulesList.push(_moduleDetails)
                            }
                        })

                        _stackDetails.discoverModulesList = _discoverModulesList
                        _stackDetails.installedModulesList = _installedModulesList

                        // 6. Update the stackDetails
                        setStackDetails(_stackDetails)
                    },
                )
            })
            .catch((err) => {
                handleError(err)
                setStackDetails({
                    ...stackDetails,
                    isLoading: false,
                })
            })
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
                        history={history}
                        location={location}
                    />
                </Route>
                <Route path={URLS.STACK_MANAGER_DISCOVER_MODULES}>
                    <ModulesListingView
                        modulesList={stackDetails.discoverModulesList}
                        currentVersion={serverInfo?.currentVersion}
                        isDiscoverModulesView={true}
                        handleModuleCardClick={handleModuleSelection}
                        history={history}
                    />
                </Route>
                <Route path={URLS.STACK_MANAGER_INSTALLED_MODULES}>
                    <ModulesListingView
                        modulesList={stackDetails.installedModulesList}
                        currentVersion={serverInfo?.currentVersion}
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
                        logPodName={stackDetails.logPodName}
                        selectedTabIndex={selectedTabIndex}
                        handleTabChange={handleTabChange}
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
                        logPodName={stackDetails.logPodName}
                        selectedTabIndex={selectedTabIndex}
                        handleTabChange={handleTabChange}
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
