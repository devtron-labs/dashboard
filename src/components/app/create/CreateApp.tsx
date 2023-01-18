import React, { Component } from 'react'
import { sortObjectArrayAlphabetically, multiSelectStyles } from '../../common'
import { ServerErrors, showError, Progressing, Drawer, TagType, TagLabelSelect } from '@devtron-labs/devtron-fe-common-lib'
import { AddNewAppProps, AddNewAppState } from '../types'
import { ViewType, getAppComposeURL, APP_COMPOSE_STAGE, AppCreationType } from '../../../config'
import { ValidationRules } from './validationRules'
import { getHostURLConfiguration, getTeamListMin } from '../../../services/service'
import { createApp } from './service'
import { toast } from 'react-toastify'
import { ReactComponent as Error } from '../../../assets/icons/ic-warning.svg'
import { ReactComponent as Info } from '../../../assets/icons/ic-info-filled.svg'
import { ReactComponent as Close } from '../../../assets/icons/ic-close.svg'
import ReactSelect from 'react-select'
import AsyncSelect from 'react-select/async'
import { RadioGroup, RadioGroupItem } from '../../common/formFields/RadioGroup'
import { appListOptions, noOptionsMessage } from '../../AppSelector/AppSelectorUtil'
import { Option } from '../../v2/common/ReactSelect.utils'
import { saveHostURLConfiguration } from '../../hostURL/hosturl.service'
import Reload from '../../Reload/Reload'
import './createApp.scss'

export class AddNewApp extends Component<AddNewAppProps, AddNewAppState> {
    rules = new ValidationRules()
    _inputAppName: HTMLInputElement
    timeoutId
    createAppRef: HTMLDivElement
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
                cloneId: 0,
                appCreationType: AppCreationType.Blank,
            },
            tags: [],
            isValid: {
                projectId: false,
                appName: false,
                cloneAppId: true,
            },
        }
        this.createApp = this.createApp.bind(this)
        this.handleAppname = this.handleAppname.bind(this)
        this.handleProject = this.handleProject.bind(this)
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
    }

    handleAppname(event: React.ChangeEvent<HTMLInputElement>): void {
        let { form, isValid } = { ...this.state }
        form.appName = event.target.value
        isValid.appName = this.rules.appName(event.target.value).isValid
        this.setState({ form, isValid, appNameErrors: true })
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
            const element = this.state.tags[index]
            if (element.isInvalidKey || element.isInvalidValue) {
                invalidLabels = true
                break
            } else if (element.key) {
                labelTags.push({ key: element.key, value: element.value, propagate: element.propagate })
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

        let request = {
            appName: this.state.form.appName,
            teamId: this.state.form.projectId,
            templateId: this.state.form.cloneId,
            labels: labelTags,
        }
        this.setState({ disableForm: true })
        createApp(request)
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
                            toast.success('Your application is created. Go ahead and set it up.')
                            this.redirectToArtifacts(this.state.form.appId)
                        },
                    )
                }
            })
            .catch((errors: ServerErrors) => {
                if (Array.isArray(errors.errors)) {
                    errors.errors.map(({ userMessage }) => toast.error(userMessage))
                    this.setState({ code: errors.code })
                } else {
                    showError(errors)
                }
                this.setState({ disableForm: false, showErrors: false, appNameErrors: false })
            })
    }

    redirectToArtifacts(appId): void {
        let url = getAppComposeURL(appId, APP_COMPOSE_STAGE.SOURCE_CONFIG)
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
                <h2 className="fs-16 fw-6 lh-1-43 m-0 title-padding">Create application</h2>
                <button type="button" className="dc__transparent flex icon-dim-24" onClick={this.props.close}>
                    <Close className="icon-dim-24" />
                </button>
            </div>
        )
    }

    renderBodySection = (): JSX.Element => {
        let errorObject = [
            this.rules.appName(this.state.form.appName),
            this.rules.team(this.state.form.projectId),
            this.rules.cloneApp(this.state.form.cloneId),
        ]
        let showError = this.state.showErrors
        let appNameErrors = this.state.appNameErrors
        return (
            <div className="scrollable-content p-20">
                <div className="form__row">
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
                        {appNameErrors && !this.state.isValid.appName ? (
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
                        <RadioGroupItem value={AppCreationType.Blank}>Create from scratch</RadioGroupItem>
                        <RadioGroupItem value={AppCreationType.Existing}>Clone existing application</RadioGroupItem>
                    </RadioGroup>
                </div>
                {this.state.form.appCreationType === AppCreationType.Existing && (
                    <>
                        <div className="form__row clone-apps dc__inline-block">
                            <span className="form__label">Select an app to clone*</span>
                            <AsyncSelect
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
                        <div className="dc__info-container info-container--create-app eb-2 mb-16">
                            <Info />
                            <div className="flex column left">
                                <div>
                                    <div className="dc__info-title">Important: </div>Do not forget to modify git
                                    repositories, corresponding branches and container registries to be used for each CI
                                    Pipeline if required.
                                </div>
                            </div>
                        </div>
                    </>
                )}
                <div className="form__row">
                    <span className="form__label">Project*</span>
                    <ReactSelect
                        className="m-0"
                        tabIndex={2}
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
                <TagLabelSelect labelTags={this.state.tags} setLabelTags={this.setTags} />
            </div>
        )
    }

    renderFooterSection = (): JSX.Element => {
        return (
            <div className="w-800 dc__border-top flex right pt-16 pr-20 pb-16 pl-20 dc__position-fixed dc__bottom-0">
                <button className="cta flex h-36" onClick={this.createApp}>
                    {this.state.form.appCreationType === AppCreationType.Existing ? 'Clone App' : 'Create App'}
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
                <div className="h-100 bcn-0 create-app-container" ref={(node) => (this.createAppRef = node)}>
                    {this.renderHeaderSection()}
                    {this.renderPageDetails()}
                </div>
            </Drawer>
        )
    }
}
