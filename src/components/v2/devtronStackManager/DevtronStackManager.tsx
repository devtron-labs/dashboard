import React, { Suspense, useEffect, useState } from 'react'
import { Redirect, Route, Router, Switch, useHistory, useLocation } from 'react-router-dom'
import { URLS } from '../../../config'
import { ErrorBoundary, Progressing } from '../../common'
import { ModulesListingView, NavItem, VersionUpToDateView } from './DevtronStackManager.component'
import './devtronStackManager.scss'
import { ModuleDetails, ModuleInstallationStates } from './DevtronStackManager.type'

export default function DevtronStackManager() {
    const [isLoading, setLoading] = useState(false)
    const [discoverModulesList, setDiscoverModulesList] = useState<ModuleDetails[]>([])
    const [installedModulesList, setInstalledModulesList] = useState<ModuleDetails[]>([])
    const history = useHistory()
    const location = useLocation()

    useEffect(() => {
        setLoading(true)
        setTimeout(() => {
            setDiscoverModulesList([
                {
                    name: 'Build and Deploy (CI/CD)',
                    info: 'Enables continous code integration and deployment.',
                    icon: 'ci-cd',
                    installationState: ModuleInstallationStates.NOT_INSTALLED,
                },
            ])
            // setInstalledModulesList([{
            //     name: 'Build and Deploy (CI/CD)',
            //     info: 'Enables continous code integration and deployment.',
            //     icon: 'ci-cd',
            //     installationState: ModuleInstallationStates.INSTALLED
            // }])
            setLoading(false)
        }, 2000)
    }, [])

    function Body() {
        return (
            <Switch location={location}>
                <Route path={URLS.STACK_MANAGER_DISCOVER_MODULES}>
                    <ModulesListingView modulesList={discoverModulesList} isDiscoverModulesView={true} history={history} />
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
                        <NavItem />
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
