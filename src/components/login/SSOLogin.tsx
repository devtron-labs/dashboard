
import React, { Component } from 'react'
import { Progressing, ConfirmationDialog, DevtronSwitch as Switch, DevtronSwitchItem as SwitchItem, showError, ErrorScreenManager, } from '../common'
import CodeEditor from '../CodeEditor/CodeEditor';
import { SSOLoginProps, SSOLoginState, SSOLoginTabType } from './ssoConfig.types'
import { getSSOConfig, createSSOList, updateSSOList, getSSOConfigList } from './login.service'
import { SSOConfigType } from './ssoConfig.types'
import { ViewType, DOCUMENTATION } from '../../config'
import { toast } from 'react-toastify';
import yamlJsParser from 'yaml';
import sample from './sampleConfig.json';
import { ReactComponent as Google } from '../../assets/icons/ic-google.svg'
import Check from '../../assets/icons/ic-outline-check.svg'
import { ReactComponent as Help } from '../../assets/icons/ic-help.svg'
import { ReactComponent as GitHub } from '../../assets/icons/git/github.svg'
import { ReactComponent as Microsoft } from '../../assets/icons/ic-microsoft.svg'
import { ReactComponent as LDAP } from '../../assets/icons/ic-ldap.svg'
import { ReactComponent as OIDC } from '../../assets/icons/ic-oidc.svg'
import { ReactComponent as Openshift } from '../../assets/icons/ic-openshift.svg'
import { ReactComponent as GitLab } from '../../assets/icons/git/gitlab.svg'
import warn from '../../assets/icons/ic-warning.svg';
import './login.css';
import { ReactComponent as Warn } from '../../assets/icons/ic-info-warn.svg';

export const SwitchItemValues = {
    Sample: 'sample',
    Configuration: 'configuration',
};

enum SSOProvider {
    google = "google",
    github = "github",
    gitlab = "gitlab",
    microsoft = "microsoft",
    ldap = "ldap",
    oidc = "oidc",
    openshift = "openshift"
}

const ssoMap = {
    google: "https://dexidp.io/docs/connectors/google/",
    github: "https://dexidp.io/docs/connectors/github/",
    gitlab: "https://dexidp.io/docs/connectors/gitlab/",
    microsoft: "https://dexidp.io/docs/connectors/microsoft/",
    ldap: "https://dexidp.io/docs/connectors/ldap/",
    oidc: "https://dexidp.io/docs/connectors/oidc/",
    openshift: "https://dexidp.io/docs/connectors/openshift/",
}

const SSOTabIcons: React.FC<{ SSOName: string }> = ({ SSOName }) => {
    switch (SSOName) {
        case "Google": return <Google />
        case "GitHub": return <GitHub />
        case "GitLab": return <GitLab />
        case "Microsoft": return <Microsoft />
        case "LDAP": return <LDAP />
        case "OIDC": return <OIDC />
        case "OpenShift": return <Openshift />
    }
}

const SSOLoginTab: React.FC<SSOLoginTabType> = ({ handleSSOClick, checked, lastActiveSSO, value, SSOName }) => {
    return <label className="dc__tertiary-tab__radio">
        <input type="radio" value={value} checked={checked} name="status" onClick={handleSSOClick} />
        <span className="dc__tertiary-tab sso-icons">
            <aside className="login__icon-alignment"><SSOTabIcons SSOName={SSOName} /></aside>
            <aside className="login__text-alignment">{SSOName}</aside>
            <label>
                {lastActiveSSO?.name === value ? <aside className="login__check-icon"><img src={Check} /></aside> : ""}
            </label>
        </span>
    </label>
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
            isError: {
                url: "",
            }
        }
        this.handleSSOClick = this.handleSSOClick.bind(this);
        this.toggleWarningModal = this.toggleWarningModal.bind(this);
        this.handleURLChange = this.handleURLChange.bind(this);
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

    handleURLChange(event): void {
        this.setState({
            ssoConfig: {
                ...this.state.ssoConfig,
                url: event.target.value,
            },
            isError: {
                url: event.target.value.length === 0 ? "This is required field" : ""
            }
        })
    }

    toggleWarningModal(): void {
        this.setState({ showToggling: !this.state.showToggling, saveLoading: false });
    }

    parseResponse(ssoConfig): SSOConfigType {
        return {
            id: ssoConfig.id,
            name: ssoConfig.name,
            url: ssoConfig.url || "",
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
        if (!this.state.ssoConfig.url) {
            toast.error("Some required field are missing");
            return;
        }

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

        //Create SSO
        if (!this.state.lastActiveSSO) {

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
            <p className="m-0">config:</p>
            <p className="m-0">&nbsp;&nbsp;&nbsp;&nbsp;type: {this.state.ssoConfig.config.type}</p>
            <p className="m-0">&nbsp;&nbsp;&nbsp;&nbsp;name: {this.state.ssoConfig.config.name}</p>
            <p className="m-0">&nbsp;&nbsp;&nbsp;&nbsp;id: {this.state.ssoConfig.config.id}</p>
            <p className="m-0">&nbsp;&nbsp;&nbsp;&nbsp;config:</p>
        </div> : null;
        return <div className="mt-0 ml-24 mr-24 mb-24">
            <div className="code-editor-container">
                <CodeEditor value={codeEditorBody}
                    height={300}
                    mode='yaml'
                    lineDecorationsWidth={this.state.configMap === SwitchItemValues.Configuration ? 50 : 0}
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

    handleSSOURLLocation(value: string): void {
        this.setState({
            ssoConfig: {
                ...this.state.ssoConfig,
                url: value
            }
        })
    }

    getSSOLoginTabsArr() {
        let SSOLoginTabsArr = [
            { provider: SSOProvider.google, SSOName: "Google" },
            { provider: SSOProvider.github, SSOName: "GitHub" },
            { provider: SSOProvider.gitlab, SSOName: "GitLab" },
            { provider: SSOProvider.microsoft, SSOName: "Microsoft" },
            { provider: SSOProvider.ldap, SSOName: "LDAP" },
            { provider: SSOProvider.oidc, SSOName: "OIDC" },
            { provider: SSOProvider.openshift, SSOName: "OpenShift" }
        ]
        return SSOLoginTabsArr;
    }

    render() {
        if (this.state.view === ViewType.LOADING) {
            return <Progressing pageLoader />
        }
        else if (this.state.view === ViewType.ERROR) {
            return <div className="global-configuration__component flex h-100">
                <ErrorScreenManager code={this.state.statusCode} />
            </div>
        }

        return <section className="global-configuration__component">
            <h2 className="form__title">SSO Login Services</h2>
            <h5 className="form__subtitle">Configure and manage login service for your organization.
              <span><a rel="noreferrer noopener" target="_blank" className="dc__link" href={DOCUMENTATION.GLOBAL_CONFIG_SSO}> Learn more about SSO Login</a> </span>
            </h5>

            <div className="bcn-0 bw-1 en-2 br-8 pb-22">
                <div className="login__sso-flex pl-24">
                    {this.getSSOLoginTabsArr().map((item) => {
                        return <SSOLoginTab value={item.provider} SSOName={item.SSOName} checked={this.state.sso === item.provider} handleSSOClick={this.handleSSOClick} lastActiveSSO={this.state.lastActiveSSO} />
                    })}
                </div>
                <div className="dc__sso-description p-16 br-4 fs-14 eb-2 bw-1 mt-20 mb-20 ml-24 mr-24">
                    <div className="flexbox">
                        <Help className="icon-dim-20 fcb-5 mr-12" />
                        <div>For redirect URL or callback URL use:  {`${window.location.origin}/orchestrator`}/api/dex/callback<br />
                            Please ensure above URL is registered with the identity provider.</div>
                    </div>
                    <div className="mt-8 ml-32">
                        <span className="fw-6">Help: </span>See documentation for
                        <a rel="noreferrer noopener" href={`${ssoMap[this.state.sso]}`} target="_blank" className="login__auth-link"> Authentication through {this.state.sso}</a>
                    </div>
                </div>
                <label className="form__row mr-24 ml-24 mb-24">
                    <span className="form__label">URL*</span>
                    <input type="text" className="form__input" value={this.state.ssoConfig.url} onChange={this.handleURLChange} />
                    {this.state.isError.url && <div className="form__error">
                        {this.state.isError.url}
                    </div>}
                    <div className="flex left fw-4 pt-4">
                        <Warn className="icon-dim-16 mr-4 " />
                        <div className="">Click to use:</div>
                        <button type="button" onClick={(e) => this.handleSSOURLLocation(`${window.location.origin}/orchestrator`)} className="login__btn cg-5"> {window.location.origin}/orchestrator</button>
                    </div>
                </label>
                {this.renderSSOCodeEditor()}
                <div className="form__buttons mt-32 mr-24">
                    <button onClick={(e) => { e.preventDefault(); this.onLoginConfigSave() }} tabIndex={5} type="submit" disabled={this.state.saveLoading} className={`cta`}>{this.state.saveLoading ? <Progressing /> : this.state.ssoConfig.id ? 'Update' : 'Save'}</button>
                </div>
            </div>
            {this.state.showToggling ? <ConfirmationDialog>
                <ConfirmationDialog.Icon src={warn} />
                <div className="modal__title sso__warn-title">Use '{this.state.sso}' instead of '{this.state.lastActiveSSO?.name}' for login?</div>
                <p className="fs-13 cn-7 lh-1-54">This will end all active user sessions. Users would have to login again using updated SSO service.</p><ConfirmationDialog.ButtonGroup>
                    <button type="button" tabIndex={3} className="cta cancel sso__warn-button" onClick={this.toggleWarningModal}>Cancel</button>
                    <button type="submit" className="cta  sso__warn-button" onClick={this.saveNewSSO}>Confirm</button>
                </ConfirmationDialog.ButtonGroup>
            </ConfirmationDialog> : null}
        </section >
    }
}
