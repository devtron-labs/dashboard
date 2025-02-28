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
} from '@devtron-labs/devtron-fe-common-lib'
import { importComponentFromFELibrary } from '@Components/common'
import { ReactComponent as Help } from '@Icons/ic-help-outline.svg'
import { SSOTabIcons } from '@Pages/GlobalConfigurations/Authorization/SSOLoginServices/utils'
import { URLS, DOCUMENTATION, TOKEN_COOKIE_NAME } from '../../config'
import { loginAsAdmin } from './login.service'
import { dashboardAccessed } from '../../services/service'
import './login.scss'
import { getSSOConfigList } from '../../Pages/GlobalConfigurations/Authorization/SSOLoginServices/service'
import { LoginCard } from './LoginCard'
import { SSOProvider } from './constants'
import { SSOConfig } from './login.types'

const NetworkStatusInterface = !importComponentFromFELibrary('NetworkStatusInterface', null, 'function')

const Login = () => {
    const [continueUrl, setContinueUrl] = useState('')
    const [loginList, setLoginList] = useState<SSOConfig[]>([])
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({
        username: 'admin',
        password: '',
    })

    const { searchParams } = useSearchString()
    const location = useLocation()
    const history = useHistory()
    const { setEmail } = useUserEmail()

    const [, initResult] = useAsync(() => Promise.allSettled([getSSOConfigList(), dashboardAccessed()]), [])

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
        if (!initResult || !Array.isArray(initResult) || initResult.length < 2) return

        const [ssoLoginListResponse, dashboardAccessesResponse] = initResult
        if (ssoLoginListResponse.status === 'fulfilled' && ssoLoginListResponse.value.result) {
            setLoginList(ssoLoginListResponse.value.result || [])
        }

        if (typeof Storage !== 'undefined' && !localStorage.getItem('isDashboardAccessed')) {
            if (dashboardAccessesResponse.status === 'fulfilled' && dashboardAccessesResponse.value.result) {
                localStorage.setItem('isDashboardAccessed', 'true')
            }
        }

        setLoginNavigationURL()
    }, [initResult])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.persist()
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        })
    }

    const isFormNotValid = () => {
        const _form = { ...form }
        let isValid = true
        const keys = ['username', 'password']
        keys.forEach((key) => {
            if (key === 'password') {
                isValid = isValid && _form[key]?.length >= 6
            } else {
                isValid = isValid && _form[key]?.length
            }
        })
        return !isValid
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
                    <Button
                        variant={ButtonVariantType.secondary}
                        text={`Login with ${item.name}`}
                        key={item.name}
                        onClick={onClickSSO}
                        dataTestId={`login-with-${item.name}`}
                        style={ButtonStyleType.neutral}
                        startIcon={<SSOTabIcons provider={item.name as SSOProvider} />}
                        fullWidth
                        size={ComponentSizeType.xl}
                    />
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
            <form className="flexbox-col dc__gap-32" autoComplete="on" onSubmit={onSubmitLogin}>
                <div className="flexbox-col dc__gap-16">
                    <CustomInput
                        data-testid="username-textbox"
                        placeholder="Enter username"
                        value={form.username}
                        name="username"
                        onChange={handleChange}
                        label="User ID"
                        required
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
                        />

                        <div className="flex left dc__gap-4">
                            <Help className="fcb-5 icon-dim-16" />

                            <a
                                className="login__know-password--link fs-11 cb-5 lh-20"
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
                        disabled={isFormNotValid() || loading}
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
    return (
        <div className={`login flex ${getComponentSpecificThemeClass(AppThemeType.light)}`}>
            <div
                className="login__bg w-50"
                style={window?._env_?.LOGIN_PAGE_IMAGE_BG ? { backgroundColor: window._env_.LOGIN_PAGE_IMAGE_BG } : {}}
            >
                <div
                    className="login__image"
                    style={
                        window?._env_?.LOGIN_PAGE_IMAGE
                            ? { backgroundImage: `url(${window._env_.LOGIN_PAGE_IMAGE})` }
                            : {}
                    }
                />
            </div>
            <div className="w-50 flex">
                <Switch>
                    <Route path={`${URLS.LOGIN_SSO}`}>
                        <LoginCard renderContent={renderSSOLoginPage} />
                    </Route>
                    <Route path={`${URLS.LOGIN_ADMIN}`}>
                        <LoginCard renderContent={renderAdminLoginPage} />
                    </Route>
                    <Redirect to={`${URLS.LOGIN_SSO}`} />
                </Switch>
            </div>
        </div>
    )
}

export default Login
