/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { Component, Fragment, SyntheticEvent } from 'react'
import { toast } from 'react-toastify'
import { withRouter } from 'react-router-dom'
import {
    showError,
    Progressing,
    ErrorScreenManager,
    RadioGroup,
    RadioGroupItem,
    CustomInput,
    noop,
    InfoColourBar,
    GitOpsFieldKeyType,
    GitOpsAuthModeType,
    handleDisableSubmitOnEnter,
    DEFAULT_SECRET_PLACEHOLDER,
} from '@devtron-labs/devtron-fe-common-lib'
import { ViewType, DOCUMENTATION, repoType } from '../../config'
import {
    GitOpsState,
    GitOpsProps,
    GitOpsConfig,
    GitOpsOrganisationIdType,
    GitProvider,
    GitProviderTabProps,
} from './gitops.type'
import { handleOnFocus, importComponentFromFELibrary, parsePassword } from '../common'
import Check from '../../assets/icons/ic-selected-corner.png'
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
import { ReactComponent as Error } from '../../assets/icons/ic-warning.svg'
import { ReactComponent as ICInfoFilled } from '../../assets/icons/ic-info-filled.svg'
import { GITOPS_FQDN_MESSAGE, GITOPS_HTTP_MESSAGE } from '../../config/constantMessaging'
import {
    GitHost,
    ShortGitHosts,
    GitLink,
    DefaultGitOpsConfig,
    DefaultShortGitOps,
    LinkAndLabelSpec,
    DefaultErrorFields,
} from './constants'
import GitProviderTabIcons from './GitProviderTabIcons'
import { getProviderNameFromEnum } from './utils'
import UpdateConfirmationDialog from './UpdateConfirmationDialog'

const OtherGitOpsForm = importComponentFromFELibrary('OtherGitOpsForm', null, 'function')
const BitBucketDCCredentials = importComponentFromFELibrary('BitBucketDCCredentials', null, 'function')
const BitbucketCloudAndServerToggleSection = importComponentFromFELibrary(
    'BitbucketCloudAndServerToggleSection',
    null,
    'function',
)

const GitProviderTab: React.FC<GitProviderTabProps> = ({
    providerTab,
    handleGitopsTab,
    lastActiveGitOp,
    provider,
    saveLoading,
    datatestid,
}) => {
    const isBitbucketDC = lastActiveGitOp?.provider === 'BITBUCKET_DC' && provider === GitProvider.BITBUCKET_CLOUD
    const showCheck = lastActiveGitOp?.provider === provider || isBitbucketDC
    const displayName = getProviderNameFromEnum(provider, !!BitBucketDCCredentials)

    return (
        <label className="dc__tertiary-tab__radio">
            <input
                type="radio"
                name="status"
                value={provider}
                checked={providerTab === provider}
                onChange={!saveLoading ? handleGitopsTab : noop}
            />
            <span className={`dc__tertiary-tab sso-icons ${OtherGitOpsForm ? 'h-90' : ''}`} data-testid={datatestid}>
                <aside className="login__icon-alignment">
                    <GitProviderTabIcons provider={provider} />
                </aside>
                <aside className="login__text-alignment" style={{ lineHeight: 1.2 }}>
                    {displayName}
                </aside>
                {showCheck && (
                    <div>
                        <aside className="dc__position-abs dc__right-0 dc__top-0">
                            <img src={Check} className="h-32" alt="saved-provider-check" />
                        </aside>
                    </div>
                )}
            </span>
        </label>
    )
}

const GitInfoTab: React.FC<{ gitLink: string; gitProvider: string; gitProviderGroupAlias: string }> = ({
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
            // FIXME: Derived state can be removed later
            isBitbucketCloud: true,
            form: {
                ...DefaultGitOpsConfig,
                ...DefaultShortGitOps,
                host: GitHost.GITHUB,
                provider: GitProvider.GITHUB,
            },
            isFormEdited: false,
            validationSkipped: false,
            isError: DefaultErrorFields,
            validatedTime: '',
            validationError: [],
            validationStatus:
                VALIDATION_STATUS.DRY_RUN ||
                VALIDATION_STATUS.FAILURE ||
                VALIDATION_STATUS.LOADER ||
                VALIDATION_STATUS.SUCCESS,
            deleteRepoError: false,
            isUrlValidationError: false,
            showUpdateConfirmationDialog: false,
            initialBitBucketDCAuthMode: null,
            bitBucketDCDataStore: null,
        }
        this.repoTypeChange = this.repoTypeChange.bind(this)
        this.handleGitopsTab = this.handleGitopsTab.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.fetchGitOpsConfigurationList = this.fetchGitOpsConfigurationList.bind(this)
    }

    componentDidMount() {
        this.fetchGitOpsConfigurationList()
    }

    isAWSCodeCommitTabSelected = (overriddenProvider?: GitProvider): boolean => {
        if (overriddenProvider) {
            return overriddenProvider === GitProvider.AWS_CODE_COMMIT
        }

        return this.state.providerTab === GitProvider.AWS_CODE_COMMIT
    }

    getIsOtherGitOpsTabSelected = (overriddenProvider?: GitProvider): boolean => {
        if (overriddenProvider) {
            return overriddenProvider === GitProvider.OTHER_GIT_OPS
        }

        return this.state.providerTab === GitProvider.OTHER_GIT_OPS
    }

    // Fallback in case of create view we need this
    getIsAuthModeSSH = (overriddenProvider?: GitProvider): boolean =>
        this.isAWSCodeCommitTabSelected(overriddenProvider) || this.getIsOtherGitOpsTabSelected(overriddenProvider)

    fetchGitOpsConfigurationList() {
        getGitOpsConfigurationList()
            .then((response) => {
                const selectedProviderDetails = response.result?.find((item) => item.active) ?? {
                    ...DefaultGitOpsConfig,
                    ...DefaultShortGitOps,
                    host: GitHost[this.state.providerTab],
                    provider: GitProvider.GITHUB,
                }
                const availableProviders = [...Object.values(GitProvider), 'BITBUCKET_DC']
                const isSelectedProviderAvailable = availableProviders.includes(selectedProviderDetails.provider)

                // TODO: Ideally should be named as selected provider config
                const form = isSelectedProviderAvailable
                    ? selectedProviderDetails
                    : {
                          ...DefaultGitOpsConfig,
                          ...DefaultShortGitOps,
                          host: GitHost[this.state.providerTab],
                          provider: GitProvider.GITHUB,
                      }

                const bitbucketCloudConfig = response.result?.find(
                    (item) => item.provider === GitProvider.BITBUCKET_CLOUD,
                )
                const bitbucketDCConfig = response.result?.find((item) => item.provider === 'BITBUCKET_DC')
                // If bit bucket dc is configured and active or only dc is configured, then default to bitbucket dc else bitbucket cloud
                const isBitbucketCloud =
                    (!bitbucketCloudConfig && !bitbucketDCConfig) ||
                    (!bitbucketDCConfig?.active && !!bitbucketCloudConfig)

                const isAuthModeSSH = form.authMode === GitOpsAuthModeType.SSH
                const initialBitBucketDCAuthMode =
                    bitbucketDCConfig?.authMode === GitOpsAuthModeType.SSH_AND_PASSWORD
                        ? GitOpsAuthModeType.SSH_AND_PASSWORD
                        : GitOpsAuthModeType.PASSWORD

                const bitBucketDCDataStore: GitOpsState['bitBucketDCDataStore'] =
                    initialBitBucketDCAuthMode === GitOpsAuthModeType.PASSWORD
                        ? {
                              [GitOpsAuthModeType.PASSWORD]: bitbucketDCConfig
                                  ? {
                                        username: bitbucketDCConfig.username,
                                        token: bitbucketDCConfig.token,
                                    }
                                  : null,
                              [GitOpsAuthModeType.SSH_AND_PASSWORD]: null,
                          }
                        : {
                              [GitOpsAuthModeType.PASSWORD]: null,
                              [GitOpsAuthModeType.SSH_AND_PASSWORD]: bitbucketDCConfig
                                  ? {
                                        username: bitbucketDCConfig.username,
                                        sshKey: bitbucketDCConfig.sshKey,
                                        token: bitbucketDCConfig.token,
                                    }
                                  : null,
                          }

                this.setState({
                    gitList: response.result || [],
                    saveLoading: false,
                    view: ViewType.FORM,
                    lastActiveGitOp: isSelectedProviderAvailable ? form : undefined,
                    providerTab: form.provider === 'BITBUCKET_DC' ? GitProvider.BITBUCKET_CLOUD : form.provider,
                    form: {
                        ...form,
                        token: form.id && form.token === '' ? DEFAULT_SECRET_PLACEHOLDER : form.token,
                    },
                    isBitbucketCloud,
                    isError: DefaultErrorFields,
                    isFormEdited: false,
                    // TODO: Why are we deriving it from form when it is not even there, or should it be inside form
                    // FIXME: Transitive state would work with selectedRepoType as well
                    allowCustomGitRepo: isAuthModeSSH || form.allowCustomRepository,
                    initialBitBucketDCAuthMode,
                    bitBucketDCDataStore,
                })
                if (isAuthModeSSH || this.state.allowCustomGitRepo) {
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
        const bitbucketGitops = this.state.isBitbucketCloud ? GitProvider.BITBUCKET_CLOUD : 'BITBUCKET_DC'
        const gitListKey = event.target.value !== GitProvider.BITBUCKET_CLOUD ? event.target.value : bitbucketGitops
        const form = this.state.gitList.find((item) => item.provider === gitListKey) ?? {
            ...DefaultGitOpsConfig,
            ...DefaultShortGitOps,
            host: GitHost[newGitOps],
            provider: gitListKey,
            allowCustomRepository: false,
        }
        const isAuthModeSSH = form.authMode ? form.authMode === GitOpsAuthModeType.SSH : this.getIsAuthModeSSH(form.provider)

        this.setState({
            providerTab: form.provider === 'BITBUCKET_DC' ? GitProvider.BITBUCKET_CLOUD : form.provider,
            form: {
                ...form,
                token: form.id && form.token === '' ? DEFAULT_SECRET_PLACEHOLDER : form.token,
            },
            isError: DefaultErrorFields,
            isFormEdited: false,
            validationStatus: VALIDATION_STATUS.DRY_RUN,
            isUrlValidationError: false,
            ...(isAuthModeSSH
                ? {
                      allowCustomGitRepo: true,
                      selectedRepoType: repoType.CONFIGURE,
                  }
                : {
                      allowCustomGitRepo: form.allowCustomRepository,
                      selectedRepoType: form.allowCustomRepository ? repoType.CONFIGURE : repoType.DEFAULT,
                  }),
        })
    }

    handleChange(event, key: GitOpsFieldKeyType): void {
        // After entering any text,if GitOpsFieldKeyType is of type host then the url validation error must disappear
        // We do not need any https url in aws code commit tab
        const isURLValidationRequired =
            key === 'host' || this.isAWSCodeCommitTabSelected() || this.getIsOtherGitOpsTabSelected()
        const validateUserName = key === 'username' && !this.getIsOtherGitOpsTabSelected()
        const shouldValidateSSHUrl = key === 'sshHost' && this.isAWSCodeCommitTabSelected()

        const isCredentialKey = key === 'token' || key === 'sshKey'
        const isBitBucketDC = this.state.form.provider === 'BITBUCKET_DC'
        const isBitBucketDCCreateView =
            !this.state.form.id || this.state.form.authMode !== this.state.initialBitBucketDCAuthMode
        const areCredentialsChanging =
            isCredentialKey && (isBitBucketDC ? !isBitBucketDCCreateView : this.state.form.id)

        this.setState({
            form: {
                ...this.state.form,
                [key]: event.target.value,
            },
            isError: {
                ...this.state.isError,
                [key]: areCredentialsChanging || event.target.value.length !== 0 ? '' : 'This is a required field',
                // Since valid SSH URL will also check for required field check
                ...(shouldValidateSSHUrl && { sshHost: this.isValidSSHUrl(event.target.value) }),
                ...(validateUserName && { username: this.requiredFieldCheck(event.target.value) }),
            },
            isFormEdited: false,
            isUrlValidationError: isURLValidationRequired ? false : this.state.isUrlValidationError,
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
        return formValueType?.length ? '' : 'This is a required field'
    }

    // TODO: Would move to common after tenants release
    isValidSSHUrl = (url: string): string => {
        try {
            const urlObject = new URL(url)
            return urlObject.protocol !== 'ssh:' ? 'Not a valid SSH URL' : ''
        } catch (error) {
            return 'Not a valid SSH URL'
        }
    }

    getFormErrors(form: GitOpsConfig): typeof this.state.isError {
        if (this.getIsOtherGitOpsTabSelected()) {
            return {
                ...DefaultErrorFields,
                sshHost: this.requiredFieldCheck(form.sshHost),
                sshKey: this.state.form.id ? '' : this.requiredFieldCheck(form.sshKey),
            }
        }

        if (this.isAWSCodeCommitTabSelected()) {
            return {
                ...DefaultErrorFields,
                username: this.requiredFieldCheck(form.username),
                sshHost: this.requiredFieldCheck(form.sshHost) || this.isValidSSHUrl(form.sshHost),
                // REQUIREMENT: Do not TRIM this field
                sshKey: this.state.form.id ? '' : this.requiredFieldCheck(form.sshKey),
            }
        }

        const isSSHKeyRequired =
            this.state.form.provider === 'BITBUCKET_DC' &&
            !!this.state.form.id &&
            this.state.form.authMode === GitOpsAuthModeType.SSH_AND_PASSWORD &&
            this.state.initialBitBucketDCAuthMode === GitOpsAuthModeType.SSH_AND_PASSWORD

        return {
            host: this.requiredFieldCheck(form.host),
            username: this.requiredFieldCheck(form.username),
            token: this.state.form.id ? '' : this.requiredFieldCheck(form.token),
            gitHubOrgId: this.requiredFieldCheck(form.gitHubOrgId),
            gitLabGroupId: this.requiredFieldCheck(form.gitLabGroupId),
            azureProjectName: this.requiredFieldCheck(form.azureProjectName),
            bitBucketWorkspaceId: this.state.isBitbucketCloud ? this.requiredFieldCheck(form.bitBucketWorkspaceId) : '',
            bitBucketProjectKey: '',
            sshHost: '',
            sshKey: isSSHKeyRequired ? '' : this.requiredFieldCheck(form.sshKey),
        }
    }

    isInvalid() {
        if (this.getIsOtherGitOpsTabSelected()) {
            // User name is optional in case of Other gitops
            const formErrors = this.getFormErrors(this.state.form)
            if (formErrors.sshHost.length > 0 || formErrors.sshKey.length > 0) {
                this.setState({
                    isError: formErrors,
                    isFormEdited: true,
                })
                return true
            }
        }

        if (this.isAWSCodeCommitTabSelected()) {
            const formErrors = this.getFormErrors(this.state.form)
            if (formErrors.sshHost.length > 0 || formErrors.sshKey.length > 0 || formErrors.username.length > 0) {
                this.setState({
                    isError: formErrors,
                    isFormEdited: true,
                })
                return true
            }
        }

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
            if (this.state.form.host?.indexOf(shortGitHost) >= 0) {
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
        if (this.isAWSCodeCommitTabSelected() || this.getIsOtherGitOpsTabSelected()) {
            return {
                id: this.state.form.id,
                username: this.state.form.username.replace(/\s/g, ''),
                provider: this.state.form.provider,
                sshHost: this.state.form.sshHost,
                sshKey: this.state.form.sshKey,
                allowCustomRepository: this.state.selectedRepoType === repoType.CONFIGURE,
                authMode: GitOpsAuthModeType.SSH,
                active: true,
            }
        }

        const payload = {
            id: this.state.form.id,
            provider: this.state.form.provider,
            username: this.state.form.username.replace(/\s/g, ''),
            host: this.state.form.host.replace(/\s/g, ''),
            token: parsePassword(this.state.form.token.replace(/\s/g, '')),
            gitLabGroupId: this.state.form.gitLabGroupId.replace(/\s/g, ''),
            gitHubOrgId: this.state.form.gitHubOrgId.replace(/\s/g, ''),
            azureProjectName: this.state.form.azureProjectName.replace(/\s/g, ''),
            ...(this.state.isBitbucketCloud
                ? {
                      bitBucketWorkspaceId: this.state.form.bitBucketWorkspaceId.replace(/\s/g, ''),
                  }
                : {}),
            ...(this.state.form.provider === 'BITBUCKET_DC' && {
                authMode: this.state.form.authMode,
                sshKey: this.state.form.authMode === GitOpsAuthModeType.SSH_AND_PASSWORD ? this.state.form.sshKey : '',
            }),
            bitBucketProjectKey: this.state.form.bitBucketProjectKey.replace(/\s/g, ''),
            allowCustomRepository: this.state.selectedRepoType === repoType.CONFIGURE,
            active: true,
        }
        return payload
    }

    isSwitchingProvider = (): boolean => {
        const lastActiveGitOpsProvider =
            this.state.lastActiveGitOp?.provider === 'BITBUCKET_DC'
                ? GitProvider.BITBUCKET_CLOUD
                : this.state.lastActiveGitOp?.provider
        return lastActiveGitOpsProvider !== this.state.providerTab
    }

    handleCloseUpdateConfirmationDialog = () => {
        this.setState({ showUpdateConfirmationDialog: false })
    }

    handleShowUpdateConfirmationDialog = () => {
        this.setState({ showUpdateConfirmationDialog: true })
    }

    saveGitOps = () => {
        if (this.isInvalid()) {
            toast.error('Some Required Fields are missing')
            return
        }

        const isValidGitOpsUrl =
            this.isAWSCodeCommitTabSelected() || this.getIsOtherGitOpsTabSelected() || this.isValidGitOpsUrl()

        if (!isValidGitOpsUrl) {
            this.setState({
                isUrlValidationError: true,
                validationStatus: VALIDATION_STATUS.DRY_RUN,
                saveLoading: false,
                validateLoading: false,
            })

            return
        }

        const isSwitchingOrUpdatingProvider =
            this.state.gitList.length > 0 && (this.isSwitchingProvider() || this.state.form.id)

        if (!this.state.showUpdateConfirmationDialog && isSwitchingOrUpdatingProvider) {
            this.handleShowUpdateConfirmationDialog()
            return
        }

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
                        showUpdateConfirmationDialog: false,
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
                        showUpdateConfirmationDialog: false,
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

    getFormStateOnCredentialTypeChange = (selectedAuthMode: GitOpsAuthModeType): GitOpsState['form'] => {
        if (selectedAuthMode === GitOpsAuthModeType.PASSWORD) {
            return {
                ...this.state.form,
                authMode: GitOpsAuthModeType.PASSWORD,
                token: this.state.bitBucketDCDataStore[GitOpsAuthModeType.PASSWORD]?.token || '',
                username: this.state.bitBucketDCDataStore[GitOpsAuthModeType.PASSWORD]?.username || '',
                sshKey: '',
            }
        }

        return {
            ...this.state.form,
            authMode: GitOpsAuthModeType.SSH_AND_PASSWORD,
            token: this.state.bitBucketDCDataStore[GitOpsAuthModeType.SSH_AND_PASSWORD]?.token || '',
            username: this.state.bitBucketDCDataStore[GitOpsAuthModeType.SSH_AND_PASSWORD]?.username || '',
            sshKey: this.state.bitBucketDCDataStore[GitOpsAuthModeType.SSH_AND_PASSWORD]?.sshKey || '',
        }
    }

    handleAuthModeChange = (e: SyntheticEvent) => {
        const selectedAuthMode = (e.target as HTMLInputElement).value as GitOpsAuthModeType
        const freshErrorState = {
            ...this.state.isError,
            token: '',
            username: '',
            sshKey: '',
        }
        const formState = this.getFormStateOnCredentialTypeChange(selectedAuthMode)

        this.setState({
            form: formState,
            isError: freshErrorState,
        })
    }

    setIsBitbucketCloud = (value: boolean) => {
        if (this.state.saveLoading) {
            return
        }

        const bitbucketGitops = value ? GitProvider.BITBUCKET_CLOUD : 'BITBUCKET_DC'
        const form = this.state.gitList.find((item) => item.provider === bitbucketGitops) ?? {
            ...DefaultGitOpsConfig,
            ...DefaultShortGitOps,
            host: GitHost[GitProvider.BITBUCKET_CLOUD],
            provider: value ? GitProvider.BITBUCKET_CLOUD : 'BITBUCKET_DC',
        }
        this.setState({
            form: {
                ...form,
                token: form.id && form.token === '' ? DEFAULT_SECRET_PLACEHOLDER : form.token,
            },
            isError: DefaultErrorFields,
            isFormEdited: false,
            isBitbucketCloud: value,
            validationStatus: VALIDATION_STATUS.DRY_RUN,
            isUrlValidationError: false,
        })
    }

    // TODO: Should happen through handleChange
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

    // TODO: Should happen through handleChange and should be based on value not toggle
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
                <div className="global-configuration__component flex dc__align-reload-center h-100 w-100">
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
                <span>
                    <span className="dc__required-field">{label} </span>&nbsp;(Use https://)
                </span>
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
            <>
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
                    <form
                        className="bcn-0 bw-1 en-2 br-8 pb-22 pl-20 pr-20"
                        autoComplete="off"
                        onKeyDown={handleDisableSubmitOnEnter}
                    >
                        <div className="login__sso-flex">
                            {Object.values(GitProvider).map((provider) => {
                                const isOtherGitOpsFormRequired =
                                    provider === GitProvider.OTHER_GIT_OPS || provider === GitProvider.AWS_CODE_COMMIT
                                if (isOtherGitOpsFormRequired && !OtherGitOpsForm) {
                                    return null
                                }
                                // Keeping data testid backward compatible so that automation tests are not broken
                                const dataTestId = `gitops-${provider.split('_').join('-').toLowerCase()}-button`

                                return (
                                    <GitProviderTab
                                        providerTab={this.state.providerTab}
                                        handleGitopsTab={this.handleGitopsTab}
                                        lastActiveGitOp={this.state.lastActiveGitOp}
                                        provider={provider}
                                        saveLoading={this.state.saveLoading}
                                        datatestid={dataTestId}
                                        key={provider}
                                    />
                                )
                            })}
                        </div>

                        {/* Not adding check for isAuthModeSSH since that no relation with form itself */}
                        {(this.isAWSCodeCommitTabSelected() || this.getIsOtherGitOpsTabSelected()) &&
                        OtherGitOpsForm ? (
                            <OtherGitOpsForm
                                sshHost={{ value: this.state.form.sshHost, error: this.state.isError.sshHost }}
                                sshKey={{ value: this.state.form.sshKey, error: this.state.isError.sshKey }}
                                username={{ value: this.state.form.username, error: this.state.isError.username }}
                                handleChange={this.handleChange}
                                id={this.state.form.id}
                                // WARNING: Won't work in case we feed bitbucket dc as provider.
                                isActive={this.state.lastActiveGitOp?.provider === this.state.providerTab}
                                isAWSCodeCommit={this.isAWSCodeCommitTabSelected()}
                                key={this.state.providerTab}
                            />
                        ) : (
                            <Fragment key={this.state.providerTab}>
                                {!!BitBucketDCCredentials && this.state.providerTab === GitProvider.BITBUCKET_CLOUD && (
                                    <BitbucketCloudAndServerToggleSection
                                        isBitbucketCloud={this.state.isBitbucketCloud}
                                        setIsBitbucketCloud={this.setIsBitbucketCloud}
                                    />
                                )}
                                {(this.state.providerTab !== GitProvider.BITBUCKET_CLOUD ||
                                    this.state.isBitbucketCloud) && (
                                    <GitInfoTab
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
                                )}

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
                                    placeholder={`Enter ${getGitOpsLabel()}`}
                                    labelClassName="gitops__id form__label--fs-13 fw-5 fs-13 mb-4"
                                    dataTestid={
                                        this.state.providerTab === GitProvider.AZURE_DEVOPS
                                            ? 'gitops-azure-organisation-url-textbox'
                                            : this.state.providerTab === GitProvider.BITBUCKET_CLOUD
                                              ? 'gitops-bitbucket-host-url-textbox'
                                              : 'gitops-github-gitlab-host-url-textbox'
                                    }
                                    autoFocus
                                />

                                {/* To display URL validation like http instead of https */}
                                {this.state.isUrlValidationError && this.state.form.host.length ? (
                                    <div className="flex fs-12 left pt-4">
                                        <div className="form__error mr-4">
                                            <Error className="form__icon form__icon--error fs-13" />
                                            {this.state.form.host.startsWith('http:')
                                                ? GITOPS_HTTP_MESSAGE
                                                : GITOPS_FQDN_MESSAGE}
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

                                <div className="mt-16">
                                    {this.state.providerTab === GitProvider.BITBUCKET_CLOUD &&
                                        this.state.isBitbucketCloud && (
                                            <CustomInput
                                                name="workspaceID"
                                                placeholder="Enter Bitbucket Workspace ID"
                                                label={renderInputLabels(
                                                    'Bitbucket Workspace ID',
                                                    GitLink.BITBUCKET_WORKSPACE,
                                                    '(How to create workspace in bitbucket?)',
                                                )}
                                                value={this.state.form.bitBucketWorkspaceId}
                                                onChange={(event) => this.handleChange(event, 'bitBucketWorkspaceId')}
                                                error={this.state.isError.bitBucketWorkspaceId}
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
                                            LinkAndLabelSpec[this.state.providerTab].label,
                                            LinkAndLabelSpec[this.state.providerTab].link,
                                            LinkAndLabelSpec[this.state.providerTab].linkText,
                                        )}
                                        placeholder={`Enter ${LinkAndLabelSpec[this.state.providerTab].label}`}
                                        value={this.state.form[key]}
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
                                            If the project is not provided, the repository is automatically assigned to
                                            the oldest project in the workspace.
                                        </span>
                                    </div>
                                )}
                                <hr />
                                <div
                                    className="fw-6 cn-9 fs-14 mb-16"
                                    data-testid="gitops-gitaccess-credentials-heading"
                                >
                                    Git access credentials
                                </div>

                                {BitBucketDCCredentials && this.state.form.provider === 'BITBUCKET_DC' ? (
                                    <BitBucketDCCredentials
                                        authMode={this.state.form.authMode}
                                        initialAuthMode={this.state.initialBitBucketDCAuthMode}
                                        handleAuthModeChange={this.handleAuthModeChange}
                                        handleChange={this.handleChange}
                                        username={{
                                            value: this.state.form.username,
                                            error: this.state.isError.username,
                                        }}
                                        sshKey={{
                                            value: this.state.form.sshKey,
                                            error: this.state.isError.sshKey,
                                        }}
                                        token={{
                                            value: this.state.form.token,
                                            error: this.state.isError.token,
                                        }}
                                        id={this.state.form.id}
                                    />
                                ) : (
                                    <div className="form__row--two-third gitops__id mb-20 fs-13">
                                        <div>
                                            <CustomInput
                                                value={this.state.form.username}
                                                onChange={(event) => this.handleChange(event, 'username')}
                                                name="Enter username"
                                                placeholder="Enter username"
                                                error={this.state.isError.username}
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
                                                placeholder="Enter access token"
                                                label={renderInputLabels(
                                                    this.state.providerTab === GitProvider.AZURE_DEVOPS
                                                        ? 'Azure DevOps Access Token '
                                                        : 'Personal Access Token ',
                                                    DOCUMENTATION.GLOBAL_CONFIG_GIT_ACCESS_LINK,
                                                    '(Check permissions required for PAT)',
                                                )}
                                                value={this.state.form.token}
                                                onChange={(event) => this.handleChange(event, 'token')}
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
                                )}
                            </Fragment>
                        )}

                        <hr />

                        <div>
                            <div className="form__row flex left">
                                <div className="fw-6 cn-9 fs-14 mb-16">Directory management in Git</div>
                                {window._env_.FEATURE_USER_DEFINED_GITOPS_REPO_ENABLE ? (
                                    <RadioGroup
                                        className="radio-group-no-border"
                                        name="trigger-type"
                                        value={this.state.selectedRepoType}
                                        onChange={this.repoTypeChange}
                                    >
                                        <div
                                            className={
                                                this.state.form.authMode === GitOpsAuthModeType.SSH
                                                    ? 'dc__disabled'
                                                    : ''
                                            }
                                        >
                                            <RadioGroupItem
                                                value={repoType.DEFAULT}
                                                disabled={this.state.form.authMode === GitOpsAuthModeType.SSH}
                                            >
                                                Auto-create git repository for each application
                                            </RadioGroupItem>
                                            <div className="ml-26 cn-7">
                                                Repository will be created automatically with application name to store
                                                deployment manifests for each application
                                            </div>
                                        </div>
                                        <div className="mt-10">
                                            <RadioGroupItem value={repoType.CONFIGURE}>
                                                Ask git repository for each application
                                            </RadioGroupItem>
                                            <div className="ml-26 cn-7">
                                                Desired git repository can be provided to store deployment manifests for
                                                each application
                                            </div>
                                        </div>
                                    </RadioGroup>
                                ) : (
                                    <InfoColourBar
                                        classname="eb-2 bw-1 bcb-1"
                                        Icon={ICInfoFilled}
                                        iconClass="dc__no-shrink"
                                        message={
                                            this.state.selectedRepoType === repoType.DEFAULT
                                                ? 'Repository will be created automatically with application name to store deployment manifests for each application'
                                                : 'Desired git repository can be provided to store deployment manifests for each application'
                                        }
                                    />
                                )}
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
                                className={`cta m-0-imp ${this.state.saveLoading ? 'cursor-not-allowed' : ''}`}
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

                {this.state.showUpdateConfirmationDialog && (
                    <UpdateConfirmationDialog
                        providerTab={this.state.providerTab}
                        lastActiveGitOp={this.state.lastActiveGitOp}
                        handleCancel={this.handleCloseUpdateConfirmationDialog}
                        handleUpdate={this.saveGitOps}
                        saveLoading={this.state.saveLoading}
                        enableBitBucketSource={!!BitBucketDCCredentials}
                    />
                )}
            </>
        )
    }
}

export default withRouter(GitOpsConfiguration)
