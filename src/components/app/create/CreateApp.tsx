import React, { Component } from 'react';
import { Select, DialogForm, DialogFormSubmit, Progressing, showError, ErrorScreenManager } from '../../common';
import { AddNewAppProps, AddNewAppState } from '../types';
import { ViewType, getAppComposeURL, APP_COMPOSE_STAGE } from '../../../config';
import { ValidationRules } from './validationRules';
import { getTeamListMin, getAppListMin } from '../../../services/service';
import { createApp } from './service';
import { toast } from 'react-toastify';
import { ServerErrors } from '../../../modals/commonTypes';
import { ReactComponent as Error } from '../../../assets/icons/ic-warning.svg';
import { ReactComponent as Info } from '../../../assets/icons/ic-info-filled.svg';
import './createApp.css';

export class AddNewApp extends Component<AddNewAppProps, AddNewAppState> {
    rules = new ValidationRules();
    _inputAppName: HTMLInputElement;

    constructor(props) {
        super(props);
        this.state = {
            view: ViewType.FORM,
            code: 0,
            projects: [],
            apps: [],
            disableForm: false,
            showErrors: false,
            form: {
                appId: 0,
                projectId: 0,
                appName: "",
                cloneId: 0,
            },
            isValid: {
                projectId: false,
                appName: false,
            }
        }
        this.createApp = this.createApp.bind(this);
        this.handleAppname = this.handleAppname.bind(this);
        this.handleProject = this.handleProject.bind(this);
    }

    async componentDidMount() {
        try {
            const [{ result: projects }, { result: apps }] = await Promise.all([getTeamListMin(), getAppListMin()])
            this.setState({ view: ViewType.FORM, projects, apps: [{ id: 0, name: 'Blank App' }, ...apps] })
        }
        catch (err) {
            this.setState({ view: ViewType.ERROR });
            showError(err)
        }
        finally {
            if (this._inputAppName) this._inputAppName.focus();
        }
    }

    handleAppname(event: React.ChangeEvent<HTMLInputElement>): void {
        let { form, isValid } = { ...this.state };
        form.appName = event.target.value;
        isValid.appName = this.rules.appName(event.target.value).isValid;
        this.setState({ form, isValid });
    }

    handleProject(item: number, appId): void {
        let { form, isValid } = { ...this.state };
        form.projectId = item;
        isValid.projectId = !!item;
        this.setState({ form, isValid });
    }

    createApp(): void {
        this.setState({ showErrors: true });
        let allKeys = Object.keys(this.state.isValid);
        let isFormValid = allKeys.reduce((valid, key) => {
            valid = valid && this.state.isValid[key];
            return valid;
        }, true);
        if (!isFormValid) return;

        let request = {
            appName: this.state.form.appName,
            teamId: this.state.form.projectId,
            templateId: this.state.form.cloneId,
        }
        this.setState({ disableForm: true });
        createApp(request).then((response) => {
            if (response.result) {
                let { form, isValid } = { ...this.state };
                form.appId = response.result.id;
                form.appName = response.result.appName;
                isValid.appName = true;
                isValid.projectId = true;
                this.setState({ code: response.code, form, isValid, disableForm: false, showErrors: false }, () => {
                    toast.success('Your application is created. Go ahead and set it up.');
                    this.redirectToArtifacts(this.state.form.appId);
                })
            }
        }).catch((errors: ServerErrors) => {
            if (Array.isArray(errors.errors)) {
                errors.errors.map(({ userMessage }) => toast.error(userMessage));
                this.setState({ code: errors.code });
            }
            else {
                showError(errors);
            }
            this.setState({ disableForm: false, showErrors: false });
        })
    }

    handleClone(cloneId, appId) {
        this.setState(state => ({ ...state, form: { ...state.form, cloneId } }));
    }

    redirectToArtifacts(appId): void {
        let url = getAppComposeURL(appId, APP_COMPOSE_STAGE.SOURCE_CONFIG);
        this.props.history.push(url);
    }

    render() {
        let errorObject = [this.rules.appName(this.state.form.appName), this.rules.team(this.state.form.projectId)];
        let showError = this.state.showErrors;
        let provider = this.state.projects.find(project => this.state.form.projectId === project.id);
        let clone = this.state.apps.find(app => this.state.form.cloneId === app.id);
        if (this.state.view === ViewType.LOADING) {
            return <DialogForm title="Add New App"
                isLoading={this.state.disableForm}
                className=""
                close={this.props.close}
                onSave={(e) => { e.preventDefault(); this.createApp() }}
                closeOnESC={true}>
                <div style={{ height: "224px" }}>
                    <Progressing pageLoader />
                </div>
            </DialogForm>
        }
        if (this.state.view === ViewType.ERROR) {
            return <DialogForm title="Add New App"
                isLoading={this.state.disableForm}
                className=""
                close={this.props.close}
                onSave={(e) => { e.preventDefault(); this.createApp() }}
                closeOnESC={true}>
                <ErrorScreenManager code={this.state.code} />
            </DialogForm>
        }
        else {
            return <DialogForm title="Add New App"
                isLoading={this.state.disableForm}
                className=""
                close={this.props.close}
                onSave={(e) => { e.preventDefault(); this.createApp() }}
                closeOnESC={true}>
                <label className="form__row">
                    <span className="form__label">App Name*</span>
                    <input ref={node => this._inputAppName = node} className="form__input" type="text" name="app-name" value={this.state.form.appName}
                        placeholder="e.g. my-first-app" autoComplete="off" autoFocus={true} tabIndex={1} onChange={this.handleAppname} required />
                    <span className="form__error">
                        {showError && !this.state.isValid.appName
                            ? <><Error className="form__icon form__icon--error" />{errorObject[0].message} <br /></>
                            : null}
                    </span>
                    <span className="form__text-field-info">
                        <Info className="form__icon form__icon--info" />
                        Apps are NOT env specific and can be used to deploy to multiple environments.
                    </span>
                </label>
                <div className="form__row">
                    <span className="form__label">Project*</span>
                    <Select value={this.state.form.projectId} onChange={e => this.handleProject(e.target.value, this.state.form.appId)} >
                        <Select.Button rootClassName="select-button--default">{provider ? provider.name : "Select Project"}</Select.Button>
                        {this.state.projects.map((team) => {
                            return <Select.Option value={team.id} key={team.id} >
                                {team.name}
                            </Select.Option>
                        })}
                    </Select>
                    <span className="form__error">
                        {showError && !this.state.isValid.projectId
                            ? <><Error className="form__icon form__icon--error" />{errorObject[1].message}</>
                            : null}
                    </span>
                </div>
                <div className="form__row clone-apps inline-block">
                    <span className="form__label">Template</span>
                    <Select value={clone ? clone.id : null} onChange={e => this.handleClone(e.target.value, this.state.form.appId)} >
                        <Select.Button rootClassName="select-button--default">{clone ? clone.name : "Select Clone"}</Select.Button>
                        <Select.Search />
                        {this.state.apps.map((app) => {
                            return <Select.Option value={app.id} key={app.id} name={app.name}>
                                {app.name}
                            </Select.Option>
                        })}
                    </Select>
                    <span className="form__error">
                        {showError && !this.state.isValid.projectId
                            ? <><Error className="form__icon form__icon--error" />{errorObject[1].message}</>
                            : null}
                    </span>
                </div>
                {this.state.form.cloneId > 0 && <div className="info__container info__container--create-app">
                    <Info />
                    <div className="flex column left">
                        <div className="info__title">Important</div>
                        <div className="info__subtitle">Do not forget to modify git repositories, corresponding branches and docker repositories to be used for each CI Pipeline if required.</div>
                    </div>
                </div>}
                <DialogFormSubmit tabIndex={3}>{this.state.form.cloneId > 0 ? 'Duplicate App' : 'Create App'}</DialogFormSubmit>
            </DialogForm >
        }
    }
}