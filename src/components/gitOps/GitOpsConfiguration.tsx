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

import React, { Component, ComponentType, Fragment, SyntheticEvent } from 'react'
import { withRouter } from 'react-router-dom'
import {
    showError,
    Progressing,
    ErrorScreenManager,
    RadioGroup,
    RadioGroupItem,
    CustomInput,
    InfoColourBar,
    GitOpsFieldKeyType,
    GitOpsAuthModeType,
    handleDisableSubmitOnEnter,
    DEFAULT_SECRET_PLACEHOLDER,
    FeatureTitleWithInfo,
    ToastVariantType,
    ToastManager,
    useMainContext,
} from '@devtron-labs/devtron-fe-common-lib'
import {
    TLSConnectionFormActionType,
    TLSConnectionFormProps,
    getCertificateAndKeyDependencyError,
    getIsTLSDataPresent,
    getTLSConnectionPayloadValues,
    handleOnFocus,
    importComponentFromFELibrary,
    parsePassword,
    TLSConnectionForm,
} from '@Components/common'
import { ViewType, repoType, HEADER_TEXT } from '../../config'
import { GitOpsState, GitOpsProps, GitOpsConfig, GitOpsOrganisationIdType } from './gitops.type'
import { ReactComponent as Info } from '../../assets/icons/ic-info-filled-purple.svg'
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
    PROVIDER_DOC_LINK_MAP,
} from './constants'
import { getGitOpsLabelText } from './utils'
import { GitProvider } from '@Components/common/GitTabs/constants'
import { GitProviderType } from '@Components/common/GitTabs/types'
import { GitProviderTab } from '@Components/common/GitTabs/GitProviderTab'
import UpdateConfirmationDialog from './UpdateConfirmationDialog'

const OtherGitOpsForm = importComponentFromFELibrary('OtherGitOpsForm', null, 'function')
const BitBucketDCCredentials = importComponentFromFELibrary('BitBucketDCCredentials', null, 'function')
const BitbucketCloudAndServerToggleSection = importComponentFromFELibrary(
    'BitbucketCloudAndServerToggleSection',
    null,
    'function',
)

const GitInfoTab: React.FC<{ gitLink: string; gitProvider: string; gitProviderGroupAlias: string }> = ({
    gitLink,
    gitProvider,
    gitProviderGroupAlias,
}) => {
    return (
        <div className="git_impt pt-10 pb-10 pl-16 pr-16 br-4 bw-1 bcv-1 flexbox-col w-100 flex-grow-1">
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

class GitOpsConfiguration extends Component<GitOpsProps & { isFeatureUserDefinedGitOpsEnabled: boolean }, GitOpsState> {
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

    isAWSCodeCommitTabSelected = (overriddenProvider?: GitProviderType): boolean => {
        if (overriddenProvider) {
            return overriddenProvider === GitProvider.AWS_CODE_COMMIT
        }

        return this.state.providerTab === GitProvider.AWS_CODE_COMMIT
    }

    getIsOtherGitOpsTabSelected = (overriddenProvider?: GitProviderType): boolean => {
        if (overriddenProvider) {
            return overriddenProvider === GitProvider.OTHER_GIT_OPS
        }

        return this.state.providerTab === GitProvider.OTHER_GIT_OPS
    }

    // Fallback in case of create view we need this
    getIsAuthModeSSH = (authMode: GitOpsAuthModeType, overriddenProvider?: GitProviderType): boolean => {
        if (authMode) {
            return authMode === GitOpsAuthModeType.SSH
        }

        return (
            this.isAWSCodeCommitTabSelected(overriddenProvider) || this.getIsOtherGitOpsTabSelected(overriddenProvider)
        )
    }

    getFormAuthMode = (authMode: GitOpsAuthModeType, provider: GitProviderType) => {
        if (authMode) {
            return authMode
        }

        if (provider === GitProvider.OTHER_GIT_OPS || provider === GitProvider.AWS_CODE_COMMIT) {
            return GitOpsAuthModeType.SSH
        }

        return GitOpsAuthModeType.PASSWORD
    }

    fetchGitOpsConfigurationList() {
        getGitOpsConfigurationList()
            .then((response) => {
                const parsedGitList =
                    response.result?.map((gitOpsConfig) => {
                        const { tlsConfig, ...rest } = gitOpsConfig
                        return {
                            ...rest,
                            caData: tlsConfig?.caData ?? '',
                            tlsCertData: tlsConfig?.tlsCertData ?? '',
                            tlsKeyData: tlsConfig?.tlsKeyData ?? '',
                            isCADataClearedAfterInitialConfig: false,
                            isTLSCertDataClearedAfterInitialConfig: false,
                            isTLSKeyDataClearedAfterInitialConfig: false,
                        }
                    }) || []

                const selectedProviderDetails = parsedGitList.find((item) => item.active) ?? {
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

                const bitbucketCloudConfig = parsedGitList.find((item) => item.provider === GitProvider.BITBUCKET_CLOUD)
                const bitbucketDCConfig = parsedGitList.find((item) => item.provider === 'BITBUCKET_DC')
                // If bit bucket dc is configured and active or only dc is configured, then default to bitbucket dc else bitbucket cloud
                const isBitbucketCloud =
                    (!bitbucketCloudConfig && !bitbucketDCConfig) ||
                    (!bitbucketDCConfig?.active && !!bitbucketCloudConfig)

                const isAuthModeSSH = this.getIsAuthModeSSH(form.authMode, form.provider)

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
                    gitList: parsedGitList,
                    saveLoading: false,
                    view: ViewType.FORM,
                    lastActiveGitOp: isSelectedProviderAvailable ? form : undefined,
                    providerTab: form.provider === 'BITBUCKET_DC' ? GitProvider.BITBUCKET_CLOUD : form.provider,
                    form: {
                        ...form,
                        token: form.id && form.token === '' ? DEFAULT_SECRET_PLACEHOLDER : form.token,
                        authMode: this.getFormAuthMode(form.authMode, form.provider),
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
            // Would be true, in case of other gitops or aws code commit.
            allowCustomRepository: false,
        }
        const isAuthModeSSH = this.getIsAuthModeSSH(form.authMode, form.provider)
        this.setState({
            providerTab: form.provider === 'BITBUCKET_DC' ? GitProvider.BITBUCKET_CLOUD : form.provider,
            form: {
                ...form,
                token: form.id && form.token === '' ? DEFAULT_SECRET_PLACEHOLDER : form.token,
                authMode: this.getFormAuthMode(form.authMode, form.provider),
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
        const isURLValidationOptional =
            key === 'host' || this.isAWSCodeCommitTabSelected() || this.getIsOtherGitOpsTabSelected()
        const validateUserName = key === 'username' && !this.getIsOtherGitOpsTabSelected()
        const shouldValidateSSHUrl = key === 'sshHost' && this.isAWSCodeCommitTabSelected()

        const isCredentialKey = key === 'token' || key === 'sshKey'
        const isBitBucketDC = this.state.form.provider === 'BITBUCKET_DC'
        const isBitBucketDCCreateView =
            !this.state.form.id || this.state.form.authMode !== this.state.initialBitBucketDCAuthMode
        const areCredentialsChanging =
            isCredentialKey && (isBitBucketDC ? !isBitBucketDCCreateView : this.state.form.id)

        const shouldOverrideRequiredCheck = areCredentialsChanging || event.target.value.length !== 0

        this.setState({
            form: {
                ...this.state.form,
                [key]: event.target.value,
            },
            isError: {
                ...this.state.isError,
                [key]: shouldOverrideRequiredCheck ? '' : 'This is a required field',
                // Since valid SSH URL will also check for required field check
                ...(shouldValidateSSHUrl ? { sshHost: this.isValidSSHUrl(event.target.value) } : { sshHost: '' }),
                ...(validateUserName ? { username: this.requiredFieldCheck(event.target.value) } : { username: '' }),
            },
            isFormEdited: false,
            isUrlValidationError: isURLValidationOptional ? false : this.state.isUrlValidationError,
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

    // Would be called by getFormErrors if is unedited else by isInvalid
    validateTLSData = (): Pick<typeof this.state.isError, 'tlsCertData' | 'tlsKeyData' | 'caData'> => {
        const currentAuthMode = this.getFormAuthMode(this.state.form.authMode, this.state.form.provider)
        const isAuthModePassword = currentAuthMode === GitOpsAuthModeType.PASSWORD

        const { isTLSKeyError, isTLSCertError, message } = getCertificateAndKeyDependencyError(
            this.state.form.isTLSCertDataPresent,
            this.state.form.isTLSKeyDataPresent,
        )

        return {
            tlsCertData: isAuthModePassword && isTLSCertError ? message : '',
            tlsKeyData: isAuthModePassword && isTLSKeyError ? message : '',
            caData: '',
        }
    }

    /**
     * Method to validate the form fields if form is unedited/or is aws or other gitops tab
     * To be consumed by isInvalid method only
     */
    getFormErrors(form: GitOpsConfig): typeof this.state.isError {
        // QUERY: Can remove form from params since it is same as state
        // No need to validate for tls values in case of ssh and ssh + password
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

        const isBitBucketDC = this.state.form.provider === 'BITBUCKET_DC'
        const isBitBucketDCCreateView =
            !this.state.form.id || this.state.form.authMode !== this.state.initialBitBucketDCAuthMode
        const isTokenRequired = isBitBucketDC && isBitBucketDCCreateView

        const isSSHKeyRequired =
            isBitBucketDC &&
            !this.state.form.id &&
            this.state.form.authMode === GitOpsAuthModeType.SSH_AND_PASSWORD &&
            this.state.initialBitBucketDCAuthMode === GitOpsAuthModeType.SSH_AND_PASSWORD

        const isBitBucketProjectKeyRequired = this.state.providerTab === GitProvider.BITBUCKET_CLOUD

        return {
            host: this.requiredFieldCheck(form.host),
            username: this.requiredFieldCheck(form.username),
            token: this.state.form.id && !isTokenRequired ? '' : this.requiredFieldCheck(form.token),
            gitHubOrgId: this.requiredFieldCheck(form.gitHubOrgId),
            gitLabGroupId: this.requiredFieldCheck(form.gitLabGroupId),
            azureProjectName: this.requiredFieldCheck(form.azureProjectName),
            bitBucketWorkspaceId: this.state.isBitbucketCloud ? this.requiredFieldCheck(form.bitBucketWorkspaceId) : '',
            bitBucketProjectKey: isBitBucketProjectKeyRequired ? this.requiredFieldCheck(form.bitBucketProjectKey) : '',
            sshHost: '',
            sshKey: isSSHKeyRequired ? this.requiredFieldCheck(form.sshKey) : '',
            ...this.validateTLSData(),
        }
    }

    // Used in case of validation before submit or clicking on validate button
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

        const { isError: errorState } = this.state
        let isError = structuredClone(errorState)
        if (!this.state.isFormEdited) {
            isError = this.getFormErrors(this.state.form)
            this.setState({
                isError,
                isFormEdited: true,
            })
        } else {
            isError = {
                ...isError,
                ...this.validateTLSData(),
            }
        }

        let _isInvalid =
            isError.host.length > 0 ||
            isError.username.length > 0 ||
            isError.token.length > 0 ||
            isError.sshKey.length > 0 ||
            isError.bitBucketProjectKey.length > 0 ||
            isError.tlsCertData.length > 0 ||
            isError.tlsKeyData.length > 0 ||
            isError.caData.length > 0

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

        this.setState({ isError })
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
        const currentAuthMode = this.getFormAuthMode(this.state.form.authMode, this.state.form.provider)
        const tlsValues =
            currentAuthMode === GitOpsAuthModeType.PASSWORD
                ? getTLSConnectionPayloadValues({
                      enableTLSVerification: this.state.form.enableTLSVerification,
                      isTLSKeyDataPresent: this.state.form.isTLSKeyDataPresent,
                      isTLSCertDataPresent: this.state.form.isTLSCertDataPresent,
                      isCADataPresent: this.state.form.isCADataPresent,
                      tlsConfig: {
                          caData: this.state.form.caData,
                          tlsCertData: this.state.form.tlsCertData,
                          tlsKeyData: this.state.form.tlsKeyData,
                      },
                  })
                : {}

        // In case of ssh, we do not send tls values
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
            ...tlsValues,
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
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: 'Some Required Fields are missing',
            })
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
                    ToastManager.showToast({
                        variant: ToastVariantType.success,
                        description: 'Configuration saved successfully',
                    })
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
                            ? ToastManager.showToast({
                                  variant: ToastVariantType.error,
                                  description: 'Configuration failed',
                              })
                            : ToastManager.showToast({
                                  variant: ToastVariantType.success,
                                  description: 'Configuration saved successfully',
                              })
                    }
                }
            })
            .catch((error) => {
                showError(error)
                this.setState({ saveLoading: false })
            })
    }

    validateGitOps(tab) {
        if (this.isInvalid()) {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: 'Some Required Fields are missing',
            })

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
                        ToastManager.showToast({
                            variant: ToastVariantType.error,
                            description: 'Configuration validation failed',
                        })
                    } else {
                        this.setState({
                            validationStatus: VALIDATION_STATUS.SUCCESS,
                            saveLoading: false,
                            validateLoading: false,
                            isFormEdited: false,
                            deleteRepoError: resp.deleteRepoFailed,
                            validationSkipped: resp.validationSkipped,
                        })
                        ToastManager.showToast({
                            variant: ToastVariantType.success,
                            description: 'Configuration validated',
                        })
                    }
                })
                .catch((error) => {
                    showError(error)
                    this.setState({
                        saveLoading: false,
                        validateLoading: false,
                        isFormEdited: false,
                        validationStatus: VALIDATION_STATUS.DRY_RUN,
                    })
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

        // No need to remove tls related data since we do not send that in payload and can retain it so on change back to password, user can see the data
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
            isFormEdited: false,
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
                authMode: this.getFormAuthMode(form.authMode, form.provider),
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

    handleTLSConfigChange: TLSConnectionFormProps['handleChange'] = ({ action, payload }) => {
        const initialGitOps = this.state.gitList.find((item) => item.provider === this.state.form.provider)
        const isTLSInitiallyConfigured = this.state.form.id && initialGitOps?.enableTLSVerification

        switch (action) {
            case TLSConnectionFormActionType.TOGGLE_ENABLE_TLS_VERIFICATION:
                this.setState((prevState) => ({
                    ...prevState,
                    form: {
                        ...prevState.form,
                        enableTLSVerification: !prevState.form.enableTLSVerification,
                    },
                    isFormEdited: true,
                }))
                break
            case TLSConnectionFormActionType.UPDATE_CA_DATA:
                this.setState((prevState) => ({
                    ...prevState,
                    form: {
                        ...prevState.form,
                        isCADataPresent: getIsTLSDataPresent({
                            targetValue: payload,
                            isTLSInitiallyConfigured,
                            wasFieldInitiallyPresent: initialGitOps?.isCADataPresent,
                            wasFieldClearedAfterInitialConfig: prevState.form.isCADataClearedAfterInitialConfig,
                        }),
                        caData: payload,
                    },
                    isError: {
                        ...prevState.isError,
                        caData: '',
                    },
                    isFormEdited: true,
                }))
                break
            case TLSConnectionFormActionType.UPDATE_CERT_DATA:
                this.setState((prevState) => ({
                    ...prevState,
                    form: {
                        ...prevState.form,
                        isTLSCertDataPresent: getIsTLSDataPresent({
                            targetValue: payload,
                            isTLSInitiallyConfigured,
                            wasFieldInitiallyPresent: initialGitOps?.isTLSCertDataPresent,
                            wasFieldClearedAfterInitialConfig: prevState.form.isTLSCertDataClearedAfterInitialConfig,
                        }),
                        tlsCertData: payload,
                    },
                    isError: {
                        ...prevState.isError,
                        tlsCertData: '',
                        tlsKeyData: '',
                    },
                    isFormEdited: true,
                }))
                break
            case TLSConnectionFormActionType.UPDATE_KEY_DATA:
                this.setState((prevState) => ({
                    ...prevState,
                    form: {
                        ...prevState.form,
                        isTLSKeyDataPresent: getIsTLSDataPresent({
                            targetValue: payload,
                            isTLSInitiallyConfigured,
                            wasFieldInitiallyPresent: initialGitOps?.isTLSKeyDataPresent,
                            wasFieldClearedAfterInitialConfig: prevState.form.isTLSKeyDataClearedAfterInitialConfig,
                        }),
                        tlsKeyData: payload,
                    },
                    isError: {
                        ...prevState.isError,
                        tlsKeyData: '',
                        tlsCertData: '',
                    },
                    isFormEdited: true,
                }))
                break
            case TLSConnectionFormActionType.CLEAR_CA_DATA:
                this.setState((prevState) => ({
                    ...prevState,
                    form: {
                        ...prevState.form,
                        caData: '',
                        isCADataPresent: false,
                        isCADataClearedAfterInitialConfig: true,
                    },
                    isError: {
                        ...prevState.isError,
                        caData: '',
                    },
                    isFormEdited: true,
                }))
                break
            case TLSConnectionFormActionType.CLEAR_CERT_DATA:
                this.setState((prevState) => ({
                    ...prevState,
                    form: {
                        ...prevState.form,
                        tlsCertData: '',
                        isTLSCertDataPresent: false,
                        isTLSCertDataClearedAfterInitialConfig: true,
                    },
                    isError: {
                        ...prevState.isError,
                        tlsKeyData: '',
                        tlsCertData: '',
                    },
                    isFormEdited: true,
                }))
                break
            case TLSConnectionFormActionType.CLEAR_KEY_DATA:
                this.setState((prevState) => ({
                    ...prevState,
                    form: {
                        ...prevState.form,
                        tlsKeyData: '',
                        isTLSKeyDataPresent: false,
                        isTLSKeyDataClearedAfterInitialConfig: true,
                    },
                    isError: {
                        ...prevState.isError,
                        tlsKeyData: '',
                        tlsCertData: '',
                    },
                    isFormEdited: true,
                }))
                break
        }
    }

    render() {
        const suggestedURL = this.suggestedValidGitOpsUrl()
        const key: GitOpsOrganisationIdType = this.getGitOpsOrgId()
        const warning =
            'Devtron was unable to delete the test repository “devtron-sample-repo-dryrun-…”. Please delete it manually.'
        const isAuthModeSSH = this.getIsAuthModeSSH(this.state.form.authMode, this.state.form.provider)
        // Would be showing TLS Config Form if auth mode is Password
        const formAuthMode = this.getFormAuthMode(this.state.form.authMode, this.state.form.provider)
        const isTLSConfigFormVisible = formAuthMode === GitOpsAuthModeType.PASSWORD

        if (this.state.view === ViewType.LOADING) {
            return (
                <div className="bg__primary h-100">
                    <Progressing pageLoader />
                </div>
            )
        }
        if (this.state.view === ViewType.ERROR) {
            return (
                <div className="global-configuration__component flex dc__align-reload-center h-100 w-100">
                    <ErrorScreenManager code={this.state.statusCode} reloadClass="dc__align-reload-center" />
                </div>
            )
        }

        const getGitOpsLabel = () => (
            <div>
                <span className="dc__required-field">{getGitOpsLabelText(this.state.providerTab)} </span>
                &nbsp;(Use https://)
            </div>
        )

        const initialGitOps = this.state.gitList.find((item) => item.provider === this.state.form.provider)

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

        const renderGitOpsTabs = () => (
            <div className="login__sso-flex dc__gap-12">
                {Object.values(GitProvider).map((provider: GitProvider) => {
                    const isOtherGitOpsFormRequired =
                        provider === GitProvider.OTHER_GIT_OPS || provider === GitProvider.AWS_CODE_COMMIT
                    if (isOtherGitOpsFormRequired && !OtherGitOpsForm) {
                        return null
                    }
                    // Keeping dataTestId backward compatible so that automation tests are not broken
                    const dataTestId = `gitops-${provider.split('_').join('-').toLowerCase()}-button`

                    return (
                        <GitProviderTab
                            isTabChecked={this.state.providerTab === provider}
                            handleGitopsTab={this.handleGitopsTab}
                            lastActiveTabName={this.state.lastActiveGitOp?.provider}
                            provider={provider}
                            saveLoading={this.state.saveLoading}
                            dataTestId={dataTestId}
                            key={provider}
                        />
                    )
                })}
            </div>
        )

        const renderGitOpsFormInputs = () => {
            /* Not adding check for isAuthModeSSH since that no relation with form itself */
            return (this.isAWSCodeCommitTabSelected() || this.getIsOtherGitOpsTabSelected()) && OtherGitOpsForm ? (
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
                    {!!BitbucketCloudAndServerToggleSection &&
                        this.state.providerTab === GitProvider.BITBUCKET_CLOUD && (
                            <BitbucketCloudAndServerToggleSection
                                isBitbucketCloud={this.state.isBitbucketCloud}
                                setIsBitbucketCloud={this.setIsBitbucketCloud}
                            />
                        )}
                    {(this.state.providerTab !== GitProvider.BITBUCKET_CLOUD || this.state.isBitbucketCloud) && (
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

                    {this.state.selectedRepoType === repoType.DEFAULT && (
                        <ValidateForm
                            id={this.state.form.id}
                            onClickValidate={() => this.validateGitOps(this.state.providerTab)}
                            validationError={this.state.validationError}
                            validationStatus={this.state.validationStatus}
                            configName="gitops"
                            warning={this.state.deleteRepoError ? warning : ''}
                        />
                    )}
                    <div className="flex-grow-1 w-100">
                        <CustomInput
                            value={this.state.form.host}
                            onChange={(event) => this.handleChange(event, 'host')}
                            name="Enter host"
                            error={this.state.isError.host}
                            label={getGitOpsLabel()}
                            placeholder={`Enter ${getGitOpsLabelText(this.state.providerTab)}`}
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
                    </div>
                    {/* To display URL validation like http instead of https */}
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
                    ) : null}

                    {this.state.providerTab === GitProvider.BITBUCKET_CLOUD && this.state.isBitbucketCloud && (
                        <div className="w-100">
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
                        </div>
                    )}
                    <div className="w-100">
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
                    <div
                        className="fw-6 cn-9 fs-14 dc__border-top-n1 w-100 pt-16"
                        data-testid="gitops-gitaccess-credentials-heading"
                    >
                        Git access credentials
                    </div>

                    {BitBucketDCCredentials && this.state.form.provider === 'BITBUCKET_DC' ? (
                        <div className={`flexbox-col ${isTLSConfigFormVisible ? 'mb-16' : ''}`}>
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
                        </div>
                    ) : (
                        <div className="form__row--two-third gitops__id fs-13 w-100">
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
                                        PROVIDER_DOC_LINK_MAP[this.state.providerTab],
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
                                    onBlur={this.handleOnBlur}
                                />
                            </div>
                        </div>
                    )}
                </Fragment>
            )
        }

        const renderTLSConfigForm = () => {
            return isTLSConfigFormVisible ? (
                <TLSConnectionForm
                    enableTLSVerification={this.state.form.enableTLSVerification}
                    caData={{
                        value: this.state.form.caData,
                        error: this.state.isError.caData,
                    }}
                    tlsCertData={{
                        value: this.state.form.tlsCertData,
                        error: this.state.isError.tlsCertData,
                    }}
                    tlsKeyData={{
                        value: this.state.form.tlsKeyData,
                        error: this.state.isError.tlsKeyData,
                    }}
                    handleChange={this.handleTLSConfigChange}
                    isTLSInitiallyConfigured={this.state.form.id && initialGitOps?.enableTLSVerification}
                    isCADataPresent={this.state.form.isCADataPresent}
                    isTLSCertDataPresent={this.state.form.isTLSCertDataPresent}
                    isTLSKeyDataPresent={this.state.form.isTLSKeyDataPresent}
                    rootClassName="w-100"
                />
            ) : (
                <div className="dc__border-top-n1 w-100" />
            )
        }

        const renderDirectoryManagementInGitOps = () => (
            <div className="flex column left w-100 dc__gap-16 pb-16">
                <div className="fw-6 cn-9 fs-14">Directory management in Git</div>
                {window._env_.FEATURE_USER_DEFINED_GITOPS_REPO_ENABLE &&
                this.props.isFeatureUserDefinedGitOpsEnabled ? (
                    <RadioGroup
                        className="radio-group-no-border"
                        name="trigger-type"
                        value={this.state.selectedRepoType}
                        onChange={this.repoTypeChange}
                    >
                        <div className={isAuthModeSSH ? 'dc__disabled' : ''}>
                            <RadioGroupItem value={repoType.DEFAULT} disabled={isAuthModeSSH}>
                                Auto-create git repository for each application
                            </RadioGroupItem>
                            <div className="ml-26 cn-7">
                                Repository will be created automatically with application name to store deployment
                                manifests for each application
                            </div>
                        </div>
                        <div className="mt-10">
                            <RadioGroupItem value={repoType.CONFIGURE}>
                                Ask git repository for each application
                            </RadioGroupItem>
                            <div className="ml-26 cn-7">
                                Desired git repository can be provided to store deployment manifests for each
                                application
                            </div>
                        </div>
                    </RadioGroup>
                ) : (
                    <InfoColourBar
                        classname="eb-2 bw-1 bcb-1 w-100"
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
        )
        const renderGitOpsBody = () => {
            return (
                <form className="flex column left w-100" autoComplete="off" onKeyDown={handleDisableSubmitOnEnter}>
                    <div className="pb-64 flex left column dc__gap-16 w-100 dc__mxw-1000">
                        {renderGitOpsTabs()}
                        {renderGitOpsFormInputs()}
                        {renderTLSConfigForm()}
                        {renderDirectoryManagementInGitOps()}
                    </div>
                </form>
            )
        }

        const renderGitOpsFooter = () => {
            return (
                <div className="form__buttons flex left dc__position-fixed bg__primary w-100 dc__bottom-0 px-20 py-16 dc__border-top-n1">
                    <button
                        type="submit"
                        disabled={this.state.saveLoading}
                        onClick={(e) => {
                            e.preventDefault()
                            this.saveGitOps()
                        }}
                        data-testid="gitops-save-button"
                        className={`cta small m-0-imp ${this.state.saveLoading ? 'cursor-not-allowed' : ''}`}
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
            )
        }

        return (
            <div className="bg__primary flex-grow-1 w-100 h-100">
                <section className="flex-1 bg__primary flex left column">
                    <div className="flex left column px-20 py-16 dc__gap-24 w-100">
                        <FeatureTitleWithInfo
                            title={HEADER_TEXT.GITOPS.title}
                            renderDescriptionContent={() => HEADER_TEXT.GITOPS.description}
                            docLink={HEADER_TEXT.GITOPS.docLink}
                            showInfoIconTippy
                            dataTestId="gitops-heading"
                        />
                        {renderGitOpsBody()}
                    </div>
                    {renderGitOpsFooter()}
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
            </div>
        )
    }
}

const withIsFeatureUserDefinedGitOpsEnabled = (Component: ComponentType) => (props) => {
    const {
        featureGitOpsFlags: { isFeatureUserDefinedGitOpsEnabled },
    } = useMainContext()
    return <Component isFeatureUserDefinedGitOpsEnabled={isFeatureUserDefinedGitOpsEnabled} {...props} />
}

export default withIsFeatureUserDefinedGitOpsEnabled(withRouter(GitOpsConfiguration))
