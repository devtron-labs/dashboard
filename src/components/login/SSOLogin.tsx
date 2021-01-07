import React, { Component } from 'react'
import './login.css'
import { Progressing, useForm, showError, ConfirmationDialog, DevtronSwitch as Switch, DevtronSwitchItem as SwitchItem, } from '../common'
import Google from '../../assets/icons/ic-google.svg'
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
            sso: "",
            saveLoading:true,
            lastActiveSSO: "",
            isLoading: true,
            configMap: SwitchItemValues.Configuration,
            showToggling: false,
            ssoConfig: undefined,
        }
        this.handleSSOClick = this.handleSSOClick.bind(this);
        this.toggleWarningModal = this.toggleWarningModal.bind(this);
        this.handleConfigChange = this.handleConfigChange.bind(this)
    }

    componentDidMount() {
        getSSOConfigList().then((res) => {
            let sso = res.result.find(sso => sso.active);
            console.log(res);
            this.setState({ sso: sso, lastActiveSSO: sso });
        }).then(() => {
            getSSOConfig(this.state.lastActiveSSO).then((response) => {
                this.setState({
                    isLoading: false,
                    sso: response.result.config.name,
                    ssoConfig: response.result.map((ssoConfig) => {
                        return {
                            name: ssoConfig.name,
                            url: ssoConfig.url,
                            config: {
                                ...ssoConfig.config,
                                config: yamlJsParser.stringify(ssoConfig.config.config, { indent: 2 })
                            },
                            active: ssoConfig.active,
                        }
                    })
                }, () => {
                    console.log(this.state)
                })
            })

        }).catch((error) => {
            this.setState({ isLoading: false })
        })
    }

    handleSSOClick(event): void {
        getSSOConfig(this.state.ssoConfig.config.config).then((response)=>{
           console.log(response) 
           this.setState({
                sso: response.result.config.name,
                ssoConfig: response.result.map((ssoConfig) => {
                    return {
                        name: ssoConfig.name,
                        url: ssoConfig.url,
                        config: {
                            ...ssoConfig.config,
                            config: yamlJsParser.stringify(ssoConfig.config.config, { indent: 2 })
                        },
                        active: ssoConfig.active,
                    }
                })
           })

        })
        this.setState({
            sso: event.target.value
        })
    }

    toggleWarningModal(): void {
        this.setState({ showToggling: !this.state.showToggling });
    }

    onLoginConfigSave() {
        let configJSON: any = {};
        try {
            configJSON = yamlJsParser.parse(this.state.ssoConfig.config.id);
        } catch (error) {
            //Invalid YAML, couldn't be parsed to JSON. Show error toast
        }

        //Update
        if (this.state.ssoConfig?.config) {
            let payload = {};
            //Update the same SSO
            if (configJSON.id && configJSON.id == this.state.sso) {
                payload = {
                    name: this.state.ssoConfig.name,
                    url: this.state.ssoConfig.url,
                    config: configJSON,
                }
            }
            //update another sso
            else {
                payload = {
                    name: this.state.ssoConfig.name,
                    url: this.state.ssoConfig.url,
                    config: configJSON,
                }
            }
            console.log(payload);

            updateSSOList(payload).then((response) => {
                let config = response.result || [];
                this.setState({
                    ssoConfig: config
                });
            })
        }
        //Create SSO
        else {
            let payload = {
                name: this.state.sso,
                url: ssoMap[this.state.sso],
                config: configJSON,
            }
            console.log(payload);

            createSSOList(payload).then((response) => {
                let config = response.result || [];
                if (config) {
                    this.setState({
                        ssoConfig: config
                    });
                    toast.success('Saved');
                }
            })
        }
    }

    handleConfigChange(value: string): void {
            try {
                this.setState({
                    ssoConfig: {
                        ...this.state.ssoConfig,
                        config: {
                            ...this.state.ssoConfig.config,
                            config: value,
                        },
                    }
                });
              } catch (error) {
            }
    }

    handleCodeEditorTab(value: string): void {
        this.setState({ configMap: value })
    }

    renderSSOCodeEditor() {
        let ssoConfig = this.state.ssoConfig?.config?.config || yamlJsParser.stringify({}, { indent: 2 });
        let codeEditorBody = this.state.configMap === SwitchItemValues.Configuration ? ssoConfig
            : yamlJsParser.stringify(sample[this.state.sso], { indent: 2 });

        let shebangJSON = this.state.ssoConfig?.config || {};
        delete shebangJSON['config'];
        shebangJSON['config'] = "";

        let shebangHtml = <textarea style={{ resize: 'none', height: 'auto', border: 'none', padding: `0 60px`, overflow: 'none' }} className="w-100" disabled value={yamlJsParser.stringify(shebangJSON, { indent: 6 })}> </textarea>
        return <div className="sso__code-editor-wrap">
            <div className="code-editor-container">
                <CodeEditor value={codeEditorBody}
                    height={300}
                    mode='yaml'
                    shebang={shebangHtml}
                    // shebang={`${yamlJsParser.stringify(shebangJSON, { indent: 2 })}`}
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
        let sso = sample[this.state.sso];

        if (this.state.isLoading) return <Progressing pageLoader />

        return <section className="git-page">
            <h2 className="form__title">SSO Login Services</h2>
            <h5 className="form__subtitle">Configure and manage login service for your organization. &nbsp;
                    <a href={``} rel="noopener noreferrer" target="_blank">
                </a>
            </h5>
            <div className="login__sso-wrapper">
                <div className="login__sso-flex">
                    <div>
                        <label className="tertiary-tab__radio ">
                            <input type="radio" id="1" value="google" checked={this.state.sso === "google"} name="status" onClick={this.handleSSOClick} />
                            <span className="tertiary-tab sso-icons">
                                <aside className="login__icon-alignment"><img src={Google} /></aside>
                                <aside className="login__text-alignment">Google</aside>
                            </span>
                        </label>
                    </div>
                    <div>
                        <label className="tertiary-tab__radio ">
                            <input type="radio" name="status" value="github" checked={this.state.sso === "github"} onClick={this.handleSSOClick} />
                            <span className="tertiary-tab sso-icons">
                                <aside className="login__icon-alignment"><a href=""><GitHub /></a></aside>
                                <aside className="login__text-alignment"> GitHub</aside>
                            </span>
                        </label>
                    </div>
                    <div>
                        <label className="tertiary-tab__radio ">
                            <input type="radio" name="status" value="microsoft" checked={this.state.sso === "microsoft"} onClick={this.handleSSOClick} />
                            <span className="tertiary-tab sso-icons">
                                <aside className="login__icon-alignment"><img src={Microsoft} /></aside>
                                <aside className="login__text-alignment"> Microsoft</aside>
                            </span>
                        </label>
                    </div>
                    <div>
                        <label className="tertiary-tab__radio ">
                            <input type="radio" name="status" value="ldap" checked={this.state.sso === "ldap"} onClick={this.handleSSOClick} />
                            <span className="tertiary-tab sso-icons">
                                <aside className="login__icon-alignment"><img src={LDAP} /></aside>
                                <aside className="login__text-alignment">LDAP</aside>
                            </span>
                        </label>
                    </div>
                    <div>
                        <label className="tertiary-tab__radio ">
                            <input type="radio" name="status" value="saml" checked={this.state.sso === "saml"} onClick={this.handleSSOClick} />
                            <span className="tertiary-tab sso-icons">
                                <aside className="login__icon-alignment"><img src={SAML} /></aside>
                                <aside className="login__text-alignment"> SAML 2.0</aside>
                            </span>
                        </label>
                    </div>
                    <div>
                        <label className="tertiary-tab__radio ">
                            <input type="radio" name="status" value="oidc" checked={this.state.sso === "oidc"} onClick={this.handleSSOClick} />
                            <span className="tertiary-tab sso-icons">
                                <aside className="login__icon-alignment"><img src={OIDC} /></aside>
                                <aside className="login__text-alignment">OIDC</aside>
                            </span>
                        </label>
                    </div>
                    <div>
                        <label className="tertiary-tab__radio ">
                            <input type="radio" name="status" value="openshift" checked={this.state.sso === "openshift"} onClick={this.handleSSOClick} />
                            <span className="tertiary-tab sso-icons">
                                <aside className="login__icon-alignment"><img src={Openshift} /></aside>
                                <aside className="login__text-alignment"> OpenShift</aside>
                            </span>
                        </label>
                    </div>
                </div>
                <div className="login__description">
                    <div className="login__link flex">
                        <Help className="icon-dim-20 vertical-align-middle fcb-5 mr-12" />
                        <div><span className="login__bold">Help: </span>See documentation for <a rel="noreferrer noopener" href={`${sso.url}`} target="_blank" className="login__auth-link"> Authentication Through {this.state.sso}</a></div>
                    </div>
                </div>

                {this.renderSSOCodeEditor()}

                <div className="form__buttons mr-24">
                    <button onClick={(e) => { e.preventDefault(); this.onLoginConfigSave() }} tabIndex={5} type="submit" disabled={this.state.saveLoading} className={`cta`}>{this.state.saveLoading? <Progressing/>: this.state.ssoConfig.name == this.state.lastActiveSSO ?  'Update':'Save'}</button>
                </div>
            </div>

            {this.state.showToggling ? <ConfirmationDialog>
                <ConfirmationDialog.Icon src={warn} />
                <div className="modal__title sso__warn-title">Use '{this.state.ssoConfig.name}' instead of '{this.state.lastActiveSSO}' for login?</div>
                <p className="modal__description sso__warn-description">This will end all active user sessions. Users would have to login again using updated SSO service.</p>
                <ConfirmationDialog.ButtonGroup>
                    <button type="button" tabIndex={3} className="cta cancel sso__warn-button" onClick={this.toggleWarningModal}>Cancel</button>
                    <button type="submit" className="cta  sso__warn-button" >Confirm</button>
                </ConfirmationDialog.ButtonGroup>
            </ConfirmationDialog> : null}
        </section>
    }
}
