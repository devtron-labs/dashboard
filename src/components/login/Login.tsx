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

import React, { useEffect, useState } from 'react'
import { Switch, Redirect, Route, useLocation, useHistory } from 'react-router-dom'
import {
    getCookie,
    ServerErrors,
    Host,
    showError,
    CustomInput,
    URLS as CommonURL,
    ToastVariantType,
    ToastManager,
    Button,
    ComponentSizeType,
    ButtonComponentType,
    ButtonVariantType,
    ButtonStyleType,
    useUserEmail,
    PasswordField,
    useSearchString,
    getComponentSpecificThemeClass,
    AppThemeType,
    useAsync,
    SSOProviderIcon,
    Icon,
} from '@devtron-labs/devtron-fe-common-lib'
import { importComponentFromFELibrary } from '@Components/common'
import { ReactComponent as Help } from '@Icons/ic-help-outline.svg'
import { REQUIRED_FIELD_MSG } from '@Config/constantMessaging'
import { URLS, DOCUMENTATION, TOKEN_COOKIE_NAME } from '../../config'
import { loginAsAdmin } from './login.service'
import { dashboardAccessed } from '../../services/service'
import './login.scss'
import { getSSOConfigList } from '../../Pages/GlobalConfigurations/Authorization/SSOLoginServices/service'
import { SSOConfigLoginList } from './login.types'
import { SSOProvider } from './constants'

const NetworkStatusInterface = !importComponentFromFELibrary('NetworkStatusInterface', null, 'function')

const getTermsAndConditions = importComponentFromFELibrary('getTermsAndConditions', null, 'function')

const Login = () => {
    const [continueUrl, setContinueUrl] = useState('')
    const [loginList, setLoginList] = useState<SSOConfigLoginList[]>([])
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({
        username: 'admin',
        password: '',
    })
    const [errorMessage, setErrorMessage] = useState({
        username: {
            message: '',
            isValid: true,
        },
        password: {
            message: '',
            isValid: true,
        },
    })

    const { searchParams } = useSearchString()
    const location = useLocation()
    const history = useHistory()
    const { setEmail } = useUserEmail()

    const [initLoading, initResult] = useAsync(() => Promise.allSettled([getSSOConfigList(), dashboardAccessed()]), [])

    const setLoginNavigationURL = () => {
        let queryParam = searchParams.continue

        // 1. TOKEN_COOKIE_NAME= 'argocd.token', is the only token unique to a user generated as Cookie when they log in,
        // If a user is still at login page for the first time and getCookie(TOKEN_COOKIE_NAME) becomes false.
        // queryParam is '/' for first time login, queryParam != "/" becomes false at login page. Hence toast won't appear
        // at the time of first login.
        // 2. Also if the cookie is deleted/changed after some time from the database at backend then getCookie(TOKEN_COOKIE_NAME)
        // becomes false but queryParam != "/" will be true and queryParam is also not null hence redirecting users to the
        // login page with Please login again toast appearing.

        if (queryParam && (getCookie(TOKEN_COOKIE_NAME) || queryParam !== '/')) {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: 'Please login again',
            })
        }
        if (queryParam && queryParam.includes('login')) {
            queryParam =
                window._env_.HIDE_NETWORK_STATUS_INTERFACE || !NetworkStatusInterface
                    ? URLS.APP
                    : CommonURL.NETWORK_STATUS_INTERFACE
            const url = `${location.pathname}?continue=${queryParam}`
            history.push(url)
        }
        if (!queryParam) {
            queryParam = ''
        }

        setContinueUrl(encodeURI(`${window.location.origin}/orchestrator${window.__BASE_URL__}${queryParam}`))
    }

    useEffect(() => {
        setLoginNavigationURL()
    }, [])

    useEffect(() => {
        if (initResult && !initLoading) {
            const [ssoLoginListResponse, dashboardAccessesResponse] = initResult
            if (ssoLoginListResponse.status === 'fulfilled' && ssoLoginListResponse.value.result) {
                setLoginList(ssoLoginListResponse.value.result as SSOConfigLoginList[])
            }

            if (
                typeof Storage !== 'undefined' &&
                !localStorage.getItem('isDashboardAccessed') &&
                dashboardAccessesResponse.status === 'fulfilled' &&
                dashboardAccessesResponse.value.result
            ) {
                localStorage.setItem('isDashboardAccessed', 'true')
            }
        }
    }, [initLoading, initResult])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.persist()

        const { name, value } = e.target
        setErrorMessage((prevState) => ({
            ...prevState,
            [name]: {
                message: value ? '' : REQUIRED_FIELD_MSG,
                isValid: !!value,
            },
        }))

        setForm({
            ...form,
            [name]: value,
        })
    }

    const getDefaultRedirectionURL = () => {
        const queryString = location.search.split('continue=')[1]
        if (queryString) {
            return queryString
        }

        if (!window._env_.HIDE_NETWORK_STATUS_INTERFACE && !!NetworkStatusInterface) {
            return CommonURL.NETWORK_STATUS_INTERFACE
        }

        // NOTE: we don't have serverMode therefore defaulting to flag value
        return window._env_.FEATURE_DEFAULT_LANDING_RB_ENABLE ? URLS.RESOURCE_BROWSER : URLS.APP
    }

    const onSubmitLogin = (e): void => {
        e.preventDefault()
        const data = form
        setLoading(true)
        loginAsAdmin(data)
            .then((response) => {
                if (response.result.token) {
                    setLoading(false)
                    const url = getDefaultRedirectionURL()
                    setEmail(data.username)
                    history.push(url)
                    localStorage.setItem('isAdminLogin', 'true')
                }
            })
            .catch((errors: ServerErrors) => {
                showError(errors)
                setLoading(false)
            })
    }

    const onClickSSO = () => {
        if (typeof Storage !== 'undefined') {
            localStorage.setItem('isSSOLogin', 'true')
        }

        const url = `${window.location.origin}${Host}${URLS.AUTHENTICATE}?return_url=${continueUrl}`
        window.location.replace(url)
    }

    const renderSSOLoginPage = () => (
        <div className="flexbox-col dc__gap-12">
            {loginList
                .filter((sso) => sso.active)
                .map((item) => (
                    <div className="login-button">
                        <Button
                            variant={ButtonVariantType.secondary}
                            text={`Login with ${item.name}`}
                            key={item.name}
                            onClick={onClickSSO}
                            dataTestId={`login-with-${item.name}`}
                            style={ButtonStyleType.neutral}
                            startIcon={<SSOProviderIcon provider={item.name as SSOProvider} />}
                            fullWidth
                            size={ComponentSizeType.xl}
                        />
                    </div>
                ))}
            <div className="flex">
                <Button
                    component={ButtonComponentType.link}
                    variant={ButtonVariantType.text}
                    linkProps={{
                        to: `${URLS.LOGIN_ADMIN}${location.search}`,
                    }}
                    text="Login as administrator"
                    dataTestId="login-as-admin"
                />
            </div>
        </div>
    )

    const renderAdminLoginPage = () => {
        const { search } = location

        return (
            <form className="flexbox-col dc__gap-32" autoComplete="on" onSubmit={onSubmitLogin} noValidate>
                <div className="flexbox-col dc__gap-16">
                    <CustomInput
                        placeholder="Enter username"
                        value={form.username}
                        name="username"
                        onChange={handleChange}
                        label="User ID"
                        required
                        error={errorMessage.username.message}
                    />
                    <div className="flexbox-col dc__gap-4">
                        <PasswordField
                            placeholder="Enter password"
                            value={form.password}
                            name="password"
                            onChange={handleChange}
                            label="Password"
                            required
                            shouldShowDefaultPlaceholderOnBlur={false}
                            autoFocus
                            error={errorMessage.password.message}
                        />

                        <div className="flex left dc__gap-4">
                            <Help className="fcb-5 icon-dim-16" />

                            <a
                                className="anchor fs-11 cb-5 lh-20"
                                rel="noreferrer noopener"
                                target="_blank"
                                href={DOCUMENTATION.ADMIN_PASSWORD}
                            >
                                What is my admin password?
                            </a>
                        </div>
                    </div>
                </div>
                <div className="flexbox-col dc__gap-12">
                    <Button
                        disabled={loading}
                        isLoading={loading}
                        dataTestId="login-button"
                        text="Login"
                        fullWidth
                        size={ComponentSizeType.xl}
                        buttonProps={{
                            type: 'submit',
                        }}
                    />

                    {loginList.length > 0 && (
                        <Button
                            dataTestId="sso-login"
                            text="Login using SSO service"
                            component={ButtonComponentType.link}
                            linkProps={{
                                to: `${URLS.LOGIN_SSO}${search}`,
                            }}
                            variant={ButtonVariantType.text}
                        />
                    )}
                </div>
            </form>
        )
    }

    const renderDevtronLogo = () => (
        <div className="flex column dc__gap-16 dc__text-center">
            {window._env_.LOGIN_DT_LOGO ? (
                <img
                    src={window._env_.LOGIN_DT_LOGO}
                    alt="login-dt-logo"
                    width="170px"
                    height="120px"
                    className="flexbox dc__align-self-center fcb-5"
                />
            ) : (
                <Icon name="ic-login-devtron-logo" color={null} size={null} />
            )}

            <p className="fs-16 lh-20 m-0 w-300 dc__align-self-center cn-9">
                Your tool for Rapid, Reliable & Repeatable deployments
            </p>
        </div>
    )

    const renderLoginContent = () => (
        <Switch>
            <Route path={URLS.LOGIN_SSO} component={renderSSOLoginPage} />
            <Route path={URLS.LOGIN_ADMIN} component={renderAdminLoginPage} />
            <Redirect to={URLS.LOGIN_SSO} />
        </Switch>
    )

    return (
        <div className={`login bg__white flex ${getComponentSpecificThemeClass(AppThemeType.light)}`}>
            <div
                className="w-50 login__bg"
                style={window?._env_?.LOGIN_PAGE_IMAGE_BG ? { backgroundColor: window._env_.LOGIN_PAGE_IMAGE_BG } : {}}
            >
                <div
                    className="login__image w-100 h-100vh mh-600"
                    style={
                        window?._env_?.LOGIN_PAGE_IMAGE
                            ? { backgroundImage: `url(${window._env_.LOGIN_PAGE_IMAGE})` }
                            : {}
                    }
                />
            </div>
            <div className="w-50 flex">
                <div className="login-card__wrapper br-12 mw-420 bg__primary dc__border">
                    <div className="flexbox-col dc__gap-32 p-36">
                        {renderDevtronLogo()}
                        {renderLoginContent()}
                    </div>
                    {getTermsAndConditions && getTermsAndConditions()}
                </div>
            </div>
        </div>
    )
}

export default Login
