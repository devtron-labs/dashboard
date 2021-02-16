import React, { Component } from "react";
import { ViewType } from '../../config'
import { GitOpsState, GitOpsProps } from './gitops.type'
import { CustomInput, ProtectedInput } from '../globalConfigurations/GlobalConfiguration'
import { ReactComponent as GitLab } from '../../assets/icons/git/gitlab.svg';
import { ReactComponent as GitHub } from '../../assets/icons/git/github.svg';
import { ErrorScreenManager, Progressing, showError } from '../common';
import { toast } from 'react-toastify';
import { updateGitOpsConfiguration, saveGitOpsConfiguration, getGitOpsConfigurationList } from './gitops.service'
import '../login/login.css';
import './gitops.css';
import Check from '../../assets/icons/ic-outline-check.svg'

const GitProvider = {
    GitLab: 'gitlab',
    Github: 'github',
};

const GitHost = {
    github: "https://github.com/",
    gitlab: "https://gitlab.com/"
}

const DefaultGitOpsConfig = {
    id: undefined,
    provider: "",
    host: "",
    token: "",
    username: "",
    gitLabGroupId: "",
    gitHubOrgId: "",
    active: true,
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
                host: GitHost.github,
                provider: "GITHUB",
            },
            isError: {
                username: "",
                token: "",
                gitHubOrgId: "",
                gitLabGroupId: "",
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
                    provider: this.state.tab === GitProvider.Github ? "GITHUB" : "GITLAB",
                }
            }
            this.setState({
                gitList: response.result || [],
                view: ViewType.FORM,
                tab: form.provider.toLowerCase(),
                form: form,
                saveLoading: false,
                lastActiveGitOp: lastActiveGitOp
            })
        }).catch((error) => {
            showError(error);
            this.setState({ view: ViewType.ERROR, statusCode: error.code });
        })
    }

    handleGitopsTab(event): void {
        let newGitOps = event.target.value;
        let form = this.state.gitList.find(item => item.provider.toLowerCase() === newGitOps);
        if (!form) {
            form = {
                ...DefaultGitOpsConfig,
                host: GitHost[newGitOps],
                provider: newGitOps === GitProvider.Github ? "GITHUB" : "GITLAB",
            }
        };
        this.setState({
            tab: newGitOps,
            form: form,
            isError: {
                username: "",
                token: "",
                gitHubOrgId: "",
                gitLabGroupId: "",
            }
        })
    }

    handleChange(event, key: "host" | "username" | "token" | "gitHubOrgId" | "gitLabGroupId"): void {
        let errorKey = (key === 'gitHubOrgId' || key === 'gitLabGroupId') ? 'org' : '';

        this.setState({
            form: {
                ...this.state.form,
                [key]: event.target.value,
            },
        })
    }

    onSave() {
        let { username, token, gitHubOrgId, gitLabGroupId } = this.state.isError;
        let isValid = username?.length === 0 && token?.length === 0;

        this.setState({ saveLoading: true });
        let payload = {
            id: this.state.form.id,
            provider: this.state.form.provider.toUpperCase(),
            username: this.state.form.username,
            host: this.state.form.host,
            token: this.state.form.token,
            gitLabGroupId: this.state.form.gitLabGroupId,
            gitHubOrgId: this.state.form.gitHubOrgId,
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
        let key: "gitHubOrgId" | "gitLabGroupId" = this.state.tab === GitProvider.Github ? 'gitHubOrgId' : 'gitLabGroupId';
        if (this.state.view === ViewType.LOADING) return <div>
            <Progressing pageLoader />
        </div>
        else if(this.state.view === ViewType.ERROR) {
            return <div className="flex" style={{height: "calc(100vh - 80px)"}}>
                <ErrorScreenManager code={this.state.statusCode} />
            </div>
        }
        return <section className="git-page">
            <h2 className="form__title">GitOps</h2>
            <h5 className="form__subtitle">Devtron uses GitOps configuration to store kubernetes configuration files of applications.</h5>
            <div className="bcn-0 bw-1 en-2 br-8 pb-22 pr-20">
                <div className="login__sso-flex">
                    <div>
                        <label className="tertiary-tab__radio">
                            <input type="radio" name="status" value={GitProvider.GitLab} checked={this.state.tab === "gitlab"} onClick={this.handleGitopsTab} />
                            <span className="tertiary-tab sso-icons">
                                <aside className="login__icon-alignment"><GitLab /></aside>
                                <aside className="login__text-alignment"> GitLab</aside>
                                <label>
                                    {this.state.lastActiveGitOp?.provider?.toLocaleLowerCase() == "gitlab" ? <aside className="login__check-icon"><img src={Check} /></aside> : ""}
                                </label>
                            </span>
                        </label>
                    </div>
                    <div>
                        <label className="tertiary-tab__radio">
                            <input type="radio" name="status" value={GitProvider.Github} checked={this.state.tab === "github"} onClick={this.handleGitopsTab} />
                            <span className="tertiary-tab sso-icons">
                                <aside className="login__icon-alignment"><GitHub /></aside>
                                <aside className="login__text-alignment"> GitHub</aside>
                                <label>
                                    {this.state.lastActiveGitOp?.provider?.toLocaleLowerCase() == "github" ? <aside className="login__check-icon"><img src={Check} /></aside> : ""}
                                </label>
                            </span>
                        </label>
                    </div>
                </div>
                <div className="flex column left top pl-20">
                    <div className="gitops__id fw-5 fs-13 mb-8">Git Host*</div>
                    <input value={this.state.form.host} type="text" name="githost" className="form__input"
                        onChange={(event) => this.handleChange(event, 'host')} />
                </div>
                <div className="flex column left top pt-16 pl-20 pb-6">
                    <div className="gitops__id fw-5 fs-13 mb-8">
                        {this.state.tab === GitProvider.Github ? "GitHub Organisation ID" : "GitLab Group ID"}
                    </div>
                    <input value={this.state.form[key]} type="text" name="gitorg" className="form__input"
                        onChange={(event) => { this.handleChange(event, key); }} />
                </div>
                <div className="pl-20"><hr /></div>
                <div className="fw-6 cn-9 fs-14 pl-20">Git access credentials</div>
                <form className="pl-20 ">
                    <div className="form__row--two-third pt-16 gitops__id mb-20 fs-13 ">
                        <CustomInput value={this.state.form.username} onChange={(event) => this.handleChange(event, 'username')} name="Enter username" error={""}
                            label={this.state.tab === GitProvider.Github ? "GithHub Username*" : "GitLab Username*"}
                            labelClassName="gitops__id form__label--fs-13 fw-5 fs-13" />
                        <ProtectedInput value={this.state.form.token} onChange={(event) => this.handleChange(event, 'token')} name="Enter token" error={""}
                            label={this.state.tab === GitProvider.Github ? "GitHub Token*" : "GitLab Token*"} labelClassName="gitops__id form__label--fs-13 mb-8 fw-5 fs-13" />
                    </div>
                    <div className="form__buttons">
                        <button type="submit" disabled={this.state.saveLoading} onClick={(e) => { e.preventDefault(); this.onSave() }} tabIndex={5} className="cta">
                            {this.state.saveLoading ? <Progressing /> : "Save"}
                        </button>
                    </div>
                </form>
            </div>
        </section>
    }

}