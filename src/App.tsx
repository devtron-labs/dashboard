import React, { lazy, Suspense, useRef, useState, useEffect } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import { useHistory, useLocation } from 'react-router';
import { URLS } from './config';
import { toast } from 'react-toastify';
import "patternfly/dist/css/patternfly.css";
import "patternfly/dist/css/patternfly-additions.css";
import "patternfly/dist/css/rcue.css";
import "patternfly/dist/css/rcue-additions.css";
import "patternfly-react/dist/css/patternfly-react.css";
import 'react-toastify/dist/ReactToastify.css';
import './css/base.scss';
import './css/formulae.scss';
import './css/forms.scss';
import 'tippy.js/dist/tippy.css';
import { useOnline, BreadcrumbStore, ToastBody, ToastBody3 as UpdateToast, Progressing, showError, getLoginInfo } from './components/common';
import * as serviceWorker from './serviceWorker';
import Hotjar from './components/Hotjar/Hotjar';
import { validateToken } from './services/service';
import Reload from './components/Reload/Reload';

const NavigationRoutes = lazy(() => import('./components/common/navigation/NavigationRoutes'));
const Login = lazy(() => import('./components/login/Login'));

toast.configure({
	autoClose: 3000,
	hideProgressBar: true,
	pauseOnHover: true,
	pauseOnFocusLoss: true,
	closeOnClick: false,
	newestOnTop: true,
	toastClassName: "devtron-toast",
	bodyClassName: "devtron-toast__body"
})

export default function App() {
	const onlineToastRef = useRef(null)
	const updateToastRef = useRef(null)
	const [errorPage, setErrorPage] = useState<Boolean>(false)
	const isOnline = useOnline();
	const refreshing = useRef(false)
	const [bgUpdated, setBGUpdated] = useState(false)
	const [validating, setValidating] = useState(true)
	const location = useLocation()
	const { push } = useHistory()
	const didMountRef = useRef(false);

	function onlineToast(toastBody: JSX.Element, options) {
		if (onlineToastRef.current && toast.isActive(onlineToastRef.current)) {
			toast.update(onlineToastRef.current, { render: toastBody, ...options })
		}
		else {
			onlineToastRef.current = toast[options.type](toastBody, options)
		}
	}

	useEffect(() => {
		if (didMountRef.current) {
			if (!isOnline) {
				const toastBody = <ToastBody title="You are offline!" subtitle="You are not seeing real-time data and any changes you make will not be saved." />
				onlineToast(toastBody, { type: toast.TYPE.ERROR, autoClose: false, closeButton: false });
			}
			else {
				const toastBody = <ToastBody title="Connected!" subtitle="You're back online." />;
				onlineToast(toastBody, { type: toast.TYPE.SUCCESS, autoClose: 3000, closeButton: true })
			}
		}
		else {
			didMountRef.current = true;
		}

	}, [isOnline])

	useEffect(() => {
		async function validation() {
			try {
				await validateToken();
				// check if admin then direct to admin otherwise router will redirect to app list
				if (location.search && location.search.includes("?continue=")) {
					const newLocation = location.search.replace("?continue=", "");
					push(newLocation);
				}
			}
			catch (err: any) {
				// push to login without breaking search
				if (err?.code === 401) {
					const loginPath = URLS.LOGIN_SSO;
					const newSearch = location.pathname.includes(URLS.LOGIN_SSO) ? location.search : `?continue=${location.pathname}`
					push(`${loginPath}${newSearch}`)
				} else {
					setErrorPage(true)
					showError(err)
				}
			}
			finally {
				setValidating(false)
			}
		}
		validation()
	}, [])


	async function update() {
		if (!navigator.serviceWorker) return
		try {
			const reg = await navigator.serviceWorker.getRegistration();
			if (reg.waiting) {
				reg.waiting.postMessage({ type: 'SKIP_WAITING' });
			}
		}
		catch (err) {

		}
	}

	function handleControllerChange() {
		if (refreshing.current) {
			return
		};
		if (document.visibilityState === 'visible') {
			window.location.reload();
			refreshing.current = true;
		}
		else {
			setBGUpdated(true)
		}
	}

	useEffect(() => {


		if (!navigator.serviceWorker) return
		function onUpdate(reg) {
			const updateToastBody = <UpdateToast onClick={e => update()} text="You are viewing an outdated version of Devtron UI." buttonText="Reload" />
			if (toast.isActive(updateToastRef.current)) {
				toast.update(updateToastRef.current, { render: updateToastBody })
			}
			else {
				updateToastRef.current = toast.info(updateToastBody, { autoClose: false, closeButton: false })
			}
		}
		function onSuccess(reg) {
			console.log('successfully installed')
		}
		navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange)
		serviceWorker.register({ onUpdate, onSuccess });
		navigator.serviceWorker.getRegistration().then(reg => {
			if (!reg) return
			setInterval(reg => {
				try {
					reg.update()
				}
				catch (err) {
					// console.log(err)
				}
			}, 1000 * 60, reg)
			if (reg.waiting) {
				const updateToastBody = <UpdateToast onClick={e => update()} text="You are viewing an outdated version of Devtron UI." buttonText="Reload" />
				if (toast.isActive(updateToastRef.current)) {
					toast.update(updateToastRef.current, { render: updateToastBody })
				}
				else {
					updateToastRef.current = toast.info(updateToastBody, { autoClose: false, closeButton: false })
				}
			}
			else {
				try {
					reg.update()
				}
				catch (err) {
					// console.log(err)
				}
			}
		})
	}, [])

	useEffect(() => {
		if (!bgUpdated) return
		const bgUpdatedToastBody = <UpdateToast onClick={e => window.location.reload()} text="This page has been updated. Please save any unsaved changes and refresh." buttonText="Reload" />
		if (toast.isActive(updateToastRef.current)) {
			toast.update(updateToastRef.current, { render: bgUpdatedToastBody })
		}
		else {
			updateToastRef.current = toast.info(bgUpdatedToastBody, { autoClose: false, closeButton: false })
		}
	}, [bgUpdated])

	return (
		<Suspense fallback={null}>
			{validating ? (
				<div style={{ height: '100vh', width: '100vw' }}>
					<Progressing pageLoader />
				</div>
			) : (
				<>
					{errorPage ? (
						<div style={{ height: '100vh', width: '100vw' }}>
							<Reload />
						</div>
					) : (
						<BreadcrumbStore>
							<Switch>
								<Route path={`/login`} component={Login} />
								<Route path="/" render={() => <NavigationRoutes />} />
								<Redirect to={`${URLS.LOGIN_SSO}${location.search}`} />
							</Switch>
							<div id="full-screen-modal"></div>
							<div id="visible-modal"></div>
							<div id="visible-modal-2"></div>
							{process.env.NODE_ENV === 'production' && window._env_ && window._env_.HOTJAR_ENABLED && (
								<Hotjar />
							)}
						</BreadcrumbStore>
					)}
				</>
			)}
		</Suspense>
	);
}