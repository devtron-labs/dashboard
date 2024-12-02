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

import React, { Component } from 'react'
import { Switch, Redirect, Route, NavLink } from 'react-router-dom'
import {
    getCookie,
    ServerErrors,
    Host,
    Progressing,
    showError,
    CustomInput,
    withUserEmail,
    URLS as CommonURL,
    ToastVariantType,
    ToastManager,
} from '@devtron-labs/devtron-fe-common-lib'
import { importComponentFromFELibrary } from '@Components/common'
import LoginIcons from '../../assets/icons/LoginSprite.svg'
import dt from '../../assets/icons/logo/logo-dt.svg'
import { URLS, DOCUMENTATION, TOKEN_COOKIE_NAME, PREVIEW_DEVTRON, PRIVACY_POLICY } from '../../config'
import { LoginProps, LoginFormState } from './login.types'
import { loginAsAdmin } from './login.service'
import { dashboardAccessed } from '../../services/service'
import './login.scss'
import { getSSOConfigList } from '../../Pages/GlobalConfigurations/Authorization/SSOLoginServices/service'

const NetworkStatusInterface = !importComponentFromFELibrary('NetworkStatusInterface', null, 'function')

class Login extends Component<LoginProps, LoginFormState> {
    constructor(props) {
        super(props)
        this.state = {
            continueUrl: '',
            loginList: [],
            loading: false,
            form: {
                username: 'admin',
                password: '',
            },
        }
        this.handleChange = this.handleChange.bind(this)
        // this.autoFillLogin = this.autoFillLogin.bind(this)
        this.login = this.login.bind(this)
        this.isFormNotValid = this.isFormNotValid.bind(this)
    }

    componentDidMount() {
        const queryString = new URLSearchParams(this.props.location.search)
        let queryParam = queryString.get('continue')

        // 1. TOKEN_COOKIE_NAME= 'argocd.token', is the only token unique to a user generated as Cookie when they log in,
        // If a user is still at login page for the first time and getCookie(TOKEN_COOKIE_NAME) becomes false.
        // queryParam is '/' for first time login, queryParam != "/" becomes false at login page. Hence toast won't appear
        // at the time of first login.
        // 2. Also if the cookie is deleted/changed after some time from the database at backend then getCookie(TOKEN_COOKIE_NAME)
        // becomes false but queryParam != "/" will be true and queryParam is also not null hence redirecting users to the
        // login page with Please login again toast appearing.

        if (queryParam && (getCookie(TOKEN_COOKIE_NAME) || queryParam != '/')) {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: 'Please login again',
            })

        }
        if (queryParam && queryParam.includes('login')) {
            queryParam = window._env_.HIDE_NETWORK_STATUS_INTERFACE || !NetworkStatusInterface ? URLS.APP : CommonURL.NETWORK_STATUS_INTERFACE
            const url = `${this.props.location.pathname}?continue=${queryParam}`
            this.props.history.push(url)
        }
        if (!queryParam) {
            queryParam = ''
        }
        this.setState({
            continueUrl: encodeURI(`${window.location.origin}/orchestrator${window.__BASE_URL__}${queryParam}`),
        })
        getSSOConfigList().then((response) => {
            const list = response.result || []
            this.setState({
                loginList: list,
            })
        })
        if (typeof Storage !== 'undefined') {
            if (localStorage.isDashboardAccessed) {
                return
            }
            dashboardAccessed()
                .then((response) => {
                    if (response.result) {
                        localStorage.isDashboardAccessed = true
                    }
                })
                .catch((errors) => {})
        }
    }

    handleChange(e: React.ChangeEvent<HTMLInputElement>): void {
        e.persist()
        this.setState({
            form: {
                ...this.state.form,
                [e.target.name]: e.target.value,
            },
        })
    }

    // autoFillLogin(): void {
    //     this.setState({ form: { username: 'admin', password: import.meta.env.REACT_APP_PASSWORD } })
    // }

    isFormNotValid(): boolean {
        let isValid = true
        const keys = ['username', 'password']
        keys.map((key) => {
            if (key === 'password') {
                isValid = isValid && this.state.form[key]?.length >= 6
            } else {
                isValid = isValid && this.state.form[key]?.length
            }
        })
        return !isValid
    }

    onClickSSO = (): void => {
        if (typeof Storage !== 'undefined') {
            localStorage.setItem('isSSOLogin', 'true')
        }
    }

    getDefaultRedirectionURL = (): string => {
        const queryString = this.props.location.search.split('continue=')[1]
        if (queryString) {
            return queryString
        }

        if (!window._env_.HIDE_NETWORK_STATUS_INTERFACE && !!NetworkStatusInterface) {
            return CommonURL.NETWORK_STATUS_INTERFACE
        }

        return window._env_.FEATURE_DEFAULT_LANDING_RB_ENABLE ? URLS.RESOURCE_BROWSER : URLS.APP
    }

    login(e): void {
        e.preventDefault()
        const data = this.state.form
        this.setState({ loading: true })
        loginAsAdmin(data)
            .then((response) => {
                if (response.result.token) {
                    this.setState({ loading: false })
                    const url = this.getDefaultRedirectionURL()
                    this.props.setEmail(data.username)
                    this.props.history.push(url)
                    localStorage.setItem('isAdminLogin', 'true')
                }
            })
            .catch((errors: ServerErrors) => {
                showError(errors)
                this.setState({ loading: false })
            })
    }

    renderLoginPrivacyText = () => {
        if (window.location.origin === PREVIEW_DEVTRON) {
            return (
                <div className="flex mt-12">
                    By logging in, you agree to our
                    <a href={PRIVACY_POLICY} target="blank" className="ml-4 bc-5">
                        Privacy Policy
                    </a>
                </div>
            )
        }
    }

    renderSSOLoginPage() {
        const { search } = this.props.location

        return (
            <div className="login__control">
                <img
                    src={window._env_.LOGIN_DT_LOGO || dt}
                    alt="login-dt-logo"
                    className="login__dt-logo"
                    width="170px"
                    height="120px"
                />

                <p className="login__text">Your tool for Rapid, Reliable & Repeatable deployments</p>
                {this.state.loginList
                    .filter((sso) => sso.active)
                    .map((item) => {
                        return (
                            <a
                                href={`${Host}${URLS.AUTHENTICATE}?return_url=${this.state.continueUrl}`}
                                className="login__google flex"
                                onClick={this.onClickSSO}
                                key={item.name}
                            >
                                <svg className="icon-dim-24 mr-8" viewBox="0 0 24 24">
                                    <use href={`${LoginIcons}#${item.name}`} />
                                </svg>
                                Login with
                                <span className="ml-5 dc__first-letter-capitalize" data-testid="login-with-text">
                                    {item.name}
                                </span>
                            </a>
                        )
                    })}
                {this.renderLoginPrivacyText()}
                <NavLink className="login__link" to={`${URLS.LOGIN_ADMIN}${search}`}>
                    Login as administrator
                </NavLink>
            </div>
        )
    }

    renderAdminLoginPage() {
        const { search } = this.props.location

        return (
            <div className="login__control">
                <img
                    src={window._env_.LOGIN_DT_LOGO || dt}
                    alt="login-dt-logo"
                    className="login__dt-logo"
                    width="170px"
                    height="120px"
                />
                <p className="login__text">Your tool for Rapid, Reliable & Repeatable deployments</p>
                {/* @ts-ignore */}
                <form className="login-dt__form" autoComplete="on" onSubmit={this.login}>
                    <CustomInput
                        data-testid="username-textbox"
                        rootClassName="fs-14 mb-24"
                        placeholder="Username"
                        value={this.state.form.username}
                        name="username"
                        onChange={this.handleChange}
                    />
                    <CustomInput
                        type={import.meta.env.VITE_NODE_ENV !== 'development' ? 'password' : 'text'}
                        data-testid="password-textbox"
                        rootClassName="fs-14"
                        placeholder="Password"
                        value={this.state.form.password}
                        name="password"
                        onChange={this.handleChange}
                    />
                    <div className="login__know-password">
                        <a
                            className="login__know-password--link fs-12 cb-5"
                            rel="noreferrer noopener"
                            target="_blank"
                            href={DOCUMENTATION.ADMIN_PASSWORD}
                        >
                            What is my admin password?
                        </a>
                    </div>
                    <button
                        disabled={this.isFormNotValid() || this.state.loading}
                        className="cta login__button"
                        data-testid="login-button"
                    >
                        {this.state.loading ? <Progressing /> : 'Login'}
                    </button>
                    {this.state.loginList.length ? (
                        <NavLink className="login__link cb-5" to={`${URLS.LOGIN_SSO}${search}`}>
                            Login using SSO service
                        </NavLink>
                    ) : (
                        <p className="login__link" />
                    )}
                </form>
            </div>
        )
    }

    render() {
        return (
            <div className="login">
                <div
                    className="login__bg"
                    style={
                        window?._env_?.LOGIN_PAGE_IMAGE_BG ? { backgroundColor: window._env_.LOGIN_PAGE_IMAGE_BG } : {}
                    }
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
                <div className="login__section">
                    <Switch>
                        <Route
                            path={`${URLS.LOGIN_SSO}`}
                            render={(props) => {
                                return this.renderSSOLoginPage()
                            }}
                        />
                        <Route
                            path={`${URLS.LOGIN_ADMIN}`}
                            render={(props) => {
                                return this.renderAdminLoginPage()
                            }}
                        />
                        <Redirect to={`${URLS.LOGIN_SSO}`} />
                    </Switch>
                </div>
            </div>
        )
    }
}

export default withUserEmail(Login)
