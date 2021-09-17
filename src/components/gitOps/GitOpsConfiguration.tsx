import React, { Component } from "react";
import { ViewType, DOCUMENTATION } from '../../config'
import { GitOpsState, GitOpsProps, GitOpsConfig, GitOpsFieldKeyType, GitOpsOrganisationIdType } from './gitops.type'
import { ProtectedInput } from '../globalConfigurations/GlobalConfiguration'
import { ReactComponent as GitLab } from '../../assets/icons/git/gitlab.svg';
import { ReactComponent as GitHub } from '../../assets/icons/git/github.svg';
import { ReactComponent as Azure } from '../../assets/icons/git/azure.svg';
import { CustomInput, ErrorScreenManager, Progressing, showError } from '../common';
import Check from '../../assets/icons/ic-outline-check.svg';
import { ReactComponent as Info } from '../../assets/icons/ic-info-filled-purple.svg';
import { toast } from 'react-toastify';
import { updateGitOpsConfiguration, saveGitOpsConfiguration, getGitOpsConfigurationList, validateGitOpsConfiguration } from './gitops.service';
import { GlobalConfigCheckList } from '../checkList/GlobalConfigCheckList';
import '../login/login.css';
import './gitops.css';
import { withRouter } from 'react-router-dom'
import { ValidateForm, ValidateLoading, ValidationSuccess, ValidateFailure, VALIDATION_STATUS, ValidatingForm } from '../common/ValidateForm/ValidateForm';

enum GitProvider {
    GITLAB = 'GITLAB',
    GITHUB = 'GITHUB',
    AZURE_DEVOPS = 'AZURE_DEVOPS'
};

const GitHost = {
    GITHUB: "https://github.com/",
    GITLAB: "https://gitlab.com/",
    AZURE_DEVOPS: 'https://dev.azure.com/'
}

const GitLink = {
    GITHUB: "https://docs.github.com/en/organizations/collaborating-with-groups-in-organizations/creating-a-new-organization-from-scratch",
    GITLAB: "https://docs.gitlab.com/ee/user/group/#create-a-group",
    AZURE_DEVOPS: 'https://docs.microsoft.com/en-us/azure/devops/organizations/projects/create-project?view=azure-devops&tabs=preview-page#create-a-project'
}

const AccessTokenLink = {
    AccessLink: "https://docs.devtron.ai/user-guide/global-configurations/gitops#3-git-access-credential",
}
const DefaultGitOpsConfig = {
    id: undefined,
    provider: GitProvider.GITHUB,
    host: "",
    token: "",
    username: "",
    gitLabGroupId: "",
    gitHubOrgId: "",
    azureProjectName: "",
    active: true,
}

const GitProviderTabIcons: React.FC<{ gitops: string }> = ({ gitops }) => {
    switch (gitops) {
        case "GitHub": return <GitHub />
        case "GitLab": return <GitLab />
        case "Azure": return <Azure />
    }
}

const GitProviderTab: React.FC<{ tab: string; handleGitopsTab: (e) => void; lastActiveGitOp: undefined | GitOpsConfig; provider: string; gitops: string, validationLoading: boolean }> = ({ tab, handleGitopsTab, lastActiveGitOp, provider, gitops, validationLoading }) => {
    return <label className="tertiary-tab__radio">
        <input type="radio" name="status" value={provider} checked={tab === provider} onChange={!validationLoading && handleGitopsTab} />
        <span className="tertiary-tab sso-icons">
            <aside className="login__icon-alignment"><GitProviderTabIcons gitops={gitops} /></aside>
            <aside className="login__text-alignment"> {gitops}</aside>
            <div>
                {(lastActiveGitOp?.provider === provider) ? <aside className="login__check-icon"><img src={Check} /></aside> : ""}
            </div>
        </span>
    </label>
}


const GitInfoTab: React.FC<{ tab: string, gitLink: string, title: string }> = ({ tab, gitLink, title }) => {
    return <div className="git_impt pt-10 pb-10 pl-16 pr-16 br-4 bw-1 bcv-1 flexbox-col mb-16">
        <div className="flex left ">
            <Info className="icon-dim-20" style={{ marginTop: 1 }} />
            <div className="ml-8 fs-13">
                <span className="fw-6 text-capitalize">Important: </span>Please create a new <span className="text-lowercase">{tab.split("_", 1)}</span> Group for gitops. Do not use GitLab Group containing your source code.
       </div>
        </div>
        <a target="_blank" href={gitLink} className="ml-28 cursor fs-13 onlink">How to create {title} ?</a>
    </div>
}

class GitOpsConfiguration extends Component<GitOpsProps, GitOpsState> {

    constructor(props) {
        super(props)
        this.state = {
            view: ViewType.LOADING,
            statusCode: 0,
            gitList: [],
            saveLoading: false,
            tab: GitProvider.GITHUB,
            lastActiveGitOp: undefined,
            form: {
                ...DefaultGitOpsConfig,
                host: GitHost.GITHUB,
                provider: GitProvider.GITHUB,
            },
            isFormEdited: false,
            isError: {
                host: "",
                username: "",
                token: "",
                gitHubOrgId: "",
                gitLabGroupId: "",
                azureProjectName: ""
            },
            validatedTime: "",
            validationError: [],
            validateLoading: false,
            validationStatus: VALIDATION_STATUS.DRY_RUN || VALIDATION_STATUS.FAILURE || VALIDATION_STATUS.LOADER || VALIDATION_STATUS.SUCCESS
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
                    provider: GitProvider.GITHUB,
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
            validationStatus:VALIDATION_STATUS.SUCCESS,
        })
    }

    handleChange(event, key: GitOpsFieldKeyType): void {
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
            azureProjectName: ""
        }

        let isError = {
            host: form.host.length ? "" : "This is a required field",
            username: form.username.length ? "" : "This is a required field",
            token: form.token.length ? "" : "This is a required field",
            gitHubOrgId: form.gitHubOrgId.length ? "" : "This is a required field",
            gitLabGroupId: form.gitLabGroupId.length ? "" : "This is a required field",
            azureProjectName: form.azureProjectName.length ? "" : "This is a required field"
        };
        return isError;
    }

    isInvalid() {
        let isError = this.state.isError;
        if (!this.state.isFormEdited) {
            isError = this.getFormErrors(true, this.state.form);
            this.setState({
                isError,
                isFormEdited: true
            })
        }

        let isInvalid = isError.host?.length > 0 || isError.username?.length > 0 || isError.token?.length > 0;
        if (this.state.tab === GitProvider.GITHUB) {
            isInvalid = isInvalid || isError.gitHubOrgId?.length > 0
        }
        else if ((this.state.tab === GitProvider.GITLAB)) {
            isInvalid = isInvalid || isError.gitLabGroupId?.length > 0
        }
        else {
            isInvalid = isInvalid || isError.azureProjectName?.length > 0
        }

        return isInvalid;
    }

    saveGitOps() {
        let isInvalid = this.isInvalid();
        if (isInvalid) {
            toast.error("Some Required Fields are missing");
            return;
        }
        this.setState({ validationStatus: VALIDATION_STATUS.LOADER, saveLoading:true,  validateLoading: true });
        let payload = {
            id: this.state.form.id,
            provider: this.state.form.provider,
            username: this.state.form.username,
            host: this.state.form.host,
            token: this.state.form.token,
            gitLabGroupId: this.state.form.gitLabGroupId,
            gitHubOrgId: this.state.form.gitHubOrgId,
            azureProjectName: this.state.form.azureProjectName,
            active: true,
        }
        let promise = payload.id ? updateGitOpsConfiguration(payload) : saveGitOpsConfiguration(payload);
        promise.then((response) => {
            let resp = response.result
            if (resp.active) {
                toast.success("Configuration validated and saved successfully");
                this.setState({ validationStatus: VALIDATION_STATUS.SUCCESS ,saveLoading: false, isFormEdited: false });
                this.fetchGitOpsConfigurationList();
            } else {
                this.setState({ validationStatus: VALIDATION_STATUS.FAILURE, isFormEdited: false, saveLoading: false, validationError: resp.stageErrorMap || [] , validateLoading: false,})
                toast.error("Configuration validation failed");
            }
        }).catch((error) => {
            showError(error);
            this.setState({ view: ViewType.ERROR, statusCode: error.code, saveLoading: false });
        })
    }

    validateGitOps(tab) {
        let isInvalid = this.isInvalid();
        if (isInvalid) {
            toast.error("Some Required Fields are missing");
            return;
        }
        this.setState({ validationStatus: VALIDATION_STATUS.LOADER, saveLoading:true,  validateLoading: true, });
        let payload = {
            id: this.state.form.id,
            provider: this.state.form.provider,
            username: this.state.form.username,
            host: this.state.form.host,
            token: this.state.form.token,
            gitLabGroupId: this.state.form.gitLabGroupId,
            gitHubOrgId: this.state.form.gitHubOrgId,
            azureProjectName: this.state.form.azureProjectName,
            active: true,
        }
        let promise = validateGitOpsConfiguration(payload);
        promise.then((response) => {
            let resp = response.result
            let validate = resp.successfulStages ? resp.successfulStages : []
            if (validate != null && validate.length > 0) {
                this.setState({ validationStatus: VALIDATION_STATUS.SUCCESS, isFormEdited: false });

                toast.success("Configuration validated");
            } else {
                this.setState({ validationStatus: VALIDATION_STATUS.FAILURE, isFormEdited: false, validationError: resp.stageErrorMap || [] , validateLoading: false,})
                toast.error("Configuration validation failed");
            }
        }).catch((error) => {
            showError(error);
            this.setState({ view: ViewType.ERROR, statusCode: error.code});
        })
    }

    getGitOpsOrgId = () => {
        if (this.state.tab === GitProvider.GITLAB) {
            return 'gitLabGroupId'
        }
        else if (this.state.tab === GitProvider.AZURE_DEVOPS) {
            return 'azureProjectName'
        }
        else {
            return 'gitHubOrgId'
        }
    }

    render() {
        let key: GitOpsOrganisationIdType = this.getGitOpsOrgId();
        if (this.state.view === ViewType.LOADING) {
            return <Progressing pageLoader />
        }
        else if (this.state.view === ViewType.ERROR) {
            return <div className="global-configuration__component flex">
                <ErrorScreenManager code={this.state.statusCode} />
            </div>
        }
        return <section className="mt-16 mb-16 ml-20 mr-20 global-configuration__component flex-1">
            <h2 className="form__title">GitOps</h2>
            <p className="form__subtitle">Devtron uses GitOps configuration to store kubernetes configuration files of applications.
            <span><a rel="noreferrer noopener" target="_blank" className="learn-more__href" href={DOCUMENTATION.GLOBAL_CONFIG_GITOPS}> Learn more about GitOps </a> </span></p>
            <form className="bcn-0 bw-1 en-2 br-8 pb-22 pl-20 pr-20" autoComplete="off">
                <div className="login__sso-flex">
                    <GitProviderTab tab={this.state.tab} handleGitopsTab={this.handleGitopsTab} lastActiveGitOp={this.state.lastActiveGitOp} provider={GitProvider.GITHUB} gitops="GitHub" validationLoading={this.state.validateLoading} />
                    <GitProviderTab tab={this.state.tab} handleGitopsTab={this.handleGitopsTab} lastActiveGitOp={this.state.lastActiveGitOp} provider={GitProvider.GITLAB} gitops="GitLab" validationLoading={this.state.validateLoading} />
                    <GitProviderTab tab={this.state.tab} handleGitopsTab={this.handleGitopsTab} lastActiveGitOp={this.state.lastActiveGitOp} provider={GitProvider.AZURE_DEVOPS} gitops="Azure" validationLoading={this.state.validateLoading} />
                </div>
                <GitInfoTab
                    tab={this.state.tab}
                    gitLink={this.state.tab === GitProvider.GITLAB ? GitLink.GITLAB : this.state.tab === GitProvider.AZURE_DEVOPS ? GitLink.AZURE_DEVOPS : GitLink.GITHUB}
                    title={this.state.tab === GitProvider.GITLAB ? "group in GitLab" : this.state.tab === GitProvider.AZURE_DEVOPS ? "project in Azure" : "organization in GithHub"}
                />
                {/* {this.state.form.id && this.state.validateFailure != true && this.state.validateSuccess != true && this.state.validateLoading != true &&
                    <ValidateForm onClickValidate={() => this.validateGitOps(this.state.tab)} configName="gitops"/>}
                {this.state.validateLoading &&
                    <ValidateLoading message="Validating GitOps configuration. Please wait… " />}
                {this.state.validateFailure && this.state.validateLoading != true &&
                    <ValidateFailure validatedTime={this.state.validatedTime} validationError={this.state.validationError} onClickValidate={() => this.validateGitOps(this.state.tab)} formId={this.state.form.id} />}
                {this.state.validateSuccess && this.state.validateLoading != true &&
                    <ValidationSuccess onClickValidate={() => this.validateGitOps(this.state.tab)} />} */}
                < ValidatingForm
                    id={this.state.form.id}
                    onClickValidate={() => this.validateGitOps(this.state.tab)}
                    validationError={this.state.validationError}
                    isChartRepo={true}
                    validationStatus={this.state.validationStatus}
                    configName="gitops "
                />

                <CustomInput autoComplete="off"
                    value={this.state.form.host}
                    onChange={(event) => this.handleChange(event, 'host')}
                    name="Enter host"
                    error={this.state.isError.host}
                    label={this.state.tab === GitProvider.AZURE_DEVOPS ? "Azure DevOps Organisation Url*" : "Git Host*"}
                    tabIndex={1}
                    labelClassName="gitops__id form__label--fs-13 fw-5 fs-13 mb-4" />
                <div className="mt-16">
                    <CustomInput autoComplete="off" value={this.state.form[key]}
                        tabIndex={2}
                        error={this.state.isError[key]}
                        showLink={true}
                        link={this.state.tab === GitProvider.GITLAB ? GitLink.GITLAB : this.state.tab === GitProvider.AZURE_DEVOPS ? GitLink.AZURE_DEVOPS : GitLink.GITHUB}
                        linkText={this.state.tab === GitProvider.GITLAB ? "(How to create group in GitLab?)" : this.state.tab === GitProvider.AZURE_DEVOPS ? "(How to create project in Azure?)" : "(How to create organization in GithHub?)"}
                        label={this.state.tab === GitProvider.GITLAB ? "GitLab Group ID*" : this.state.tab === GitProvider.AZURE_DEVOPS ? "Azure DevOps Project Name*" : "GitHub Organisation Name*"}
                        onChange={(event) => { this.handleChange(event, key); }}
                        labelClassName="gitops__id form__label--fs-13 fw-5 fs-13" />
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
                            label={this.state.tab === GitProvider.GITLAB ? "GitLab Username*" : this.state.tab === GitProvider.AZURE_DEVOPS ? "Azure DevOps Username*" : "GithHub Username*"}
                            labelClassName="gitops__id form__label--fs-13 fw-5 fs-13" />
                    </div>
                    <div>
                        <span className={this.state.tab === GitProvider.AZURE_DEVOPS ? "azure_access_token" : "access_token"}>
                            <a target="_blank" href={AccessTokenLink.AccessLink} className="cursor fs-13 onlink">(Check permissions required for PAT)</a>
                        </span>
                        <ProtectedInput value={this.state.form.token}
                            onChange={(event) => this.handleChange(event, 'token')}
                            name="Enter token"
                            tabIndex={4}
                            error={this.state.isError.token}
                            label={this.state.tab === GitProvider.AZURE_DEVOPS ? "Azure DevOps Access Token*" : "Personal Access Token*"}
                            labelClassName="gitops__id form__label--fs-13 mb-8 fw-5 fs-13" />
                    </div>
                </div>

                <div className="form__buttons">
                    <button type="submit" disabled={this.state.saveLoading} onClick={(e) => { e.preventDefault(); this.saveGitOps() }} tabIndex={5} className="cta">
                        {this.state.saveLoading ? <Progressing /> : "Save"}
                    </button>
                </div>
            </form>
        </section>
    }
}

export default withRouter(GitOpsConfiguration);