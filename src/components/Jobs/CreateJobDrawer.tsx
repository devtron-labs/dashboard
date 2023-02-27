import React, { Component, Reducer, useEffect, useReducer, useRef, useState } from 'react'
import { Progressing, showError, sortObjectArrayAlphabetically, multiSelectStyles, Drawer } from '../common'
import { ViewType, getAppComposeURL, APP_COMPOSE_STAGE } from '../../config'
import { getHostURLConfiguration, getTeamListMin } from '../../services/service'
import { toast } from 'react-toastify'
import { ReactComponent as Error } from '../../assets/icons/ic-warning.svg'
import { ReactComponent as Info } from '../../assets/icons/ic-info-filled.svg'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import ReactSelect from 'react-select'
import { DEFAULT_TAG_DATA } from '../app/config'
import Reload from '../Reload/Reload'
import { ValidationRules } from '../app/create/validationRules'
import { createJob } from './Service'
import { JobCreationType, _multiSelectStyles } from './Constants'
import { noOptionsMessage } from '../AppSelector/AppSelectorUtil'
import { Option } from '../v2/common/ReactSelect.utils'
import { RadioGroup, RadioGroupItem } from '../common/formFields/RadioGroup'
import TagLabelSelect from '../app/details/TagLabelSelect'
import { createJobReducer, initialState } from './Utils'
import { CreateJobViewState, CreateJobViewStateAction, CreateJobViewStateActionTypes } from './Types'
import { ServerErrors } from '../../modals/commonTypes'
import { TagType } from '../app/types'

export default function CreateJobDrawer(props) {
    const [state, dispatch] = useReducer<Reducer<CreateJobViewState, CreateJobViewStateAction>>(
        createJobReducer,
        initialState,
    )
    const createAppRef = useRef<HTMLDivElement>()
    const jobNameInputRef = useRef<HTMLInputElement>()
    const validationRulesRef = useRef<ValidationRules>(new ValidationRules())

    useEffect(() => {
        // try {
        //     const { result } = await getTeamListMin()
        //     sortObjectArrayAlphabetically(result, 'name')
        //     dispatch({ view: ViewType.FORM, projects: result })
        // } catch (err) {
        //     dispatch({ view: ViewType.ERROR })
        //     showError(err)
        // } finally {
        //     if (jobNameInputRef.current) jobNameInputRef.current.focus()
        // }
        document.addEventListener('keydown', escKeyPressHandler)
        document.addEventListener('click', outsideClickHandler)

        return (): void => {
            document.removeEventListener('keydown', escKeyPressHandler)
            document.removeEventListener('click', outsideClickHandler)
        }
    }, [])

    useEffect(() => {
        if (state.form.jobCreationType === JobCreationType.Existing && props.reloadList) {
            props.reloadList()
        }
    }, [state.form.jobCreationType])

    const renderHeaderSection = (): JSX.Element => {
        return (
            <div className="flex flex-align-center flex-justify dc__border-bottom bcn-0 pt-12 pr-20 pb-12 pl-20">
                <h2 className="fs-16 fw-6 lh-1-43 m-0 title-padding">Create job</h2>
                <button type="button" className="dc__transparent flex icon-dim-24" onClick={props.close}>
                    <Close className="icon-dim-24" />
                </button>
            </div>
        )
    }

    const escKeyPressHandler = (evt): void => {
        if (evt && evt.key === 'Escape' && typeof props.close === 'function') {
            evt.preventDefault()
            props.close(evt)
        }
    }

    const outsideClickHandler = (evt): void => {
        if (createAppRef.current && !createAppRef.current.contains(evt.currentTarget) && typeof props.close === 'function') {
            props.close(evt)
        }
    }

    const handlejobName = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const { form, isValid } = { ...state }
        form.jobName = event.target.value
        isValid.jobName = validationRulesRef.current.appName(event.target.value).isValid
        dispatch({
            type: CreateJobViewStateActionTypes.multipleOptions,
            payload: { form, isValid, jobNameErrors: true },
        })
    }

    const handleProject = (item: number): void => {
        const { form, isValid } = { ...state }
        form.projectId = item
        isValid.projectId = !!item

        dispatch({
            type: CreateJobViewStateActionTypes.multipleOptions,
            payload: { form, isValid },
        })
    }

    const handleCreateJobClick = (e): void => {
        e.preventDefault()
        const labelTags = []
        let invalidLabels = false
        for (let index = 0; index < state.tags.length; index++) {
            const currentTag = state.tags[index]
            if (currentTag.isInvalidKey || currentTag.isInvalidValue) {
                invalidLabels = true
                break
            } else if (currentTag.key) {
                labelTags.push({ key: currentTag.key, value: currentTag.value, propagate: currentTag.propagate })
            }
        }
        dispatch({
            type: CreateJobViewStateActionTypes.multipleOptions,
            payload: { showErrors: true, jobNameErrors: true },
        })
        let allKeys = Object.keys(state.isValid)
        let isFormValid = allKeys.reduce((valid, key) => {
            valid = valid && state.isValid[key]
            return valid
        }, true)
        if (!isFormValid || invalidLabels) {
            if (invalidLabels) {
                toast.error('Some required fields in tags are missing or invalid')
            }
            return
        }

        let request = {
            jobName: state.form.jobName,
            teamId: state.form.projectId,
            templateId: state.form.cloneId,
            labels: labelTags,
        }
        dispatch({
            type: CreateJobViewStateActionTypes.disableForm,
            payload: true,
        })
        createJob(request)
            .then((response) => {
                if (response.result) {
                    // getHostURLConfig()
                    let { form, isValid } = { ...state }
                    form.jobId = response.result.id
                    form.jobName = response.result.jobName
                    isValid.jobName = true
                    isValid.projectId = true
                    dispatch({
                        type: CreateJobViewStateActionTypes.multipleOptions,
                        payload: {
                            code: response.code,
                            form,
                            isValid,
                            disableForm: false,
                            showErrors: false,
                            jobNameErrors: false,
                            tags: response.result?.labels?.tags,
                        },
                    })
                    toast.success('Your job is created. Go ahead and set it up.')
                    redirectToArtifacts(state.form.jobId)
                }
            })
            .catch((errors: ServerErrors) => {
                if (Array.isArray(errors.errors)) {
                    errors.errors.forEach((element) => {
                        toast.error(element.userMessage)
                    })
                    dispatch({
                        type: CreateJobViewStateActionTypes.code,
                        payload: errors.code,
                    })
                } else {
                    showError(errors)
                }
                dispatch({
                    type: CreateJobViewStateActionTypes.multipleOptions,
                    payload: { disableForm: false, showErrors: false, jobNameErrors: false },
                })
            })
    }

    const redirectToArtifacts = (jobId): void => {
        let url = getAppComposeURL(jobId, APP_COMPOSE_STAGE.SOURCE_CONFIG)
        props.history.push(url)
    }

    const changeTemplate = (jobCreationType: string): void => {
        let { form, isValid } = { ...state }
        form.jobCreationType = jobCreationType
        isValid.cloneJobId = jobCreationType === JobCreationType.Blank

        dispatch({
            type: CreateJobViewStateActionTypes.multipleOptions,
            payload: { form, isValid },
        })
    }

    const handleCloneAppChange = ({ value }): void => {
        let { form, isValid } = { ...state }
        form.cloneId = value
        isValid.cloneJobId = !!value

        dispatch({
            type: CreateJobViewStateActionTypes.multipleOptions,
            payload: { form, isValid },
        })
    }

    const setTags = (tags: TagType[]): void => {
        dispatch({
            type: CreateJobViewStateActionTypes.tags,
            payload: tags,
        })
    }

    const renderBodySection = (): JSX.Element => {
        const errorObject = [
            validationRulesRef.current.appName(state.form.jobName),
            validationRulesRef.current.team(state.form.projectId),
            validationRulesRef.current.cloneApp(state.form.cloneId),
        ]
        const showError = state.showErrors
        const jobNameErrors = state.jobNameErrors
        return (
            <div className="scrollable-content p-20">
                <div className="form__row">
                    <span className="form__label dc__required-field">App Name</span>
                    <input
                        ref={jobNameInputRef}
                        className="form__input"
                        type="text"
                        name="app-name"
                        value={state.form.jobName}
                        placeholder="e.g. my-first-app"
                        autoComplete="off"
                        autoFocus={true}
                        tabIndex={1}
                        onChange={handlejobName}
                        required
                    />
                    <span className="form__error">
                        {jobNameErrors && !state.isValid.jobName ? (
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
                        value={state.form.jobCreationType}
                        name="trigger-type"
                        onChange={(event) => {
                            changeTemplate(event.target.value)
                        }}
                    >
                        <RadioGroupItem value={JobCreationType.Blank}>Create from scratch</RadioGroupItem>
                        <RadioGroupItem value={JobCreationType.Existing}>Clone existing application</RadioGroupItem>
                    </RadioGroup>
                </div>
                {state.form.jobCreationType === JobCreationType.Existing && (
                    <>
                        <div className="form__row clone-apps dc__inline-block">
                            <span className="form__label dc__required-field">Select a job to clone</span>
                            <ReactSelect
                                options={[]}
                                onChange={handleCloneAppChange}
                                styles={_multiSelectStyles}
                                components={{
                                    IndicatorSeparator: null,
                                    LoadingIndicator: null,
                                    Option,
                                }}
                                placeholder="Select job"
                                tabIndex={3}
                            />
                            <span className="form__error">
                                {showError && !state.isValid.cloneJobId ? (
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
                    <span className="form__label dc__required-field">Project</span>
                    <ReactSelect
                        className="m-0"
                        tabIndex={4}
                        isMulti={false}
                        isClearable={false}
                        options={state.projects}
                        getOptionLabel={(option) => `${option.name}`}
                        getOptionValue={(option) => `${option.id}`}
                        styles={_multiSelectStyles}
                        components={{
                            IndicatorSeparator: null,
                            Option,
                        }}
                        onChange={(selected) => {
                            handleProject(selected.id)
                        }}
                        placeholder="Select project"
                    />
                    <span className="form__error">
                        {showError && !state.isValid.projectId ? (
                            <>
                                <Error className="form__icon form__icon--error" />
                                {errorObject[1].message}
                            </>
                        ) : null}
                    </span>
                </div>
                <TagLabelSelect isCreateApp={true} labelTags={state.tags} setLabelTags={setTags} tabIndex={5} />
            </div>
        )
    }

    const renderFooterSection = (): JSX.Element => {
        return (
            <div className="w-800 dc__border-top flex right pt-16 pr-20 pb-16 pl-20 dc__position-fixed dc__bottom-0">
                <button className="cta flex h-36" onClick={createJob}>
                    {state.form.jobCreationType === JobCreationType.Existing ? 'Clone App' : 'Create App'}
                </button>
            </div>
        )
    }

    const renderPageDetails = (): JSX.Element => {
        if (state.view === ViewType.LOADING) {
            return <Progressing pageLoader />
        } else if (state.view === ViewType.ERROR) {
            return <Reload />
        } else {
            return (
                <>
                    {renderBodySection()}
                    {renderFooterSection()}
                </>
            )
        }
    }

    return (
        <Drawer position="right" width="800px">
            <div className="h-100 bcn-0 create-app-container" ref={createAppRef}>
                {renderHeaderSection()}
                {renderPageDetails()}
            </div>
        </Drawer>
    )
}
