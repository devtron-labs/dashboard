import React, { Component } from 'react'
import { sortObjectArrayAlphabetically, importComponentFromFELibrary } from '../../common'
import {
    ServerErrors,
    showError,
    Progressing,
    Drawer,
    TagType,
    TagLabelSelect,
    getTeamListMin,
    DEFAULT_TAG_DATA,
    multiSelectStyles,
    Reload,
    RadioGroup,
    RadioGroupItem,
} from '@devtron-labs/devtron-fe-common-lib'
import { AddNewAppProps, AddNewAppState } from '../types'
import { ViewType, getAppComposeURL, APP_COMPOSE_STAGE, AppCreationType } from '../../../config'
import { ValidationRules } from './validationRules'
import { getHostURLConfiguration } from '../../../services/service'
import { createApp } from './service'
import { toast } from 'react-toastify'
import { ReactComponent as Error } from '../../../assets/icons/ic-warning.svg'
import { ReactComponent as Info } from '../../../assets/icons/ic-info-filled.svg'
import { ReactComponent as Close } from '../../../assets/icons/ic-close.svg'
import ReactSelect from 'react-select'
import AsyncSelect from 'react-select/async'
import { appListOptions, noOptionsMessage } from '../../AppSelector/AppSelectorUtil'
import { Option } from '../../v2/common/ReactSelect.utils'
import { saveHostURLConfiguration } from '../../hostURL/hosturl.service'
import { createJob } from '../../Jobs/Service'
import './createApp.scss'
const TagsContainer = importComponentFromFELibrary('TagLabelSelect', TagLabelSelect)
export class AddNewApp extends Component<AddNewAppProps, AddNewAppState> {
    rules = new ValidationRules()
    _inputAppName: HTMLInputElement
    createAppRef = null
    constructor(props) {
        super(props)
        this.state = {
            view: ViewType.FORM,
            code: 0,
            projects: [],
            disableForm: false,
            appNameErrors: false,
            showErrors: false,
            form: {
                appId: 0,
                projectId: 0,
                appName: '',
                description: '',
                cloneId: 0,
                appCreationType: AppCreationType.Blank,
            },
            tags: [DEFAULT_TAG_DATA],
            isValid: {
                projectId: false,
                appName: false,
                cloneAppId: true,
            },
        }
        this.createApp = this.createApp.bind(this)
        this.handleAppname = this.handleAppname.bind(this)
        this.handleProject = this.handleProject.bind(this)
        this.escKeyPressHandler = this.escKeyPressHandler.bind(this)
        this.outsideClickHandler = this.outsideClickHandler.bind(this)
        this.createAppRef = React.createRef()
    }

    async componentDidMount() {
        try {
            const { result } = await getTeamListMin()
            sortObjectArrayAlphabetically(result, 'name')
            this.setState({ view: ViewType.FORM, projects: result })
        } catch (err) {
            this.setState({ view: ViewType.ERROR })
            showError(err)
        } finally {
            if (this._inputAppName) this._inputAppName.focus()
        }
        document.addEventListener('keydown', this.escKeyPressHandler)
        document.addEventListener('click', this.outsideClickHandler)
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.escKeyPressHandler)
        document.removeEventListener('click', this.outsideClickHandler)
    }

    escKeyPressHandler(evt): void {
        if (evt && evt.key === 'Escape' && typeof this.props.close === 'function') {
            evt.preventDefault()
            this.props.close(evt)
        }
    }
    outsideClickHandler(evt): void {
        if (
            this.createAppRef.current &&
            !this.createAppRef.current.contains(evt.target) &&
            typeof this.props.close === 'function'
        ) {
            this.props.close(evt)
        }
    }

    handleAppname(event: React.ChangeEvent<HTMLInputElement>): void {
        let { form, isValid } = { ...this.state }
        form.appName = event.target.value
        isValid.appName = this.rules.appName(event.target.value).isValid
        this.setState({ form, isValid, appNameErrors: true })
    }

    handleDescription = (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
        const { form } = { ...this.state }
        form.description = event.target.value
        this.setState({ form })
    }

    handleProject(item: number): void {
        let { form, isValid } = { ...this.state }
        form.projectId = item
        isValid.projectId = !!item
        this.setState({ form, isValid })
    }

    getHostURLConfig = async () => {
        try {
            const { result } = await getHostURLConfiguration()
            if (!result?.value) {
                const payload = {
                    id: result?.id,
                    key: result?.key || 'url',
                    value: window.location.origin,
                    active: result?.active || true,
                }
                await saveHostURLConfiguration(payload)
            }
        } catch (error) {
            showError(error)
        }
    }

    createApp(e): void {
        e.preventDefault()
        const labelTags = []
        let invalidLabels = false
        for (let index = 0; index < this.state.tags.length; index++) {
            const currentTag = this.state.tags[index]
            if (currentTag.isInvalidKey || currentTag.isInvalidValue) {
                invalidLabels = true
                break
            } else if (currentTag.key) {
                labelTags.push({ key: currentTag.key, value: currentTag.value, propagate: currentTag.propagate })
            }
        }
        this.setState({ showErrors: true, appNameErrors: true })
        let allKeys = Object.keys(this.state.isValid)
        let isFormValid = allKeys.reduce((valid, key) => {
            valid = valid && this.state.isValid[key]
            return valid
        }, true)
        if (!isFormValid || invalidLabels) {
            if (invalidLabels) {
                toast.error('Some required fields in tags are missing or invalid')
            }
            return
        }

        const request = {
            appName: this.state.form.appName,
            teamId: this.state.form.projectId,
            templateId: this.state.form.cloneId,
            labels: labelTags,
        }

        if (this.props.isJobView) {
            request['appType'] = 2 // type 2 is for job type
            request['description'] = this.state.form.description
        }

        this.setState({ disableForm: true })
        const createAPI = this.props.isJobView ? createJob : createApp
        createAPI(request)
            .then((response) => {
                if (response.result) {
                    this.getHostURLConfig()
                    let { form, isValid } = { ...this.state }
                    form.appId = response.result.id
                    form.appName = response.result.appName
                    isValid.appName = true
                    isValid.projectId = true
                    this.setState(
                        {
                            code: response.code,
                            form,
                            isValid,
                            disableForm: false,
                            showErrors: false,
                            appNameErrors: false,
                            tags: response.result?.labels?.tags,
                        },
                        () => {
                            toast.success(
                                `Your ${
                                    this.props.isJobView ? 'job' : 'application'
                                } is created. Go ahead and set it up.`,
                            )
                            this.redirectToArtifacts(this.state.form.appId)
                        },
                    )
                }
            })
            .catch((errors: ServerErrors) => {
                if (Array.isArray(errors.errors)) {
                    errors.errors.forEach((element) => {
                        toast.error(element.userMessage)
                    })
                    this.setState({ code: errors.code })
                } else {
                    showError(errors)
                }
                this.setState({ disableForm: false, showErrors: false, appNameErrors: false })
            })
    }

    redirectToArtifacts(appId): void {
        const url = getAppComposeURL(appId, APP_COMPOSE_STAGE.SOURCE_CONFIG, this.props.isJobView)
        this.props.history.push(url)
    }

    changeTemplate = (appCreationType: string): void => {
        let { form, isValid } = { ...this.state }
        form.appCreationType = appCreationType
        isValid.cloneAppId = appCreationType === AppCreationType.Blank
        this.setState({ form, isValid })
    }

    handleCloneAppChange = ({ value }): void => {
        let { form, isValid } = { ...this.state }
        form.cloneId = value
        isValid.cloneAppId = !!value
        this.setState({ form, isValid })
    }

    setTags = (tags: TagType[]): void => {
        this.setState({ tags })
    }

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
            }
        },
    }
    
    renderHeaderSection = (): JSX.Element => {
        return (
            <div className="flex flex-align-center flex-justify dc__border-bottom bcn-0 pt-12 pr-20 pb-12 pl-20">
                <h2 className="fs-16 fw-6 lh-1-43 m-0 title-padding">
                    Create {this.props.isJobView ? 'job' : 'application'}
                </h2>
                <button
                    type="button"
                    className="dc__transparent flex icon-dim-24"
                    onClick={this.props.close}
                    data-testid={`close-create-custom${this.props.isJobView ? 'job' : 'app'}-wing`}
                >
                    <Close className="icon-dim-24" />
                </button>
            </div>
        )
    }

    loadAppListOptions = (inputValue: string) => appListOptions(inputValue, this.props.isJobView)

    renderBodySection = (): JSX.Element => {
        let errorObject = [
            this.rules.appName(this.state.form.appName),
            this.rules.team(this.state.form.projectId),
            this.rules.cloneApp(this.state.form.cloneId),
        ]
        const showError = this.state.showErrors
        const appNameErrors = this.state.appNameErrors
        return (
            <div className="scrollable-content p-20">
                <div className="form__row">
                    <span className="form__label dc__required-field">{this.props.isJobView ? 'Job' : 'App'} Name</span>
                    <input
                        ref={(node) => (this._inputAppName = node)}
                        data-testid={`${this.props.isJobView ? 'job' : 'app'}-name-textbox`}
                        className="form__input"
                        type="text"
                        name="app-name"
                        value={this.state.form.appName}
                        placeholder={`e.g. my-first-${this.props.isJobView ? 'job' : 'app'}`}
                        autoComplete="off"
                        autoFocus={true}
                        tabIndex={1}
                        onChange={this.handleAppname}
                        required
                    />
                    <span className="form__error">
                        {appNameErrors && !this.state.isValid.appName ? (
                            <>
                                <Error className="form__icon form__icon--error" />
                                {errorObject[0].message} <br />
                            </>
                        ) : null}
                    </span>
                    {!this.props.isJobView && (
                        <span className="form__text-field-info form__text-field-info--create-app">
                            <Info className="form__icon form__icon--info form__icon--create-app" />
                            Apps are NOT env specific and can be used to deploy to multiple environments.
                        </span>
                    )}
                    {this.props.isJobView && (
                        <>
                            <span className="form__label">Description</span>
                            <textarea
                                data-testid="description-textbox"
                                className="form__textarea"
                                name="job-description"
                                value={this.state.form.description}
                                placeholder="Describe this job"
                                tabIndex={2}
                                onChange={this.handleDescription}
                            />
                        </>
                    )}
                </div>

                <div className="form__row clone-apps dc__inline-block">
                    <RadioGroup
                        className="radio-group-no-border"
                        value={this.state.form.appCreationType}
                        name="trigger-type"
                        onChange={(event) => {
                            this.changeTemplate(event.target.value)
                        }}
                    >
                        <RadioGroupItem value={AppCreationType.Blank} dataTestId="create-from-scratch-radio-button">
                            Create from scratch
                        </RadioGroupItem>
                        <RadioGroupItem
                            value={AppCreationType.Existing}
                            dataTestId={`clone-existing-${this.props.isJobView ? 'job' : 'application'}-radio-button`}
                        >
                            Clone existing {this.props.isJobView ? 'job' : 'application'}
                        </RadioGroupItem>
                    </RadioGroup>
                </div>
                {this.state.form.appCreationType === AppCreationType.Existing && (
                    <>
                        <div
                            className="form__row clone-apps dc__inline-block"
                            data-testid={`clone-existing-${this.props.isJobView ? 'job' : 'application'}-radio-button`}
                        >
                            <span
                                className="form__label dc__required-field"
                                data-testid={`Clone-${this.props.isJobView ? 'job' : 'app'}-option`}
                            >
                                Select an {this.props.isJobView ? 'job' : 'app'} to clone
                            </span>
                            <AsyncSelect
                                classNamePrefix={`${this.props.isJobView ? 'job' : 'app'}-name-for-clone`}
                                loadOptions={this.loadAppListOptions}
                                noOptionsMessage={noOptionsMessage}
                                onChange={this.handleCloneAppChange}
                                styles={this._multiSelectStyles}
                                components={{
                                    IndicatorSeparator: null,
                                    LoadingIndicator: null,
                                    Option,
                                }}
                                placeholder={`Select ${this.props.isJobView ? 'job' : 'app'}`}
                                tabIndex={3}
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
                        <div className="dc__info-container info-container--create-app eb-2 mb-16">
                            <Info />
                            <div className="flex column left">
                                <div>
                                    <div className="dc__info-title">Important: </div>
                                    {this.props.isJobView
                                        ? 'Do not forget to modify git repositories and corresponding branches to be used for each Job Pipeline if required.'
                                        : 'Do not forget to modify git repositories, corresponding branches and container registries to be used for each CI Pipeline if required.'}
                                </div>
                            </div>
                        </div>
                    </>
                )}
                <div className="form__row">
                    <span className="form__label dc__required-field">Project</span>
                    <ReactSelect
                        classNamePrefix="create-app__select-project"
                        className="m-0"
                        tabIndex={4}
                        isMulti={false}
                        isClearable={false}
                        options={this.state.projects}
                        getOptionLabel={(option) => `${option.name}`}
                        getOptionValue={(option) => `${option.id}`}
                        styles={this._multiSelectStyles}
                        components={{
                            IndicatorSeparator: null,
                            Option,
                        }}
                        onChange={(selected) => {
                            this.handleProject(selected.id)
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
                <TagsContainer
                    isCreateApp={true}
                    labelTags={this.state.tags}
                    setLabelTags={this.setTags}
                    tabIndex={5}
                    selectedProjectId={this.state.form.projectId}
                />
            </div>
        )
    }

    renderFooterSection = (): JSX.Element => {
        return (
            <div className="w-800 dc__border-top flex right pt-16 pr-20 pb-16 pl-20 dc__position-fixed dc__bottom-0">
                <button
                    className="cta flex h-36"
                    onClick={this.createApp}
                    data-testid={`${
                        this.state.form.appCreationType === AppCreationType.Existing ? 'clone' : 'create'
                    }-${this.props.isJobView ? 'job' : 'app'}-button-on-drawer`}
                >
                    {`${this.state.form.appCreationType === AppCreationType.Existing ? 'Clone ' : 'Create '}${
                        this.props.isJobView ? 'Job' : 'App'
                    }`}
                </button>
            </div>
        )
    }

    renderPageDetails = (): JSX.Element => {
        if (this.state.view === ViewType.LOADING) {
            return <Progressing pageLoader />
        } else if (this.state.view === ViewType.ERROR) {
            return <Reload />
        } else {
            return (
                <>
                    {this.renderBodySection()}
                    {this.renderFooterSection()}
                </>
            )
        }
    }

    render() {
        return (
            <Drawer position="right" width="800px">
                <div className="h-100 bcn-0 create-app-container" ref={this.createAppRef}>
                    {this.renderHeaderSection()}
                    {this.renderPageDetails()}
                </div>
            </Drawer>
        )
    }
}
