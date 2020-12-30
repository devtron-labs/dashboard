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
import { SSOLoginProps, SSOLoginState } from './types'
import warn from '../../assets/icons/ic-warning.svg';
import { toast } from 'react-toastify';
import { getSSOList, createSSOList, updateSSOList } from './service'
import CodeEditor from '../CodeEditor/CodeEditor';
import yamlJsParser from 'yaml';
import config from './sampleConfig.json'
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

// const configMap = {
//     config: {
//         type: "",
//         id: "",
//         name: "",
//         config: {
//             issuer: "",
//             clientID: "",
//             clientSecret: "",
//             redirectURI: "",
//             hostedDomains: []
//         }
//     }
// }
// const configSwitch = 'configuration';

export default class SSOLogin extends Component<SSOLoginProps, SSOLoginState> {
    constructor(props) {
        super(props)
        this.state = {
            sso: "google",
            isLoading: true,
            configMap: SwitchItemValues.Configuration,
            showToggling: false,
            // loginList: [],
            configList: [],
        }
        this.handleSSOClick = this.handleSSOClick.bind(this);
        this.toggleWarningModal = this.toggleWarningModal.bind(this);
        this.handleConfigChange = this.handleConfigChange.bind(this)
    }

    componentDidMount() {
        getSSOList().then((response) => {
            let list = response.result || [];
            // this.setState({
            //     loginList: list
            // })
            //Mock data
            let res = this.getMockData();

            this.setState({
                isLoading: false,
                sso: res.result[0]?.config?.id || "google",
                configList: res.result.map((ssoConfig) => {
                    return {
                        ...ssoConfig,
                        config: yamlJsParser.stringify(ssoConfig.config, { indent: 2 })
                    }
                }),
            })
        })
    }

    getMockData() {
        return {
            result: [{
                name: "gitlab3",
                url: "http://gitlab.com",
                config: {
                    type: "oidc",
                    id: "google",
                    name: "Google",
                    config: {
                        "issuer": "https://accounts.google.com",
                        "clientID": "140226597160-1cd76.apps.googleusercontent.com",
                        "clientSecret": "tytytyttyttytytytytyty",
                        "redirectURI": "",
                        "hostedDomains": [
                        ]
                    }
                },
                active: true,
            }]
        }
    }

    handleSSOClick(event): void {
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
            configJSON = yamlJsParser.parse(this.state.configList[0].config);

        } catch (error) {
            //Invalid YAML, couldn't be parsed to JSON. Show error toast 
        }

        //Update
        if (this.state.configList[0].config) {
            //Update the same SSO
            if (configJSON.id && configJSON.id == this.state.sso) {

                let payload = {
                    name: this.state.configList[0].name,
                    url: this.state.configList[0].url,
                    config: configJSON,
                }

                updateSSOList(payload).then((response) => {
                    let config = response.result || [];
                    this.setState({
                        configList: config
                    });
                })

            }
            //update another sso
            else {
                return (<ConfirmationDialog>
                    <ConfirmationDialog.Icon src={warn} />
                    <div className="modal__title sso__warn-title">Use 'Github' instead of 'Google' for login?</div>
                    <p className="modal__description sso__warn-description">This will end all active user sessions. Users would have to login again using updated SSO service.</p>
                    <ConfirmationDialog.ButtonGroup>
                        <button type="button" tabIndex={3} className="cta cancel sso__warn-button" onClick={this.toggleWarningModal}>Cancel</button>
                        <button type="submit" className="cta  sso__warn-button" >Confirm</button>
                    </ConfirmationDialog.ButtonGroup>
                </ConfirmationDialog>)
            }
        }
        //Create SSO
        else {

        }
    }

    handleConfigChange(value: string): void {
        try {
            let configList = [{
                ...this.state.configList[0],
                config: value
            }];
            this.setState({ configList: configList });
        } catch (error) {

        }
    }

    handleCodeEditorTab(value: string): void {
        this.setState({ configMap: value })
    }

    renderSSOCodeEditor = () => {
        //  let codeEditorBody = this.state.configList[0].switch === SwitchItemValues.Configuration ? yamlJsParser.stringify(this.state.configList.map((item) => { return item }), { indent: 2 }) : this.state.configMap;
        let codeEditorBody = this.state.configMap === SwitchItemValues.Configuration ? this.state.configList[0].config : yamlJsParser.stringify(sample[this.state.sso], { indent: 2 });
        return <div className="sso__code-editor-wrap">
            <div className="code-editor-container">
                <CodeEditor
                    value={codeEditorBody}
                    height={300}
                    mode='yaml'
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
        if (this.state.isLoading) return <Progressing pageLoader />
        return (
            <section className="git-page">
                <h2 className="form__title">SSO Login Services</h2>
                <h5 className="form__subtitle">Configure and manage login service for your organization. &nbsp;
            <a href={``} rel="noopener noreferrer" target="_blank">

                    </a>
                </h5>
                <div className="login__sso-wrapper">
                    <div className="login__sso-flex">
                        <div >
                            <label className="tertiary-tab__radio ">
                                <input type="radio" id="1" value="google" name="status" onClick={this.handleSSOClick} />
                                <span className="tertiary-tab sso-icons">
                                    <aside className="login__icon-alignment"><img src={Google} /></aside>
                                    <aside className="login__text-alignment"> Google</aside>
                                </span>
                            </label>
                        </div>
                        <div >
                            <label className="tertiary-tab__radio ">
                                <input type="radio" name="status" value="github" onClick={this.handleSSOClick} />
                                <span className="tertiary-tab sso-icons">
                                    <aside className="login__icon-alignment"><a href=""><GitHub /></a></aside>
                                    <aside className="login__text-alignment"> GitHub</aside>
                                </span>
                            </label>
                        </div>
                        <div>
                            <label className="tertiary-tab__radio ">
                                <input type="radio" name="status" value="microsoft" onClick={this.handleSSOClick} />
                                <span className="tertiary-tab sso-icons">
                                    <aside className="login__icon-alignment"><img src={Microsoft} /></aside>
                                    <aside className="login__text-alignment"> Microsoft</aside>
                                </span>
                            </label>
                        </div>
                        <div>
                            <label className="tertiary-tab__radio ">
                                <input type="radio" name="status" value="ldap" onClick={this.handleSSOClick} />
                                <span className="tertiary-tab sso-icons">
                                    <aside className="login__icon-alignment"><img src={LDAP} /></aside>
                                    <aside className="login__text-alignment">LDAP</aside>
                                </span>
                            </label>
                        </div>
                        <div>
                            <label className="tertiary-tab__radio ">
                                <input type="radio" name="status" value="saml" onClick={this.handleSSOClick} />
                                <span className="tertiary-tab sso-icons">
                                    <aside className="login__icon-alignment"><img src={SAML} /></aside>
                                    <aside className="login__text-alignment"> SAML 2.0</aside>
                                </span>
                            </label>
                        </div>
                        <div>
                            <label className="tertiary-tab__radio ">
                                <input type="radio" name="status" value="oidc" onClick={this.handleSSOClick} />
                                <span className="tertiary-tab sso-icons">
                                    <aside className="login__icon-alignment"><img src={OIDC} /></aside>
                                    <aside className="login__text-alignment">OIDC</aside>
                                </span>
                            </label>
                        </div>
                        <div>
                            <label className="tertiary-tab__radio ">
                                <input type="radio" name="status" value="openshift" onClick={this.handleSSOClick} />
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
                            <div><span className="login__bold">Help: </span>See documentation for <a rel="noreferrer noopener" href={``} target="_blank" className="login__auth-link"> Authentication Through {this.state.sso}</a></div>
                        </div>
                    </div>

                    {this.renderSSOCodeEditor()}

                    <div className="form__buttons mr-24">
                        <button onClick={() => this.onLoginConfigSave()} tabIndex={5} type="button" className={`cta`}>Save</button>
                    </div>
                </div>


            </section>

        )
    }
}
