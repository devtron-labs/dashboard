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

import React, { Component } from 'react'
import {
    ServerErrors,
    showError,
    Progressing,
    Drawer,
    getTeamListMin,
    multiSelectStyles,
    Reload,
    RadioGroup,
    RadioGroupItem,
    noop,
    CustomInput,
    SelectPicker,
    OptionType,
    ToastManager,
    ToastVariantType,
    Button,
    TagsContainer,
    getEmptyTagTableRow,
    PATTERNS,
} from '@devtron-labs/devtron-fe-common-lib'
import AsyncSelect from 'react-select/async'
import { importComponentFromFELibrary, sortObjectArrayAlphabetically } from '../../common'
import { AddNewAppProps, AddNewAppState } from '../types'
import { ViewType, getAppComposeURL, APP_COMPOSE_STAGE, AppCreationType, APP_TYPE } from '../../../config'
import { ValidationRules } from './validationRules'
import { getHostURLConfiguration } from '../../../services/service'
import { createApp } from './service'
import { ReactComponent as Error } from '../../../assets/icons/ic-warning.svg'
import { ReactComponent as Info } from '../../../assets/icons/ic-info-filled.svg'
import { ReactComponent as Close } from '../../../assets/icons/ic-close.svg'
import { appListOptions, noOptionsMessage } from '../../AppSelector/AppSelectorUtil'
import { Option } from '../../v2/common/ReactSelect.utils'
import { saveHostURLConfiguration } from '../../hostURL/hosturl.service'
import { createJob } from '../../Jobs/Service'
import './createApp.scss'

const MandatoryTagsContainer = importComponentFromFELibrary('MandatoryTagsContainer', null, 'function')

export class AddNewApp extends Component<AddNewAppProps, AddNewAppState> {
    rules = new ValidationRules()

    createAppRef = null

    constructor(props) {
        super(props)
        this.state = {
            view: ViewType.LOADING,
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
            tags: [getEmptyTagTableRow()],
            tagsError: {},
            isValid: {
                projectId: false,
                appName: false,
                cloneAppId: true,
                description: true,
            },
            createAppLoader: false,
        }
        this.createApp = this.createApp.bind(this)
        this.handleAppName = this.handleAppName.bind(this)
        this.handleProject = this.handleProject.bind(this)
        this.escKeyPressHandler = this.escKeyPressHandler.bind(this)
        this.outsideClickHandler = this.outsideClickHandler.bind(this)
        this.createAppRef = React.createRef()
    }

    async componentDidMount() {
        this.setState({ view: ViewType.LOADING })
        try {
            const { result } = await getTeamListMin()
            sortObjectArrayAlphabetically(result, 'name')
            const _projects: OptionType[] = result.map((project) => ({
                value: project.id.toString(),
                label: project.name,
            }))
            this.setState({ view: ViewType.FORM, projects: _projects })
        } catch (err) {
            this.setState({ view: ViewType.ERROR })
            showError(err)
        }
        document.addEventListener('keydown', this.escKeyPressHandler)
        document.addEventListener('click', this.outsideClickHandler)
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.escKeyPressHandler)
        document.removeEventListener('click', this.outsideClickHandler)
    }

    escKeyPressHandler(evt): void {
        if (!this.state.createAppLoader && evt && evt.key === 'Escape' && typeof this.props.close === 'function') {
            evt.preventDefault()
            this.props.close(evt)
        }
    }

    outsideClickHandler(evt): void {
        if (
            !this.state.createAppLoader &&
            this.createAppRef.current &&
            !this.createAppRef.current.contains(evt.target) &&
            typeof this.props.close === 'function'
        ) {
            this.props.close(evt)
        }
    }

    handleAppName(event: React.ChangeEvent<HTMLInputElement>): void {
        const { form, isValid } = { ...this.state }
        form.appName = event.target.value
        isValid.appName = this.rules.appName(event.target.value).isValid
        this.setState({ form, isValid, appNameErrors: true })
    }

    handleProject(_projectId: number): void {
        const { form, isValid } = { ...this.state }
        form.projectId = _projectId
        isValid.projectId = !!_projectId
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

    setTagsError = (updatedTagsError: typeof this.state.tagsError): void => {
        this.setState({ tagsError: updatedTagsError })
    }

    createApp(e): void {
        e.preventDefault()
        const labelTags = []
        let invalidLabels = false
        for (let index = 0; index < this.state.tags.length; index++) {
            const currentTag = this.state.tags[index]
            const currentKey = currentTag.data.tagKey.value
            const currentVal = currentTag.data.tagValue.value
            if (!currentKey && !currentVal) {
                continue
            }
            const isKeyValid = new RegExp(PATTERNS.ALPHANUMERIC_WITH_SPECIAL_CHAR).test(currentKey)
            const isValueValid = new RegExp(PATTERNS.ALPHANUMERIC_WITH_SPECIAL_CHAR).test(currentVal)
            if (!isKeyValid || !isValueValid) {
                invalidLabels = true
                this.setTagsError({
                    ...this.state.tagsError,
                    [currentTag.id]: {
                        tagKey: {
                            isValid: isKeyValid,
                            errorMessages: isKeyValid
                                ? []
                                : ['Can only contain alphanumeric chars and ( - ), ( _ ), ( . )', 'Spaces not allowed'],
                        },
                        tagValue: {
                            isValid: isValueValid,
                            errorMessages: isValueValid
                                ? []
                                : ['Can only contain alphanumeric chars and ( - ), ( _ ), ( . )', 'Spaces not allowed'],
                        },
                    },
                })
            } else if (currentKey) {
                labelTags.push({
                    key: currentKey,
                    value: currentVal,
                    propagate: currentTag.customState.propagateTag,
                })
            }
        }
        this.setState({ showErrors: true, appNameErrors: true })
        const allKeys = Object.keys(this.state.isValid)
        const isFormValid = allKeys.reduce((valid, key) => {
            valid = valid && this.state.isValid[key]
            return valid
        }, true)
        if (!isFormValid || invalidLabels) {
            if (invalidLabels) {
                ToastManager.showToast({
                    variant: ToastVariantType.error,
                    description: 'Some required fields in tags are missing or invalid',
                })
            }
            return
        }

        const request = {
            appName: this.state.form.appName,
            teamId: this.state.form.projectId,
            templateId: this.state.form.cloneId,
            description: this.state.form.description?.trim(),
            labels: labelTags,
        }

        if (this.props.isJobView) {
            request['appType'] = 2 // type 2 is for job type
        }

        this.setState({ disableForm: true, createAppLoader: true })
        const createAPI = this.props.isJobView ? createJob : createApp
        createAPI(request)
            .then((response) => {
                if (response.result) {
                    this.getHostURLConfig()
                    const { form, isValid } = { ...this.state }
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
                            createAppLoader: false,
                        },
                        () => {
                            ToastManager.showToast({
                                variant: ToastVariantType.success,
                                description: `Your ${
                                    this.props.isJobView ? 'job' : 'application'
                                } is created. Go ahead and set it up.`,
                            })
                            this.redirectToArtifacts(this.state.form.appId)
                        },
                    )
                }
            })
            .catch((errors: ServerErrors) => {
                if (Array.isArray(errors.errors)) {
                    errors.errors.forEach((element) => {
                        ToastManager.showToast({
                            variant: ToastVariantType.error,
                            description: element.userMessage,
                        })
                    })
                    this.setState({ code: errors.code })
                } else {
                    showError(errors)
                }
                this.setState({ disableForm: false, showErrors: false, appNameErrors: false, createAppLoader: false })
            })
    }

    redirectToArtifacts(appId): void {
        const url = getAppComposeURL(appId, APP_COMPOSE_STAGE.SOURCE_CONFIG, this.props.isJobView)
        this.props.history.push(url)
    }

    changeTemplate = (appCreationType: string): void => {
        const { form, isValid } = { ...this.state }
        form.appCreationType = appCreationType
        form.cloneId = appCreationType === AppCreationType.Blank ? 0 : form.cloneId
        isValid.cloneAppId = appCreationType === AppCreationType.Blank
        this.setState({ form, isValid })
    }

    updateCreateAppFormDescription = (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
        const description: string = event.target.value
        const { form, isValid } = { ...this.state }
        form.description = description
        isValid.description = this.rules.description(description).isValid
        this.setState({ form, isValid })
    }

    handleCloneAppChange = ({ value }): void => {
        const { form, isValid } = { ...this.state }
        form.cloneId = value
        isValid.cloneAppId = !!value
        this.setState({ form, isValid })
    }

    setTags = (tags: typeof this.state.tags): void => {
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
                <h2 className="fs-16 fw-6 lh-1-43 m-0">Create {this.props.isJobView ? 'job' : 'application'}</h2>
                <button
                    type="button"
                    className="dc__transparent flex icon-dim-24"
                    onClick={this.state.createAppLoader ? noop : this.props.close}
                    data-testid={`close-create-custom${this.props.isJobView ? 'job' : 'app'}-wing`}
                >
                    <Close className="icon-dim-24" />
                </button>
            </div>
        )
    }

    loadAppListOptions = (inputValue: string) => appListOptions(inputValue, this.props.isJobView)

    renderBodySection = (): JSX.Element => {
        const errorObject = [
            this.rules.appName(this.state.form.appName),
            this.rules.team(this.state.form.projectId),
            this.rules.cloneApp(this.state.form.cloneId),
            this.rules.description(this.state.form.description),
        ]
        const showError = this.state.showErrors
        const { appNameErrors } = this.state
        return (
            <div className="scrollable-content p-20">
                <div className="form__row">
                    <div className={`${this.props.isJobView ? 'mb-12' : ''}`}>
                        <CustomInput
                            data-testid={`${this.props.isJobView ? 'job' : 'app'}-name-textbox`}
                            name="app-name"
                            label={`${this.props.isJobView ? 'Job' : 'App'} Name`}
                            value={this.state.form.appName}
                            placeholder={`e.g. my-first-${this.props.isJobView ? 'job' : 'app'}`}
                            autoFocus
                            tabIndex={1}
                            onChange={this.handleAppName}
                            isRequiredField
                            error={appNameErrors && !this.state.isValid.appName && errorObject[0].message}
                        />
                    </div>
                    {!this.props.isJobView && (
                        <span className="form__text-field-info form__text-field-info--create-app">
                            <Info className="form__icon form__icon--info form__icon--create-app" />
                            Apps are NOT env specific and can be used to deploy to multiple environments.
                        </span>
                    )}
                    <span className="form__label mt-16">Description</span>
                    <textarea
                        data-testid="description-textbox"
                        className="form__textarea dc__resizable-textarea--vertical"
                        name={this.props.isJobView ? 'job-description' : 'app-description'}
                        value={this.state.form.description}
                        placeholder={
                            this.props.isJobView ? 'Describe this job' : 'Write a description for this application'
                        }
                        tabIndex={2}
                        onChange={this.updateCreateAppFormDescription}
                        rows={4}
                    />
                    <span className="form__error">
                        {!this.state.isValid.description ? (
                            <>
                                <Error className="form__icon form__icon--error" />
                                {errorObject[3].message} <br />
                            </>
                        ) : null}
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
                    <SelectPicker
                        classNamePrefix="create-app__select-project"
                        inputId="create-app__select-project"
                        name="create-app__select-project"
                        isClearable={false}
                        options={this.state.projects}
                        onChange={(selected: OptionType) => this.handleProject(+selected.value)}
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

                {MandatoryTagsContainer ? (
                    <MandatoryTagsContainer
                        isCreateApp
                        appType={this.props.isJobView ? APP_TYPE.JOB : APP_TYPE.DEVTRON_APPS}
                        projectId={this.state.form.projectId}
                        tags={this.state.tags}
                        setTags={this.setTags}
                        tagsError={this.state.tagsError}
                        setTagErrors={this.setTagsError}
                    />
                ) : (
                    <TagsContainer
                        appType={this.props.isJobView ? APP_TYPE.JOB : APP_TYPE.DEVTRON_APPS}
                        isCreateApp
                        rows={this.state.tags}
                        setRows={this.setTags}
                        tagsError={this.state.tagsError}
                        setTagErrors={this.setTagsError}
                    />
                )}
            </div>
        )
    }

    renderFooterSection = (): JSX.Element => {
        return (
            <div className="w-800 dc__border-top flex right px-20 py-16 dc__position-fixed dc__bottom-0">
                <Button
                    onClick={this.createApp}
                    dataTestId={`${this.state.form.appCreationType === AppCreationType.Existing ? 'clone' : 'create'}-${
                        this.props.isJobView ? 'job' : 'app'
                    }-button-on-drawer`}
                    disabled={this.state.createAppLoader}
                    isLoading={this.state.createAppLoader}
                    text={`${this.state.form.appCreationType === AppCreationType.Existing ? 'Clone ' : 'Create '}${
                        this.props.isJobView ? 'Job' : 'App'
                    }`}
                />
            </div>
        )
    }

    renderPageDetails = (): JSX.Element => {
        if (this.state.view === ViewType.LOADING) {
            return <Progressing pageLoader />
        }
        if (this.state.view === ViewType.ERROR) {
            return <Reload />
        }
        return (
            <>
                {this.renderBodySection()}
                {this.renderFooterSection()}
            </>
        )
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
