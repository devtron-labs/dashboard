import React, { Component } from 'react';
import {
    DialogForm,
    DialogFormSubmit,
    Progressing,
    showError,
    ErrorScreenManager,
    sortObjectArrayAlphabetically,
    multiSelectStyles,
} from '../../common';
import { AddNewAppProps, AddNewAppState } from '../types';
import { ViewType, getAppComposeURL, APP_COMPOSE_STAGE, AppCreationType } from '../../../config';
import { ValidationRules } from './validationRules';
import { getTeamListMin } from '../../../services/service';
import { createApp } from './service';
import { toast } from 'react-toastify';
import { ServerErrors } from '../../../modals/commonTypes';
import './createApp.css';
import { TAG_VALIDATION_MESSAGE, validateTags, createOption, handleKeyDown } from '../appLabelCommon';
import TagLabelSelect from '../details/TagLabelSelect';
import { ReactComponent as Error } from '../../../assets/icons/ic-warning.svg';
import { ReactComponent as Info } from '../../../assets/icons/ic-info-filled.svg';
import ReactSelect from 'react-select';
import AsyncSelect from 'react-select/async';
import { RadioGroup, RadioGroupItem } from '../../common/formFields/RadioGroup';
import { appListOptions, noOptionsMessage } from '../../AppSelector/AppSelectorUtil';

export class AddNewApp extends Component<AddNewAppProps, AddNewAppState> {
    rules = new ValidationRules();
    _inputAppName: HTMLInputElement;
    timeoutId;
    constructor(props) {
        super(props);
        this.state = {
            view: ViewType.FORM,
            code: 0,
            projects: [],
            disableForm: false,
            showErrors: false,
            form: {
                appId: 0,
                projectId: 0,
                appName: '',
                cloneId: 0,
                appCreationType: AppCreationType.Blank,
            },
            labels: {
                tags: [],
                inputTagValue: '',
                tagError: '',
            },
            isValid: {
                projectId: false,
                appName: false,
                cloneAppId: true,
            },
        };
        this.createApp = this.createApp.bind(this);
        this.handleAppname = this.handleAppname.bind(this);
        this.handleProject = this.handleProject.bind(this);
    }

    async componentDidMount() {
        try {
            const { result } = await getTeamListMin();
            sortObjectArrayAlphabetically(result, 'name');
            this.setState({ view: ViewType.FORM, projects: result });
        } catch (err) {
            this.setState({ view: ViewType.ERROR });
            showError(err);
        } finally {
            if (this._inputAppName) this._inputAppName.focus();
        }
    }

    handleInputChange = (inputTagValue) => {
        let { form, isValid } = { ...this.state };
        this.setState({
            form,
            isValid,
            labels: {
                ...this.state.labels,
                inputTagValue: inputTagValue,
                tagError: '',
            },
        });
    };

    handleTagsChange = (newValue: any, actionMeta: any) => {
        this.setState({
            labels: {
                ...this.state.labels,
                tags: newValue || [],
                tagError: '',
            },
        });
    };

    handleCreatableBlur = (e) => {
        this.state.labels.inputTagValue = this.state.labels?.inputTagValue.trim();
        if (!this.state.labels.inputTagValue) return;
        this.setState({
            labels: {
                inputTagValue: '',
                tags: [...this.state.labels.tags, createOption(e.target.value)],
                tagError: '',
            },
        });
    };

    handleAppname(event: React.ChangeEvent<HTMLInputElement>): void {
        let { form, isValid } = { ...this.state };
        form.appName = event.target.value;
        isValid.appName = this.rules.appName(event.target.value).isValid;
        this.setState({ form, isValid });
    }

    handleProject(item: number): void {
        let { form, isValid } = { ...this.state };
        form.projectId = item;
        isValid.projectId = !!item;
        this.setState({ form, isValid });
    }
    validateForm = (): boolean => {
        if (
            this.state.labels.tags.length !==
            this.state.labels.tags.map((tag) => tag.value).filter((tag) => validateTags(tag)).length
        ) {
            this.setState({
                labels: {
                    ...this.state.labels,
                    tagError: TAG_VALIDATION_MESSAGE.error,
                },
            });
            return false;
        }
        return true;
    };

    createApp(): void {
        const validForm = this.validateForm();
        if (!validForm) {
            return;
        }
        this.setState({ showErrors: true });
        let allKeys = Object.keys(this.state.isValid);
        let isFormValid = allKeys.reduce((valid, key) => {
            valid = valid && this.state.isValid[key] && validForm;
            return valid;
        }, true);
        if (!isFormValid) return;

        let _optionTypes = [];
        if (this.state.labels.tags && this.state.labels.tags.length > 0) {
            this.state.labels.tags.forEach((_label) => {
                let colonIndex = _label.value.indexOf(':');
                let splittedTagBeforeColon = _label.value.substring(0, colonIndex);
                let splittedTagAfterColon = _label.value.substring(colonIndex + 1);
                _optionTypes.push({
                    key: splittedTagBeforeColon,
                    value: splittedTagAfterColon,
                });
            });
        }

        let request = {
            appName: this.state.form.appName,
            teamId: this.state.form.projectId,
            templateId: this.state.form.cloneId,
            labels: _optionTypes,
        };
        this.setState({ disableForm: true });
        createApp(request)
            .then((response) => {
                if (response.result) {
                    let { form, isValid } = { ...this.state };
                    form.appId = response.result.id;
                    form.appName = response.result.appName;
                    isValid.appName = true;
                    isValid.projectId = true;
                    this.setState(
                        {
                            code: response.code,
                            form,
                            isValid,
                            disableForm: false,
                            showErrors: false,
                            labels: {
                                ...this.state.labels,
                                tags: response.result?.labels?.tags,
                            },
                        },
                        () => {
                            toast.success('Your application is created. Go ahead and set it up.');
                            this.redirectToArtifacts(this.state.form.appId);
                        },
                    );
                }
            })
            .catch((errors: ServerErrors) => {
                if (Array.isArray(errors.errors)) {
                    errors.errors.map(({ userMessage }) => toast.error(userMessage));
                    this.setState({ code: errors.code });
                } else {
                    showError(errors);
                }
                this.setState({ disableForm: false, showErrors: false });
            });
    }

    redirectToArtifacts(appId): void {
        let url = getAppComposeURL(appId, APP_COMPOSE_STAGE.SOURCE_CONFIG);
        this.props.history.push(url);
    }

    setAppTagLabel = () => {
        let newTag = this.state.labels.inputTagValue.split(',').map((e) => {
            e = e.trim();
            return createOption(e);
        });

        this.setState({
            labels: {
                inputTagValue: '',
                tags: [...this.state.labels.tags, ...newTag],
                tagError: '',
            },
        });
    };

    changeTemplate = (appCreationType: string): void => {
        let { form, isValid } = { ...this.state };
        form.appCreationType = appCreationType;
        isValid.cloneAppId = appCreationType === AppCreationType.Blank;
        this.setState({ form, isValid });
    };

    handleCloneAppChange = ({ value }): void => {
        let { form, isValid } = { ...this.state };
        form.cloneId = value;
        isValid.cloneAppId = !!value;
        this.setState({ form, isValid });
    };

    _multiSelectStyles = {
        ...multiSelectStyles,
        control: (base, state) => ({
            ...base,
            cursor: 'pointer',
        }),
        menu: (base, state) => ({
            ...base,
            marginTop: 'auto',
        }),
        menuList: (base) => {
            return {
                ...base,
                position: 'relative',
                paddingBottom: '0px',
                maxHeight: '180px',
            };
        },
    };

    render() {
        let errorObject = [
            this.rules.appName(this.state.form.appName),
            this.rules.team(this.state.form.projectId),
            this.rules.cloneApp(this.state.form.cloneId),
        ];
        let showError = this.state.showErrors;
        if (this.state.view === ViewType.LOADING) {
            return (
                <DialogForm
                    title="Create application"
                    isLoading={this.state.disableForm}
                    className="create-app-modal"
                    close={this.props.close}
                    onSave={(e) => {
                        e.preventDefault();
                        this.createApp();
                    }}
                    closeOnESC={true}
                >
                    <div style={{ height: '224px' }}>
                        <Progressing pageLoader />
                    </div>
                </DialogForm>
            );
        }
        if (this.state.view === ViewType.ERROR) {
            return (
                <DialogForm
                    title="Create application"
                    isLoading={this.state.disableForm}
                    className="create-app-modal"
                    close={this.props.close}
                    onSave={(e) => {
                        e.preventDefault();
                        this.createApp();
                    }}
                    closeOnESC={true}
                >
                    <ErrorScreenManager code={this.state.code} />
                </DialogForm>
            );
        } else {
            return (
                <DialogForm
                    title="Create application"
                    isLoading={this.state.disableForm}
                    className="create-app-modal p-0"
                    headerClassName={'m-20'}
                    close={this.props.close}
                    onSave={(e) => {
                        e.preventDefault();
                        this.createApp();
                    }}
                    closeOnESC={true}
                >
                    <hr className="separator m-0" />
                    <div className="scrollable-content p-20">
                        <label className="form__row">
                            <span className="form__label">App Name*</span>
                            <input
                                ref={(node) => (this._inputAppName = node)}
                                className="form__input"
                                type="text"
                                name="app-name"
                                value={this.state.form.appName}
                                placeholder="e.g. my-first-app"
                                autoComplete="off"
                                autoFocus={true}
                                tabIndex={1}
                                onChange={this.handleAppname}
                                required
                            />
                            <span className="form__error">
                                {showError && !this.state.isValid.appName ? (
                                    <>
                                        <Error className="form__icon form__icon--error" />
                                        {errorObject[0].message} <br />
                                    </>
                                ) : null}
                            </span>
                            <span className="form__text-field-info form__text-field-info--create-app">
                                <Info className="form__icon form__icon--info form__icon--create-app" />
                                Apps are NOT env specific and can be used to deploy to multiple environments.
                            </span>
                        </label>
                        <div className="form__row">
                            <span className="form__label">Project*</span>
                            <ReactSelect
                                className="m-0"
                                tabIndex="2"
                                isMulti={false}
                                isClearable={false}
                                options={this.state.projects}
                                getOptionLabel={(option) => `${option.name}`}
                                getOptionValue={(option) => `${option.id}`}
                                styles={this._multiSelectStyles}
                                components={{
                                    IndicatorSeparator: null,
                                }}
                                onChange={(selected) => {
                                    this.handleProject(selected.id);
                                }}
                                placeholder="Select project"
                            />
                            <span className="form__error">
                                {showError && !this.state.isValid.projectId ? (
                                    <>
                                        <Error className="form__icon form__icon--error" />
                                        {errorObject[1].message}
                                    </>
                                ) : null}
                            </span>
                        </div>
                        <div className="form__row clone-apps inline-block">
                            <RadioGroup
                                className="no-border"
                                value={this.state.form.appCreationType}
                                name="trigger-type"
                                onChange={(event) => {
                                    this.changeTemplate(event.target.value);
                                }}
                            >
                                <RadioGroupItem value={AppCreationType.Blank}>Blank app</RadioGroupItem>
                                <RadioGroupItem value={AppCreationType.Existing}>Clone an existing app</RadioGroupItem>
                            </RadioGroup>
                        </div>
                        {this.state.form.appCreationType === AppCreationType.Existing && (
                            <div className="form__row clone-apps inline-block">
                                <span className="form__label">Select an app to clone*</span>
                                <AsyncSelect
                                    defaultOption
                                    loadOptions={appListOptions}
                                    noOptionsMessage={noOptionsMessage}
                                    onChange={this.handleCloneAppChange}
                                    styles={this._multiSelectStyles}
                                    components={{
                                        IndicatorSeparator: null,
                                        LoadingIndicator: null,
                                    }}
                                    placeholder="Select app"
                                />

                                <span className="form__error">
                                    {showError && !this.state.isValid.cloneAppId ? (
                                        <>
                                            <Error className="form__icon form__icon--error" />
                                            {errorObject[2].message}
                                        </>
                                    ) : null}
                                </span>
                            </div>
                        )}
                        {this.state.form.appCreationType === AppCreationType.Existing && (
                            <div className="info__container info__container--create-app eb-2 mb-16">
                                <Info />
                                <div className="flex column left">
                                    <div>
                                        <div className="info__title">Important: </div>Do not forget to modify git
                                        repositories, corresponding branches and container registries to be used for
                                        each CI Pipeline if required.
                                    </div>
                                </div>
                            </div>
                        )}
                        <TagLabelSelect
                            validateTags={validateTags}
                            labelTags={this.state.labels}
                            onInputChange={this.handleInputChange}
                            onTagsChange={this.handleTagsChange}
                            onKeyDown={(event) => handleKeyDown(this.state.labels, this.setAppTagLabel, event)}
                            onCreatableBlur={this.handleCreatableBlur}
                        />

                        <div className="cr-5 fs-11">{this.state.labels.tagError}</div>
                    </div>
                    <hr className="separator m-0" />
                    <div className="footer">
                        <DialogFormSubmit tabIndex={3}>
                            {this.state.form.appCreationType === AppCreationType.Existing ? 'Clone App' : 'Create App'}
                        </DialogFormSubmit>
                    </div>
                </DialogForm>
            );
        }
    }
}
