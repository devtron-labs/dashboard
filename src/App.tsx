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

import { lazy, Suspense, useRef, useState, useEffect } from 'react'
import { Route, Switch, Redirect, useHistory, useLocation } from 'react-router-dom'
import './css/application.scss'
import {
    showError,
    BreadcrumbStore,
    Reload,
    DevtronProgressing,
    APPROVAL_MODAL_TYPE,
    useUserEmail,
    URLS as CommonURLS,
    ToastManager,
    ToastVariantType,
    API_STATUS_CODES,
    logExceptionToSentry,
    Button,
    ButtonVariantType,
    ButtonStyleType,
    ComponentSizeType,
} from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as ICSparkles } from '@Icons/ic-sparkles.svg'
import { ReactComponent as ICArrowClockwise } from '@Icons/ic-arrow-clockwise.svg'
import { useRegisterSW } from 'virtual:pwa-register/react'
import {
    useOnline,
    ErrorBoundary,
    importComponentFromFELibrary,
    getApprovalModalTypeFromURL,
    reloadLocation,
} from './components/common'
import { UPDATE_AVAILABLE_TOAST_PROGRESS_BG, URLS } from './config'
import Hotjar from './components/Hotjar/Hotjar'
import { validateToken } from './services/service'
import { setCurrentClient } from '@sentry/browser'

const NavigationRoutes = lazy(() => import('./components/common/navigation/NavigationRoutes'))
const Login = lazy(() => import('./components/login/Login'))
const GenericDirectApprovalModal = importComponentFromFELibrary('GenericDirectApprovalModal')

export default function App() {
    const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('dark')

    const onlineToastRef = useRef(null)
    const updateToastRef = useRef(null)
    const [errorPage, setErrorPage] = useState<boolean>(false)
    const isOnline = useOnline()
    const refreshing = useRef(false)
    const { setEmail } = useUserEmail()
    const [bgUpdated, setBGUpdated] = useState(false)
    const [validating, setValidating] = useState(true)
    const [approvalToken, setApprovalToken] = useState<string>('')
    const [approvalType, setApprovalType] = useState<APPROVAL_MODAL_TYPE>(APPROVAL_MODAL_TYPE.CONFIG)
    const location = useLocation()
    const { push } = useHistory()
    const didMountRef = useRef(false)
    const isDirectApprovalNotification =
        location.pathname &&
        location.pathname.includes('approve') &&
        location.search &&
        location.search.includes(`?token=${approvalToken}`)
    const customThemeClassName = location.pathname.startsWith(CommonURLS.NETWORK_STATUS_INTERFACE)
        ? 'custom-theme-override'
        : ''

    function onlineToast(...showToastParams: Parameters<typeof ToastManager.showToast>) {
        if (onlineToastRef.current && ToastManager.isToastActive(onlineToastRef.current)) {
            ToastManager.dismissToast(onlineToastRef.current)
        }
        onlineToastRef.current = ToastManager.showToast(...showToastParams)
    }

    useEffect(() => {
        if (didMountRef.current) {
            if (!isOnline) {
                onlineToast(
                    {
                        variant: ToastVariantType.error,
                        title: 'You are offline!',
                        description: 'You are not seeing real-time data and any changes you make will not be saved.',
                    },
                    {
                        autoClose: false,
                    },
                )
            } else {
                onlineToast({
                    variant: ToastVariantType.success,
                    title: 'Connected!',
                    description: "You're back online.",
                })
            }
        } else {
            didMountRef.current = true
            // Removing any toast explicitly due to race condition of offline toast for some users
            ToastManager.dismissToast(onlineToastRef.current)
        }
    }, [isOnline])

    const defaultRedirection = (): void => {
        if (location.search && location.search.includes('?continue=')) {
            const newLocation = location.search.replace('?continue=', '')
            push(newLocation)
        }
    }

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
            if (err?.code === 401) {
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

    function handleControllerChange() {
        if (refreshing.current) {
            return
        }
        if (document.visibilityState === 'visible') {
            window.location.reload()
            refreshing.current = true
        } else {
            setBGUpdated(true)
        }
    }

    useEffect(() => {
        if (typeof Storage !== 'undefined') {
            // TODO (Arun): Remove in next packet
            localStorage.removeItem('undefined')
        }
        if (navigator.serviceWorker) {
            navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange)
        }
        // If not K8S_CLIENT then validateToken otherwise directly redirect
        if (!window._env_.K8S_CLIENT) {
            // By Passing validations for direct email approval notifications
            if (isDirectApprovalNotification) {
                redirectToDirectApprovalNotification()
            } else {
                validation()
            }
        } else {
            setValidating(false)
            defaultRedirection()
        }
        return () => {
            navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange)
        }
    }, [])

    const serviceWorkerTimeout = (() => {
        const parsedTimeout = parseInt(window._env_.SERVICE_WORKER_TIMEOUT, 10)

        if (parsedTimeout) {
            return parsedTimeout
        }

        return 3
    })()

    const {
        needRefresh: [doesNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegisteredSW(swUrl, swRegistration) {
            console.log(`Service Worker at: ${swUrl}`)
            swRegistration &&
                setInterval(
                    async () => {
                        if (
                            swRegistration.installing ||
                            !navigator ||
                            ('connection' in navigator && !navigator.onLine)
                        ) {
                            return
                        }

                        try {
                            const resp = await fetch(swUrl, {
                                cache: 'no-store',
                                headers: {
                                    cache: 'no-store',
                                    'cache-control': 'no-cache',
                                },
                            })
                            if (resp?.status === API_STATUS_CODES.OK) {
                                await swRegistration.update()
                            }
                        } catch {
                            // Do nothing
                        }
                    },
                    serviceWorkerTimeout * 1000 * 60,
                )
        },
        onRegisterError(error) {
            console.error('SW registration error', error)
            logExceptionToSentry(error)
        },
        onNeedRefresh() {
            handleNeedRefresh()
        },
    })

    function handleAppUpdate() {
        if (ToastManager.isToastActive(updateToastRef.current)) {
            ToastManager.dismissToast(updateToastRef.current)
        }

        updateServiceWorker(true)
    }

    function handleNeedRefresh() {
        if (ToastManager.isToastActive(updateToastRef.current)) {
            ToastManager.dismissToast(updateToastRef.current)
        }

        updateToastRef.current = ToastManager.showToast(
            {
                variant: ToastVariantType.info,
                title: 'Update available',
                description: 'You are viewing an outdated version of Devtron UI.',
                buttonProps: {
                    text: 'Reload',
                    dataTestId: 'reload-btn',
                    onClick: handleAppUpdate,
                    startIcon: <ICArrowClockwise />,
                },
                icon: <ICSparkles />,
                progressBarBg: UPDATE_AVAILABLE_TOAST_PROGRESS_BG,
            },
            {
                autoClose: false,
            },
        )
        if (typeof Storage !== 'undefined') {
            localStorage.removeItem('serverInfo')
        }
    }

    useEffect(() => {
        if (window.isSecureContext && navigator.serviceWorker) {
            // check for sw updates on page change
            navigator.serviceWorker
                .getRegistrations()
                .then((registrations) => registrations.forEach((reg) => reg.update()))
            if (doesNeedRefresh) {
                handleAppUpdate()
            } else if (ToastManager.isToastActive(updateToastRef.current)) {
                ToastManager.dismissToast(updateToastRef.current)
            }
        }
    }, [location])

    useEffect(() => {
        if (!bgUpdated) {
            return
        }
        if (ToastManager.isToastActive(updateToastRef.current)) {
            ToastManager.dismissToast(updateToastRef.current)
        }

        updateToastRef.current = ToastManager.showToast(
            {
                variant: ToastVariantType.info,
                title: 'Update available',
                description: 'This page has been updated. Please save any unsaved changes and refresh.',
                buttonProps: {
                    text: 'Reload',
                    dataTestId: 'reload-btn',
                    onClick: reloadLocation,
                    startIcon: <ICArrowClockwise />,
                },
                icon: <ICSparkles />,
                progressBarBg: UPDATE_AVAILABLE_TOAST_PROGRESS_BG,
            },
            {
                autoClose: false,
            },
        )
    }, [bgUpdated])

    useEffect(() => {
        // Need to update the html element since there are elements outside of the #root div as well
        const html = document.querySelector('html')
        if (html) {
            html.removeAttribute('class')
            html.classList.add(`theme__${currentTheme}`)
        }
    }, [currentTheme])

    return (
        <div className={customThemeClassName}>
            <Suspense fallback={null}>
                {validating ? (
                    <div className="full-height-width">
                        <DevtronProgressing parentClasses="h-100 flex bcn-0" classes="icon-dim-80" />
                    </div>
                ) : (
                    <>
                        {errorPage ? (
                            <div className="full-height-width">
                                <Reload />
                            </div>
                        ) : (
                            <ErrorBoundary>
                                <BreadcrumbStore>
                                    <Switch>
                                        {isDirectApprovalNotification && GenericDirectApprovalModal && (
                                            <Route exact path={`/${approvalType?.toLocaleLowerCase()}/approve`}>
                                                <GenericDirectApprovalModal
                                                    approvalType={approvalType}
                                                    approvalToken={approvalToken}
                                                />
                                            </Route>
                                        )}
                                        {!window._env_.K8S_CLIENT && <Route path="/login" component={Login} />}
                                        <Route path="/" render={() => <NavigationRoutes />} />
                                        <Redirect
                                            to={window._env_.K8S_CLIENT ? '/' : `${URLS.LOGIN_SSO}${location.search}`}
                                        />
                                    </Switch>
                                    <div id="full-screen-modal" />
                                    <div id="visible-modal" />
                                    <div id="visible-modal-2" />
                                    <div id="animated-dialog-backdrop" />
                                    {import.meta.env.VITE_NODE_ENV === 'production' &&
                                        window._env_ &&
                                        window._env_.HOTJAR_ENABLED && <Hotjar />}
                                </BreadcrumbStore>
                            </ErrorBoundary>
                        )}
                    </>
                )}
            </Suspense>
            <div className="dc__position-abs dc__bottom-30-imp dc__right-20">
                <Button
                    icon={<ICSparkles />}
                    variant={ButtonVariantType.borderLess}
                    style={ButtonStyleType.neutral}
                    size={ComponentSizeType.small}
                    ariaLabel="Toggle theme"
                    showAriaLabelInTippy={false}
                    onClick={() => {
                        setCurrentTheme(currentTheme === 'light' ? 'dark' : 'light')
                    }}
                    dataTestId="toggle-theme"
                />
            </div>
        </div>
    )
}
