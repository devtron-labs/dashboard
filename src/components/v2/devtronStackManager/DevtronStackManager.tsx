import React, { Suspense, useEffect, useRef, useState } from 'react'
import { Redirect, Route, Router, Switch, useHistory, useLocation } from 'react-router-dom'
import { URLS } from '../../../config'
import { ErrorBoundary, Progressing } from '../../common'
import AboutDevtronView from './AboutDevtronView'
import {
    handleError,
    ManagedByDialog,
    ModuleDetailsView,
    ModulesListingView,
    NavItem,
    PageHeader,
} from './DevtronStackManager.component'
import './devtronStackManager.scss'
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
    ModuleInfoResponse,
    ModuleStatus,
    ReleaseNotes,
    ReleaseNotesResponse,
    ServerInfo,
    ServerInfoResponse,
} from './DevtronStackManager.type'
import { isLatestVersionAvailable, MODULE_DETAILS_MAP } from './DevtronStackManager.utils'

let modulesPollingInterval = null

export default function DevtronStackManager({ serverInfo }: { serverInfo: ServerInfo }) {
    const [isLoading, setLoading] = useState(false)
    const [showManagedByDialog, setShowManagedByDialog] = useState(false)
    const [discoverModulesList, setDiscoverModulesList] = useState<ModuleDetails[]>([])
    const [installedModulesList, setInstalledModulesList] = useState<ModuleDetails[]>([])
    const [selectedModule, setSelectedModule] = useState<ModuleDetails>()
    const [releaseNotes, setReleaseNotes] = useState<ReleaseNotes[]>([])
    const [detailsMode, setDetailsMode] = useState('')
    const [logPodName, setLogPodName] = useState('')
    const history = useHistory()
    const location = useLocation()
    const stackManagerRef = useRef<HTMLElement>()
    const queryParams = new URLSearchParams(location.search)

    useEffect(() => {
        setLoading(true)
        getModuleAndServerInfo()

        modulesPollingInterval = setInterval(() => {
            getModuleAndServerInfo()
        }, 30000)

        return (): void => {
            clearInterval(modulesPollingInterval)
        }
    }, [])

    // To reset detailsMode when switching to "About devtron" using "Help option" (side nav)
    // or "Check for updates" after successful installtion from module details page
    useEffect(() => {
        if (!queryParams.has('id')) {
            setDetailsMode('')
        }
    }, [location.pathname])

    useEffect(() => {
        if (queryParams.get('actionTriggered') === 'true') {
            getModuleAndServerInfo()
            queryParams.delete('actionTriggered')
            history.push(`${location.pathname}?${queryParams.toString()}`)
        }
    }, [location.search])

    function getModuleAndServerInfo() {
        Promise.allSettled([getAllModules(), getLogPodName(), getReleasesNotes()])
            .then((responses: { status: string; value?: any; reason?: any }[]) => {
                const allModulesRes: AllModuleInfoResponse = responses[0].value
                const logPodNameRes: LogPodNameResponse = responses[1].value
                const releaseNotesRes: ReleaseNotesResponse = responses[2].value
                setReleaseNotes(releaseNotesRes?.result)
                setLogPodName(logPodNameRes?.result?.podName)

                const _discoverModulesList = []
                const _installedModulesList = []
                const _getModuleInfoList = allModulesRes?.result?.map((module: ModuleInfo) =>
                    getModuleInfo(module.name),
                )

                Promise.allSettled(_getModuleInfoList).then(
                    (responses: { status: string; value?: any; reason?: any }[]) => {
                        responses.forEach((res) => {
                            const _moduleDetails = {
                                ...(MODULE_DETAILS_MAP[res.value?.result?.name] || MODULE_DETAILS_MAP['unknown']),
                                installationStatus: res.value?.result?.status,
                                baseMinVersionSupported: res.value?.result?.baseMinVersionSupported,
                            }

                            _discoverModulesList.push(_moduleDetails)

                            if (
                                _moduleDetails.installationStatus === ModuleStatus.INSTALLED &&
                                !isLatestVersionAvailable(
                                    _moduleDetails.baseMinVersionSupported,
                                    serverInfo?.currentVersion,
                                ) &&
                                _moduleDetails.id !== 'unknown'
                            ) {
                                _installedModulesList.push(_moduleDetails)
                            }
                        })

                        setDiscoverModulesList(_discoverModulesList)
                        setInstalledModulesList(_installedModulesList)
                        setLoading(false)
                    },
                )
            })
            .catch((err) => {
                handleError(err)
                setLoading(false)
            })
    }

    function handleModuleSelection(moduleDetails: ModuleDetails, fromDiscoverModules?: boolean, moduleId?: string) {
        if (!moduleDetails && moduleId) {
            const _moduleDetails = fromDiscoverModules
                ? discoverModulesList.find((module) => module.id === moduleId)
                : installedModulesList.find((module) => module.id === moduleId)
            setSelectedModule(_moduleDetails)
            if (_moduleDetails) {
                setDetailsMode(fromDiscoverModules ? 'discover' : 'installed')
            } else {
                setDetailsMode('')
                history.push(
                    fromDiscoverModules ? URLS.STACK_MANAGER_DISCOVER_MODULES : URLS.STACK_MANAGER_INSTALLED_MODULES,
                )
            }
        } else {
            const queryParams = new URLSearchParams(location.search)
            queryParams.set('id', moduleDetails.id)
            setSelectedModule(moduleDetails)
            setDetailsMode(fromDiscoverModules ? 'discover' : 'installed')

            history.push(
                `${
                    fromDiscoverModules
                        ? URLS.STACK_MANAGER_DISCOVER_MODULES_DETAILS
                        : URLS.STACK_MANAGER_INSTALLED_MODULES_DETAILS
                }?${queryParams.toString()}`,
            )
        }
    }

    function handleBreadcrumbClick() {
        setDetailsMode('')
        setSelectedModule(undefined)
    }

    function Body() {
        return (
            <Switch location={location}>
                <Route path={URLS.STACK_MANAGER_DISCOVER_MODULES_DETAILS}>
                    <ModuleDetailsView
                        moduleDetails={selectedModule}
                        handleModuleSelection={handleModuleSelection}
                        setDetailsMode={setDetailsMode}
                        setShowManagedByDialog={setShowManagedByDialog}
                        serverInfo={serverInfo}
                        upgradeVersion={releaseNotes[0]?.releaseName}
                        logPodName={logPodName}
                        fromDiscoverModules={true}
                        history={history}
                        location={location}
                    />
                </Route>
                <Route path={URLS.STACK_MANAGER_INSTALLED_MODULES_DETAILS}>
                    <ModuleDetailsView
                        moduleDetails={selectedModule}
                        handleModuleSelection={handleModuleSelection}
                        setDetailsMode={setDetailsMode}
                        setShowManagedByDialog={setShowManagedByDialog}
                        serverInfo={serverInfo}
                        upgradeVersion={releaseNotes[0]?.releaseName}
                        logPodName={logPodName}
                        history={history}
                        location={location}
                    />
                </Route>
                <Route path={URLS.STACK_MANAGER_DISCOVER_MODULES}>
                    <ModulesListingView
                        modulesList={discoverModulesList}
                        currentVersion={serverInfo?.currentVersion}
                        isDiscoverModulesView={true}
                        handleModuleCardClick={handleModuleSelection}
                        history={history}
                    />
                </Route>
                <Route path={URLS.STACK_MANAGER_INSTALLED_MODULES}>
                    <ModulesListingView
                        modulesList={installedModulesList}
                        currentVersion={serverInfo?.currentVersion}
                        handleModuleCardClick={handleModuleSelection}
                        history={history}
                    />
                </Route>
                <Route path={URLS.STACK_MANAGER_ABOUT}>
                    <AboutDevtronView
                        parentRef={stackManagerRef}
                        releaseNotes={releaseNotes}
                        serverInfo={serverInfo}
                        setShowManagedByDialog={setShowManagedByDialog}
                        logPodName={logPodName}
                        history={history}
                        location={location}
                    />
                </Route>
                <Redirect to={URLS.STACK_MANAGER_DISCOVER_MODULES} />
            </Switch>
        )
    }

    return (
        <main ref={stackManagerRef} className={`stack-manager ${isLoading || detailsMode ? 'full-view-mode' : ''}`}>
            <PageHeader
                detailsMode={detailsMode}
                selectedModule={selectedModule}
                handleBreadcrumbClick={handleBreadcrumbClick}
            />
            {isLoading ? (
                <Progressing pageLoader />
            ) : (
                <Router history={history}>
                    {!detailsMode && (
                        <section className="stack-manager__navigation">
                            <NavItem
                                installedModulesCount={installedModulesList.length}
                                currentVersion={serverInfo?.currentVersion}
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
