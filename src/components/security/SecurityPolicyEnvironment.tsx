
import React, { Component } from 'react';
import { RouteComponentProps, NavLink } from 'react-router-dom';
import { SecurityPolicyEdit } from './SecurityPolicyEdit';
import { getEnvironmentListMinPublic } from '../../services/service';
import { showError, Progressing, sortCallback } from '../common';
import { ViewType } from '../../config';
import { SecurityPolicyEnvironmentState } from './security.types';
import { ReactComponent as Search } from '../../assets/icons/ic-search.svg';
import Reload from '../Reload/Reload';

export class SecurityPolicyEnvironment extends Component<RouteComponentProps<{ envId: string }>, SecurityPolicyEnvironmentState> {

    constructor(props) {
        super(props);
        this.state = {
            view: ViewType.LOADING,
            envSearch: "",
            envList: []
        }
        this.handleSearchChange = this.handleSearchChange.bind(this);
    }

    componentDidMount() {
        getEnvironmentListMinPublic().then((response) => {
            let list = response.result || [];
            list = list.map((env) => {
                return {
                    id: env.id,
                    name: env.environment_name,
                    namespace: env.namespace
                }
            })
            list = list.sort((a, b) => sortCallback('name', a, b))
            this.setState({ envList: list, view: ViewType.FORM });
        }).catch((error) => {
            showError(error);
            this.setState({ view: ViewType.ERROR });
        })
    }

    handleSearchChange(e) {
        this.setState({ envSearch: e.target.value });
    }

    renderList() {
        const url = this.props.match.url;
        if (this.state.view === ViewType.LOADING) return <div style={{ height: "280px" }}><Progressing pageLoader /></div>
        else if (this.state.view === ViewType.LOADING) return <Reload />
        else return <table className="security-policy-cluster__table">
            <tbody>
                <tr>
                    <td className="security-policy-cluster__title w-100">
                        <div className="dc__search-with-dropdown">
                            <Search className="icon-dim-20 ml-8" />
                            <input type="text" className="search-with-dropdown__search" onChange={this.handleSearchChange} autoFocus placeholder="Search Environment" />
                        </div>
                    </td>
                </tr>
                {this.state.envList.filter(env => env.name.includes(this.state.envSearch)).map((env) => {
                    return <tr key={env.id} className="security-policy-cluster__content-row">
                        <td className="pl-20 pr-20 pt-16 pb-16">
                            <NavLink to={`${url}/${env.id}`}>
                                {env.name}
                            </NavLink>
                        </td>
                    </tr>
                })}
            </tbody>
        </table>
    }

    renderContent() {
        if (this.props.match.params.envId) {
            return <SecurityPolicyEdit level="environment" id={Number(`${this.props.match.params.envId}`)} key={`${this.props.match.params.envId}`} />
        }
        else return <>
            <div className="ml-24 mr-24 mt-20 mb-20">
                <h1 className="form__title">Environment Security Policies</h1>
                <p className="form__subtitle">Manage security policies for specific environment. Global policies would be applicable if not denied</p>
            </div>
            <div className="white-card white-card--cluster">
                {this.renderList()}
            </div>
        </>
    }

    render() {
        return <>
            {this.renderContent()}
        </>
    }
}
