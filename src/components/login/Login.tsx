import React, { Component } from 'react'
import dt from '../../assets/icons/logo/logo-dt.svg'
import LoginIcons from '../../assets/icons/LoginSprite.svg'
import { Switch, Redirect, Route, NavLink } from 'react-router-dom'
import { toast } from 'react-toastify'
import { getCookie, ServerErrors, Host, Progressing, showError } from '@devtron-labs/devtron-fe-common-lib'
import { URLS, DOCUMENTATION, TOKEN_COOKIE_NAME } from '../../config'
import { LoginProps, LoginFormState } from './login.types'
import { getSSOConfigList, loginAsAdmin } from './login.service'
import { dashboardAccessed } from '../../services/service'
import './login.scss'

export default class Login extends Component<LoginProps, LoginFormState> {
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
        this.autoFillLogin = this.autoFillLogin.bind(this)
        this.login = this.login.bind(this)
        this.isFormNotValid = this.isFormNotValid.bind(this)
    }
    componentDidMount() {
        let queryString = new URLSearchParams(this.props.location.search)
        let queryParam = queryString.get('continue')

        //1. TOKEN_COOKIE_NAME= 'argocd.token', is the only token unique to a user generated as Cookie when they log in,
        //If a user is still at login page for the first time and getCookie(TOKEN_COOKIE_NAME) becomes false.
        //queryParam is '/' for first time login, queryParam != "/" becomes false at login page. Hence toast won't appear
        //at the time of first login.
        //2. Also if the cookie is deleted/changed after some time from the database at backend then getCookie(TOKEN_COOKIE_NAME)
        //becomes false but queryParam != "/" will be true and queryParam is also not null hence redirecting users to the
        //login page with Please login again toast appearing.

        if (queryParam && (getCookie(TOKEN_COOKIE_NAME) || queryParam != '/')) {
            toast.error('Please login again')
        }
        if (queryParam && queryParam.includes('login')) {
            queryParam = '/app'
            let url = `${this.props.location.pathname}?continue=${queryParam}`
            this.props.history.push(url)
        }
        if (!queryParam) queryParam = ''
        this.setState({
            continueUrl: encodeURI(`${window.location.origin}/orchestrator${process.env.PUBLIC_URL}${queryParam}`),
        })
        getSSOConfigList().then((response) => {
            let list = response.result || []
            this.setState({
                loginList: list,
            })
        })
        if (typeof Storage !== 'undefined') {
            if (localStorage.isDashboardAccessed) return
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

    autoFillLogin(): void {
        this.setState({ form: { username: 'admin', password: process.env.REACT_APP_PASSWORD } })
    }

    isFormNotValid(): boolean {
        let isValid = true
        let keys = ['username', 'password']
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

    login(e): void {
        e.preventDefault()
        let data = this.state.form
        this.setState({ loading: true })
        loginAsAdmin(data)
            .then((response) => {
                if (response.result.token) {
                    this.setState({ loading: false })
                    let queryString = this.props.location.search.split('continue=')[1]
                    let url = queryString ? `${queryString}` : URLS.APP
                    this.props.history.push(url)
                    localStorage.setItem('isAdminLogin', 'true')
                }
            })
            .catch((errors: ServerErrors) => {
                showError(errors)
                this.setState({ loading: false })
            })
    }

    renderSSOLoginPage() {
        const search = this.props.location.search

        return (
            <div className="login__control">
                <img src={dt} alt="login" className="login__dt-logo" width="170px" height="120px" />
                <p className="login__text">Your tool for Rapid, Reliable & Repeatable deployments</p>
                {this.state.loginList
                    .filter((sso) => sso.active)
                    .map((item) => {
                        return (
                            <a
                                href={`${Host}${URLS.AUTHENTICATE}?return_url=${this.state.continueUrl}`}
                                className="login__google flex"
                                onClick={this.onClickSSO}
                            >
                                <svg className="icon-dim-24 mr-8" viewBox="0 0 24 24">
                                    <use href={`${LoginIcons}#${item.name}`}></use>
                                </svg>
                                Login with
                                <span className="ml-5 dc__first-letter-capitalize" data-testid="login-with-text">
                                    {item.name}
                                </span>
                            </a>
                        )
                    })}
                <NavLink className="login__link" to={`${URLS.LOGIN_ADMIN}${search}`}>
                    Login as administrator
                </NavLink>
            </div>
        )
    }

    renderAdminLoginPage() {
        let search = this.props.location.search

        return (
            <div className="login__control">
                <img src={dt} alt="login" className="login__dt-logo" width="170px" height="120px" />
                <p className="login__text">Your tool for Rapid, Reliable & Repeatable deployments</p>
                {/* @ts-ignore */}
                <form className="login-dt__form" autoComplete="on" onSubmit={this.login}>
                    <input
                        type="text"
                        data-testid="username-textbox"
                        className="form__input fs-14 mb-24"
                        placeholder="Username"
                        value={this.state.form.username}
                        name="username"
                        onChange={this.handleChange}
                    />
                    <input
                        type={process.env.NODE_ENV !== 'development' ? 'password' : 'text'}
                        data-testid="password-textbox"
                        className="form__input fs-14"
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
                        <p className="login__link"></p>
                    )}
                </form>
            </div>
        )
    }

    render() {
        return (
            <div className="login">
                <div className="login__bg">
                    <div className="login__image" />
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
