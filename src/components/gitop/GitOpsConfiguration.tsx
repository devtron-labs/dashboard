import React, { Component } from "react";
import { ViewType } from '../../config'
import { GitOpsState, GitOpsProps } from './gitops.type'
import { CustomInput, ProtectedInput } from '../globalConfigurations/GlobalConfiguration'
import { ReactComponent as GitLab } from '../../assets/icons/git/gitlab.svg';
import { ReactComponent as GitHub } from '../../assets/icons/git/github.svg';
import { Progressing, showError } from '../common';
import { toast } from 'react-toastify';
import { updateGitOpsConfiguration, saveGitOpsConfiguration } from './gitops.service'
import { getGitOpsConfigurationList } from '../../services/service';
import '../login/login.css';
import './gitops.css';

const SwitchGitItemValues = {
    GitLab: 'gitlab',
    Github: 'github',
};

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
            tab: SwitchGitItemValues.GitLab,
            form: {
                ...DefaultGitOpsConfig,
                host: SwitchGitItemValues.Github,
            }
        }
        this.handleGitopsTab = this.handleGitopsTab.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount() {
        getGitOpsConfigurationList().then((response) => {
            let form = response.result.find(item => item.active);
            if (!form) {
                form = {
                    ...DefaultGitOpsConfig,
                    host: this.state.tab === SwitchGitItemValues.Github ? "github" : "gitlab",
                }
            }

            this.setState({
                gitList: response.result || [],
                view: ViewType.FORM,
                tab: form.provider,
                form: form
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
                host: newGitOps === SwitchGitItemValues.Github ? "github" : "gitlab",
                provider: newGitOps === SwitchGitItemValues.Github ? "github" : "gitlab",
            }
        };
        this.setState({
            tab: newGitOps,
            form: form
        })
    }

    handleChange(event, key): void {
        this.setState({
            form: {
                ...this.state.form,
                [key]: event.target.value,
            }
        })
    }

    onSave() {
        this.setState({ saveLoading: true });
        let payload = {
            id: this.state.form.id,
            provider: this.state.form.provider,
            username: this.state.form.username,
            host: this.state.form.host,
            token: this.state.form.token,
            gitLabGroupId: this.state.form.gitLabGroupId,
            gitHubOrgId: this.state.form.gitHubOrgId,
            active: true,
        }
        let promise = payload.id ? updateGitOpsConfiguration(payload) : saveGitOpsConfiguration(payload);
        promise.then((response) => {
            let form = response.result;
            this.setState({
                view: ViewType.FORM,
                form: {
                    id: form.id,
                    provider: form.provider,
                    username: form.username,
                    token: form.token,
                    gitLabGroupId: form.gitLabGroupId,
                    gitHubOrgId: form.gitHubOrgId,
                    host: form.host,
                    active: true
                },
                saveLoading: false
            });
            toast.success("Saved Successful");
        }).catch((error) => {
            showError(error);
            this.setState({ view: ViewType.ERROR, statusCode: error.code, saveLoading: false });
        })
    }

    render() {
        let key = this.state.tab === SwitchGitItemValues.Github ? 'gitHubOrgId' : 'gitLabGroupId';
        if (this.state.view === ViewType.LOADING) return <div>
            <Progressing pageLoader />
        </div>
        return <section className="git-page">
            <h2 className="form__title">GitOps configuration</h2>
            <h5 className="form__subtitle"></h5>
            <div className="bcn-0 bw-1 en-2 br-8 pb-22 pr-20">
                <div className="login__sso-flex">
                    <div>
                        <label className="tertiary-tab__radio ">
                            <input type="radio" name="status" value={SwitchGitItemValues.GitLab} checked={this.state.tab === "gitlab"} onClick={this.handleGitopsTab} />
                            <span className="tertiary-tab sso-icons">
                                <aside className="login__icon-alignment"><GitLab /></aside>
                                <aside className="login__text-alignment"> GitLab</aside>
                            </span>
                        </label>
                    </div>
                    <div>
                        <label className="tertiary-tab__radio ">
                            <input type="radio" name="status" value={SwitchGitItemValues.Github} checked={this.state.tab === "github"} onClick={this.handleGitopsTab} />
                            <span className="tertiary-tab sso-icons">
                                <aside className="login__icon-alignment"><GitHub /></aside>
                                <aside className="login__text-alignment"> GitHub</aside>
                            </span>
                        </label>
                    </div>
                </div>
                <div className="flex column left top pl-20">
                    <div className="gitops__id fw-5 fs-13 mb-8">Git host*</div>
                    <input value={this.state.form.host} type="text" name="githost" className="form__input"
                        onChange={(event) => this.handleChange(event, 'host')} />
                </div>
                <div className="flex column left top pt-16 pl-20 pb-6">
                    <div className="gitops__id fw-5 fs-13 mb-8">GitLab organisation ID*</div>
                    <input value={this.state.form[key]} type="text" name="gitorg" className="form__input"
                        onChange={(event) => { this.handleChange(event, key); }} />
                </div>
                <div className="pl-20"><hr /></div>
                <div className="fw-6 cn-9 fs-14 pl-20">Git access credentials</div>
                <form className="pl-20 pr-20">
                    <div className="form__row--two-third pt-16 gitops__id mb-20 fs-13 ">
                        <CustomInput value={this.state.form.username} onChange={(event) => this.handleChange(event, 'username')} name="Enter username" error={""} label="GitLab username*" labelClassName="gitops__id form__label--fs-13 fw-5 fs-13" />
                        <ProtectedInput value={this.state.form.token} onChange={(event) => this.handleChange(event, 'token')} name="Enter token" error={""} label="GitLab token*" labelClassName="gitops__id form__label--fs-13 mb-8 fw-5 fs-13" />
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