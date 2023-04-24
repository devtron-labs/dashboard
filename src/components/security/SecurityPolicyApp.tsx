
import React, { Component } from 'react';
import { RouteComponentProps, NavLink } from 'react-router-dom';
import { SecurityPolicyEdit } from './SecurityPolicyEdit';
import { getAppListMin } from '../../services/service';
import { showError, Progressing, sortCallback, Reload } from '@devtron-labs/devtron-fe-common-lib'
import { ViewType } from '../../config';
import { SecurityPolicyAppState } from './security.types';
import { ReactComponent as Search } from '../../assets/icons/ic-search.svg';

export class SecurityPolicyApp extends Component<RouteComponentProps<{ appId: string; }>, SecurityPolicyAppState> {

    constructor(props) {
        super(props);
        this.state = {
            view: ViewType.LOADING,
            appSearch: "",
            appList: []
        }
        this.handleSearchChange = this.handleSearchChange.bind(this);
    }

    componentDidMount() {
        getAppListMin().then((response) => {
            let list = response.result || [];
            list = list.sort((a, b) => sortCallback('name', a, b));
            this.setState({
                view: ViewType.FORM,
                appList: list,
            });
        }).catch((error) => {
            showError(error);
            this.setState({ view: ViewType.ERROR });
        })
    }

    handleSearchChange(e) {
        this.setState({ appSearch: e.target.value });
    }

    renderList() {
        const url = this.props.match.url;
        if (this.state.view === ViewType.LOADING) return <div style={{ height: "280px" }}><Progressing pageLoader /></div>
        else if (this.state.view === ViewType.LOADING) return <Reload />
        else return (
            <table className="security-policy-cluster__table">
                <tbody>
                    <tr>
                        <td className="security-policy-cluster__title w-100">
                            <div className="dc__search-with-dropdown">
                                <Search className="icon-dim-20 ml-8" />
                                <input
                                    type="text"
                                    className="search-with-dropdown__search"
                                    data-testid="search-application"
                                    onChange={this.handleSearchChange}
                                    autoFocus
                                    placeholder="Search application"
                                />
                            </div>
                        </td>
                    </tr>
                    {this.state.appList
                        .filter((app) => app.name.includes(this.state.appSearch))
                        .map((app) => {
                            return (
                                <tr
                                    key={app.id}
                                    className="security-policy-cluster__content-row"
                                    data-testid="select-application-from-list"
                                >
                                    <td className="pl-20 pr-20 pt-16 pb-16">
                                        <NavLink to={`${url}/${app.id}`}>{app.name}</NavLink>
                                    </td>
                                </tr>
                            )
                        })}
                </tbody>
            </table>
        )
    }

    renderContent() {
        if (this.props.match.params.appId) {
            return <SecurityPolicyEdit level="application" id={Number(`${this.props.match.params.appId}`)} key={`${this.props.match.params.appId}`} />
        }
        else return <>
            <div className="ml-24 mr-24 mt-20 mb-20">
                <h1 className="form__title">Application Security Policies</h1>
                <p className="form__subtitle">Manage security policies for specific applications. Global policies would be applicable if not denied</p>
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
