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

/* eslint-disable react/prop-types */

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
    CustomInput,
    noop,
    YAMLStringify,
    DEFAULT_SECRET_PLACEHOLDER,
    CodeEditor,
    FeatureTitleWithInfo,
    InfoColourBar,
    ToastManager,
    ToastVariantType,
    Button,
    ButtonVariantType,
    ComponentSizeType,
    MODES,
    ConfirmationModal,
    ConfirmationModalVariantType,
} from '@devtron-labs/devtron-fe-common-lib'
import yamlJsParser from 'yaml'
import Check from '@Icons/ic-selected-corner.png'
import { ReactComponent as Help } from '@Icons/ic-help.svg'
import { ReactComponent as UsersIcon } from '@Icons/ic-users.svg'
import { ReactComponent as InfoIcon } from '@Icons/ic-info-warn.svg'
import {
    DevtronSwitch as Switch,
    DevtronSwitchItem as SwitchItem,
    importComponentFromFELibrary,
} from '@Components/common'
import { OIDCType, SSOLoginProps, SSOLoginState, SSOConfigType, SSOLoginTabType } from './ssoConfig.types'
import { getSSOConfig, createSSOList, updateSSOList, getSSOConfigList } from './service'
import { ViewType, URLS, SwitchItemValues, HEADER_TEXT, DOCUMENTATION } from '../../../../config'

import '@Components/login/login.scss'
import { withGlobalConfiguration } from '../../../../components/globalConfigurations/GlobalConfigurationProvider'

import sample from './sampleSSOConfig.json'

import {
    AUTHORIZATION_CONFIG_TYPES,
    SSOProvider,
    autoAssignPermissionsFlowActiveProviders,
    ssoDocumentationMap,
    ssoProviderToDisplayNameMap,
    SsoSecretsToHide,
} from './constants'
import './ssoLogin.scss'
import { SSOTabIcons } from './utils'

const AutoAssignToggleTile = importComponentFromFELibrary('AutoAssignToggleTile')
const UserPermissionConfirmationModal = importComponentFromFELibrary('UserPermissionConfirmationModal')
const getAuthorizationGlobalConfig = importComponentFromFELibrary('getAuthorizationGlobalConfig', noop, 'function')
const SSOLoginTab: React.FC<SSOLoginTabType> = ({ handleSSOClick, checked, lastActiveSSO, value, SSOName }) => (
    <label className="dc__tertiary-tab__radio">
        <input
            className="dc__hide-section"
            type="radio"
            value={value}
            checked={checked}
            name="status"
            onChange={handleSSOClick}
        />
        <span className="dc__tertiary-tab sso-icons" data-testid={`sso-${value}-button`}>
            <aside className="login__icon-alignment">
                <SSOTabIcons provider={value} />
            </aside>
            <aside className="login__text-alignment">{SSOName}</aside>
            <label>
                {lastActiveSSO?.name === value ? (
                    <aside className="dc__position-abs dc__right-0 dc__top-0">
                        <img src={Check} className="h-32 dc__top-right-radius-3" alt="saved-provider-check" />
                    </aside>
                ) : (
                    ''
                )}
            </label>
        </span>
    </label>
)

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
                config: YAMLStringify(ssoConfig.config.config),
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
                ToastManager.showToast({
                    variant: ToastVariantType.error,
                    description: '"tenant" is required in configuration for auto-assigning permissions to users',
                })
                return { isValid: false }
            }
        } catch {
            // Invalid YAML, couldn't be parsed to JSON. Show error toast
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: 'Invalid Yaml',
            })
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
        ToastManager.showToast({
            variant: ToastVariantType.success,
            description: 'Saved Successful',
        })
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
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: 'Some required field are missing',
            })
            return
        }

        if (this.state.sso === OIDCType) {
            if (this.state.invalidYaml) {
                ToastManager.showToast({
                    variant: ToastVariantType.error,
                    description: 'Invalid YAML',
                })
                return
            }
            if (
                !this.state.ssoConfig.config.id ||
                !this.state.ssoConfig.config.name ||
                !this.state.ssoConfig.config.config
            ) {
                ToastManager.showToast({
                    variant: ToastVariantType.error,
                    description: 'Configuration must have id, name and config value',
                })
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
                                    <Button
                                        variant={ButtonVariantType.text}
                                        size={ComponentSizeType.small}
                                        onClick={handleClick}
                                        dataTestId="take-me-there"
                                        text="Take me there"
                                    />
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
            } catch {
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
                configValue = YAMLStringify(config.config)
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
        } catch {
            // Invalid YAML, couldn't be parsed to JSON. Show error toast
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: 'Invalid YAML',
            })
            return
        }
        if (newConfig) {
            this.setDefaultSecretPlaceHolder(newConfig)
        }
        const value = YAMLStringify(newConfig)

        setTimeout(() => {
            this.setState({
                ssoConfig: {
                    ...this.state.ssoConfig,
                    config: {
                        ...this.state.ssoConfig.config,
                        config: value,
                    },
                },
            })
        }, 0)
    }

    renderSSOCodeEditor() {
        let ssoConfig = this.state.ssoConfig.config.config || YAMLStringify({})
        if (this.state.sso === OIDCType) {
            const config = {
                name: this.state.ssoConfig.config.name,
                id: this.state.ssoConfig.config.id,
                config: yamlJsParser.parse(this.state.ssoConfig.config.config),
            }
            const stringifyConfig = YAMLStringify(config, { indent: 1 })

            ssoConfig = stringifyConfig.replaceAll('null', '')
        }

        const codeEditorBody =
            this.state.configMap === SwitchItemValues.Configuration ? ssoConfig : YAMLStringify(sample[this.state.sso])

        let presetConfig = (
            <div className="w-100 code-editor__text">
                <p className="m-0">config:</p>
                <p className="m-0">&nbsp;&nbsp;&nbsp;&nbsp;type: {this.state.ssoConfig.config.type}</p>
                <p className="m-0">&nbsp;&nbsp;&nbsp;&nbsp;name: {this.state.ssoConfig.config.name}</p>
                <p className="m-0">&nbsp;&nbsp;&nbsp;&nbsp;id: {this.state.ssoConfig.config.id}</p>
                <p className="m-0">&nbsp;&nbsp;&nbsp;&nbsp;config:</p>
            </div>
        )

        if (this.state.configMap === SwitchItemValues.Configuration && this.state.sso === OIDCType) {
            presetConfig = (
                <div className="w-100 code-editor__text">
                    <p className="m-0">config:</p>
                    <p className="m-0">&nbsp;&nbsp;&nbsp;&nbsp;type: {this.state.ssoConfig.config.type}</p>
                </div>
            )
        }

        const shebangHtml = this.state.configMap === SwitchItemValues.Configuration ? presetConfig : null

        return (
            <CodeEditor.Container>
                <CodeEditor
                    value={codeEditorBody}
                    mode={MODES.YAML}
                    noParsing={this.state.sso === OIDCType}
                    shebang={shebangHtml}
                    readOnly={this.state.configMap !== SwitchItemValues.Configuration}
                    onChange={this.handleConfigChange}
                    onBlur={this.handleOnBlur}
                    height="auto"
                >
                    <CodeEditor.Header>
                        <div className="flex dc__content-space dc__gap-6">
                            <div className="dc__no-shrink">
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
                            </div>
                        </div>
                    </CodeEditor.Header>
                </CodeEditor>
            </CodeEditor.Container>
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
            return (
                <div className="bg__primary h-100">
                    <Progressing pageLoader />
                </div>
            )
        }
        if (this.state.view === ViewType.ERROR) {
            return (
                <div className="dc__align-reload-center">
                    <ErrorScreenManager code={this.state.statusCode} />
                </div>
            )
        }

        const renderInfoText = (): JSX.Element => (
            <div className="flex left column dc__gap-24">
                <div>
                    For <span className="fw-6">redirectURI or callbackURI</span> use: &nbsp;
                    {`${window.location.origin}/orchestrator`}
                    /api/dex/callback
                    <br />
                    Please ensure above URL is registered with the identity provider.
                </div>
                <div>
                    <span className="fw-6">📙 Need Help? </span>See documentation for&nbsp;
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
        )

        this.isAutoAssignPermissionFlowActive = !!(
            autoAssignPermissionsFlowActiveProviders.includes(this.state.sso as SSOProvider) && AutoAssignToggleTile
        )
        // The assignment confirmation modal has precedence over SSO change confirmation modal
        const showSSOChangeConfirmationModal = this.state.showToggling && !this.state.showAutoAssignConfirmationModal

        const renderSSOBody = () => (
            <div className="flex column left dc__gap-16 w-100">
                <div className="login__sso-flex dc__gap-12">
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
                <div className="flex-grow-1 w-100">
                    <InfoColourBar
                        message={renderInfoText()}
                        classname="question-bar w-100 dc__mw-600"
                        iconClass="icon-dim-20 fcv-5"
                        Icon={Help}
                    />
                </div>
                <div className="flex-grow-1 w-100">
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
                        <InfoIcon className="icon-dim-16 mr-4 " />
                        <div className="">Click to use:</div>
                        <button
                            type="button"
                            onClick={() => this.handleSSOURLLocation(`${window.location.origin}/orchestrator`)}
                            className="login__btn cg-5"
                        >
                            {window.location.origin}/orchestrator
                        </button>
                    </div>
                </div>
                {this.renderSSOCodeEditor()}
                {this.isAutoAssignPermissionFlowActive && (
                    <div className="w-100">
                        <AutoAssignToggleTile
                            ssoType={this.state.sso}
                            isSelected={this.state.shouldAutoAssignPermissions}
                            onChange={this.toggleAutoAssignPermissions}
                        />
                    </div>
                )}
            </div>
        )

        const renderSSOContent = () => (
            <div className="flex column left dc__mxw-1000 w-100 pb-64">
                <div className="px-20 py-16 dc__gap-24 flex column left w-100">
                    <FeatureTitleWithInfo
                        title={HEADER_TEXT.SSO_LOGIN.title}
                        renderDescriptionContent={() => HEADER_TEXT.SSO_LOGIN.description}
                        docLink={DOCUMENTATION.GLOBAL_CONFIG_SSO}
                        showInfoIconTippy
                        dataTestId="sso-login-heading"
                    />
                    {renderSSOBody()}
                </div>
                <div className="px-20 py-16 dc__border-top-n1 w-100 dc__position-fixed bg__primary dc__bottom-0">
                    <button
                        onClick={this.onLoginConfigSave}
                        tabIndex={5}
                        type="submit"
                        disabled={this.state.saveLoading}
                        className="cta small"
                        data-testid="sso-save-button"
                    >
                        {this.state.saveLoading ? <Progressing /> : this.renderButtonText()}
                    </button>
                </div>
            </div>
        )
        return (
            <section className="bg__primary sso-login__wrapper min-h-100">
                {renderSSOContent()}
                {/* Confirmation Modal for SSO Change */}
                <ConfirmationModal
                    variant={ConfirmationModalVariantType.warning}
                    title={`Use "${ssoProviderToDisplayNameMap[this.state.sso]}" instead of "${
                        ssoProviderToDisplayNameMap[this.state.lastActiveSSO?.name]
                    }" for login?`}
                    subtitle="This will end all active user sessions. Users would have to login again using updated SSO service."
                    buttonConfig={{
                        secondaryButtonConfig: {
                            text: 'Cancel',
                            disabled: this.state.saveLoading,
                            onClick: this.toggleWarningModal,
                        },
                        primaryButtonConfig: {
                            text: 'Confirm',
                            isLoading: this.state.saveLoading,
                            onClick: this.saveNewSSO,
                        },
                    }}
                    showConfirmationModal={showSSOChangeConfirmationModal}
                    handleClose={this.toggleWarningModal}
                />
                {/* Confirmation modal for permission auto-assignment */}
                {UserPermissionConfirmationModal && (
                    <UserPermissionConfirmationModal
                        handleSave={this.saveNewSSO}
                        handleCancel={this.handleAutoAssignConfirmationModalClose}
                        ssoType={this.state.sso}
                        isLoading={this.state.saveLoading}
                        showAutoAssignConfirmationModal={this.state.showAutoAssignConfirmationModal}
                    />
                )}
            </section>
        )
    }
}

export default withGlobalConfiguration(SSOLogin)
