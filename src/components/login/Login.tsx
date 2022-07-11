import React, { Component } from 'react'
import dt from '../../assets/icons/logo/logo-dt.svg'
import LoginIcons from '../../assets/icons/LoginSprite.svg'
import { Switch, Redirect, NavLink } from 'react-router-dom'
import { Route } from 'react-router'
import { toast } from 'react-toastify'
import { ServerErrors } from '../../modals/commonTypes'
import { URLS, Host, DOCUMENTATION } from '../../config'
import { Progressing, showError } from '../common'
import { LoginProps, LoginFormState } from './login.types'
import { getSSOConfigList, loginAsAdmin } from './login.service'
import './login.css'
import { dashboardAccessed } from '../../services/service'

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

        if (queryParam) {
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
                    this.props.history.push(`${url}`)
                }
            })
            .catch((errors: ServerErrors) => {
                showError(errors)
                this.setState({ loading: false })
            })
    }

    renderSSOLoginPage() {
        let search = this.props.location.search

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
                            >
                                <svg className="icon-dim-24 mr-8" viewBox="0 0 24 24">
                                    <use href={`${LoginIcons}#${item.name}`}></use>
                                </svg>
                                Login with <span className="ml-5 capitalize">{item.name}</span>
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
                        className="form__input fs-14 mb-24"
                        placeholder="Username"
                        value={this.state.form.username}
                        name="username"
                        onChange={this.handleChange}
                    />
                    <input
                        type={process.env.NODE_ENV !== 'development' ? 'password' : 'text'}
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
                    <button disabled={this.isFormNotValid() || this.state.loading} className="cta login__button">
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
