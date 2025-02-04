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

import { useState } from 'react'
import {
    showError,
    Progressing,
    ErrorScreenNotAuthorized,
    Checkbox,
    CHECKBOX_VALUE,
    useAsync,
    RadioGroup,
    RadioGroupItem,
    CustomInput,
    FeatureTitleWithInfo,
    ToastManager,
    ToastVariantType,
    Button,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    ERROR_STATUS_CODE,
    DeleteConfirmationModal,
} from '@devtron-labs/devtron-fe-common-lib'
import Tippy from '@tippyjs/react'
import { NavLink } from 'react-router-dom'
import { ReactComponent as Add } from '@Icons/ic-add.svg'
import { ReactComponent as Helm } from '@Icons/ic-helmchart.svg'
import { ReactComponent as Trash } from '@Icons/ic-delete-interactive.svg'
import { ReactComponent as ICHelpOutline } from '@Icons/ic-help-outline.svg'

import { useForm } from '../common'
import { List, ProtectedInput } from '../globalConfigurations/GlobalConfiguration'
import {
    saveChartProviderConfig,
    updateChartProviderConfig,
    validateChartRepoConfiguration,
    deleteChartRepo,
} from './chartRepo.service'
import { getChartRepoList } from '../../services/service'
import { PATTERNS, CHART_REPO_TYPE, CHART_REPO_AUTH_TYPE, CHART_REPO_LABEL, URLS, HEADER_TEXT } from '../../config'
import { ValidateForm, VALIDATION_STATUS } from '../common/ValidateForm/ValidateForm'
import './chartRepo.scss'
import { DC_CHART_REPO_CONFIRMATION_MESSAGE, DeleteComponentsName } from '../../config/constantMessaging'
import { ChartFormFields } from './ChartRepoType'
import { ChartRepoType } from './chartRepo.types'

export default function ChartRepo({ isSuperAdmin }: ChartRepoType) {
    const [loading, result, error, reload] = useAsync(getChartRepoList, [], isSuperAdmin)
    if (loading && !result) {
        return <Progressing pageLoader />
    }
    if (error) {
        showError(error)
        if (!result) {
            return null
        }
    }

    function getRandomInt(): number {
        const max = Number.MAX_SAFE_INTEGER
        const min = Number.MIN_SAFE_INTEGER
        const randomBytes = new Uint32Array(1)
        window.crypto.getRandomValues(randomBytes)
        const range = max - min + 1
        const maxRange = 4294967296
        const num = randomBytes[0] / maxRange
        return Math.floor(num * range) + min
    }

    if (!isSuperAdmin) {
        return <ErrorScreenNotAuthorized />
    }
    return (
        <section className="global-configuration__component" data-testid="chart-repository-wrapper">
            <FeatureTitleWithInfo
                title={HEADER_TEXT.CHART_REPOSITORY.title}
                renderDescriptionContent={() => HEADER_TEXT.CHART_REPOSITORY.description}
                docLink={HEADER_TEXT.CHART_REPOSITORY.docLink}
                showInfoIconTippy
                additionalContainerClasses="mb-20"
                dataTestId="chart-repository-heading"
            />
            <CollapsedList
                id={null}
                default
                url=""
                name=""
                active
                authMode="ANONYMOUS"
                key={getRandomInt().toString()}
                reload={reload}
                isEditable
                allowInsecureConnection={false}
            />
            <div className="chartRepo_form__subtitle dc__float-left dc__bold">
                Repositories({(result && Array.isArray(result.result) ? result.result : []).length})
            </div>
            {[]
                .concat(result && Array.isArray(result.result) ? result.result : [])
                .sort((a, b) => a.name.localeCompare(b.name))
                .map(
                    (chart) =>
                        chart.id != 1 && (
                            <CollapsedList
                                {...chart}
                                allowInsecureConnection={chart.allow_insecure_connection}
                                key={chart.id || getRandomInt()}
                                reload={reload}
                            />
                        ),
                )}
        </section>
    )
}

const CollapsedList = ({
    id,
    name,
    active,
    url,
    authMode,
    isEditable,
    accessToken = '',
    userName = '',
    password = '',
    reload,
    allowInsecureConnection,
    ...props
}) => {
    const [collapsed, toggleCollapse] = useState(true)

    const setToggleCollapse = (e) => {
        e.stopPropagation()
        toggleCollapse((t) => !t)
    }

    return (
        <article
            className={`collapsed-list dc__clear-both ${
                id ? 'collapsed-list--chart' : 'collapsed-list--git'
            } collapsed-list--${id ? 'update' : 'create dashed'}`}
        >
            <List
                onClick={setToggleCollapse}
                dataTestId={name || 'add-repository-button'}
                className={`${!id && !collapsed ? 'no-grid-column' : ''}`}
            >
                <List.Logo>
                    {id ? (
                        <div className={`${url} list__logo`}>
                            <Helm className="icon-dim-24 fcb-5 dc__vertical-align-middle " />
                        </div>
                    ) : (
                        collapsed && <Add className="icon-dim-24 fcb-5 dc__vertical-align-middle" />
                    )}
                </List.Logo>
                <div className="flex left">
                    <List.Title
                        style={{ color: !id && !collapsed ? 'var(--N900)' : '' }}
                        title={id && !collapsed ? 'Edit repository' : name || 'Add repository'}
                        subtitle={collapsed ? url : null}
                    />
                </div>
                {id && (
                    <List.DropDown
                        dataTestid="select-existing-repository-button"
                        className="rotate"
                        style={{ ['--rotateBy' as any]: `${Number(!collapsed) * 180}deg` }}
                    />
                )}
            </List>
            {!collapsed && (
                <ChartForm
                    {...{
                        id,
                        name,
                        active,
                        url,
                        authMode,
                        accessToken,
                        userName,
                        password,
                        reload,
                        toggleCollapse,
                        collapsed,
                        isEditable,
                        allowInsecureConnection,
                    }}
                />
            )}
        </article>
    )
}

const ChartForm = ({
    id = null,
    name = '',
    active = false,
    url = '',
    authMode = 'ANONYMOUS',
    accessToken = '',
    userName = '',
    password = '',
    reload,
    toggleCollapse,
    collapsed,
    isEditable,
    allowInsecureConnection,
    ...props
}) => {
    const [validationError, setValidationError] = useState({ errtitle: '', errMessage: '' })
    const [validationStatus, setValidationStatus] = useState(
        VALIDATION_STATUS.DRY_RUN || VALIDATION_STATUS.FAILURE || VALIDATION_STATUS.LOADER || VALIDATION_STATUS.SUCCESS,
    )
    const [loading, setLoading] = useState(false)
    const [customState, setCustomState] = useState({
        password: { value: password, error: '' },
        username: { value: userName, error: '' },
        accessToken: { value: accessToken, error: '' },
    })
    const [allowInsecure, setAllowInsecure] = useState(allowInsecureConnection)
    const { state, handleOnChange, handleOnSubmit } = useForm(
        {
            name: { value: name, error: '' },
            url: { value: url, error: '' },
            auth: { value: authMode, error: '' },
        },
        {
            name: {
                required: true,
                validators: [
                    { error: 'Name is required', regex: /^.*$/ },
                    { error: 'Min 3 chars, spaces not allowed ', regex: /^.\S{2,}$/ },
                ],
            },
            url: {
                required: true,
                validators: [
                    { error: 'URL is required', regex: /^.*$/ },
                    { error: 'Invalid URL', regex: PATTERNS.URL },
                ],
            },
            auth: {
                required: true,
                validator: { error: 'Mode is required', regex: /^.*$/ },
            },
        },
        onClickSave,
    )

    const customHandleChange = (e) =>
        setCustomState((state) => ({ ...state, [e.target.name]: { value: e.target.value, error: '' } }))

    const [confirmation, setConfirmation] = useState(false)
    const [chartRepoType, setChartRepoType] = useState<string>(CHART_REPO_TYPE.PUBLIC)

    if (chartRepoType === CHART_REPO_TYPE.PUBLIC) {
        state.auth.value = CHART_REPO_AUTH_TYPE.ANONYMOUS
    } else {
        state.auth.value = CHART_REPO_AUTH_TYPE.USERNAME_PASSWORD
    }

    const chartRepoPayload = {
        id: id || 0,
        name: state.name.value,
        url: state.url.value,
        authMode: id
            ? password.length > 0
                ? CHART_REPO_AUTH_TYPE.USERNAME_PASSWORD
                : CHART_REPO_AUTH_TYPE.ANONYMOUS
            : chartRepoType === CHART_REPO_TYPE.PUBLIC
              ? CHART_REPO_AUTH_TYPE.ANONYMOUS
              : CHART_REPO_AUTH_TYPE.USERNAME_PASSWORD,
        active: true,
        allow_insecure_connection: allowInsecure,
        ...(state.auth.value === CHART_REPO_AUTH_TYPE.USERNAME_PASSWORD ||
        authMode === CHART_REPO_AUTH_TYPE.USERNAME_PASSWORD
            ? { username: customState.username.value, password: customState.password.value }
            : {}),
        ...(state.auth.value === CHART_REPO_AUTH_TYPE.ACCESS_TOKEN
            ? { accessToken: customState.accessToken.value }
            : {}),
    }

    const isFormValid = () => {
        let isValid = true

        if (state.name.error.length > 0 || state.url.error.length > 0) {
            isValid = false
        }

        if (state.auth.value === CHART_REPO_AUTH_TYPE.USERNAME_PASSWORD) {
            if (!customState.password.value || !customState.username.value) {
                setCustomState((state) => ({
                    ...state,
                    password: { value: state.password.value, error: 'Required' },
                    username: { value: state.username.value, error: 'Required' },
                }))
                isValid = false
            }
        } else if (state.auth.value === 'ACCESS_TOKEN') {
            if (!customState.accessToken.value) {
                setCustomState((state) => ({ ...state, accessToken: { value: '', error: 'Required' } }))
                isValid = false
            }
        }
        return isValid
    }

    async function onClickValidate() {
        if (!isFormValid()) {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: 'Some Required Fields are missing',
            })
            return
        }
        setValidationStatus(VALIDATION_STATUS.LOADER)
        const promise = validateChartRepoConfiguration(chartRepoPayload)
        await promise
            .then((response) => {
                const validateResp = response?.result
                if (!validateResp.actualErrMsg.length) {
                    setValidationStatus(VALIDATION_STATUS.SUCCESS)
                    ToastManager.showToast({
                        variant: ToastVariantType.success,
                        description: 'Configuration validated',
                    })
                } else if (validateResp.actualErrMsg.length > 0) {
                    setValidationStatus(VALIDATION_STATUS.FAILURE)
                    setValidationError({ errtitle: validateResp?.customErrMsg, errMessage: validateResp.actualErrMsg })
                    ToastManager.showToast({
                        variant: ToastVariantType.error,
                        description: 'Configuration validation failed',
                    })
                }
            })
            .catch((error) => {
                showError(error)
                setValidationStatus(VALIDATION_STATUS.DRY_RUN)
                setLoading(false)
            })
    }

    async function onClickSave(e) {
        if (!isFormValid()) {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: 'Some Required Fields are missing',
            })
            return
        }
        setValidationStatus(VALIDATION_STATUS.LOADER)
        const api = id ? updateChartProviderConfig : saveChartProviderConfig

        try {
            setLoading(true)
            const { result } = await api(chartRepoPayload, id)

            if (result && !result?.actualErrMsg) {
                setValidationStatus(VALIDATION_STATUS.SUCCESS)
                ToastManager.showToast({
                    variant: ToastVariantType.success,
                    title: 'Chart repo saved',
                    description: 'It may take upto 5 mins for the charts to be listed in the chart store.',
                })
                await reload()
            } else {
                setValidationStatus(VALIDATION_STATUS.FAILURE)
                setLoading(false)
                setValidationError({ errtitle: result?.customErrMsg, errMessage: result.actualErrMsg })
                ToastManager.showToast({
                    variant: ToastVariantType.error,
                    description: 'Configuration validation failed',
                })
            }
        } catch (err) {
            showError(err)
            setValidationStatus(VALIDATION_STATUS.DRY_RUN)
        } finally {
            setLoading(false)
        }
    }

    function toggleIsPublicChartType(e) {
        setCustomState((state) => ({
            ...state,
            password: { value: '', error: '' },
            username: { value: '', error: '' },
        }))

        if (chartRepoType === CHART_REPO_TYPE.PUBLIC) {
            setChartRepoType(CHART_REPO_TYPE.PRIVATE)
        } else {
            setChartRepoType(CHART_REPO_TYPE.PUBLIC)
        }
    }

    function allowInsecureConnectionHandler(e) {
        setAllowInsecure(!allowInsecure)
    }
    const showConfirmationModal = () => setConfirmation(true)
    const closeConfirmationModal = () => setConfirmation(false)

    const handleCancelClick = () => toggleCollapse((t) => !t)

    const renderChartInputElement = (field: string) => {
        const isNameField: boolean = field === 'name'
        return (
            <CustomInput
                dataTestid={isNameField ? 'add-chart-repo-name' : 'add-chart-repo-URL'}
                value={isNameField ? state.name.value : state.url.value}
                onChange={handleOnChange}
                name={isNameField ? 'name' : 'url'}
                error={isNameField ? state.name.error : state.url.error}
                label={isNameField ? 'Name' : 'URL'}
                placeholder={isNameField ? 'Enter Repository name' : 'Enter repo URL'}
                disabled={!isEditable}
                isRequiredField
            />
        )
    }

    const renderModifiedChartInputElement = (field: string, isEditable: boolean) =>
        !isEditable ? (
            <Tippy
                className="default-tt w-200"
                arrow={false}
                placement="bottom"
                content={`Cannot edit ${field}. Some charts from this repository are being used by helm apps.`}
            >
                <div>{renderChartInputElement(field)}</div>
            </Tippy>
        ) : (
            renderChartInputElement(field)
        )

    const onDelete = async () => {
        await deleteChartRepo(chartRepoPayload)
        reload()
    }

    return (
        <form onSubmit={handleOnSubmit} className="git-form flexbox-col dc__gap-12" autoComplete="off">
            {!id && (
                <RadioGroup
                    className="chartrepo-type__radio-group"
                    value={chartRepoType}
                    name={`chartrepo-type_${chartRepoType}`}
                    onChange={toggleIsPublicChartType}
                >
                    {CHART_REPO_LABEL.map(({ label, value }) => (
                        <RadioGroupItem dataTestId={`${label}`} value={value}>
                            <span className={`dc__no-text-transform ${chartRepoType === value ? 'fw-6' : 'fw-4'}`}>
                                {label}
                            </span>
                        </RadioGroupItem>
                    ))}
                </RadioGroup>
            )}
            <ValidateForm
                id={id}
                onClickValidate={onClickValidate}
                validationError={validationError}
                isChartRepo
                validationStatus={validationStatus}
                configName="chart repo"
            />

            <div className="form__row--two-third">
                {renderModifiedChartInputElement(ChartFormFields.NAME, isEditable)}
                {renderModifiedChartInputElement(ChartFormFields.URL, isEditable)}
                {(chartRepoType !== CHART_REPO_TYPE.PUBLIC ||
                    (id && authMode === CHART_REPO_AUTH_TYPE.USERNAME_PASSWORD)) && (
                    <>
                        <CustomInput
                            dataTestid="add-chart-repo-username"
                            value={customState.username.value}
                            onChange={customHandleChange}
                            name="username"
                            error={customState.username.error}
                            label="Username"
                            labelClassName="mt-12"
                            isRequiredField
                        />
                        <ProtectedInput
                            dataTestid="add-chart-repo-password"
                            value={customState.password.value}
                            onChange={customHandleChange}
                            name="password"
                            error={customState.password.error}
                            label="Password"
                            labelClassName="mt-12"
                            isRequiredField
                        />
                    </>
                )}

                <Checkbox
                    rootClassName="fs-13 dc__hover-n50 pt-8 pb-8"
                    isChecked={allowInsecure}
                    value={CHECKBOX_VALUE.CHECKED}
                    onChange={allowInsecureConnectionHandler}
                >
                    <div className="ml-1">Allow Insecure Connection</div>
                </Checkbox>
            </div>
            <div className={`${!id ? 'form__row--one-third' : ''} pb-16 pt-16 dc__border-top`}>
                {!id && (
                    <div className="form-row flex left fs-13">
                        <ICHelpOutline className="icon-dim-16 mr-8" />
                        Looking to add OCI-based registry?
                        <NavLink
                            className="dc__no-decor pl-8 pr-8 flex left cb-5"
                            to={`${URLS.GLOBAL_CONFIG_DOCKER}/0`}
                        >
                            Add OCI Registry
                        </NavLink>
                    </div>
                )}

                <div className="flex dc__content-space">
                    {id && (
                        <Button
                            text="Delete"
                            variant={ButtonVariantType.secondary}
                            style={ButtonStyleType.negative}
                            size={ComponentSizeType.large}
                            startIcon={<Trash />}
                            dataTestId="chart-repo-delete-button"
                            onClick={showConfirmationModal}
                        />
                    )}
                    <div className="flex right w-100 dc__gap-12">
                        <button
                            data-testid="chart-repo-cancel-button"
                            className="cta cancel"
                            type="button"
                            onClick={handleCancelClick}
                        >
                            Cancel
                        </button>
                        <button data-testid="chart-repo-save-button" className="cta" type="submit" disabled={loading}>
                            {loading ? <Progressing /> : id ? 'Update' : 'Save'}
                        </button>
                    </div>
                </div>
            </div>
            <DeleteConfirmationModal
                title={state.name.value}
                component={DeleteComponentsName.ChartRepository}
                renderCannotDeleteConfirmationSubTitle={DC_CHART_REPO_CONFIRMATION_MESSAGE}
                errorCodeToShowCannotDeleteDialog={ERROR_STATUS_CODE.INTERNAL_SERVER_ERROR}
                onDelete={onDelete}
                showConfirmationModal={confirmation}
                closeConfirmationModal={closeConfirmationModal}
            />
        </form>
    )
}
