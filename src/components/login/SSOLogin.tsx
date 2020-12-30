//@ts-nocheck
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
const configSwitch = 'configuration';
     
export default class SSOLogin extends Component<SSOLoginProps, SSOLoginState> {
    constructor(props) {
        super(props)
        this.state = {
            sso: "google",
            configMap: SwitchItemValues.Configuration,
            showToggling: false,
            // loginList: [],
            configList: [],
        }
        this.handleSSOClick = this.handleSSOClick.bind(this);
        this.toggleWarningModal = this.toggleWarningModal.bind(this);
        this.handleStageConfigChange = this.handleStageConfigChange.bind(this)
    }
    
    componentDidMount() {
        getSSOList().then((response) => {
            let list = response.result || [];
            // this.setState({
            //     loginList: list
            // })
            //Mock data
            console.log(response.result)

            let res = this.getMockData();
            this.setState({
               // sso: response.result[0].confid.id || "google",
                configList: response.result.map((ssoConfig) => {
                    return {
                        switch: 'configuration',
                        ...ssoConfig,
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

    handleSSOClick(event) {
        this.setState({
            sso: event.target.value
        })
    }

    toggleWarningModal(): void {
        this.setState({ showToggling: !this.state.showToggling });
    }

    onLoginConfigSave() {
        //Update
        if (this.state.configList[0].config) {
            //Update the same SSO
            if (this.state.configList[0].config.id == this.state.sso) {

                let payload = {
                    name: this.state.configList[0].name,
                    url: this.state.configList[0].url,
                    config: this.state.configList[0].config.toString().split(",").filter(item => item != "")
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

    handleStageConfigChange(value: string, key: 'configuration' | 'switch' ) {
        if (key != 'configuration') this.state.configList[key] = value
        else {
            if (this.state.configMap === SwitchItemValues.Configuration) { this.state.configList[key] = value }
        }
        this.setState({ configMap: JSON.stringify(config) })
    }

    renderSSOCodeEditor = () => {
       //  let codeEditorBody = this.state.configList[0].switch === SwitchItemValues.Configuration ? yamlJsParser.stringify(this.state.configList.map((item) => { return item }), { indent: 2 }) : this.state.configMap;
        let codeEditorBody = this.state.configMap === SwitchItemValues.Configuration ? yamlJsParser.stringify(this.state.configList[0], { indent: 2 }) : sample[this.state.sso];

        return <div className="sso__code-editor-wrap">
            <div className=" code-editor-container">
                <CodeEditor
                    value={codeEditorBody}
                    height={300}
                    mode='yaml'
                    readOnly={this.state.configMap !== SwitchItemValues.Configuration}
                    onChange={(event) => { this.handleStageConfigChange(event, 'configuration') }}>
                    <CodeEditor.Header >
                        <Switch value={this.state.configMap} name={this.state.sso} onChange={(event) => { this.handleStageConfigChange(event.target.value, key) }}>
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
                                <input type="radio" id="1" value="Google" name="status" onClick={this.handleSSOClick} />
                                <span className="tertiary-tab sso-icons">
                                    <aside className="login__icon-alignment"><img src={Google} /></aside>
                                    <aside className="login__text-alignment"> Google</aside>
                                </span>
                            </label>
                        </div>
                        <div >
                            <label className="tertiary-tab__radio ">
                                <input type="radio" name="status" value="Github" onClick={this.handleSSOClick} />
                                <span className="tertiary-tab sso-icons">
                                    <aside className="login__icon-alignment"><a href=""><GitHub /></a></aside>
                                    <aside className="login__text-alignment"> GitHub</aside>
                                </span>
                            </label>
                        </div>
                        <div>
                            <label className="tertiary-tab__radio ">
                                <input type="radio" name="status" value="Microsoft" onClick={this.handleSSOClick} />
                                <span className="tertiary-tab sso-icons">
                                    <aside className="login__icon-alignment"><img src={Microsoft} /></aside>
                                    <aside className="login__text-alignment"> Microsoft</aside>
                                </span>
                            </label>
                        </div>
                        <div>
                            <label className="tertiary-tab__radio ">
                                <input type="radio" name="status" value="LDAP" onClick={this.handleSSOClick} />
                                <span className="tertiary-tab sso-icons">
                                    <aside className="login__icon-alignment"><img src={LDAP} /></aside>
                                    <aside className="login__text-alignment">LDAP</aside>
                                </span>
                            </label>
                        </div>
                        <div>
                            <label className="tertiary-tab__radio ">
                                <input type="radio" name="status" value="SAML 2.0" onClick={this.handleSSOClick} />
                                <span className="tertiary-tab sso-icons">
                                    <aside className="login__icon-alignment"><img src={SAML} /></aside>
                                    <aside className="login__text-alignment"> SAML 2.0</aside>
                                </span>
                            </label>
                        </div>
                        <div>
                            <label className="tertiary-tab__radio ">
                                <input type="radio" name="status" value="OIDC" onClick={this.handleSSOClick} />
                                <span className="tertiary-tab sso-icons">
                                    <aside className="login__icon-alignment"><img src={OIDC} /></aside>
                                    <aside className="login__text-alignment">OIDC</aside>
                                </span>
                            </label>
                        </div>
                        <div>
                            <label className="tertiary-tab__radio ">
                                <input type="radio" name="status" value="OpenShift" onClick={this.handleSSOClick} />
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
