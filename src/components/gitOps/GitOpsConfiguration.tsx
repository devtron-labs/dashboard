import React, { Component } from 'react'
import { toast } from 'react-toastify'
import { withRouter } from 'react-router-dom'
import {
    showError,
    Progressing,
    ErrorScreenManager,
    RadioGroup,
    RadioGroupItem,
    CustomInput,
} from '@devtron-labs/devtron-fe-common-lib'
import { ViewType, DOCUMENTATION, repoType, DEFAULT_SECRET_PLACEHOLDER } from '../../config'
import {
    GitOpsState,
    GitOpsProps,
    GitOpsConfig,
    GitOpsFieldKeyType,
    GitOpsOrganisationIdType,
    GitProvider,
} from './gitops.type'
import { ReactComponent as GitLab } from '../../assets/icons/git/gitlab.svg'
import { ReactComponent as GitHub } from '../../assets/icons/git/github.svg'
import { ReactComponent as Azure } from '../../assets/icons/git/azure.svg'
import { handleOnFocus, parsePassword } from '../common'
import Check from '../../assets/icons/ic-outline-check.svg'
import { ReactComponent as Info } from '../../assets/icons/ic-info-filled-purple.svg'
import { ReactComponent as InfoFill } from '../../assets/icons/appstatus/info-filled.svg'
import {
    updateGitOpsConfiguration,
    saveGitOpsConfiguration,
    getGitOpsConfigurationList,
    validateGitOpsConfiguration,
} from './gitops.service'
import '../login/login.scss'
import './gitops.scss'
import { VALIDATION_STATUS, ValidateForm } from '../common/ValidateForm/ValidateForm'
import { ReactComponent as Bitbucket } from '../../assets/icons/git/bitbucket.svg'
import { ReactComponent as Error } from '../../assets/icons/ic-warning.svg'
import { GITOPS_FQDN_MESSAGE, GITOPS_HTTP_MESSAGE } from '../../config/constantMessaging'
import { GitHost, ShortGitHosts, GitLink, DefaultGitOpsConfig, DefaultShortGitOps, LinkAndLabelSpec } from './constants'

const GitProviderTabIcons: React.FC<{ gitops: string }> = ({ gitops }) => {
    switch (gitops) {
        case 'GitHub':
            return <GitHub />
        case 'GitLab':
            return <GitLab />
        case 'Azure':
            return <Azure />
        case 'Bitbucket Cloud':
            return <Bitbucket />
    }
}

const GitProviderTab: React.FC<{
    providerTab: string
    handleGitopsTab: (e) => void
    lastActiveGitOp: undefined | GitOpsConfig
    provider: string
    gitops: string
    saveLoading: boolean
    datatestid: string
}> = ({ providerTab, handleGitopsTab, lastActiveGitOp, provider, gitops, saveLoading, datatestid }) => {
    return (
        <label className="dc__tertiary-tab__radio">
            <input
                type="radio"
                name="status"
                value={provider}
                checked={providerTab === provider}
                onChange={!saveLoading && handleGitopsTab}
            />
            <span className="dc__tertiary-tab sso-icons" data-testid={datatestid}>
                <aside className="login__icon-alignment">
                    <GitProviderTabIcons gitops={gitops} />
                </aside>
                <aside className="login__text-alignment" style={{ lineHeight: 1.2 }}>
                    {gitops}
                </aside>
                {lastActiveGitOp?.provider === provider && (
                    <div>
                        <aside className="login__check-icon">
                            <img src={Check} />
                        </aside>
                    </div>
                )}
            </span>
        </label>
    )
}

const GitInfoTab: React.FC<{ tab: string; gitLink: string; gitProvider: string; gitProviderGroupAlias: string }> = ({
    tab,
    gitLink,
    gitProvider,
    gitProviderGroupAlias,
}) => {
    return (
        <div className="git_impt pt-10 pb-10 pl-16 pr-16 br-4 bw-1 bcv-1 flexbox-col mb-16">
            <div className="flex left ">
                <Info className="icon-dim-20" style={{ marginTop: 1 }} />
                <div className="ml-8 fs-13" data-testid="gitops-create-organisation-text">
                    <span className="fw-6 dc__capitalize">Recommended: </span>Create a new {gitProvider}{' '}
                    {gitProviderGroupAlias} for gitops. Avoid using {gitProvider} {gitProviderGroupAlias} containing
                    your source code.
                </div>
            </div>
            <a
                target="_blank"
                href={gitLink}
                className="ml-28 cursor fs-13 onlink"
                data-testid="gitops-create-organization-link"
                rel="noreferrer"
            >
                How to create {gitProviderGroupAlias} in {gitProvider} ?
            </a>
        </div>
    )
}

class GitOpsConfiguration extends Component<GitOpsProps, GitOpsState> {
    constructor(props) {
        super(props)
        this.state = {
            view: ViewType.LOADING,
            statusCode: 0,
            gitList: [],
            saveLoading: false,
            selectedRepoType: repoType.DEFAULT,
            validateLoading: false,
            allowCustomGitRepo: false,
            providerTab: GitProvider.GITHUB,
            lastActiveGitOp: undefined,
            form: {
                ...DefaultGitOpsConfig,
                ...DefaultShortGitOps,
                host: GitHost.GITHUB,
                provider: GitProvider.GITHUB,
            },
            isFormEdited: false,
            validationSkipped: false,
            isError: DefaultShortGitOps,
            validatedTime: '',
            validationError: [],
            validationStatus:
                VALIDATION_STATUS.DRY_RUN ||
                VALIDATION_STATUS.FAILURE ||
                VALIDATION_STATUS.LOADER ||
                VALIDATION_STATUS.SUCCESS,
            deleteRepoError: false,
            isUrlValidationError: false,
        }
        this.repoTypeChange = this.repoTypeChange.bind(this)
        this.handleGitopsTab = this.handleGitopsTab.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.fetchGitOpsConfigurationList = this.fetchGitOpsConfigurationList.bind(this)
    }

    componentDidMount() {
        this.fetchGitOpsConfigurationList()
    }

    fetchGitOpsConfigurationList() {
        getGitOpsConfigurationList()
            .then((response) => {
                const form = response.result?.find((item) => item.active) ?? {
                    ...DefaultGitOpsConfig,
                    ...DefaultShortGitOps,
                    host: GitHost[this.state.providerTab],
                    provider: GitProvider.GITHUB,
                }
                this.setState({
                    gitList: response.result || [],
                    saveLoading: false,
                    view: ViewType.FORM,
                    lastActiveGitOp: form,
                    providerTab: form.provider,
                    form: {
                        ...form,
                        token: form.id && form.token === '' ? DEFAULT_SECRET_PLACEHOLDER : form.token,
                    },
                    isError: DefaultShortGitOps,
                    isFormEdited: false,
                    allowCustomGitRepo: form.allowCustomRepository,
                })
                if (this.state.allowCustomGitRepo) {
                    this.setState({ selectedRepoType: repoType.CONFIGURE })
                }
            })
            .catch((error) => {
                showError(error, true, true)
                this.setState({ view: ViewType.ERROR, statusCode: error.code })
            })
    }

    handleGitopsTab(event): void {
        if (this.state.saveLoading) {
            return
        }

        const newGitOps = event.target.value
        const form = this.state.gitList.find((item) => item.provider === newGitOps) ?? {
            ...DefaultGitOpsConfig,
            ...DefaultShortGitOps,
            host: GitHost[newGitOps],
            provider: newGitOps,
        }
        this.setState({
            providerTab: form.provider,
            form: {
                ...form,
                token: form.id && form.token === '' ? DEFAULT_SECRET_PLACEHOLDER : form.token,
            },
            isError: DefaultShortGitOps,
            isFormEdited: false,
            validationStatus: VALIDATION_STATUS.DRY_RUN,
            isUrlValidationError: false,
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
                [key]:
                    (key === 'token' && this.state.form.id) || event.target.value.length !== 0
                        ? ''
                        : 'This is a required field',
            },
            isFormEdited: false,
            // After entering any text,if GitOpsFieldKeyType is of type host then the url validation error must dissapear
            isUrlValidationError: key === 'host' ? false : this.state.isUrlValidationError,
        })
    }

    handleOnBlur = (event): void => {
        if (!event.target.value && this.state.form.id) {
            this.setState({
                form: {
                    ...this.state.form,
                    token: DEFAULT_SECRET_PLACEHOLDER,
                },
            })
        }
    }

    requiredFieldCheck(formValueType: string): string {
        return formValueType.length ? '' : 'This is a required field'
    }

    getFormErrors(form: GitOpsConfig): any {
        return {
            host: this.requiredFieldCheck(form.host),
            username: this.requiredFieldCheck(form.username),
            token: this.state.form.id ? '' : this.requiredFieldCheck(form.token),
            gitHubOrgId: this.requiredFieldCheck(form.gitHubOrgId),
            gitLabGroupId: this.requiredFieldCheck(form.gitLabGroupId),
            azureProjectName: this.requiredFieldCheck(form.azureProjectName),
            bitBucketWorkspaceId: this.requiredFieldCheck(form.bitBucketWorkspaceId),
            bitBucketProjectKey: '',
        }
    }

    isInvalid() {
        let { isError } = this.state
        if (!this.state.isFormEdited) {
            isError = this.getFormErrors(this.state.form)
            this.setState({
                isError,
                isFormEdited: true,
            })
        }

        let _isInvalid = isError.host.length > 0 || isError.username.length > 0 || isError.token.length > 0
        if (!_isInvalid) {
            if (this.state.providerTab === GitProvider.GITHUB) {
                _isInvalid = isError.gitHubOrgId.length > 0
            } else if (this.state.providerTab === GitProvider.GITLAB) {
                _isInvalid = isError.gitLabGroupId.length > 0
            } else if (this.state.providerTab === GitProvider.BITBUCKET_CLOUD) {
                _isInvalid = isError.bitBucketWorkspaceId.length > 0
            } else {
                _isInvalid = isError.azureProjectName.length > 0
            }
        }

        return _isInvalid
    }

    suggestedValidGitOpsUrl() {
        for (const shortGitHost of ShortGitHosts) {
            if (this.state.form.host.indexOf(shortGitHost) >= 0) {
                return `https://${shortGitHost}/`
            }
        }
        return ''
    }

    isValidGitOpsUrl() {
        if (!this.state.form.host) {
            return true
        }

        let url: URL
        try {
            url = new URL(this.state.form.host)
        } catch (error) {
            return false
        }

        for (const shortGitHost of ShortGitHosts) {
            if (url.hostname.includes(shortGitHost)) {
                // Skipping the pathname length validation for Azure as there can be custom pathname of length 1 to n
                return (shortGitHost === 'dev.azure.com' || url.pathname.length === 1) && url.protocol === 'https:'
            }
        }

        return true
    }

    getPayload = () => {
        const payload = {
            id: this.state.form.id,
            provider: this.state.form.provider,
            username: this.state.form.username.replace(/\s/g, ''),
            host: this.state.form.host.replace(/\s/g, ''),
            token: parsePassword(this.state.form.token.replace(/\s/g, '')),
            gitLabGroupId: this.state.form.gitLabGroupId.replace(/\s/g, ''),
            gitHubOrgId: this.state.form.gitHubOrgId.replace(/\s/g, ''),
            azureProjectName: this.state.form.azureProjectName.replace(/\s/g, ''),
            bitBucketWorkspaceId: this.state.form.bitBucketWorkspaceId.replace(/\s/g, ''),
            bitBucketProjectKey: this.state.form.bitBucketProjectKey.replace(/\s/g, ''),
            allowCustomRepository: this.state.selectedRepoType === repoType.CONFIGURE,
            active: true,
        }
        return payload
    }

    saveGitOps() {
        if (this.isInvalid()) {
            toast.error('Some Required Fields are missing')
            return
        }

        const isValidGitOpsUrl = this.isValidGitOpsUrl()
        if (!isValidGitOpsUrl) {
            this.setState({
                isUrlValidationError: true,
                validationStatus: VALIDATION_STATUS.DRY_RUN,
                saveLoading: false,
                validateLoading: false,
            })
        } else {
            this.setState({
                isUrlValidationError: false,
                validationStatus: VALIDATION_STATUS.LOADER,
                saveLoading: true,
            })
            const payload = this.getPayload()
            const promise = payload.id ? updateGitOpsConfiguration(payload) : saveGitOpsConfiguration(payload)
            promise
                .then((response) => {
                    const resp = response.result
                    const errorMap = resp.stageErrorMap
                    if (errorMap == null || Object.keys(errorMap).length == 0) {
                        this.props.handleChecklistUpdate('gitOps')
                        toast.success('Configuration saved successfully')
                        this.setState({
                            validationStatus: !resp.validationSkipped ? VALIDATION_STATUS.SUCCESS : '',
                            saveLoading: false,
                            isFormEdited: false,
                            deleteRepoError: resp.deleteRepoFailed,
                            validationSkipped: resp.validationSkipped,
                        })
                        this.fetchGitOpsConfigurationList()
                    } else {
                        this.setState({
                            validationStatus: !resp.validationSkipped ? VALIDATION_STATUS.FAILURE : '',
                            saveLoading: false,
                            isFormEdited: false,
                            validationError: errorMap || [],
                            deleteRepoError: resp.deleteRepoFailed,
                            validationSkipped: resp.validationSkipped,
                        })
                        {
                            this.state.selectedRepoType === repoType.DEFAULT
                                ? toast.error('Configuration failed')
                                : toast.success('Configuration saved successfully')
                        }
                    }
                })
                .catch((error) => {
                    showError(error)
                    this.setState({ view: ViewType.ERROR, statusCode: error.code, saveLoading: false })
                })
        }
    }

    validateGitOps(tab) {
        if (this.isInvalid()) {
            toast.error('Some Required Fields are missing')
            return
        }

        if (!this.isValidGitOpsUrl()) {
            this.setState({
                isUrlValidationError: true,
                validationStatus: VALIDATION_STATUS.DRY_RUN,
                saveLoading: false,
                validateLoading: false,
            })
        } else {
            this.setState({
                isUrlValidationError: false,
                validationStatus: VALIDATION_STATUS.LOADER,
                saveLoading: true,
                validateLoading: true,
            })
            const payload = this.getPayload()
            validateGitOpsConfiguration(payload)
                .then((response) => {
                    const resp = response.result
                    const errorMap = resp.stageErrorMap
                    if (errorMap != null && Object.keys(errorMap).length > 0) {
                        this.setState({
                            validationStatus: VALIDATION_STATUS.FAILURE,
                            saveLoading: false,
                            validateLoading: false,
                            isFormEdited: false,
                            validationError: errorMap || [],
                            deleteRepoError: resp.deleteRepoFailed,
                            validationSkipped: resp.validationSkipped,
                        })
                        toast.error('Configuration validation failed')
                    } else {
                        this.setState({
                            validationStatus: VALIDATION_STATUS.SUCCESS,
                            saveLoading: false,
                            validateLoading: false,
                            isFormEdited: false,
                            deleteRepoError: resp.deleteRepoFailed,
                            validationSkipped: resp.validationSkipped,
                        })
                        toast.success('Configuration validated')
                    }
                })
                .catch((error) => {
                    showError(error)
                    this.setState({ view: ViewType.ERROR, statusCode: error.code })
                })
        }
    }

    getGitOpsOrgId = () => {
        if (this.state.providerTab === GitProvider.GITLAB) {
            return 'gitLabGroupId'
        }
        if (this.state.providerTab === GitProvider.AZURE_DEVOPS) {
            return 'azureProjectName'
        }
        if (this.state.providerTab === GitProvider.BITBUCKET_CLOUD) {
            return 'bitBucketProjectKey'
        }
        return 'gitHubOrgId'
    }

    updateGitopsUrl(value: string): void {
        this.setState((prevState) => {
            return {
                form: {
                    ...prevState.form,
                    host: value,
                },
                isUrlValidationError: false,
            }
        })
    }

    repoTypeChange() {
        if (this.state.selectedRepoType === repoType.DEFAULT) {
            this.setState({ selectedRepoType: repoType.CONFIGURE })
        } else {
            this.setState({ selectedRepoType: repoType.DEFAULT })
        }
    }

    render() {
        const suggestedURL = this.suggestedValidGitOpsUrl()
        const key: GitOpsOrganisationIdType = this.getGitOpsOrgId()
        const warning =
            'Devtron was unable to delete the test repository “devtron-sample-repo-dryrun-…”. Please delete it manually.'
        if (this.state.view === ViewType.LOADING) {
            return <Progressing pageLoader />
        }
        if (this.state.view === ViewType.ERROR) {
            return (
                <div className="global-configuration__component flex dc__align-reload-center">
                    <ErrorScreenManager code={this.state.statusCode} reloadClass="dc__align-reload-center" />
                </div>
            )
        }

        const getGitOpsLabel = () => {
            let label = ''
            if (this.state.providerTab === GitProvider.AZURE_DEVOPS) {
                label = 'Azure DevOps Organisation Url'
            } else if (this.state.providerTab === GitProvider.BITBUCKET_CLOUD) {
                label = 'Bitbucket Host'
            } else {
                label = 'Git Host'
            }

            return (
                <div className="form__label fw-5 fs-13 mb-4 flex">
                    <span className="dc__required-field">{label} </span>&nbsp;(Use https://)
                </div>
            )
        }

        const renderInputLabels = (label: string, link: string, linkText: string) => {
            return (
                <div className="flex">
                    <span className="dc__required-field">{label}</span>&nbsp;
                    <a target="_blank" href={link} className="cursor fs-13 onlink ml-4" rel="noreferrer">
                        {linkText}
                    </a>
                </div>
            )
        }

        return (
            <section className="global-configuration__component flex-1">
                <h2 className="form__title" data-testid="gitops-heading">
                    GitOps
                </h2>
                <p className="form__subtitle" data-testid="gitops-subheading">
                    Devtron uses GitOps configuration to store kubernetes configuration files of applications.
                    <span>
                        <a
                            rel="noreferrer noopener"
                            target="_blank"
                            className="dc__link"
                            href={DOCUMENTATION.GLOBAL_CONFIG_GITOPS}
                        >
                            &nbsp; Learn more about GitOps&nbsp;
                        </a>
                        &nbsp;
                    </span>
                </p>
                <form className="bcn-0 bw-1 en-2 br-8 pb-22 pl-20 pr-20" autoComplete="off">
                    <div className="login__sso-flex">
                        <GitProviderTab
                            providerTab={this.state.providerTab}
                            handleGitopsTab={this.handleGitopsTab}
                            lastActiveGitOp={this.state.lastActiveGitOp}
                            provider={GitProvider.GITHUB}
                            gitops="GitHub"
                            saveLoading={this.state.saveLoading}
                            datatestid="gitops-github-button"
                        />
                        <GitProviderTab
                            providerTab={this.state.providerTab}
                            handleGitopsTab={this.handleGitopsTab}
                            lastActiveGitOp={this.state.lastActiveGitOp}
                            provider={GitProvider.GITLAB}
                            gitops="GitLab"
                            saveLoading={this.state.saveLoading}
                            datatestid="gitops-gitlab-button"
                        />
                        <GitProviderTab
                            providerTab={this.state.providerTab}
                            handleGitopsTab={this.handleGitopsTab}
                            lastActiveGitOp={this.state.lastActiveGitOp}
                            provider={GitProvider.AZURE_DEVOPS}
                            gitops="Azure"
                            saveLoading={this.state.saveLoading}
                            datatestid="gitops-azure-button"
                        />
                        <GitProviderTab
                            providerTab={this.state.providerTab}
                            handleGitopsTab={this.handleGitopsTab}
                            lastActiveGitOp={this.state.lastActiveGitOp}
                            provider={GitProvider.BITBUCKET_CLOUD}
                            gitops="Bitbucket Cloud"
                            saveLoading={this.state.saveLoading}
                            datatestid="gitops-bitbucket-button"
                        />
                    </div>
                    <GitInfoTab
                        tab={this.state.providerTab}
                        gitLink={
                            this.state.providerTab === GitProvider.GITLAB
                                ? GitLink.GITLAB
                                : this.state.providerTab === GitProvider.AZURE_DEVOPS
                                  ? GitLink.AZURE_DEVOPS
                                  : this.state.providerTab === GitProvider.BITBUCKET_CLOUD
                                    ? GitLink.BITBUCKET_WORKSPACE
                                    : GitLink.GITHUB
                        }
                        gitProvider={
                            this.state.providerTab === GitProvider.GITLAB
                                ? 'GitLab'
                                : this.state.providerTab === GitProvider.AZURE_DEVOPS
                                  ? 'Azure'
                                  : this.state.providerTab === GitProvider.BITBUCKET_CLOUD
                                    ? 'BitBucket'
                                    : 'GitHub'
                        }
                        gitProviderGroupAlias={
                            this.state.providerTab === GitProvider.GITLAB
                                ? 'group'
                                : this.state.providerTab === GitProvider.AZURE_DEVOPS
                                  ? 'project'
                                  : this.state.providerTab === GitProvider.BITBUCKET_CLOUD
                                    ? 'workspace'
                                    : 'organization'
                        }
                    />

                    <ValidateForm
                        id={this.state.form.id}
                        onClickValidate={() => this.validateGitOps(this.state.providerTab)}
                        validationError={this.state.validationError}
                        validationStatus={this.state.validationStatus}
                        configName="gitops "
                        warning={this.state.deleteRepoError ? warning : ''}
                    />
                    <CustomInput
                        value={this.state.form.host}
                        onChange={(event) => this.handleChange(event, 'host')}
                        name="Enter host"
                        error={this.state.isError.host}
                        label={getGitOpsLabel()}
                        tabIndex={1}
                        labelClassName="gitops__id form__label--fs-13 fw-5 fs-13 mb-4"
                        dataTestid={
                            this.state.providerTab === GitProvider.AZURE_DEVOPS
                                ? 'gitops-azure-organisation-url-textbox'
                                : this.state.providerTab === GitProvider.BITBUCKET_CLOUD
                                  ? 'gitops-bitbucket-host-url-textbox'
                                  : 'gitops-github-gitlab-host-url-textbox'
                        }
                    />
                    {this.state.isUrlValidationError && this.state.form.host.length ? (
                        <div className="flex fs-12 left pt-4">
                            <div className="form__error mr-4">
                                <Error className="form__icon form__icon--error fs-13" />
                                {this.state.form.host.startsWith('http:') ? GITOPS_HTTP_MESSAGE : GITOPS_FQDN_MESSAGE}
                            </div>
                            {suggestedURL && (
                                <>
                                    Please Use:
                                    <button
                                        type="button"
                                        onClick={(e) => this.updateGitopsUrl(suggestedURL)}
                                        className="hosturl__url dc__no-border dc__no-background fw-4 cg-5"
                                    >
                                        {suggestedURL}
                                    </button>
                                </>
                            )}
                        </div>
                    ) : (
                        <></>
                    )}
                    <div className="mt-16 ">
                        {this.state.providerTab === GitProvider.BITBUCKET_CLOUD && (
                            <CustomInput
                                name="workspaceID"
                                label={renderInputLabels(
                                    'Bitbucket Workspace ID',
                                    GitLink.BITBUCKET_WORKSPACE,
                                    '(How to create workspace in bitbucket?)',
                                )}
                                value={this.state.form.bitBucketWorkspaceId}
                                onChange={(event) => this.handleChange(event, 'bitBucketWorkspaceId')}
                                error={this.state.isError.bitBucketWorkspaceId}
                                tabIndex={1}
                                labelClassName="gitops__id form__label--fs-13 fw-5 fs-13 mb-4"
                                dataTestid="gitops-bitbucket-workspace-id-textbox"
                                isRequiredField
                            />
                        )}
                    </div>
                    <div className="mt-16">
                        <CustomInput
                            name="groupID"
                            label={renderInputLabels(
                                LinkAndLabelSpec[this.state.providerTab]['label'],
                                LinkAndLabelSpec[this.state.providerTab]['link'],
                                LinkAndLabelSpec[this.state.providerTab]['linkText'],
                            )}
                            value={this.state.form[key]}
                            tabIndex={2}
                            error={this.state.isError[key]}
                            onChange={(event) => {
                                this.handleChange(event, key)
                            }}
                            labelClassName="gitops__id form__label--fs-13 fw-5 fs-13"
                            dataTestid={
                                this.state.providerTab === GitProvider.AZURE_DEVOPS
                                    ? 'gitops-azure-project-name-textbox'
                                    : this.state.providerTab === GitProvider.BITBUCKET_CLOUD
                                      ? 'gitops-bitbucket-project-textbox'
                                      : this.state.providerTab === GitProvider.GITLAB
                                        ? 'gitops-gitlab-group-id-textbox'
                                        : 'gitops-github-organisation-name-textbox'
                            }
                            isRequiredField
                        />
                    </div>
                    {this.state.providerTab === GitProvider.BITBUCKET_CLOUD && (
                        <div className="mt-4 flex left" data-testid="gitops-bitbucket-project-id">
                            <InfoFill className="icon-dim-16" />
                            <span className="ml-4 fs-11">
                                If the project is not provided, the repository is automatically assigned to the oldest
                                project in the workspace.
                            </span>
                        </div>
                    )}
                    <hr />
                    <div className="fw-6 cn-9 fs-14 mb-16" data-testid="gitops-gitaccess-credentials-heading">
                        Git access credentials
                    </div>

                    <div className="form__row--two-third gitops__id mb-20 fs-13">
                        <div>
                            <CustomInput
                                value={this.state.form.username}
                                onChange={(event) => this.handleChange(event, 'username')}
                                name="Enter username"
                                error={this.state.isError.username}
                                tabIndex={3}
                                label={
                                    this.state.providerTab === GitProvider.GITLAB
                                        ? 'GitLab Username'
                                        : this.state.providerTab === GitProvider.AZURE_DEVOPS
                                          ? 'Azure DevOps Username'
                                          : this.state.providerTab === GitProvider.BITBUCKET_CLOUD
                                            ? 'Bitbucket Username'
                                            : 'GitHub Username'
                                }
                                labelClassName="gitops__id form__label--fs-13 fw-5 fs-13"
                                dataTestid={
                                    this.state.providerTab === GitProvider.AZURE_DEVOPS
                                        ? 'gitops-azure-username-textbox'
                                        : this.state.providerTab === GitProvider.BITBUCKET_CLOUD
                                          ? 'gitops-bitbucket-username-textbox'
                                          : this.state.providerTab === GitProvider.GITLAB
                                            ? 'gitops-gitlab-username-textbox'
                                            : 'gitops-github-username-textbox'
                                }
                                isRequiredField
                            />
                        </div>
                        <div>
                            <CustomInput
                                name="token"
                                label={renderInputLabels(
                                    this.state.providerTab === GitProvider.AZURE_DEVOPS
                                        ? 'Azure DevOps Access Token '
                                        : 'Personal Access Token ',
                                    DOCUMENTATION.GLOBAL_CONFIG_GIT_ACCESS_LINK,
                                    '(Check permissions required for PAT)',
                                )}
                                value={this.state.form.token}
                                onChange={(event) => this.handleChange(event, 'token')}
                                tabIndex={4}
                                error={this.state.isError.token}
                                onFocus={handleOnFocus}
                                labelClassName="gitops__id form__label--fs-13 mb-8 fw-5 fs-13"
                                dataTestid={
                                    this.state.providerTab === GitProvider.AZURE_DEVOPS
                                        ? 'gitops-azure-pat-textbox'
                                        : this.state.providerTab === GitProvider.BITBUCKET_CLOUD
                                          ? 'gitops-bitbucket-pat-textbox'
                                          : this.state.providerTab === GitProvider.GITLAB
                                            ? 'gitops-gitlab-pat-textbox'
                                            : 'gitops-github-pat-textbox'
                                }
                                isRequiredField
                                handleOnBlur={this.handleOnBlur}
                            />
                        </div>
                    </div>
                    <hr />
                    <div>
                        <div className="form__row flex left">
                            <div className="fw-6 cn-9 fs-14 mb-16">Directory Managment in Git</div>
                            <RadioGroup
                                className="radio-group-no-border"
                                name="trigger-type"
                                value={this.state.selectedRepoType}
                                onChange={this.repoTypeChange}
                            >
                                <div>
                                    <RadioGroupItem value={repoType.DEFAULT}>
                                        Use default git repository structure
                                    </RadioGroupItem>
                                    <div className="ml-26 cn-7">
                                        Repository will be created automatically with application name. Users can't
                                        change default repository
                                    </div>
                                </div>
                                <div className="mt-10">
                                    <RadioGroupItem value={repoType.CONFIGURE}>
                                        Allow changing git repository for application
                                    </RadioGroupItem>
                                    <div className="ml-26 cn-7">
                                        Application admins can provide desired git repository
                                    </div>
                                </div>
                            </RadioGroup>
                        </div>
                        <hr />
                    </div>
                    <div className="form__buttons flex left">
                        <button
                            type="submit"
                            disabled={this.state.saveLoading}
                            onClick={(e) => {
                                e.preventDefault()
                                this.saveGitOps()
                            }}
                            data-testid="gitops-save-button"
                            tabIndex={5}
                            className={`cta ${this.state.saveLoading ? 'cursor-not-allowed' : ''}`}
                        >
                            {this.state.saveLoading && !this.state.validateLoading ? (
                                <Progressing />
                            ) : this.state.form.id ? (
                                'Update'
                            ) : (
                                'Save'
                            )}
                        </button>
                    </div>
                </form>
            </section>
        )
    }
}

export default withRouter(GitOpsConfiguration)
