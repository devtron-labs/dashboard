/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { lazy, Suspense, useEffect, useState } from 'react'
import { Redirect, Route, Switch, useHistory, useLocation } from 'react-router-dom'

import {
    API_STATUS_CODES,
    APPROVAL_MODAL_TYPE,
    BreadcrumbStore,
    DevtronProgressing,
    ErrorScreenManager,
    getUrlWithSearchParams,
    setGlobalAPITimeout,
    showError,
    URLS as CommonURLS,
    useUserEmail,
} from '@devtron-labs/devtron-fe-common-lib'

import { useVersionUpdateReload } from '@Components/common/hooks/useVersionUpdate'
import { VersionUpdateProps } from '@Components/common/hooks/useVersionUpdate/types'
import ActivateLicense from '@Pages/License/ActivateLicense'

import { ErrorBoundary, getApprovalModalTypeFromURL, importComponentFromFELibrary } from './components/common'
import { validateToken } from './services/service'
import { URLS } from './config'

import './css/application.scss'

const NavigationRoutes = lazy(() => import('./components/common/navigation/NavigationRoutes'))
const Login = lazy(() => import('./components/login/Login'))
const GenericDirectApprovalModal = importComponentFromFELibrary('GenericDirectApprovalModal')

const App = () => {
    const [errorPage, setErrorPage] = useState<boolean>(false)
    const [validating, setValidating] = useState(true)
    const [approvalToken, setApprovalToken] = useState<string>('')
    const [approvalType, setApprovalType] = useState<APPROVAL_MODAL_TYPE>(APPROVAL_MODAL_TYPE.CONFIG)

    const { setEmail } = useUserEmail()

    const location = useLocation()
    const { push } = useHistory()

    const isDirectApprovalNotification =
        location.pathname &&
        location.pathname.includes('approve') &&
        location.search &&
        location.search.includes(`?token=${approvalToken}`)
    const customThemeClassName = location.pathname.startsWith(CommonURLS.NETWORK_STATUS_INTERFACE)
        ? 'custom-theme-override'
        : ''

    const defaultRedirection = (): void => {
        if (location.search) {
            const continueUrl = new URLSearchParams(location.search).get('continue')
            if (continueUrl) {
                push(continueUrl)
            }
        }
    }

    const toastEligibleRoutes: VersionUpdateProps['toastEligibleRoutes'] = [
        {
            path: `/${approvalType?.toLowerCase()}/approve`,
            exact: true,
            condition: isDirectApprovalNotification && GenericDirectApprovalModal,
            component: <GenericDirectApprovalModal approvalType={approvalType} approvalToken={approvalToken} />,
            eligibleLocation: `/${approvalType?.toLowerCase()}/approve`,
        },
        {
            path: CommonURLS.LICENSE_AUTH,
            exact: false,
            condition: true,
            component: <ActivateLicense />,
            eligibleLocation: CommonURLS.LICENSE_AUTH,
        },
        {
            path: URLS.LOGIN,
            exact: false,
            condition: !window._env_.K8S_CLIENT,
            component: <Login />,
            eligibleLocation: URLS.LOGIN_SSO || URLS.LOGIN_ADMIN,
        },
    ]

    const reloadVersionConfig = useVersionUpdateReload({
        toastEligibleRoutes,
    })

    const redirectToDirectApprovalNotification = (): void => {
        setValidating(false)
        setApprovalType(getApprovalModalTypeFromURL(location.pathname))

        const queryString = new URLSearchParams(location.search)
        const token = queryString.get('token')
        if (token) {
            setApprovalToken(token)
        }
    }

    async function validation() {
        try {
            const {
                result: { emailId: email },
            } = await validateToken()
            setEmail(email)
            defaultRedirection()
        } catch (err: any) {
            // push to login without breaking search
            if (err?.code === API_STATUS_CODES.UNAUTHORIZED) {
                const loginPath = URLS.LOGIN_SSO
                if (location.pathname.includes(URLS.LOGIN_SSO)) {
                    push(`${loginPath}${location.search}`)
                } else {
                    push(getUrlWithSearchParams(loginPath, { continue: `${location.pathname}${location.search}` }))
                }
            } else {
                setErrorPage(true)
                showError(err)
            }
        } finally {
            setValidating(false)
        }
    }

    useEffect(() => {
        // If not K8S_CLIENT then validateToken otherwise directly redirect
        //  No need to validate token if on license auth page
        if (!window._env_.K8S_CLIENT && location.pathname !== CommonURLS.LICENSE_AUTH) {
            // By Passing validations for direct email approval notifications
            if (isDirectApprovalNotification) {
                redirectToDirectApprovalNotification()
            } else {
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                validation()
            }
        } else {
            setValidating(false)
            defaultRedirection()
        }

        setGlobalAPITimeout(window._env_.GLOBAL_API_TIMEOUT)
    }, [])

    useEffect(() => {
        // Mapping few commonly used old routes to new routes
        const parts = location.pathname.split('/').filter((part) => part)

        if (parts?.[0] === 'app') {
            if (Number.isNaN(Number(parts?.[1]))) {
                return
            }

            const pageHeaderTab = parts?.[2]

            if (
                pageHeaderTab === CommonURLS.APP_DETAILS ||
                pageHeaderTab === CommonURLS.APP_TRIGGER ||
                pageHeaderTab === URLS.APP_CI_DETAILS ||
                pageHeaderTab === URLS.APP_CD_DETAILS ||
                pageHeaderTab === URLS.APP_DEPLOYMENT_METRICS ||
                pageHeaderTab === CommonURLS.APP_CONFIG
            ) {
                parts[0] = URLS.APPLICATION_MANAGEMENT_APP
                const newPath = parts.join('/')
                push(newPath)
            }
        }
    }, [location])

    const renderRoutesWithErrorBoundary = () =>
        errorPage ? (
            <div className="full-height-width bg__tertiary">
                <ErrorScreenManager />
            </div>
        ) : (
            <ErrorBoundary>
                <BreadcrumbStore>
                    <Switch>
                        {toastEligibleRoutes.map(({ exact, path, condition, component }) =>
                            condition ? (
                                <Route key={path} path={path} exact={exact}>
                                    {component}
                                </Route>
                            ) : null,
                        )}
                        <Route path="/" render={() => <NavigationRoutes reloadVersionConfig={reloadVersionConfig} />} />
                        <Redirect to={window._env_.K8S_CLIENT ? '/' : `${URLS.LOGIN_SSO}${location.search}`} />
                    </Switch>
                </BreadcrumbStore>
            </ErrorBoundary>
        )

    return (
        <div className={customThemeClassName}>
            <Suspense fallback={null}>
                {validating ? (
                    <DevtronProgressing parentClasses="full-height-width flex bg__primary" classes="icon-dim-80" />
                ) : (
                    renderRoutesWithErrorBoundary()
                )}
            </Suspense>
        </div>
    )
}

export default App
