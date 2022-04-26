import React, { Suspense, useEffect, useRef, useState } from 'react'
import { Redirect, Route, Router, Switch, useHistory, useLocation } from 'react-router-dom'
import { URLS } from '../../../config'
import { ErrorBoundary, Progressing } from '../../common'
import AboutDevtronView from './AboutDevtronView'
import {
    handleError,
    ModuleDetailsView,
    ModulesListingView,
    NavItem,
    PageHeader,
} from './DevtronStackManager.component'
import './devtronStackManager.scss'
import { getLogPodName, getModuleInfo, getServerInfo } from './DevtronStackManager.service'
import { ModuleDetails, ModuleStatus, ServerInfo } from './DevtronStackManager.type'
import { MODULE_DETAILS_MAP } from './DevtronStackManager.utils'

let modulesPollingInterval = null

export default function DevtronStackManager() {
    const [isLoading, setLoading] = useState(false)
    const [discoverModulesList, setDiscoverModulesList] = useState<ModuleDetails[]>([])
    const [installedModulesList, setInstalledModulesList] = useState<ModuleDetails[]>([])
    const [selectedModule, setSelectedModule] = useState<ModuleDetails>()
    const [serverInfo, setServerInfo] = useState<ServerInfo>()
    const [detailsMode, setDetailsMode] = useState('')
    const [logPodName, setLogPodName] = useState('')
    const history = useHistory()
    const location = useLocation()
    const stackManagerRef = useRef<HTMLElement>()

    useEffect(() => {
        setLoading(true)
        getModuleAndServerInfo()

        modulesPollingInterval = setInterval(() => {
            getModuleAndServerInfo()
        }, 20000)

        return (): void => {
            clearInterval(modulesPollingInterval)
        }
    }, [])

    // To reset detailsMode when switching to "About devtron" using "Help option" (side nav)
    // or "Check for updates" after successful installtion from module details page
    useEffect(() => {
        if (!new URLSearchParams(location.search).has('id')) {
            setDetailsMode('')
        }
    }, [location.pathname])

    function getModuleAndServerInfo() {
        Promise.all([getModuleInfo('ciCd'), getServerInfo(), getLogPodName()])
            .then(([moduleInfoRes, serverInfoRes, logPodNameRes]) => {
                setServerInfo(serverInfoRes.result)
                setLogPodName(logPodNameRes.result?.podName)
                setDiscoverModulesList([
                    {
                        ...MODULE_DETAILS_MAP[moduleInfoRes.result?.name],
                        installationStatus: moduleInfoRes.result?.status,
                    },
                ])
                setInstalledModulesList(
                    moduleInfoRes.result?.status === ModuleStatus.INSTALLED
                        ? [
                              {
                                  ...MODULE_DETAILS_MAP[moduleInfoRes.result?.name],
                                  installationStatus: ModuleStatus.INSTALLED,
                              },
                          ]
                        : [],
                )
                setLoading(false)
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
            setDetailsMode(fromDiscoverModules ? 'discover' : 'installed')
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
                        serverInfo={serverInfo}
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
                        serverInfo={serverInfo} 
                        logPodName={logPodName}
                        history={history}
                        location={location}
                    />
                </Route>
                <Route path={URLS.STACK_MANAGER_DISCOVER_MODULES}>
                    <ModulesListingView
                        modulesList={discoverModulesList}
                        isDiscoverModulesView={true}
                        handleModuleCardClick={handleModuleSelection}
                        history={history}
                    />
                </Route>
                <Route path={URLS.STACK_MANAGER_INSTALLED_MODULES}>
                    <ModulesListingView
                        modulesList={installedModulesList}
                        handleModuleCardClick={handleModuleSelection}
                        history={history}
                    />
                </Route>
                <Route path={URLS.STACK_MANAGER_ABOUT}>
                    <AboutDevtronView parentRef={stackManagerRef} serverInfo={serverInfo} logPodName={logPodName} />
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
                </Router>
            )}
        </main>
    )
}
