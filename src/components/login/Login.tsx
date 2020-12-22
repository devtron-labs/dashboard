import React, { Component } from 'react';
import dt from '../../assets/icons/logo/logo-dt.svg';
import { toast } from 'react-toastify';
import { LoginProps, LoginFormState } from './types';
import { LoginValidation } from './formValidator';
import { post } from '../../services/api';
import { ServerErrors } from '../../modals/commonTypes';
import { FullRoutes, URLS } from '../../config';
import { Progressing, showError } from '../common'
import LoginIcons from '../../assets/icons/LoginSprite.svg'
import { Route } from 'react-router';
import { Switch, Redirect } from 'react-router-dom';
import { getLoginList } from './service'
import './login.css';

export default class Login extends Component<LoginProps, LoginFormState>{
    validationRules;
    constructor(props) {
        super(props);
        this.state = {
            continueUrl: "",
            code: 0,
            errors: [],
            loginList: [],
            loading: false,
            form: {
                username: "",
                password: ""
            },
        }
        this.validationRules = new LoginValidation();
        this.autoFillLogin = this.autoFillLogin.bind(this);
    }

    componentDidMount() {
        const currentPath = window.location.href
        let cont = ""
        if (currentPath.includes('/admin')) {
            cont = currentPath.split('/admin')[1];
            toast.error('Please login again');
        }

        this.setState({
            continueUrl: encodeURI(`${process.env.PUBLIC_URL}${cont}`)
        })

        if (process.env.NODE_ENV === 'development') {
            this.autoFillLogin()
        }

        getLoginList().then((response) => {
            let list = response.result;
            this.setState({
                loginList: list
            })
        })
    }

    handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        e.persist();
        this.setState(state => ({ ...state, form: { ...state.form, [e.target.name]: e.target.value } }));
    }


    autoFillLogin() {
        this.setState({ form: { username: 'admin', password: process.env.REACT_APP_PASSWORD } })
    }


    isFormNotValid = () => {
        let isValid = true;
        let keys = ['username', 'password'];
        keys.map((key) => {
            if (key === 'password') {
                isValid = isValid && this.state.form[key]?.length >= 6;
            }
            else {
                isValid = isValid && this.state.form[key]?.length;
            }
        })
        return !isValid;
    }

    login = async (e) => {
        e.preventDefault();
        let data = this.state.form;
        this.setState({ loading: true })
        post(FullRoutes.LOGIN, data).then((response) => {
            if (response.result.token) {
                this.setState({ code: response.code, loading: false });
                let queryString = this.props.location.search.split("admin")[1];
                let url = (queryString) ? `${queryString}` : URLS.APP;
                this.props.history.push(`${url}`);
            }
        }).catch((errors: ServerErrors) => {
            showError(errors);
            this.setState({ code: errors.code, errors: errors.errors, loading: false })
        })
    }


    renderSSOLoginPage() {
        return (
            <div className="login__control">
                <img src={dt} alt="login" className="login__dt-logo" width="170px" height="120px" />
                <p className="login__text">Your tool for Rapid, Reliable & Repeatable deployments</p>
                {this.state.loginList.map((item, index) => {
                    return <a href={`/orchestrator/auth/login?return_url=${this.state.continueUrl}`} className="login__google flex">
                        <svg className="icon-dim-24 mr-8" viewBox="0 0 24 24"><use href={`${LoginIcons}#${item.name}`}></use></svg>
                        <span>{item.label}</span>
                    </a>
                })}
                <a className="login__link" href={`${URLS.LOGIN}/admin`}>Login as administrator</a>
            </div>
        )
    }

    renderAdminLoginPage() {
        return (<div className="login__control">
            <img src={dt} alt="login" className="login__dt-logo" width="170px" height="120px" />
            <p className="login__text">Your tool for Rapid, Reliable & Repeatable deployments</p>
            <form className="login-dt__form" onSubmit={this.login}>
                <input type="text" className="form__input fs-14 mb-24"
                    placeholder="Username"
                    value={this.state.form.username}
                    name="username"
                    onChange={this.handleChange} />
                <input type={process.env.NODE_ENV !== 'development' ? 'password' : 'text'}
                    className="form__input fs-14"
                    placeholder="Password"
                    value={this.state.form.password}
                    name="password"
                    onChange={this.handleChange} />
                <div className="login__know-password">
                    <a className="login__know-password--link fs-12 cb-5" rel="noreferrer noopener" target="_blank" href="https://github.com/devtron-labs/devtron#key-access-devtron-dashboard">What is my admin password?</a>
                </div>
                <button disabled={this.isFormNotValid()} className="login__button">{this.state.loading ? <Progressing /> : 'Login'}</button>
                {this.state.loginList.length ? (<a className="login__link cb-5" href={`${URLS.LOGIN}/sso`}>Login using SSO service</a>) : ""}
            </form>
        </div>)
    }


    render() {
        return <div className="login">
            <div className="login__bg"><div className="login__image" /></div>
            <div className="login__section">
                <Switch>
                    <Route path={`${URLS.LOGIN}/sso`} render={(props) => { return this.renderSSOLoginPage() }} />
                    <Route path={`${URLS.LOGIN}/admin`} render={(props) => { return this.renderAdminLoginPage() }} />
                    <Redirect to={`${URLS.LOGIN}/admin`} />
                </Switch>
            </div>
        </div>
    }

}
