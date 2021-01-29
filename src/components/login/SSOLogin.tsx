
import React, { Component } from 'react'
import './login.css'
import { Progressing, ConfirmationDialog, DevtronSwitch as Switch, DevtronSwitchItem as SwitchItem, showError, ErrorScreenManager, } from '../common'
import Google from '../../assets/icons/ic-google.svg'
import Check from '../../assets/icons/ic-outline-check.svg'
import { ReactComponent as Help } from '../../assets/icons/ic-help.svg'
import { ReactComponent as GitHub } from '../../assets/icons/git/github.svg'
import Microsoft from '../../assets/icons/ic-microsoft.svg'
import LDAP from '../../assets/icons/ic-ldap.svg'
import SAML from '../../assets/icons/ic-saml.svg'
import OIDC from '../../assets/icons/ic-oidc.svg'
import Openshift from '../../assets/icons/ic-openshift.svg'
import { SSOLoginProps, SSOLoginState } from './ssoConfig.types'
import warn from '../../assets/icons/ic-warning.svg';
import { toast } from 'react-toastify';
import { getSSOConfig, createSSOList, updateSSOList, getSSOConfigList } from './login.service'
import CodeEditor from '../CodeEditor/CodeEditor';
import yamlJsParser from 'yaml';
import sample from './sampleConfig.json';
import { SSOConfigType } from './ssoConfig.types'
import { ViewType } from '../../config'

export const SwitchItemValues = {
    Sample: 'sample',
    Configuration: 'configuration',
};

const ssoMap = {
    google: "https://dexidp.io/docs/connectors/google/",
    github: "https://dexidp.io/docs/connectors/github/",
    microsoft: "https://dexidp.io/docs/connectors/microsoft/",
    ldap: "https://dexidp.io/docs/connectors/ldap/",
    saml: "https://dexidp.io/docs/connectors/saml/",
    oidc: "https://dexidp.io/docs/connectors/oidc/",
    openshift: "https://dexidp.io/docs/connectors/openshift/",
}

export default class SSOLogin extends Component<SSOLoginProps, SSOLoginState> {
    constructor(props) {
        super(props)
        this.state = {
            view: ViewType.LOADING,
            statusCode: 0,
            sso: "",
            lastActiveSSO: undefined,
            saveLoading: false,
            configMap: SwitchItemValues.Configuration,
            showToggling: false,
            ssoConfig: undefined,
        }
        this.handleSSOClick = this.handleSSOClick.bind(this);
        this.toggleWarningModal = this.toggleWarningModal.bind(this);
        this.handleConfigChange = this.handleConfigChange.bind(this);
        this.saveNewSSO = this.saveNewSSO.bind(this);
    }

    componentDidMount() {
        getSSOConfigList().then((res) => {
            let ssoConfig = res.result?.find(sso => sso.active);
            if (res.result && ssoConfig) {
                this.setState({ sso: ssoConfig?.name, lastActiveSSO: ssoConfig });
            }
            else {
                ssoConfig = sample['google'];
                this.setState({ sso: 'google', ssoConfig: this.parseResponse(ssoConfig) });
            }
        }).then(() => {
            if (this.state.lastActiveSSO && this.state.lastActiveSSO?.id) {
                getSSOConfig(this.state.lastActiveSSO?.name.toLowerCase()).then((response) => {
                    let newConfig = this.parseResponse(sample[this.state.lastActiveSSO.name.toLowerCase()]);
                    if (response.result) {
                        newConfig = this.parseResponse(response.result)
                    }
                    this.setState({
                        view: ViewType.FORM,
                        ssoConfig: newConfig,
                    })
                }).catch((error) => {
                    this.setState({ view: ViewType.ERROR, statusCode: error.code })
                })
            }
            else {
                this.setState({
                    view: ViewType.FORM,
                    ssoConfig: this.parseResponse(sample[this.state.sso]),
                })
            }
        }).catch((error) => {
            this.setState({ view: ViewType.ERROR, statusCode: error.code })
        })
    }

    handleSSOClick(event): void {
        let newsso = event.target.value;
        getSSOConfig(newsso).then((response) => {
            let newConfig = this.parseResponse(sample[newsso]);
            if (response.result) {
                newConfig = this.parseResponse(response.result)
            }
            this.setState({
                view: ViewType.FORM,
                sso: newsso,
                ssoConfig: newConfig,
            })
        }).catch((error) => {
            this.setState({ view: ViewType.ERROR, statusCode: error.code })
        })
    }

    toggleWarningModal(): void {
        this.setState({ showToggling: !this.state.showToggling });
    }

    parseResponse(ssoConfig): SSOConfigType {
        return {
            id: ssoConfig.id,
            name: ssoConfig.name,
            url: ssoConfig.url,
            config: {
                name: ssoConfig.config.name,
                type: ssoConfig.config.type,
                id: ssoConfig.config.id,
                config: yamlJsParser.stringify(ssoConfig.config.config, { indent: 2 })
            },
            active: ssoConfig.active
        }
    }

    saveNewSSO(): void {
        this.setState({ saveLoading: true });

        let configJSON: any = {};
        try {
            configJSON = yamlJsParser.parse(this.state.ssoConfig.config.config);
        } catch (error) {
            //Invalid YAML, couldn't be parsed to JSON. Show error toast
            toast.error("Invalid Yaml");
            this.setState({ saveLoading: false });
        }
        let payload = {
            id: this.state.ssoConfig?.id,
            name: this.state.sso,
            url: this.state.ssoConfig.url,
            config: {
                type: this.state.ssoConfig.config.type,
                id: this.state.ssoConfig.config.id,
                name: this.state.ssoConfig.config.name,
                config: configJSON
            },
            active: true,
        }
        let promise = this.state.ssoConfig.id ? updateSSOList(payload) : createSSOList(payload);
        promise.then((response) => {
            let ssoConfig = response.result;
            this.setState({
                view: ViewType.FORM,
                showToggling: false,
                saveLoading: false,
                ssoConfig: this.parseResponse(response.result),
                lastActiveSSO: {
                    id: ssoConfig.id,
                    name: ssoConfig.name,
                    active: ssoConfig.active,
                }
            });
            toast.success("Saved Successful");
        }).catch((error) => {
            showError(error);
            this.setState({ saveLoading: false });
        })
    }

    onLoginConfigSave(): void {
        this.setState({ saveLoading: true });

        let configJSON: any = {};
        try {
            configJSON = yamlJsParser.parse(this.state.ssoConfig.config.config);
        } catch (error) {
            //Invalid YAML, couldn't be parsed to JSON. Show error toast
            toast.error("Invalid Yaml");
            this.setState({ saveLoading: false });
        }

        //Create SSO
        if (!this.state.lastActiveSSO) {
            let payload = {
                id: this.state.ssoConfig.id,
                name: this.state.sso,
                url: this.state.ssoConfig.url,
                config: {
                    type: this.state.ssoConfig.config.type,
                    id: this.state.ssoConfig.config.id,
                    name: this.state.ssoConfig.config.name,
                    config: configJSON
                },
                active: true,
            }
            createSSOList(payload).then((response) => {
                let ssoConfig = response.result;
                this.setState({
                    view: ViewType.FORM,
                    saveLoading: false,
                    ssoConfig: this.parseResponse(response.result),
                    lastActiveSSO: {
                        id: ssoConfig.id,
                        name: ssoConfig.name,
                        active: ssoConfig.active,
                    }
                })
                toast.success("Saved Successful");
            }).catch((error) => {
                showError(error);
                this.setState({ saveLoading: false });
            })
        }
        //Update the same SSO
        else if (this.state.lastActiveSSO) {
            if (this.state.sso === this.state.lastActiveSSO?.name) {
                let payload = {
                    id: this.state.ssoConfig.id,
                    name: this.state.sso,
                    url: this.state.ssoConfig.url,
                    config: {
                        id: this.state.ssoConfig.config.id,
                        type: this.state.ssoConfig.config.type,
                        name: this.state.ssoConfig.config.name,
                        config: configJSON
                    },
                    active: true,
                }
                updateSSOList(payload).then((response) => {
                    let ssoConfig = response.result;
                    this.setState({
                        view: ViewType.FORM,
                        saveLoading: false,
                        ssoConfig: this.parseResponse(response.result),
                        lastActiveSSO: {
                            id: ssoConfig.id,
                            name: ssoConfig.name,
                            active: ssoConfig.active,
                        }
                    })
                    toast.success("Saved Successful");
                }).catch((error) => {
                    showError(error);
                    this.setState({ saveLoading: false });
                })
            }
            else {
                this.toggleWarningModal();
            }
        }
    }

    handleConfigChange(value: string): void {
        if (this.state.configMap !== SwitchItemValues.Configuration) return;

        this.setState({
            ssoConfig: {
                ...this.state.ssoConfig,
                config: {
                    name: this.state.ssoConfig.config.name,
                    type: this.state.ssoConfig.config.type,
                    id: this.state.ssoConfig.config.id,
                    config: value,
                },
            }
        });
    }

    handleCodeEditorTab(value: string): void {
        this.setState({ configMap: value })
    }

    renderSSOCodeEditor() {
        let ssoConfig = this.state.ssoConfig.config.config || yamlJsParser.stringify({}, { indent: 2 });
        let codeEditorBody = this.state.configMap === SwitchItemValues.Configuration ? ssoConfig : yamlJsParser.stringify(sample[this.state.sso], { indent: 2 });
        let shebangHtml = this.state.configMap === SwitchItemValues.Configuration ? <div style={{ resize: 'none', lineHeight: '1.4', border: 'none', padding: `0 35px`, overflow: 'none', color: '#f32e2e', fontSize: '14px', fontFamily: 'Consolas, "Courier New", monospace' }} className="w-100">
            <p className="m-0"> - type: {this.state.ssoConfig.config.type}</p>
            <p className="m-0">&nbsp;&nbsp;name: {this.state.ssoConfig.config.name}</p>
            <p className="m-0">&nbsp;&nbsp;id: {this.state.ssoConfig.config.id}</p>
            <p className="m-0">&nbsp;&nbsp;config:</p>
        </div> : null;
        return <div className="sso__code-editor-wrap">
            <div className="code-editor-container">
                <CodeEditor value={codeEditorBody}
                    height={300}
                    mode='yaml'
                    lineDecorationsWidth={this.state.configMap === SwitchItemValues.Configuration ? 32 : 0}
                    shebang={shebangHtml}
                    readOnly={this.state.configMap !== SwitchItemValues.Configuration}
                    onChange={(event) => { this.handleConfigChange(event) }}>
                    <CodeEditor.Header >
                        <Switch value={this.state.configMap} name={'tab'} onChange={(event) => { this.handleCodeEditorTab(event.target.value) }}>
                            <SwitchItem value={SwitchItemValues.Configuration}> Configuration  </SwitchItem>
                            <SwitchItem value={SwitchItemValues.Sample}>  Sample Script</SwitchItem>
                        </Switch>
                        <CodeEditor.ValidationError />
                    </CodeEditor.Header>
                </CodeEditor>
            </div>
        </div>
    }

    render() {
        if (this.state.view === ViewType.LOADING) {
            return <Progressing pageLoader />
        }
        else if (this.state.view === ViewType.ERROR) {
            return <div style={{ height: "calc(100vh - 80px)" }} className="flex">
                <ErrorScreenManager code={this.state.statusCode} />
            </div>
        }
        return <section className="git-page">
            <h2 className="form__title">SSO Login Services</h2>
            <h5 className="form__subtitle">Configure and manage login service for your organization. &nbsp;
            </h5>
            <div className="login__sso-wrapper">
                <div className="login__sso-flex">
                    <div>
                        <label className="tertiary-tab__radio ">
                            <input type="radio" value="google" checked={this.state.sso === "google"} name="status" onClick={this.handleSSOClick} />
                            <span className="tertiary-tab sso-icons">
                                <aside className="login__icon-alignment"><img src={Google} /></aside>
                                <aside className="login__text-alignment">Google</aside>
                                <label>
                                    {this.state.lastActiveSSO?.name == "google" ? <aside className="login__check-icon"><img src={Check} /></aside> : ""}
                                </label>
                            </span>
                        </label>
                    </div>
                    <div>
                        <label className="tertiary-tab__radio ">
                            <input type="radio" name="status" value="github" checked={this.state.sso === "github"} onClick={this.handleSSOClick} />
                            <span className="tertiary-tab sso-icons">
                                <aside className="login__icon-alignment"><GitHub /></aside>
                                <aside className="login__text-alignment"> GitHub</aside>
                                <label>
                                    {this.state.lastActiveSSO?.name == "github" ? <aside className="login__check-icon"><img src={Check} /></aside> : ''}
                                </label>
                            </span>
                        </label>
                    </div>
                    <div>
                        <label className="tertiary-tab__radio ">
                            <input type="radio" name="status" value="microsoft" checked={this.state.sso === "microsoft"} onClick={this.handleSSOClick} />
                            <span className="tertiary-tab sso-icons">
                                <aside className="login__icon-alignment "><img src={Microsoft} /></aside>
                                <aside className="login__text-alignment"> Microsoft</aside>
                                <label>
                                    {this.state.lastActiveSSO?.name == "microsoft" ? <aside className="login__check-icon"><img src={Check} /></aside> : ''}
                                </label>
                            </span>

                        </label>
                    </div>
                    <div>
                        <label className="tertiary-tab__radio ">
                            <input type="radio" name="status" value="ldap" checked={this.state.sso === "ldap"} onClick={this.handleSSOClick} />
                            <span className="tertiary-tab sso-icons">
                                <aside className="login__icon-alignment"><img src={LDAP} /></aside>
                                <aside className="login__text-alignment">LDAP</aside>
                                <label>
                                    {this.state.lastActiveSSO?.name == "ldap" ? <aside className="login__check-icon"><img src={Check} /></aside> : ''}
                                </label>
                            </span>
                        </label>
                    </div>
                    <div>
                        <label className="tertiary-tab__radio ">
                            <input type="radio" name="status" value="saml" checked={this.state.sso === "saml"} onClick={this.handleSSOClick} />
                            <span className="tertiary-tab sso-icons">
                                <aside className="login__icon-alignment"><img src={SAML} /></aside>
                                <aside className="login__text-alignment"> SAML 2.0</aside>
                                <label>
                                    {this.state.lastActiveSSO?.name == "saml" ? <aside className="login__check-icon"><img src={Check} /></aside> : ''}
                                </label>
                            </span>
                        </label>
                    </div>
                    <div>
                        <label className="tertiary-tab__radio ">
                            <input type="radio" name="status" value="oidc" checked={this.state.sso === "oidc"} onClick={this.handleSSOClick} />
                            <span className="tertiary-tab sso-icons">
                                <aside className="login__icon-alignment"><img src={OIDC} /></aside>
                                <aside className="login__text-alignment">OIDC</aside>
                                <label>
                                    {this.state.lastActiveSSO?.name == "oidc" ? <aside className="login__check-icon"><img src={Check} /></aside> : ''}
                                </label>
                            </span>
                        </label>
                    </div>
                    <div>
                        <label className="tertiary-tab__radio ">
                            <input type="radio" name="status" value="openshift" checked={this.state.sso === "openshift"} onClick={this.handleSSOClick} />
                            <span className="tertiary-tab sso-icons">
                                <aside className="login__icon-alignment"><img src={Openshift} /></aside>
                                <aside className="login__text-alignment"> OpenShift</aside>
                                <label>
                                    {this.state.lastActiveSSO?.name == "openshift" ? <aside className="login__check-icon"><img src={Check} /></aside> : ''}
                                </label>
                            </span>
                        </label>
                    </div>
                </div>
                <div className="sso__description">
                    <div className="flex">
                        <Help className="icon-dim-20 vertical-align-middle fcb-5 mr-12" />
                        <div><span className="login__bold">Help: </span>See documentation for
                        <a rel="noreferrer noopener" href={`${ssoMap[this.state.sso]}`} target="_blank" className="login__auth-link"> Authentication through {this.state.sso}</a></div>
                    </div>
                </div>

                {this.renderSSOCodeEditor()}

                <div className="form__buttons mr-24">
                    <button onClick={(e) => { e.preventDefault(); this.onLoginConfigSave() }} tabIndex={5} type="submit" disabled={this.state.saveLoading} className={`cta`}>{this.state.saveLoading ? <Progressing /> : this.state.ssoConfig.id ? 'Update' : 'Save'}</button>
                </div>
            </div>

            {this.state.showToggling ? <ConfirmationDialog>
                <ConfirmationDialog.Icon src={warn} />
                <div className="modal__title sso__warn-title">Use '{this.state.sso}' instead of '{this.state.lastActiveSSO?.name}' for login?</div>
                <p className="modal__description sso__warn-description">This will end all active user sessions. Users would have to login again using updated SSO service.</p><ConfirmationDialog.ButtonGroup>
                    <button type="button" tabIndex={3} className="cta cancel sso__warn-button" onClick={this.toggleWarningModal}>Cancel</button>
                    <button type="submit" className="cta  sso__warn-button" onClick={this.saveNewSSO}>Confirm</button>
                </ConfirmationDialog.ButtonGroup>
            </ConfirmationDialog> : null}
        </section >
    }
}
