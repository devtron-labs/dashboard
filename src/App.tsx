import React, { lazy, Suspense, useRef, useState, useEffect } from 'react'
import { Route, Switch, Redirect, useHistory, useLocation } from 'react-router-dom'
import { URLS } from './config'
import { toast } from 'react-toastify'
// @TODO: Patternfly styles files need to be removed in future
import './css/patternfly.scss'
import 'react-toastify/dist/ReactToastify.css'
import './css/base.scss'
import './css/formulae.scss'
import './css/forms.scss'
import 'tippy.js/dist/tippy.css'
import { useOnline, ToastBody, ToastBody3 as UpdateToast, ErrorBoundary } from './components/common'
import { showError, BreadcrumbStore, Reload, DevtronProgressing } from '@devtron-labs/devtron-fe-common-lib'
import { useRegisterSW } from 'virtual:pwa-register/react'
import Hotjar from './components/Hotjar/Hotjar'
import { validateToken } from './services/service'

const NavigationRoutes = lazy(() => import('./components/common/navigation/NavigationRoutes'))
const Login = lazy(() => import('./components/login/Login'))

toast.configure({
    autoClose: 3000,
    hideProgressBar: true,
    pauseOnHover: true,
    pauseOnFocusLoss: true,
    closeOnClick: false,
    newestOnTop: true,
    toastClassName: 'devtron-toast',
    bodyClassName: 'devtron-toast__body',
})

export default function App() {
    const onlineToastRef = useRef(null)
    const updateToastRef = useRef(null)
    const [errorPage, setErrorPage] = useState<Boolean>(false)
    const isOnline = useOnline()
    const [validating, setValidating] = useState(true)
    const location = useLocation()
    const { push } = useHistory()
    const didMountRef = useRef(false)

    function onlineToast(toastBody: JSX.Element, options) {
        if (onlineToastRef.current && toast.isActive(onlineToastRef.current)) {
            toast.update(onlineToastRef.current, { render: toastBody, ...options })
        } else {
            onlineToastRef.current = toast[options.type](toastBody, options)
        }
    }

    useEffect(() => {
        if (didMountRef.current) {
            if (!isOnline) {
                const toastBody = (
                    <ToastBody
                        title="You are offline!"
                        subtitle="You are not seeing real-time data and any changes you make will not be saved."
                    />
                )
                onlineToast(toastBody, { type: toast.TYPE.ERROR, autoClose: false, closeButton: false })
            } else {
                const toastBody = <ToastBody title="Connected!" subtitle="You're back online." />
                onlineToast(toastBody, { type: toast.TYPE.SUCCESS, autoClose: 3000, closeButton: true })
            }
        } else {
            didMountRef.current = true
        }
    }, [isOnline])

    const defaultRedirection = (): void => {
        if (location.search && location.search.includes('?continue=')) {
            const newLocation = location.search.replace('?continue=', '')
            push(newLocation)
        }
    }

    useEffect(() => {
        async function validation() {
            try {
                await validateToken()
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
        // If not K8S_CLIENT then validateToken otherwise directly redirect
        if (!window._env_.K8S_CLIENT) {
            validation()
        } else {
            setValidating(false)
            defaultRedirection()
        }
    }, [])

    const {
        needRefresh: [needRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegisteredSW(swUrl, r) {
            console.log(`Service Worker at: ${swUrl}`)
            if (r) {
              r.update()
            }
        },
        onRegisterError(error) {
            console.log('SW registration error', error)
        },
    })

    function update() {
        updateServiceWorker(true)
    }

    useEffect(() => {
      // check for sw updates on page change
      navigator.serviceWorker
        .getRegistrations()
        .then((regs) => regs.forEach((reg) => reg.update()))
        if (!needRefresh) return
        update()
    }, [location])

    function onUpdate() {
        const updateToastBody = (
            <UpdateToast
                onClick={update}
                text="You are viewing an outdated version of Devtron UI."
                buttonText="Reload"
            />
        )
        if (toast.isActive(updateToastRef.current)) {
            toast.update(updateToastRef.current, { render: updateToastBody })
        } else {
            updateToastRef.current = toast.info(updateToastBody, { autoClose: false, closeButton: false })
        }
        if (typeof Storage !== 'undefined') {
            localStorage.removeItem('serverInfo')
        }
    }

    useEffect(() => {
        if (needRefresh) {
            onUpdate()
        }
    }, [needRefresh])

    return (
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
                                    {!window._env_.K8S_CLIENT && <Route path={`/login`} component={Login} />}
                                    <Route path="/" render={() => <NavigationRoutes />} />
                                    <Redirect
                                        to={window._env_.K8S_CLIENT ? '/' : `${URLS.LOGIN_SSO}${location.search}`}
                                    />
                                </Switch>
                                <div id="full-screen-modal"></div>
                                <div id="visible-modal"></div>
                                <div id="visible-modal-2"></div>
                                {import.meta.env.VITE_NODE_ENV === 'production' &&
                                    window._env_ &&
                                    window._env_.VITE_HOTJAR_ENABLED && <Hotjar />}
                            </BreadcrumbStore>
                        </ErrorBoundary>
                    )}
                </>
            )}
        </Suspense>
    )
}
