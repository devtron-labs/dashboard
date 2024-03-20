/* eslint-disable react/sort-comp */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-param-reassign */
/* eslint-disable no-prototype-builtins */
/* eslint-disable react/no-access-state-in-setstate */
/* eslint-disable jsx-a11y/tabindex-no-positive */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/destructuring-assignment */
import React, { Component, createRef } from 'react'
import {
    showError,
    Progressing,
    ErrorScreenManager,
    ConfirmationDialog,
    CustomInput,
    noop,
} from '@devtron-labs/devtron-fe-common-lib'
import { toast } from 'react-toastify'
import yamlJsParser from 'yaml'
import CodeEditor from '../../../../components/CodeEditor/CodeEditor'
import { OIDCType, SSOLoginProps, SSOLoginState, SSOLoginTabType, SSOConfigType } from './ssoConfig.types'
import { getSSOConfig, createSSOList, updateSSOList, getSSOConfigList } from './service'
import { ViewType, DOCUMENTATION, URLS, DEFAULT_SECRET_PLACEHOLDER } from '../../../../config'
import {
    ButtonWithLoader,
    DevtronSwitch as Switch,
    DevtronSwitchItem as SwitchItem,
    importComponentFromFELibrary,
} from '../../../../components/common'

import '../../../../components/login/login.scss'
import { withGlobalConfiguration } from '../../../../components/globalConfigurations/GlobalConfigurationProvider'

import sample from './sampleSSOConfig.json'
import { ReactComponent as Google } from '../../../../assets/icons/ic-google.svg'
import Check from '../../../../assets/icons/ic-selected-corner.png'
import { ReactComponent as Help } from '../../../../assets/icons/ic-help.svg'
import { ReactComponent as GitHub } from '../../../../assets/icons/git/github.svg'
import { ReactComponent as Microsoft } from '../../../../assets/icons/ic-microsoft.svg'
import { ReactComponent as LDAP } from '../../../../assets/icons/ic-ldap.svg'
import { ReactComponent as OIDC } from '../../../../assets/icons/ic-oidc.svg'
import { ReactComponent as Openshift } from '../../../../assets/icons/ic-openshift.svg'
import { ReactComponent as GitLab } from '../../../../assets/icons/git/gitlab.svg'
import { ReactComponent as UsersIcon } from '../../../../assets/icons/ic-users.svg'

import { ReactComponent as WarningIcon } from '../../../../assets/icons/ic-warning.svg'
import { ReactComponent as Warn } from '../../../../assets/icons/ic-info-warn.svg'

import {
    AUTHORIZATION_CONFIG_TYPES,
    SSOProvider,
    SwitchItemValues,
    autoAssignPermissionsFlowActiveProviders,
    ssoDocumentationMap,
    ssoProviderToDisplayNameMap,
    SsoSecretsToHide,
} from './constants'

const AutoAssignToggleTile = importComponentFromFELibrary('AutoAssignToggleTile')
const UserPermissionConfirmationModal = importComponentFromFELibrary('UserPermissionConfirmationModal')
const getAuthorizationGlobalConfig = importComponentFromFELibrary('getAuthorizationGlobalConfig', noop, 'function')

// eslint-disable-next-line consistent-return
const SSOTabIcons: React.FC<{ provider: SSOProvider }> = ({ provider }) => {
    // eslint-disable-next-line default-case
    switch (provider) {
        case SSOProvider.google:
            return <Google />
        case SSOProvider.github:
            return <GitHub />
        case SSOProvider.gitlab:
            return <GitLab />
        case SSOProvider.microsoft:
            return <Microsoft />
        case SSOProvider.ldap:
            return <LDAP />
        case SSOProvider.oidc:
            return <OIDC />
        case SSOProvider.openshift:
            return <Openshift />
    }
}

const SSOLoginTab: React.FC<SSOLoginTabType> = ({ handleSSOClick, checked, lastActiveSSO, value, SSOName }) => {
    return (
        <label className="dc__tertiary-tab__radio">
            <input type="radio" value={value} checked={checked} name="status" onChange={handleSSOClick} />
            <span className="dc__tertiary-tab sso-icons" data-testid={`sso-${value}-button`}>
                <aside className="login__icon-alignment">
                    <SSOTabIcons provider={value} />
                </aside>
                <aside className="login__text-alignment">{SSOName}</aside>
                <label>
                    {lastActiveSSO?.name === value ? (
                        <aside className="dc__position-abs dc__right-0 dc__top-0">
                            {/* eslint-disable-next-line jsx-a11y/alt-text */}
                            <img src={Check} className="h-32" />
                        </aside>
                    ) : (
                        ''
                    )}
                </label>
            </span>
        </label>
    )
}

class SSOLogin extends Component<SSOLoginProps, SSOLoginState> {
    /**
     * Ref to store the value from the API, used for showing the modal
     */
    savedShouldAutoAssignPermissionRef: React.MutableRefObject<SSOLoginState['showAutoAssignConfirmationModal']>

    /**
     * Whether the auto-assign flow should be active or not
     */
    isAutoAssignPermissionFlowActive: SSOLoginState['shouldAutoAssignPermissions'] = null

    constructor(props) {
        super(props)
        this.state = {
            view: ViewType.LOADING,
            statusCode: 0,
            sso: '',
            lastActiveSSO: undefined,
            saveLoading: false,
            configMap: SwitchItemValues.Configuration,
            showToggling: false,
            ssoConfig: undefined,
            shouldAutoAssignPermissions: null,
            showAutoAssignConfirmationModal: false,
            isError: {
                url: '',
            },
            invalidYaml: false,
        }
        this.savedShouldAutoAssignPermissionRef = createRef()
        this.handleSSOClick = this.handleSSOClick.bind(this)
        this.toggleWarningModal = this.toggleWarningModal.bind(this)
        this.handleURLChange = this.handleURLChange.bind(this)
        this.handleConfigChange = this.handleConfigChange.bind(this)
        this.handleOnBlur = this.handleOnBlur.bind(this)
        this.saveNewSSO = this.saveNewSSO.bind(this)
    }

    componentDidMount() {
        Promise.all([getSSOConfigList(), getAuthorizationGlobalConfig()])
            // keeping the existing type intact
            .then(([ssoConfigListRes, authorizationGlobalConfig]) => {
                let ssoConfig = ssoConfigListRes.result?.find((sso) => sso.active)
                if (ssoConfig) {
                    this.setState({ sso: ssoConfig?.name, lastActiveSSO: ssoConfig })
                } else {
                    ssoConfig = sample.google
                    this.setState({ sso: 'google', ssoConfig: this.parseResponse(ssoConfig) })
                }
                // Would be undefined for OSS
                if (authorizationGlobalConfig) {
                    const shouldAutoAssignPermissions =
                        authorizationGlobalConfig[AUTHORIZATION_CONFIG_TYPES.GROUP_CLAIMS]
                    this.setState({
                        shouldAutoAssignPermissions,
                    })
                    this.savedShouldAutoAssignPermissionRef.current = shouldAutoAssignPermissions
                }
            })
            .then(() => {
                if (this.state.lastActiveSSO && this.state.lastActiveSSO?.id) {
                    getSSOConfig(this.state.lastActiveSSO?.name.toLowerCase())
                        .then((response) => {
                            this.setConfig(response, this.state.lastActiveSSO.name.toLowerCase())
                        })
                        .catch((error) => {
                            this.setState({ view: ViewType.ERROR, statusCode: error.code })
                        })
                } else {
                    this.setState({
                        view: ViewType.FORM,
                        ssoConfig: this.parseResponse(sample[this.state.sso]),
                    })
                }
            })
            .catch((error) => {
                this.setState({ view: ViewType.ERROR, statusCode: error.code })
            })
    }

    handleSSOClick(event): void {
        const newsso = event.target.value
        getSSOConfig(newsso)
            .then((response) => {
                this.setConfig(response, newsso)
            })
            .catch((error) => {
                this.setState({ view: ViewType.ERROR, statusCode: error.code })
            })
    }

    setSecretPlaceHolderInResponse(response): void {
        const config = response.result?.config?.config
        if (config?.hasOwnProperty(SsoSecretsToHide.clientID) && config?.clientID === '') {
            response.result.config.config.clientID = DEFAULT_SECRET_PLACEHOLDER
        }
        if (config?.hasOwnProperty(SsoSecretsToHide.clientSecret) && config?.clientSecret === '') {
            response.result.config.config.clientSecret = DEFAULT_SECRET_PLACEHOLDER
        }
        if (config?.hasOwnProperty(SsoSecretsToHide.bindPW) && config?.bindPW === '') {
            response.result.config.config.bindPW = DEFAULT_SECRET_PLACEHOLDER
        }
        if (config?.hasOwnProperty(SsoSecretsToHide.usernamePrompt) && config?.usernamePrompt === '') {
            response.result.config.config.usernamePrompt = DEFAULT_SECRET_PLACEHOLDER
        }
    }

    setConfig(response, newsso): void {
        this.setSecretPlaceHolderInResponse(response)

        let newConfig: SSOConfigType
        if (response.result) {
            newConfig = this.parseResponse(response.result)
        } else {
            newConfig = this.parseResponse(sample[newsso])
        }
        this.setState({
            view: ViewType.FORM,
            sso: newsso,
            ssoConfig: newConfig,
        })
    }

    handleURLChange(event): void {
        this.setState({
            ssoConfig: {
                ...this.state.ssoConfig,
                url: event.target.value,
            },
            isError: {
                url: event.target.value.length === 0 ? 'This is required field' : '',
            },
        })
    }

    toggleWarningModal(): void {
        this.setState({ showToggling: !this.state.showToggling, saveLoading: false })
    }

    parseResponse(ssoConfig): SSOConfigType {
        return {
            id: ssoConfig.id,
            name: ssoConfig.name,
            url: ssoConfig.url || '',
            config: {
                name: ssoConfig.config.name,
                type: ssoConfig.config.type,
                id: ssoConfig.config.id,
                config: yamlJsParser.stringify(ssoConfig.config.config, { indent: 2 }),
            },
            active: ssoConfig.active,
        }
    }

    checkConfigJson(ssoConfig) {
        if (
            ssoConfig?.hasOwnProperty(SsoSecretsToHide.clientID) &&
            (ssoConfig?.clientID === DEFAULT_SECRET_PLACEHOLDER || !ssoConfig.clientID)
        ) {
            ssoConfig.clientID = ''
        }
        if (
            ssoConfig?.hasOwnProperty(SsoSecretsToHide.clientSecret) &&
            (ssoConfig?.clientSecret === DEFAULT_SECRET_PLACEHOLDER || !ssoConfig.clientSecret)
        ) {
            ssoConfig.clientSecret = ''
        }
        if (
            ssoConfig?.hasOwnProperty(SsoSecretsToHide.bindPW) &&
            (ssoConfig?.bindPW === DEFAULT_SECRET_PLACEHOLDER || !ssoConfig.bindPW)
        ) {
            ssoConfig.bindPW = ''
        }
        if (
            ssoConfig?.hasOwnProperty(SsoSecretsToHide.usernamePrompt) &&
            (ssoConfig?.usernamePrompt === DEFAULT_SECRET_PLACEHOLDER || !ssoConfig.usernamePrompt)
        ) {
            ssoConfig.usernamePrompt = ''
        }
        return ssoConfig
    }

    // The global auth config type needs to be updated irrespective of the SSO name check
    _getGlobalAuthConfigType = () =>
        AutoAssignToggleTile
            ? {
                  globalAuthConfigType:
                      this.isAutoAssignPermissionFlowActive && this.state.shouldAutoAssignPermissions
                          ? AUTHORIZATION_CONFIG_TYPES.GROUP_CLAIMS
                          : AUTHORIZATION_CONFIG_TYPES.DEVTRON_MANAGED,
              }
            : {}

    _getSSOCreateOrUpdatePayload = (configJSON) => ({
        id: this.state.ssoConfig.id,
        name: this.state.sso,
        url: this.state.ssoConfig.url,
        config: {
            type: this.state.ssoConfig.config.type,
            id: this.state.ssoConfig.config.id,
            name: this.state.ssoConfig.config.name,
            config: configJSON,
        },
        active: true,
        ...this._getGlobalAuthConfigType(),
    })

    /**
     * Parses the configuration for the SSO and returns the JSON config
     */
    _validateYaml = () => {
        let configJSON: Record<string, string> = {}
        try {
            configJSON = this.checkConfigJson(yamlJsParser.parse(this.state.ssoConfig.config.config))

            if (
                this.state.sso === SSOProvider.microsoft &&
                this.isAutoAssignPermissionFlowActive &&
                this.state.shouldAutoAssignPermissions &&
                !configJSON.tenant
            ) {
                toast.error('"tenant" is required in configuration for auto-assigning permissions to users')
                return { isValid: false }
            }
        } catch (error) {
            // Invalid YAML, couldn't be parsed to JSON. Show error toast
            toast.error('Invalid Yaml')
            this.setState({ saveLoading: false })
            return { isValid: false }
        }
        return { isValid: true, configJSON }
    }

    sanitiseSecretDataFromResponse(response): void {
        if (response.result.config.config.hasOwnProperty(SsoSecretsToHide.clientID)) {
            response.result.config.config.clientID = ''
        }
        if (response.result.config.config.hasOwnProperty(SsoSecretsToHide.clientSecret)) {
            response.result.config.config.clientSecret = ''
        }
        if (response.result.config.config.hasOwnProperty(SsoSecretsToHide.bindPW)) {
            response.result.config.config.bindPW = ''
        }
        if (response.result.config.config.hasOwnProperty(SsoSecretsToHide.usernamePrompt)) {
            response.result.config.config.usernamePrompt = ''
        }
    }

    saveSSO(response): void {
        this.sanitiseSecretDataFromResponse(response)

        this.setConfig(response, this.state.sso.toLowerCase())
        const ssoConfig = response.result
        const shouldAutoAssignPermissions =
            this._getGlobalAuthConfigType()?.globalAuthConfigType === AUTHORIZATION_CONFIG_TYPES.GROUP_CLAIMS
        this.setState({
            view: ViewType.FORM,
            saveLoading: false,
            ssoConfig: this.parseResponse(response.result),
            lastActiveSSO: {
                id: ssoConfig.id,
                name: ssoConfig.name,
                active: ssoConfig.active,
            },
            shouldAutoAssignPermissions,
        })
        // Updating the ref, in case the user updates the AD in same session
        this.savedShouldAutoAssignPermissionRef.current = shouldAutoAssignPermissions
        toast.success('Saved Successful')
    }

    saveNewSSO(): void {
        this.setState({ saveLoading: true })
        const { isValid, configJSON } = this._validateYaml()

        if (!isValid) {
            this.setState({ saveLoading: false })
            return
        }

        const payload = this._getSSOCreateOrUpdatePayload(configJSON)
        const promise = this.state.ssoConfig.id ? updateSSOList(payload) : createSSOList(payload)
        promise
            .then((response) => {
                this.saveSSO(response)
                this.setState({
                    showToggling: false,
                    saveLoading: false,
                })
                this.handleAutoAssignConfirmationModalClose()
            })
            .catch((error) => {
                showError(error)
                this.setState({ saveLoading: false })
            })
    }

    // FIXME: This is overlapping with saveNewSSO functionality and can be combined in future
    onLoginConfigSave = (e) => {
        e.preventDefault()

        if (!this.state.ssoConfig.url) {
            toast.error('Some required field are missing')
            return
        }

        if (this.state.sso === OIDCType) {
            if (this.state.invalidYaml) {
                toast.error('Invalid YAML')
                return
            }
            if (
                !this.state.ssoConfig.config.id ||
                !this.state.ssoConfig.config.name ||
                !this.state.ssoConfig.config.config
            ) {
                toast.error('Configuration must have id, name and config value')
                return
            }
        }

        this.setState({ saveLoading: true })
        const { isValid, configJSON } = this._validateYaml()

        if (!isValid) {
            this.setState({ saveLoading: false })
            return
        }

        const payload = this._getSSOCreateOrUpdatePayload(configJSON)

        // Create SSO
        if (!this.state.lastActiveSSO) {
            createSSOList(payload)
                .then((response) => {
                    this.saveSSO(response)

                    // The tippy for User Permission is displayed only when the SSO config is saved for the first time with AD 'off'.
                    if (payload.globalAuthConfigType !== AUTHORIZATION_CONFIG_TYPES.GROUP_CLAIMS) {
                        const { setTippyConfig } = this.props.globalConfiguration

                        const renderTippyButton = () => {
                            const handleClick = () => {
                                setTippyConfig({
                                    showTippy: false,
                                })
                                this.props.history.push(URLS.GLOBAL_CONFIG_AUTH_USER_PERMISSION)
                            }

                            return (
                                <div className="pb-20 pr-20 pl-20">
                                    <button
                                        type="button"
                                        onClick={handleClick}
                                        className="cta secondary cursor lh-20-imp h-28"
                                    >
                                        Take me there
                                    </button>
                                </div>
                            )
                        }

                        setTippyConfig({
                            infoTextHeading: 'Manage Users and Permissions',
                            infoText: 'Ensure seamless one-click SSO login by adding users.',
                            Icon: UsersIcon,
                            iconClass: 'fcy-5',
                            showTippy: true,
                            showOnRoute: URLS.GLOBAL_CONFIG_AUTH_USER_PERMISSION,
                            iconSize: 32,
                            additionalContent: renderTippyButton(),
                        })
                    }
                })
                .catch((error) => {
                    showError(error)
                    this.setState({ saveLoading: false })
                })
        }
        // Update the same SSO
        else if (this.state.lastActiveSSO) {
            // The modal for confirming the auto-assign permissions is opened only when the toggle is changed to true
            if (
                this.isAutoAssignPermissionFlowActive &&
                this.state.shouldAutoAssignPermissions &&
                this.state.shouldAutoAssignPermissions !== this.savedShouldAutoAssignPermissionRef.current
            ) {
                this.setState({
                    showAutoAssignConfirmationModal: true,
                    saveLoading: false,
                })
            } else if (this.state.sso === this.state.lastActiveSSO?.name) {
                // If the SSO is unchanged, proceed with the update flow, else show the SSO Change Confirmation Modal

                // Update the SSO Config
                updateSSOList(payload)
                    .then((response) => {
                        this.saveSSO(response)
                    })
                    .catch((error) => {
                        showError(error)
                        this.setState({ saveLoading: false })
                    })
            } else {
                this.toggleWarningModal()
            }
        }
    }

    handleAutoAssignConfirmationModalClose = () => {
        this.setState({ showAutoAssignConfirmationModal: false })
    }

    handleConfigChange(value: string): void {
        if (this.state.configMap !== SwitchItemValues.Configuration) {
            return
        }
        if (this.state.sso === OIDCType) {
            let config
            try {
                config = yamlJsParser.parse(value)
            } catch (error) {
                // Invalid YAML, couldn't be parsed to JSON. Show error toast
                this.setState({
                    invalidYaml: true,
                })
                return
            }
            this.setState({
                invalidYaml: false,
            })
            let configValue = ''
            if (config?.config) {
                configValue = yamlJsParser.stringify(config.config)
            }
            this.setState({
                ssoConfig: {
                    ...this.state.ssoConfig,
                    config: {
                        name: config?.name,
                        id: config?.id,
                        type: this.state.ssoConfig.config.type,
                        config: configValue,
                    },
                },
            })
            return
        }

        this.setState({
            ssoConfig: {
                ...this.state.ssoConfig,
                config: {
                    name: this.state.ssoConfig.config.name,
                    type: this.state.ssoConfig.config.type,
                    id: this.state.ssoConfig.config.id,
                    config: value,
                },
            },
        })
    }

    toggleAutoAssignPermissions = (shouldAutoAssignPermissions: boolean) => {
        this.setState({
            shouldAutoAssignPermissions,
        })
    }

    handleCodeEditorTab(value: string): void {
        this.setState({ configMap: value })
    }

    setDefaultSecretPlaceHolder(newConfig): void {
        if (newConfig.hasOwnProperty(SsoSecretsToHide.clientID) && !newConfig.clientID) {
            newConfig.clientID = DEFAULT_SECRET_PLACEHOLDER
        }
        if (newConfig.hasOwnProperty(SsoSecretsToHide.clientSecret) && !newConfig.clientSecret) {
            newConfig.clientSecret = DEFAULT_SECRET_PLACEHOLDER
        }
        if (newConfig.hasOwnProperty(SsoSecretsToHide.bindPW) && !newConfig.bindPW) {
            newConfig.bindPW = DEFAULT_SECRET_PLACEHOLDER
        }
        if (newConfig.hasOwnProperty(SsoSecretsToHide.usernamePrompt) && !newConfig.usernamePrompt) {
            newConfig.usernamePrompt = DEFAULT_SECRET_PLACEHOLDER
        }
    }

    handleOnBlur(): void {
        if (this.state.configMap !== SwitchItemValues.Configuration) {
            return
        }
        let newConfig
        try {
            newConfig = yamlJsParser.parse(this.state.ssoConfig.config.config)
        } catch (error) {
            // Invalid YAML, couldn't be parsed to JSON. Show error toast
            toast.error('Invalid Yaml')
            return
        }
        if (newConfig) {
            this.setDefaultSecretPlaceHolder(newConfig)
        }
        const value = yamlJsParser.stringify(newConfig)

        this.setState({
            ssoConfig: {
                ...this.state.ssoConfig,
                config: {
                    ...this.state.ssoConfig.config,
                    config: value,
                },
            },
        })
    }

    renderSSOCodeEditor() {
        let ssoConfig = this.state.ssoConfig.config.config || yamlJsParser.stringify({}, { indent: 2 })
        if (this.state.sso === OIDCType) {
            const config = {
                name: this.state.ssoConfig.config.name,
                id: this.state.ssoConfig.config.id,
                config: yamlJsParser.parse(this.state.ssoConfig.config.config),
            }
            const stringifyConfig = yamlJsParser.stringify(config, { indent: 1 })

            ssoConfig = stringifyConfig.replaceAll('null', '')
        }

        const codeEditorBody =
            this.state.configMap === SwitchItemValues.Configuration
                ? ssoConfig
                : yamlJsParser.stringify(sample[this.state.sso], { indent: 2 })

        let presetConfig = (
            <div
                style={{
                    resize: 'none',
                    lineHeight: '1.4',
                    border: 'none',
                    padding: `0 35px`,
                    overflow: 'none',
                    color: '#f32e2e',
                    fontSize: '14px',
                    fontFamily: 'Consolas, "Courier New", monospace',
                }}
                className="w-100"
            >
                <p className="m-0">config:</p>
                <p className="m-0">&nbsp;&nbsp;&nbsp;&nbsp;type: {this.state.ssoConfig.config.type}</p>
                <p className="m-0">&nbsp;&nbsp;&nbsp;&nbsp;name: {this.state.ssoConfig.config.name}</p>
                <p className="m-0">&nbsp;&nbsp;&nbsp;&nbsp;id: {this.state.ssoConfig.config.id}</p>
                <p className="m-0">&nbsp;&nbsp;&nbsp;&nbsp;config:</p>
            </div>
        )

        if (this.state.configMap === SwitchItemValues.Configuration && this.state.sso === OIDCType) {
            presetConfig = (
                <div
                    style={{
                        resize: 'none',
                        lineHeight: '1.4',
                        border: 'none',
                        padding: `0 35px`,
                        overflow: 'none',
                        color: '#f32e2e',
                        fontSize: '14px',
                        fontFamily: 'Consolas, "Courier New", monospace',
                    }}
                    className="w-100"
                >
                    <p className="m-0">config:</p>
                    <p className="m-0">&nbsp;&nbsp;&nbsp;&nbsp;type: {this.state.ssoConfig.config.type}</p>
                </div>
            )
        }

        const shebangHtml = this.state.configMap === SwitchItemValues.Configuration ? presetConfig : null

        const decorationWidth = this.state.sso !== OIDCType ? 50 : 25
        return (
            <div className="mt-0 ml-24 mr-24 mb-24">
                <div className="code-editor-container">
                    <CodeEditor
                        value={codeEditorBody}
                        height={300}
                        mode="yaml"
                        noParsing={this.state.sso === OIDCType}
                        lineDecorationsWidth={
                            this.state.configMap === SwitchItemValues.Configuration ? decorationWidth : 0
                        }
                        shebang={shebangHtml}
                        readOnly={this.state.configMap !== SwitchItemValues.Configuration}
                        onChange={this.handleConfigChange}
                        onBlur={this.handleOnBlur}
                    >
                        <CodeEditor.Header>
                            <Switch
                                value={this.state.configMap}
                                name="tab"
                                onChange={(event) => {
                                    this.handleCodeEditorTab(event.target.value)
                                }}
                            >
                                <SwitchItem value={SwitchItemValues.Configuration}> Configuration </SwitchItem>
                                <SwitchItem value={SwitchItemValues.Sample}> Sample Script</SwitchItem>
                            </Switch>
                            <CodeEditor.ValidationError />
                        </CodeEditor.Header>
                    </CodeEditor>
                </div>
            </div>
        )
    }

    handleSSOURLLocation(value: string): void {
        this.setState({
            ssoConfig: {
                ...this.state.ssoConfig,
                url: value,
            },
        })
    }

    renderButtonText(): string {
        return this.state.ssoConfig.id ? 'Update' : 'Save'
    }

    render() {
        if (this.state.view === ViewType.LOADING) {
            return <Progressing pageLoader />
        }
        if (this.state.view === ViewType.ERROR) {
            return (
                <div className="dc__align-reload-center">
                    <ErrorScreenManager code={this.state.statusCode} />
                </div>
            )
        }

        this.isAutoAssignPermissionFlowActive = !!(
            autoAssignPermissionsFlowActiveProviders.includes(this.state.sso as SSOProvider) && AutoAssignToggleTile
        )
        // The assignment confirmation modal has precedence over SSO change confirmation modal
        const showSSOChangeConfirmationModal = this.state.showToggling && !this.state.showAutoAssignConfirmationModal

        return (
            <section className="global-configuration__component">
                <h2 className="form__title" data-testid="sso-login-heading">
                    SSO Login Services
                </h2>
                <p className="form__subtitle">
                    Configure and manage login service for your organization.
                    <span>
                        <a
                            rel="noreferrer noopener"
                            target="_blank"
                            className="dc__link"
                            href={DOCUMENTATION.GLOBAL_CONFIG_SSO}
                        >
                            Learn more about SSO Login
                        </a>
                    </span>
                </p>

                <div className="bcn-0 bw-1 en-2 br-8 pb-22">
                    <div className="login__sso-flex pl-24">
                        {Object.entries(ssoProviderToDisplayNameMap).map(([provider, ssoName]) => (
                            <SSOLoginTab
                                key={provider}
                                value={provider as SSOProvider}
                                SSOName={ssoName}
                                checked={this.state.sso === provider}
                                handleSSOClick={this.handleSSOClick}
                                lastActiveSSO={this.state.lastActiveSSO}
                            />
                        ))}
                    </div>
                    <div className="dc__sso-description p-16 br-4 fs-14 eb-2 bw-1 mt-20 mb-20 ml-24 mr-24">
                        <div className="flexbox">
                            <Help className="icon-dim-20 fcb-5 mr-12" />
                            <div>
                                For redirect URL or callback URL use: {`${window.location.origin}/orchestrator`}
                                /api/dex/callback
                                <br />
                                Please ensure above URL is registered with the identity provider.
                            </div>
                        </div>
                        <div className="mt-8 ml-32">
                            <span className="fw-6">Help: </span>See documentation for&nbsp;
                            <a
                                rel="noreferrer noopener"
                                href={`${ssoDocumentationMap[this.state.sso]}`}
                                target="_blank"
                                className="login__auth-link"
                            >
                                Authentication through {ssoProviderToDisplayNameMap[this.state.sso]}
                            </a>
                        </div>
                    </div>
                    <label className="form__row mr-24 ml-24 mb-24">
                        <CustomInput
                            value={this.state.ssoConfig.url || window.__ORCHESTRATOR_ROOT__}
                            onChange={this.handleURLChange}
                            data-testid="sso-url-input"
                            name="sso-url"
                            label="URL"
                            isRequiredField
                            error={this.state.isError.url}
                        />
                        <div className="flex left fw-4 pt-4">
                            <Warn className="icon-dim-16 mr-4 " />
                            <div className="">Click to use:</div>
                            <button
                                type="button"
                                onClick={() => this.handleSSOURLLocation(`${window.location.origin}/orchestrator`)}
                                className="login__btn cg-5"
                            >
                                {window.location.origin}/orchestrator
                            </button>
                        </div>
                    </label>
                    {this.renderSSOCodeEditor()}
                    {this.isAutoAssignPermissionFlowActive && (
                        <div className="mb-12 ml-24 mr-24">
                            <AutoAssignToggleTile
                                ssoType={this.state.sso}
                                isSelected={this.state.shouldAutoAssignPermissions}
                                onChange={this.toggleAutoAssignPermissions}
                            />
                        </div>
                    )}
                    <div className="form__buttons mt-32 mr-24">
                        <button
                            onClick={this.onLoginConfigSave}
                            tabIndex={5}
                            type="submit"
                            disabled={this.state.saveLoading}
                            className="cta"
                            data-testid="sso-save-button"
                        >
                            {this.state.saveLoading ? <Progressing /> : this.renderButtonText()}
                        </button>
                    </div>
                </div>
                {/* Confirmation Modal for SSO Change */}
                {showSSOChangeConfirmationModal && (
                    <ConfirmationDialog className="w-400">
                        <WarningIcon className="icon-dim-48 mb-12 warning-icon-y5-imp" />
                        <ConfirmationDialog.Body
                            title={`Use "${ssoProviderToDisplayNameMap[this.state.sso]}" instead of "${
                                ssoProviderToDisplayNameMap[this.state.lastActiveSSO?.name]
                            }" for login?`}
                            subtitle="This will end all active user sessions. Users would have to login again using updated SSO service."
                        />
                        <ConfirmationDialog.ButtonGroup>
                            <button
                                type="button"
                                className="cta cancel"
                                disabled={this.state.saveLoading}
                                onClick={this.toggleWarningModal}
                            >
                                Cancel
                            </button>
                            <ButtonWithLoader
                                type="submit"
                                rootClassName="cta"
                                dataTestId="confirm-sso-button"
                                disabled={this.state.saveLoading}
                                isLoading={this.state.saveLoading}
                                loaderColor=""
                                onClick={this.saveNewSSO}
                            >
                                Confirm
                            </ButtonWithLoader>
                        </ConfirmationDialog.ButtonGroup>
                    </ConfirmationDialog>
                )}
                {/* Confirmation modal for permission auto-assignment */}
                {this.state.showAutoAssignConfirmationModal && (
                    <UserPermissionConfirmationModal
                        handleSave={this.saveNewSSO}
                        handleCancel={this.handleAutoAssignConfirmationModalClose}
                        ssoType={this.state.sso}
                        isLoading={this.state.saveLoading}
                    />
                )}
            </section>
        )
    }
}

export default withGlobalConfiguration(SSOLogin)
