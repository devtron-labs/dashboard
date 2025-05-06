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
    showError,
    URLS as CommonURLS,
    useUserEmail,
} from '@devtron-labs/devtron-fe-common-lib'

import { useVersionUpdateReload } from '@Components/common/hooks/useVersionUpdate'
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
    const [showVersionUpdateToast, setShowVersionUpdateToast] = useState(true)

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
        if (location.search && location.search.includes('?continue=')) {
            const newLocation = location.search.replace('?continue=', '')
            push(newLocation)
        }
    }

    const toastEligibleRoutes = [`/${approvalType?.toLowerCase()}/approve`, CommonURLS.LICENSE_AUTH, URLS.LOGIN]

    const {
        bgUpdated,
        handleAppUpdate,
        doesNeedRefresh,
        updateServiceWorker,
        handleControllerChange,
        updateToastRef,
        isRefreshing,
    } = useVersionUpdateReload({
        showVersionUpdateToast,
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

    const hideVersionUpdateToast = () => {
        setShowVersionUpdateToast(false)
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
                const newSearch = location.pathname.includes(URLS.LOGIN_SSO)
                    ? location.search
                    : `?continue=${location.pathname}`
                push(`${loginPath}${newSearch}`)
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
    }, [])

    const reloadVersionConfig = {
        handleAppUpdate,
        doesNeedRefresh,
        updateServiceWorker,
        handleControllerChange,
        bgUpdated,
        updateToastRef,
        isRefreshing,
    }

    const renderRoutesWithErrorBoundary = () =>
        errorPage ? (
            <div className="full-height-width bg__tertiary">
                <ErrorScreenManager />
            </div>
        ) : (
            <ErrorBoundary>
                <BreadcrumbStore>
                    <Switch>
                        {toastEligibleRoutes.map((path) => {
                            const render = () => {
                                if (path === `/${approvalType?.toLowerCase()}/approve`) {
                                    return isDirectApprovalNotification && GenericDirectApprovalModal ? (
                                        <GenericDirectApprovalModal
                                            approvalType={approvalType}
                                            approvalToken={approvalToken}
                                        />
                                    ) : null
                                }
                                if (path === CommonURLS.LICENSE_AUTH) {
                                    return <ActivateLicense />
                                }
                                if (path === URLS.LOGIN) {
                                    return <Login />
                                }
                                return null
                            }

                            return <Route key={path} path={path} exact render={render} />
                        })}

                        <Route
                            path="/"
                            render={() => (
                                <NavigationRoutes
                                    reloadVersionConfig={reloadVersionConfig}
                                    hideVersionUpdateToast={hideVersionUpdateToast}
                                />
                            )}
                        />
                        <Redirect to={window._env_.K8S_CLIENT ? '/' : `${URLS.LOGIN_SSO}${location.search}`} />
                    </Switch>
                    <div id="visible-modal" />
                    <div id="visible-modal-2" />
                    <div id="animated-dialog-backdrop" />
                </BreadcrumbStore>
            </ErrorBoundary>
        )

    return (
        <div className={customThemeClassName}>
            <Suspense fallback={null}>
                {validating ? (
                    <div className="full-height-width">
                        <DevtronProgressing parentClasses="h-100 flex bg__primary" classes="icon-dim-80" />
                    </div>
                ) : (
                    renderRoutesWithErrorBoundary()
                )}
            </Suspense>
        </div>
    )
}

export default App
