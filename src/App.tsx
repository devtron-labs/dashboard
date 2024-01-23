import React, { lazy, Suspense, useRef, useState, useEffect } from 'react'
import { Route, Switch, Redirect, useHistory, useLocation } from 'react-router-dom'
import { URLS } from './config'
import { toast } from 'react-toastify'
import 'patternfly/dist/css/patternfly.css'
import 'patternfly/dist/css/patternfly-additions.css'
import 'patternfly/dist/css/rcue.css'
import 'patternfly/dist/css/rcue-additions.css'
import 'patternfly-react/dist/css/patternfly-react.css'
import 'react-toastify/dist/ReactToastify.css'
import './css/base.scss'
import './css/formulae.scss'
import './css/forms.scss'
import 'tippy.js/dist/tippy.css'
import {
    useOnline,
    ToastBody,
    ToastBody3 as UpdateToast,
    ErrorBoundary,
    importComponentFromFELibrary,
} from './components/common'
import { showError, BreadcrumbStore, Reload, DevtronProgressing, APPROVAL_MODAL_TYPE } from '@devtron-labs/devtron-fe-common-lib'
import * as serviceWorker from './serviceWorker'
import Hotjar from './components/Hotjar/Hotjar'
import { validateToken } from './services/service'

const NavigationRoutes = lazy(() => import('./components/common/navigation/NavigationRoutes'))
const Login = lazy(() => import('./components/login/Login'))
const GenericDirectApprovalModal = importComponentFromFELibrary('GenericDirectApprovalModal')

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
    const refreshing = useRef(false)
    const [bgUpdated, setBGUpdated] = useState(false)
    const [validating, setValidating] = useState(true)
    const [forceUpdateOnLocationChange, setForceUpdateOnLocationChange] = useState(false)
    const [approvalToken, setApprovalToken] = useState<string>('')
    const [approvalType, setApprovalType] = useState<APPROVAL_MODAL_TYPE>(APPROVAL_MODAL_TYPE.CONFIG)
    const location = useLocation()
    const { push } = useHistory()
    const didMountRef = useRef(false)
    const isDirectApprovalNotification = location.pathname && location.pathname.includes('approve') && location.search && location.search.includes(`?token=${approvalToken}`)

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

    const redirectToDirectApprovalNotification = (): void => {
        setValidating(false)
        if (location.pathname && location.pathname.includes('deployment')) {
            setApprovalType(APPROVAL_MODAL_TYPE.DEPLOYMENT)
        } else {
            setApprovalType(APPROVAL_MODAL_TYPE.CONFIG)
        }

        let queryString = new URLSearchParams(location.search)
        let token = queryString.get('token')
        if (token) {
            setApprovalToken(token)
        }
    }

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


    useEffect(() => {
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
    }, [])

    async function update() {
        if (!navigator.serviceWorker) return
        try {
            const reg = await navigator.serviceWorker.getRegistration()
            if (reg.waiting) {
                reg.waiting.postMessage({ type: 'SKIP_WAITING' })
            }
        } catch (err) {}
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
        if (!forceUpdateOnLocationChange) return
        update()
    }, [location])

    useEffect(() => {
        if (!navigator.serviceWorker) return
        function onUpdate(reg) {
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
            setForceUpdateOnLocationChange(true)
            if (typeof Storage !== 'undefined') {
                localStorage.removeItem('serverInfo')
            }
        }
        function onSuccess(reg) {
            console.log('successfully installed')
        }
        navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange)
        serviceWorker.register({ onUpdate, onSuccess })
        navigator.serviceWorker.getRegistration().then((reg) => {
            if (!reg) return
            setInterval(
                (reg) => {
                    try {
                        reg.update()
                    } catch (err) {}
                },
                1000 * 60,
                reg,
            )
            if (reg.waiting) {
                onUpdate(reg)
            } else {
                try {
                    reg.update()
                } catch (err) {}
            }
        })
    }, [])

    useEffect(() => {
        if (!bgUpdated) return
        const bgUpdatedToastBody = (
            <UpdateToast
                onClick={(e) => window.location.reload()}
                text="This page has been updated. Please save any unsaved changes and refresh."
                buttonText="Reload"
            />
        )
        if (toast.isActive(updateToastRef.current)) {
            toast.update(updateToastRef.current, { render: bgUpdatedToastBody })
        } else {
            updateToastRef.current = toast.info(bgUpdatedToastBody, { autoClose: false, closeButton: false })
        }
    }, [bgUpdated])

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
                                             {isDirectApprovalNotification && GenericDirectApprovalModal && (
                                                <Route exact path={`/${approvalType?.toLocaleLowerCase()}/approve`}>
                                                    <GenericDirectApprovalModal
                                                        approvalType={approvalType}
                                                        approvalToken={approvalToken}
                                                    />
                                                </Route>
                                            )}
                                        {!window._env_.K8S_CLIENT && <Route path={`/login`} component={Login} />}
                                        <Route path="/" render={() => <NavigationRoutes />} />
                                        <Redirect
                                            to={window._env_.K8S_CLIENT ? '/' : `${URLS.LOGIN_SSO}${location.search}`}
                                        />
                                    </Switch>
                                <div id="full-screen-modal"></div>
                                <div id="visible-modal"></div>
                                <div id="visible-modal-2"></div>
                                {process.env.NODE_ENV === 'production' &&
                                    window._env_ &&
                                    window._env_.HOTJAR_ENABLED && <Hotjar />}
                            </BreadcrumbStore>
                        </ErrorBoundary>
                    )}
                </>
            )}
        </Suspense>
    )
}
