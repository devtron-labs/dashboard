import React, { Component } from 'react';
import { LoginValidation } from './formValidator';
import { post } from '../../services/api';
import { ServerErrors } from '../../modals/commonTypes';
import { FullRoutes, URLS } from '../../config';
import { DevtronLoginProps, DevtronLoginState } from './types';
import dt from '../../assets/icons/logo/logo-dt.svg';
import { toast } from 'react-toastify'
import './login-dt.css';
import { Progressing, showError } from '../common'

export default class DevtronLogin extends Component<DevtronLoginProps, DevtronLoginState> {
    validationRules;

    constructor(props) {
        super(props);

        this.state = {
            code: 0,
            errors: [],
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
        let arr = this.props.location.search.split("=");
        if (arr.length && arr[0].indexOf("continue") != -1) {
            toast.error('Please login again.');
        }

        if(process.env.NODE_ENV === 'development'){
            this.autoFillLogin()
        }
    }
    
    autoFillLogin(){
        this.setState({form: {username: 'admin', password: process.env.REACT_APP_PASSWORD}})
    }

    handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        e.persist();
        this.setState(state => ({ ...state, form: { ...state.form, [e.target.name]: e.target.value } }));
        
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
                let queryString = this.props.location.search.split("continue=")[1];
                let url = (queryString) ? `${queryString}` : URLS.APP;
                this.props.history.push(`${url}`);
            }
        }).catch((errors: ServerErrors) => {
            showError(errors);
            this.setState({ code: errors.code, errors: errors.errors, loading: false })
        })
    }

    render() {
        return (
            <div className="login-dt">
                <form className="login-dt__form" onSubmit={this.login}>
                    <img src={dt} className="login__dt-logo" width="170px" height="120px" />
                    <input type="text" className="text-input text-input--username" placeholder="Username" value={this.state.form.username} name="username" onChange={this.handleChange} />
                    <input type={process.env.NODE_ENV !== 'development' ? 'password' : 'text'} className="text-input text-input--pwd" placeholder="Password" value={this.state.form.password} name="password" onChange={this.handleChange} />
                    <button disabled={this.isFormNotValid()} className="login__button">{this.state.loading ? <Progressing /> : 'Login'}</button>
                </form>
            </div>
        )
    }

}
