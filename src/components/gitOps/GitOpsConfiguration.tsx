import React, { Component } from "react";
import { ViewType, DOCUMENTATION } from '../../config'
import { GitOpsState, GitOpsProps, GitOpsConfig } from './gitops.type'
import { ProtectedInput } from '../globalConfigurations/GlobalConfiguration'
import { ReactComponent as GitLab } from '../../assets/icons/git/gitlab.svg';
import { ReactComponent as GitHub } from '../../assets/icons/git/github.svg';
import Azure from '../../assets/icons/git/azure.png';
import { CustomInput, ErrorScreenManager, Progressing, showError } from '../common';
import Check from '../../assets/icons/ic-outline-check.svg';
import { toast } from 'react-toastify';
import { updateGitOpsConfiguration, saveGitOpsConfiguration, getGitOpsConfigurationList } from './gitops.service';
import { GlobalConfigCheckList } from '../checkList/GlobalConfigCheckList';
import '../login/login.css';
import './gitops.css';


enum GitProvider {
    GitLab = 'GITLAB',
    Github = 'GITHUB',
    Azure_devops = 'AZURE_DEVOPS'
};

const GitHost = {
    GITHUB: "https://github.com/",
    GITLAB: "https://gitlab.com/",
    AZURE_DEVOPS: 'https://dev.azure.com/'
}

const DefaultGitOpsConfig = {
    id: undefined,
    provider: GitProvider.Github,
    host: "",
    token: "",
    username: "",
    gitLabGroupId: "",
    gitHubOrgId: "",
    azureOrgId: "",
    active: true,
}

const GitProviderTabIcons: React.FC<{ gitops: string }> = ({ gitops }) => {
    switch (gitops) {
        case "GitHub": return <GitHub />
        case "GitLab": return <GitLab />
        case "Azure": return <img className="icon-dim-24" src={Azure} />
    }
}

const GitProviderTab: React.FC<{ tab: string; handleGitopsTab: (e) => void; lastActiveGitOp: undefined | GitOpsConfig; provider: string; gitops: string }> = ({ tab, handleGitopsTab, lastActiveGitOp, provider, gitops }) => {
    return <label className="tertiary-tab__radio">
        <input type="radio" name="status" value={provider} checked={tab === provider} onChange={handleGitopsTab} />
        <span className="tertiary-tab sso-icons">
            <aside className="login__icon-alignment"><GitProviderTabIcons gitops={gitops} /></aside>
            <aside className="login__text-alignment"> {gitops}</aside>
            <div>
                {(lastActiveGitOp?.provider === provider) ? <aside className="login__check-icon"><img src={Check} /></aside> : ""}
            </div>
        </span>
    </label>
}


export default class GitOpsConfiguration extends Component<GitOpsProps, GitOpsState> {

    constructor(props) {
        super(props)
        this.state = {
            view: ViewType.LOADING,
            statusCode: 0,
            gitList: [],
            saveLoading: false,
            tab: GitProvider.Github,
            lastActiveGitOp: undefined,
            form: {
                ...DefaultGitOpsConfig,
                host: GitHost.GITHUB,
                provider: GitProvider.Github,
            },
            isFormEdited: false,
            isError: {
                host: "",
                username: "",
                token: "",
                gitHubOrgId: "",
                gitLabGroupId: "",
                azureOrgId: ""
            }
        }
        this.handleGitopsTab = this.handleGitopsTab.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.fetchGitOpsConfigurationList = this.fetchGitOpsConfigurationList.bind(this);
    }

    componentDidMount() {
        this.fetchGitOpsConfigurationList();
    }

    fetchGitOpsConfigurationList() {
        getGitOpsConfigurationList().then((response) => {
            let lastActiveGitOp = response.result?.find(item => item.active);
            let form = lastActiveGitOp;
            if (!lastActiveGitOp) {
                form = {
                    ...DefaultGitOpsConfig,
                    host: GitHost[this.state.tab],
                    provider: GitProvider.Github,
                }
            }
            let isError = this.getFormErrors(false, form)
            this.setState({
                gitList: response.result || [],
                saveLoading: false,
                view: ViewType.FORM,
                lastActiveGitOp: lastActiveGitOp,
                tab: form.provider,
                form: form,
                isError: isError,
                isFormEdited: false,
            })
        }).catch((error) => {
            showError(error);
            this.setState({ view: ViewType.ERROR, statusCode: error.code });
        })
    }

    handleGitopsTab(event): void {
        let newGitOps = event.target.value;
        let form = this.state.gitList.find(item => item.provider === newGitOps);
        if (!form) {
            form = {
                ...DefaultGitOpsConfig,
                host: GitHost[newGitOps],
                provider: newGitOps,
            }
        };
        let isError = this.getFormErrors(false, form);
        this.setState({
            tab: form.provider,
            form: form,
            isError: isError,
            isFormEdited: false,
        })
    }

    handleChange(event, key: "host" | "username" | "token" | "gitHubOrgId" | "azureOrgId" | "gitLabGroupId"): void {
        this.setState({
            form: {
                ...this.state.form,
                [key]: event.target.value,
            },
            isError: {
                ...this.state.isError,
                [key]: event.target.value.length === 0 ? "This is a required field" : "",
            },
            isFormEdited: false,
        })
    }

    getFormErrors(isFormEdited, form: GitOpsConfig): any {
        if (!isFormEdited) return {
            host: "",
            username: "",
            token: "",
            gitHubOrgId: "",
            gitLabGroupId: "",
            azureOrgId: ""
        }

        let isError = {
            host: form.host.length ? "" : "This is a required field",
            username: form.username.length ? "" : "This is a required field",
            token: form.token.length ? "" : "This is a required field",
            gitHubOrgId: form.gitHubOrgId.length ? "" : "This is a required field",
            gitLabGroupId: form.gitLabGroupId.length ? "" : "This is a required field",
            azureOrgId: form.azureOrgId.length ? "" : "This is a required field"
        };
        return isError;
    }

    onSave() {
        let isError = this.state.isError;
        if (!this.state.isFormEdited) {
            isError = this.getFormErrors(true, this.state.form);
            this.setState({
                isError,
                isFormEdited: true
            })
        }

        let { host, username, token, gitHubOrgId, gitLabGroupId, azureOrgId } = isError;
        let isInvalid = host?.length > 0 || username?.length > 0 || token?.length > 0;
        if (this.state.tab === GitProvider.Github) {
            isInvalid = isInvalid || gitHubOrgId?.length > 0
        }
        else if ((this.state.tab === GitProvider.GitLab)) {
            isInvalid = isInvalid || gitLabGroupId?.length > 0
        }
        else {
            isInvalid = isInvalid || azureOrgId?.length > 0
        }

        if (isInvalid) {
            toast.error("Some Required Fields are missing");
            return;
        }

        this.saveGitOps();
    }

    saveGitOps() {
        this.setState({ saveLoading: true });
        let payload = {
            id: this.state.form.id,
            provider: this.state.form.provider,
            username: this.state.form.username,
            host: this.state.form.host,
            token: this.state.form.token,
            gitLabGroupId: this.state.form.gitLabGroupId,
            gitHubOrgId: this.state.form.gitHubOrgId,
            azureOrgId: this.state.form.azureOrgId,
            active: true,
        }
        let promise = payload.id ? updateGitOpsConfiguration(payload) : saveGitOpsConfiguration(payload);
        promise.then((response) => {
            toast.success("Saved Successful");
            this.fetchGitOpsConfigurationList();
        }).catch((error) => {
            showError(error);
            this.setState({ view: ViewType.ERROR, statusCode: error.code, saveLoading: false });
        })
    }

    render() {
        let key: "gitHubOrgId" | "gitLabGroupId" | "azureOrgId" = this.state.tab === GitProvider.Github ? 'gitHubOrgId' : this.state.tab === GitProvider.Azure_devops ? 'azureOrgId' : 'gitLabGroupId';
        if (this.state.view === ViewType.LOADING) {
            return <Progressing pageLoader />
        }
        else if (this.state.view === ViewType.ERROR) {
            return <div className="global-configuration__component flex" >
                <ErrorScreenManager code={this.state.statusCode} />
            </div>
        }
        return <section className="mt-16 mb-16 ml-20 mr-20 global-configuration__component flex-1">
            <h2 className="form__title">GitOps</h2>
            <p className="form__subtitle">Devtron uses GitOps configuration to store kubernetes configuration files of applications.
            <span><a rel="noreferrer noopener" target="_blank" className="learn-more__href" href={DOCUMENTATION.GLOBAL_CONFIG_GITOPS}> Learn more about GitOps </a> </span></p>
            <form className="bcn-0 bw-1 en-2 br-8 pb-22 pl-20 pr-20">
                <div className="login__sso-flex">
                    <GitProviderTab tab={this.state.tab} handleGitopsTab={this.handleGitopsTab} lastActiveGitOp={this.state.lastActiveGitOp} provider={GitProvider.Github} gitops="GitHub" />
                    <GitProviderTab tab={this.state.tab} handleGitopsTab={this.handleGitopsTab} lastActiveGitOp={this.state.lastActiveGitOp} provider={GitProvider.GitLab} gitops="GitLab" />
                    <GitProviderTab tab={this.state.tab} handleGitopsTab={this.handleGitopsTab} lastActiveGitOp={this.state.lastActiveGitOp} provider={GitProvider.Azure_devops} gitops="Azure" />
                </div>
                <CustomInput autoComplete="off"
                    value={this.state.form.host}
                    onChange={(event) => this.handleChange(event, 'host')}
                    name="Enter host"
                    error={this.state.isError.host}
                    label={this.state.tab === GitProvider.Azure_devops ? "Azure DevOps organization Url*" : "Git Host*"}
                    tabIndex={1}
                    labelClassName="gitops__id form__label--fs-13 fw-5 fs-13" />
                <div className="mt-16">
                    <CustomInput autoComplete="off" value={this.state.form[key]}
                        tabIndex={2}
                        error={this.state.isError[key]}
                        label={this.state.tab === GitProvider.Github ? "GitHub Organisation Name*" : this.state.tab === GitProvider.GitLab ? "GitLab Group ID*" : "Azure DevOps Project Name*"}
                        onChange={(event) => { this.handleChange(event, key); }} />
                </div>
                <hr />
                <div className="fw-6 cn-9 fs-14 mb-16">Git access credentials</div>

                <div className="form__row--two-third gitops__id mb-20 fs-13">
                    <div>
                        <CustomInput autoComplete="off"
                            value={this.state.form.username}
                            onChange={(event) => this.handleChange(event, 'username')}
                            name="Enter username" error={this.state.isError.username}
                            tabIndex={3}
                            label={this.state.tab === GitProvider.Github ? "GithHub Username*" : this.state.tab === GitProvider.GitLab ? "GitLab Username*" : "Azure DevOps Username*"}
                            labelClassName="gitops__id form__label--fs-13 fw-5 fs-13" />
                    </div>
                    <ProtectedInput value={this.state.form.token}
                        onChange={(event) => this.handleChange(event, 'token')}
                        name="Enter token"
                        tabIndex={4}
                        error={this.state.isError.token}
                        label={this.state.tab === GitProvider.Azure_devops ? "Azure DevOps Access Token*" : "Personal Access Token*"}
                        labelClassName="gitops__id form__label--fs-13 mb-8 fw-5 fs-13" />
                </div>

                <div className="form__buttons">
                    <button type="submit" disabled={this.state.saveLoading} onClick={(e) => { e.preventDefault(); this.onSave() }} tabIndex={5} className="cta">
                        {this.state.saveLoading ? <Progressing /> : "Save"}
                    </button>
                </div>
            </form>
        </section>
    }
}