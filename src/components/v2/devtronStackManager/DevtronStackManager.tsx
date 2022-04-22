import React, { Suspense, useEffect, useState } from 'react'
import { Redirect, Route, Router, Switch, useHistory, useLocation } from 'react-router-dom'
import { URLS } from '../../../config'
import { ErrorBoundary, Progressing, showError } from '../../common'
import { ModulesListingView, MODULE_DETAILS_MAP, NavItem, VersionUpToDateView } from './DevtronStackManager.component'
import './devtronStackManager.scss'
import { getModuleInfo, getServerInfo } from './DevtronStackManager.service'
import { ModuleDetails, ModuleStatus } from './DevtronStackManager.type'

let modulesPollingInterval = null

export default function DevtronStackManager() {
    const [isLoading, setLoading] = useState(false)
    const [discoverModulesList, setDiscoverModulesList] = useState<ModuleDetails[]>([])
    const [installedModulesList, setInstalledModulesList] = useState<ModuleDetails[]>([])
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

    function getModuleAndServerInfo() {
        console.log('xyz')
        Promise.all([getModuleInfo('ciCd'), getServerInfo()])
            .then(([moduleInfoRes, serverInfoRes]) => {
                setDiscoverModulesList([
                    {
                        ...MODULE_DETAILS_MAP[moduleInfoRes.result?.name],
                        installationStatus: moduleInfoRes.result?.status,
                    },
                ])
                setInstalledModulesList([
                    {
                        ...MODULE_DETAILS_MAP[moduleInfoRes.result?.name],
                        installationStatus: ModuleStatus.INSTALLED,
                    },
                ])
                setInstalledModulesList(
                    moduleInfoRes.result?.name === 'ciCd' && moduleInfoRes.result?.status === ModuleStatus.INSTALLED
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

    function Body() {
        return (
            <Switch location={location}>
                <Route path={URLS.STACK_MANAGER_DISCOVER_MODULES}>
                    <ModulesListingView
                        modulesList={discoverModulesList}
                        isDiscoverModulesView={true}
                        history={history}
                    />
                </Route>
                <Route path={URLS.STACK_MANAGER_INSTALLED_MODULES}>
                    <ModulesListingView modulesList={installedModulesList} history={history} />
                </Route>
                <Route path={URLS.STACK_MANAGER_ABOUT}>
                    <VersionUpToDateView history={history} />
                </Route>
                <Redirect to={URLS.STACK_MANAGER_DISCOVER_MODULES} />
            </Switch>
        )
    }

    return (
        <main className={`stack-manager ${isLoading ? 'loading' : ''}`}>
            <section className="page-header flex left">
                <div className="flex left page-header__title cn-9 fs-14 fw-6">Devtron Stack Manager</div>
            </section>
            {isLoading ? (
                <Progressing pageLoader />
            ) : (
                <Router history={history}>
                    <section className="stack-manager__navigation">
                        <NavItem installedModulesCount={installedModulesList.length} />
                    </section>
                    <section className="stack-manager__component-wrapper">
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
