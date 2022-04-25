import React, { Suspense, useEffect, useState } from 'react'
import { Redirect, Route, Router, Switch, useHistory, useLocation } from 'react-router-dom'
import { URLS } from '../../../config'
import { ErrorBoundary, Progressing, showError } from '../../common'
import {
    ModuleDetailsView,
    ModulesListingView,
    MODULE_DETAILS_MAP,
    NavItem,
    PageHeader,
    VersionUpToDateView,
} from './DevtronStackManager.component'
import './devtronStackManager.scss'
import { getModuleInfo, getServerInfo } from './DevtronStackManager.service'
import { ModuleDetails, ModuleStatus } from './DevtronStackManager.type'

let modulesPollingInterval = null

export default function DevtronStackManager() {
    const [isLoading, setLoading] = useState(false)
    const [discoverModulesList, setDiscoverModulesList] = useState<ModuleDetails[]>([])
    const [installedModulesList, setInstalledModulesList] = useState<ModuleDetails[]>([])
    const [selectedModule, setSelectedModule] = useState<ModuleDetails>()
    const [detailsMode, setDetailsMode] = useState('')
    const history = useHistory()
    const location = useLocation()

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
        Promise.all([getModuleInfo(''), getServerInfo()])
            .then(([moduleInfoRes, serverInfoRes]) => {
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
            .catch((errors) => {
                showError(errors)
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
                    <VersionUpToDateView history={history} />
                </Route>
                <Redirect to={URLS.STACK_MANAGER_DISCOVER_MODULES} />
            </Switch>
        )
    }

    return (
        <main className={`stack-manager ${isLoading || detailsMode ? 'full-view-mode' : ''}`}>
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
                            <NavItem installedModulesCount={installedModulesList.length} />
                        </section>
                    )}
                    <section className={`stack-manager__component-wrapper ${detailsMode ? 'flex column top' : ''}`}>
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
