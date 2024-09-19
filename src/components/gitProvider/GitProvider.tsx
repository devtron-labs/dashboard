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

import { useState, useEffect } from 'react'
import {
    showError,
    Progressing,
    ErrorScreenManager,
    ErrorScreenNotAuthorized,
    InfoColourBar,
    VisibleModal,
    useEffectAfterMount,
    stopPropagation,
    useAsync,
    CustomInput,
    DEFAULT_SECRET_PLACEHOLDER,
    FeatureTitleWithInfo,
    DeleteComponent,
    ToastVariantType,
    ToastManager,
    SelectPicker,
    ComponentSizeType,
} from '@devtron-labs/devtron-fe-common-lib'
import Tippy from '@tippyjs/react'
import {
    getCertificateAndKeyDependencyError,
    getIsTLSDataPresent,
    getTLSConnectionPayloadValues,
    TLSConnectionDTO,
    TLSConnectionFormActionType,
    TLSConnectionFormProps,
    useForm,
    handleOnBlur,
    handleOnFocus,
    parsePassword,
    renderMaterialIcon,
    TLSConnectionForm,
} from '@Components/common'
import { getGitHostList, getGitProviderList } from '../../services/service'
import { saveGitHost, saveGitProviderConfig, updateGitProviderConfig, deleteGitProvider } from './gitProvider.service'
import { List } from '../globalConfigurations/GlobalConfiguration'
import { HEADER_TEXT } from '../../config'
import './gitProvider.scss'
import { GitHostConfigModal } from './AddGitHostConfigModal'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import { ReactComponent as Warn } from '../../assets/icons/ic-info-warn.svg'
import { DC_GIT_PROVIDER_CONFIRMATION_MESSAGE, DeleteComponentsName } from '../../config/constantMessaging'
import { AuthenticationType } from '../cluster/cluster.type'
import { ReactComponent as Info } from '../../assets/icons/info-filled.svg'
import { safeTrim } from '../../util/Util'
import { TLSInputType } from './types'

export default function GitProvider({ ...props }) {
    const [, , error] = useAsync(getGitProviderList, [], props.isSuperAdmin)
    const [providerList, setProviderList] = useState([])
    const [hostListOption, setHostListOption] = useState([])
    const [isPageLoading, setIsPageLoading] = useState(true)
    const [isErrorLoading, setIsErrorLoading] = useState(false)
    const [showGitProviderConfigModal, setGitProviderConfigModal] = useState(false)

    async function getInitData() {
        try {
            const { result: providers = [] } = await getGitProviderList()
            const { result: hosts = [] } = await getGitHostList()
            providers.sort((a, b) => a.name.localeCompare(b.name))
            hosts.sort((a, b) => a.name.localeCompare(b.name))
            const hostOptions = hosts.map((host) => {
                return {
                    value: host.id,
                    label: host.name,
                }
            })
            setProviderList(providers)
            setHostListOption(hostOptions)
        } catch (error) {
            showError(error)
            setIsErrorLoading(true)
        } finally {
            setIsPageLoading(false)
        }
    }

    async function getHostList() {
        try {
            const { result: hosts = [] } = await getGitHostList()
            hosts.sort((a, b) => a.name.localeCompare(b.name))
            const host = hosts.map((host) => {
                return {
                    value: host.id,
                    label: host.name,
                }
            })
            setHostListOption(host)
        } catch (error) {
            showError(error)
            setIsErrorLoading(true)
        }
    }

    async function getProviderList() {
        try {
            const { result: providers = [] } = await getGitProviderList()
            providers.sort((a, b) => a.name.localeCompare(b.name))
            setProviderList(providers)
        } catch (error) {
            showError(error)
            setIsErrorLoading(true)
        }
    }

    useEffect(() => {
        if (props.isSuperAdmin) {
            getInitData()
        }
    }, [])
    if (!props.isSuperAdmin) {
        return (
            <div className="dc__align-reload-center">
                <ErrorScreenNotAuthorized />
            </div>
        )
    }
    if (isPageLoading) {
        return <Progressing pageLoader />
    }
    if (isErrorLoading) {
        return <ErrorScreenManager code={error?.code} />
    }

    const defaultTLSData: TLSConnectionDTO = {
        enableTLSVerification: false,
        tlsConfig: {
            caData: '',
            tlsCertData: '',
            tlsKeyData: '',
        },
        isCADataPresent: false,
        isTLSCertDataPresent: false,
        isTLSKeyDataPresent: false,
    }

    const allProviders = [
        {
            id: null,
            name: '',
            active: true,
            url: '',
            gitHostId: '',
            authMode: 'ANONYMOUS',
            userName: '',
            password: '',
            sshPrivateKey: '',
            ...structuredClone(defaultTLSData),
        },
    ].concat(providerList)

    return (
        <section className="global-configuration__component flex-1" data-testid="git-provider-wrapper">
            <FeatureTitleWithInfo
                title={HEADER_TEXT.GIT_ACCOUNTS.title}
                renderDescriptionContent={() => HEADER_TEXT.GIT_ACCOUNTS.description}
                docLink={HEADER_TEXT.GIT_ACCOUNTS.docLink}
                showInfoIconTippy
                additionalContainerClasses="mb-20"
            />
            {allProviders.map((provider) => {
                return (
                    <>
                        <CollapsedList
                            key={provider.name || Math.random().toString(36).substr(2, 5)}
                            id={provider.id}
                            name={provider.name}
                            showGitProviderConfigModal={showGitProviderConfigModal}
                            setGitProviderConfigModal={setGitProviderConfigModal}
                            providerList={providerList}
                            hostListOption={hostListOption}
                            gitHostId={provider.gitHostId}
                            active={provider.active}
                            url={provider.url}
                            authMode={provider.authMode}
                            userName={provider.userName}
                            password={provider.password}
                            getHostList={getHostList}
                            getProviderList={getProviderList}
                            reload={getInitData}
                            sshPrivateKey={provider.sshPrivateKey}
                            enableTLSVerification={provider.enableTLSVerification}
                            tlsConfig={provider.tlsConfig}
                            isCADataPresent={provider.isCADataPresent}
                            isTLSCertDataPresent={provider.isTLSCertDataPresent}
                            isTLSKeyDataPresent={provider.isTLSKeyDataPresent}
                        />
                        {showGitProviderConfigModal && (
                            <VisibleModal className="app-status__material-modal">
                                <GitHostConfigModal
                                    closeGitConfigModal={() => setGitProviderConfigModal(false)}
                                    getHostList={getHostList}
                                />
                            </VisibleModal>
                        )}
                    </>
                )
            })}
            {/* {[{ id: null, name: "", active: true, url: "", authMode: "ANONYMOUS" }].concat(result && Array.isArray(result.result) ? result.result : []).sort((a, b) => a.name.localeCompare(b.name)).map(git => <CollapsedList {...git} key={git.id || Math.random().toString(36).substr(2, 5)} reload={reload} />)} */}
        </section>
    )
}

const CollapsedList = ({
    id,
    name,
    active,
    url,
    authMode,
    gitHostId,
    accessToken = '',
    userName = '',
    password = '',
    reload,
    hostListOption,
    getHostList,
    getProviderList,
    providerList,
    showGitProviderConfigModal,
    setGitProviderConfigModal,
    sshPrivateKey,
    enableTLSVerification,
    tlsConfig,
    isCADataPresent,
    isTLSCertDataPresent,
    isTLSKeyDataPresent,
    ...props
}) => {
    const [collapsed, toggleCollapse] = useState(true)
    const [enabled, toggleEnabled] = useState<boolean>(active)
    const [loading, setLoading] = useState(false)
    const selectedGitHost = hostListOption.find((p) => p.value === gitHostId)
    const [gitHost, setGithost] = useState({ value: selectedGitHost, error: '' })

    const handleReload = async () => {
        toggleCollapse(true)
        await reload()
    }

    useEffectAfterMount(() => {
        async function update() {
            const payload = {
                id: id || 0,
                name,
                url,
                authMode,
                active: enabled,
                gitHostId: +gitHostId,
                enableTLSVerification,
                isCADataPresent,
                isTLSCertDataPresent,
                isTLSKeyDataPresent,
                tlsConfig,
                ...(authMode === 'USERNAME_PASSWORD' ? { username: userName, password } : {}),
                ...(authMode === 'ACCESS_TOKEN' ? { accessToken } : {}),
                ...(authMode === 'SSH' ? { sshPrivateKey } : {}),
            }
            try {
                setLoading(true)
                await updateGitProviderConfig(payload, id)
                await handleReload()
                ToastManager.showToast({
                    variant: ToastVariantType.success,
                    description: `Git account ${enabled ? 'enabled' : 'disabled'}.`,
                })
            } catch (err) {
                showError(err)
            } finally {
                setLoading(false)
            }
        }
        update()
    }, [enabled])

    const setToggleCollapse = () => {
        toggleCollapse(false)
    }

    const closeDropdown = (e) => {
        e.stopPropagation()
        toggleCollapse((t) => !t)
    }

    return (
        <article
            className={`collapsed-list ${id ? 'collapsed-list--chart' : 'collapsed-list--git dashed'} collapsed-list--${
                id ? 'update' : 'create'
            }`}
        >
            <List
                dataTestId={name || 'Add git account'}
                onClick={setToggleCollapse}
                className={`${!id && !collapsed ? 'no-grid-column' : ''}`}
            >
                <List.Logo>
                    {id && (
                        <div className="">
                            <span className="mr-8">{renderMaterialIcon(url)}</span>
                        </div>
                    )}
                    {!id && collapsed && <Add className="icon-dim-24 fcb-5 dc__vertical-align-middle" />}
                </List.Logo>
                <div className="flex left">
                    <List.Title
                        style={{ color: !id && !collapsed ? 'var(--N900)' : '' }}
                        title={id && !collapsed ? 'Edit git account' : name || 'Add git account'}
                        subtitle={collapsed ? url : null}
                    />
                    {id && (
                        <Tippy
                            className="default-tt"
                            arrow={false}
                            placement="bottom"
                            content={enabled ? 'Disable git account' : 'Enable git account'}
                        >
                            <span
                                onClick={stopPropagation}
                                style={{ marginLeft: 'auto' }}
                                data-testid={`${name}-toggle-button`}
                            >
                                {loading ? <Progressing /> : <List.Toggle onSelect={toggleEnabled} enabled={enabled} />}
                            </span>
                        </Tippy>
                    )}
                </div>
                {id && (
                    <List.DropDown
                        onClick={closeDropdown}
                        className="rotate"
                        style={{ ['--rotateBy' as any]: `${Number(!collapsed) * 180}deg` }}
                    />
                )}
            </List>
            {!collapsed && (
                <GitForm
                    {...{
                        id,
                        name,
                        active: enabled,
                        url,
                        authMode,
                        gitHostId,
                        accessToken,
                        userName,
                        password,
                        hostListOption,
                        getHostList,
                        getProviderList,
                        reload: handleReload,
                        providerList,
                        toggleCollapse,
                        showGitProviderConfigModal,
                        setGitProviderConfigModal,
                        gitHost,
                        setGithost,
                        sshPrivateKey,
                        enableTLSVerification,
                        tlsConfig,
                        isCADataPresent,
                        isTLSCertDataPresent,
                        isTLSKeyDataPresent,
                    }}
                />
            )}
        </article>
    )
}

const GitForm = ({
    id = null,
    name = '',
    active = false,
    url = '',
    gitHostId,
    authMode = null,
    accessToken = '',
    userName = '',
    password = '',
    hostListOption,
    hostName = undefined,
    reload,
    toggleCollapse,
    getHostList,
    getProviderList,
    providerList,
    showGitProviderConfigModal,
    setGitProviderConfigModal,
    gitHost,
    setGithost,
    sshPrivateKey = '',
    enableTLSVerification,
    // Could be null since coming from api
    tlsConfig,
    isCADataPresent,
    isTLSCertDataPresent,
    isTLSKeyDataPresent,
    ...props
}) => {
    const { state, handleOnChange, handleOnSubmit } = useForm(
        {
            name: { value: name, error: '' },
            url: { value: url, error: '' },
            auth: { value: authMode, error: '' },
        },
        {
            name: {
                required: true,
                validator: { error: 'Name is required', regex: /^.{5,}$/ },
            },
            url: {
                required: true,
                validator: { error: 'URL is required', regex: /^.{10,}$/ },
            },
            auth: {
                required: true,
                validator: { error: 'Mode is required', regex: /^.*$/ },
            },
        },
        onValidation,
    )

    const [loading, setLoading] = useState(false)
    const [customState, setCustomState] = useState({
        password: {
            value: !password && id && authMode === 'USERNAME_PASSWORD' ? DEFAULT_SECRET_PLACEHOLDER : password,
            error: '',
        },
        username: { value: userName, error: '' },
        accessToken: { value: accessToken, error: '' },
        hostName: { value: gitHost.value, error: '' },
        sshInput: { value: !sshPrivateKey && id ? DEFAULT_SECRET_PLACEHOLDER : sshPrivateKey, error: '' },
    })

    // Need to merge all the input states to a single state
    const [tlsInput, setTLSInput] = useState<TLSInputType>({
        enableTLSVerification: enableTLSVerification ?? false,
        isCADataPresent: isCADataPresent ?? false,
        isTLSCertDataPresent: isTLSCertDataPresent ?? false,
        isTLSKeyDataPresent: isTLSKeyDataPresent ?? false,
        isCADataClearedAfterInitialConfig: false,
        isTLSCertDataClearedAfterInitialConfig: false,
        isTLSKeyDataClearedAfterInitialConfig: false,
        tlsConfig: {
            caData: { value: tlsConfig?.caData || '', error: '' },
            tlsCertData: { value: tlsConfig?.tlsCertData || '', error: '' },
            tlsKeyData: { value: tlsConfig?.tlsKeyData || '', error: '' },
        },
    })

    const [deleting, setDeleting] = useState(false)
    const [confirmation, toggleConfirmation] = useState(false)

    const isTLSInitiallyConfigured = id && enableTLSVerification

    function customHandleChange(e) {
        const _name = e.target.name
        const _value = e.target.value

        setCustomState((state) => ({
            ...state,
            [_name]: { value: _value, error: '' },
        }))
    }

    function handleGithostChange(host) {
        setGithost({
            value: host,
            error: host ? '' : 'Required',
        })
    }

    async function onSave() {
        const { isTLSKeyError, isTLSCertError, message } = getCertificateAndKeyDependencyError(
            tlsInput.isTLSCertDataPresent,
            tlsInput.isTLSKeyDataPresent,
        )
        const isAuthModePassword = state.auth.value === 'USERNAME_PASSWORD'

        if (message && isAuthModePassword) {
            setTLSInput({
                ...tlsInput,
                tlsConfig: {
                    ...tlsInput.tlsConfig,
                    tlsCertData: {
                        value: tlsInput.tlsConfig.tlsCertData.value,
                        error: isTLSCertError ? message : '',
                    },
                    tlsKeyData: {
                        value: tlsInput.tlsConfig.tlsKeyData.value,
                        error: isTLSKeyError ? message : '',
                    },
                },
            })
            return
        }

        const payload = {
            id: id || 0,
            name: state.name.value,
            gitHostId: gitHost.value.value,
            url: state.url.value,
            authMode: state.auth.value,
            active,
            ...(state.auth.value === 'USERNAME_PASSWORD'
                ? {
                      username: customState.username.value,
                      password: parsePassword(customState.password.value),
                      ...getTLSConnectionPayloadValues({
                          enableTLSVerification: tlsInput.enableTLSVerification,
                          isCADataPresent: tlsInput.isCADataPresent,
                          isTLSCertDataPresent: tlsInput.isTLSCertDataPresent,
                          isTLSKeyDataPresent: tlsInput.isTLSKeyDataPresent,
                          tlsConfig: {
                              caData: tlsInput.tlsConfig.caData.value,
                              tlsCertData: tlsInput.tlsConfig.tlsCertData.value,
                              tlsKeyData: tlsInput.tlsConfig.tlsKeyData.value,
                          },
                      }),
                  }
                : {}),
            ...(state.auth.value === 'ACCESS_TOKEN' ? { accessToken: customState.accessToken.value } : {}),
            ...(state.auth.value === 'SSH'
                ? {
                      sshPrivateKey: parsePassword(safeTrim(customState.sshInput.value)),
                  }
                : {}),
        }

        const api = id ? updateGitProviderConfig : saveGitProviderConfig
        try {
            setLoading(true)
            await api(payload, id)
            reload()
            ToastManager.showToast({
                variant: ToastVariantType.success,
                description: 'Successfully saved',
            })
        } catch (err) {
            showError(err)
        } finally {
            setLoading(false)
        }
    }

    async function onValidation() {
        if (state.auth.value === 'USERNAME_PASSWORD') {
            const isPasswordEmpty = (!id || authMode !== 'USERNAME_PASSWORD') && !customState.password.value

            if (isPasswordEmpty || !customState.username.value) {
                setCustomState((state) => ({
                    ...state,
                    password: { value: state.password.value, error: isPasswordEmpty ? 'This is a required field' : '' },
                    username: { value: state.username.value, error: !customState.username.value ? 'Required' : '' },
                }))
                return
            }
        } else if (state.auth.value === 'ACCESS_TOKEN') {
            if (!customState.accessToken.value) {
                setCustomState((state) => ({
                    ...state,
                    accessToken: { value: '', error: 'This is a required field' },
                }))
                return
            }
        } else if (state.auth.value === 'SSH') {
            if (!id && !customState.sshInput.value) {
                setCustomState((state) => ({
                    ...state,
                    sshInput: { value: '', error: 'This is a required field' },
                }))
                return
            }
        }

        if (!gitHost.value) {
            setGithost({
                ...gitHost,
                error: 'This is a required field',
            })
            return
        }

        if (gitHost.value && gitHost.value.__isNew__) {
            const gitHostPayload = {
                name: gitHost.value.value,
                active: true,
            }
            try {
                let gitHostId = gitHost.value.value
                const { result } = await saveGitHost(gitHostPayload)
                await getHostList()

                gitHostId = result
            } catch (error) {
                showError(error)
            }
        }
        onSave()
    }

    const onClickAddGitAccountHandler = (): void => {
        setGitProviderConfigModal(true)
        toggleCollapse(false)
    }

    const renderGitHostBottom = () => {
        return (
            <button
                className="flex left dc__gap-8 px-10 py-8 cb-5 cursor bcn-0 dc__react-select__bottom dc__border-top dc__transparent fw-6"
                onClick={onClickAddGitAccountHandler}
            >
                <Add className="icon-dim-20 fcb-5 dc__vertical-align-bottom" /> <span>Add Git Host</span>
            </button>
        )
    }

    const TippyMessage = {
        authMessage: 'Authentication type cannot be switched from HTTPS to SSH or vice versa.',
    }

    const AuthType = [
        { label: 'User auth', value: 'USERNAME_PASSWORD' },
        { label: 'Anonymous', value: 'ANONYMOUS' },
        { label: 'SSH Key', value: 'SSH' },
    ]

    function canSelectAuth(selectedAuth: string) {
        if (!id) {
            return true
        }

        const savedAuth = state.auth.value
        if ((savedAuth == 'SSH' && selectedAuth != 'SSH') || (savedAuth != 'SSH' && selectedAuth == 'SSH')) {
            return false
        }
        return true
    }

    const handleTLSConfigChange: TLSConnectionFormProps['handleChange'] = ({ action, payload }) => {
        switch (action) {
            case TLSConnectionFormActionType.TOGGLE_ENABLE_TLS_VERIFICATION:
                setTLSInput({
                    ...tlsInput,
                    enableTLSVerification: !tlsInput.enableTLSVerification,
                })
                break
            case TLSConnectionFormActionType.UPDATE_CA_DATA:
                setTLSInput({
                    ...tlsInput,
                    isCADataPresent: getIsTLSDataPresent({
                        targetValue: payload,
                        isTLSInitiallyConfigured,
                        wasFieldInitiallyPresent: tlsConfig?.isCADataPresent,
                        wasFieldClearedAfterInitialConfig: tlsInput.isCADataClearedAfterInitialConfig,
                    }),
                    tlsConfig: {
                        ...tlsInput.tlsConfig,
                        caData: {
                            value: payload,
                            error: '',
                        },
                    },
                })
                break
            case TLSConnectionFormActionType.UPDATE_CERT_DATA:
                setTLSInput({
                    ...tlsInput,
                    isTLSCertDataPresent: getIsTLSDataPresent({
                        targetValue: payload,
                        isTLSInitiallyConfigured,
                        wasFieldInitiallyPresent: tlsConfig?.isTLSCertDataPresent,
                        wasFieldClearedAfterInitialConfig: tlsInput.isTLSCertDataClearedAfterInitialConfig,
                    }),
                    tlsConfig: {
                        ...tlsInput.tlsConfig,
                        tlsCertData: {
                            value: payload,
                            error: '',
                        },
                        tlsKeyData: {
                            ...tlsInput.tlsConfig.tlsKeyData,
                            error: '',
                        },
                    },
                })
                break
            case TLSConnectionFormActionType.UPDATE_KEY_DATA:
                setTLSInput({
                    ...tlsInput,
                    isTLSKeyDataPresent: getIsTLSDataPresent({
                        targetValue: payload,
                        isTLSInitiallyConfigured,
                        wasFieldInitiallyPresent: tlsConfig?.isTLSKeyDataPresent,
                        wasFieldClearedAfterInitialConfig: tlsInput.isTLSKeyDataClearedAfterInitialConfig,
                    }),
                    tlsConfig: {
                        ...tlsInput.tlsConfig,
                        tlsKeyData: {
                            value: payload,
                            error: '',
                        },
                        tlsCertData: {
                            ...tlsInput.tlsConfig.tlsCertData,
                            error: '',
                        },
                    },
                })
                break
            case TLSConnectionFormActionType.CLEAR_CA_DATA:
                setTLSInput({
                    ...tlsInput,
                    isCADataClearedAfterInitialConfig: true,
                    isCADataPresent: false,
                    tlsConfig: {
                        ...tlsInput.tlsConfig,
                        caData: {
                            value: '',
                            error: '',
                        },
                    },
                })
                break
            case TLSConnectionFormActionType.CLEAR_CERT_DATA:
                setTLSInput({
                    ...tlsInput,
                    isTLSCertDataClearedAfterInitialConfig: true,
                    isTLSCertDataPresent: false,
                    tlsConfig: {
                        ...tlsInput.tlsConfig,
                        tlsCertData: {
                            value: '',
                            error: '',
                        },
                        tlsKeyData: {
                            ...tlsInput.tlsConfig.tlsKeyData,
                            error: '',
                        },
                    },
                })
                break
            case TLSConnectionFormActionType.CLEAR_KEY_DATA:
                setTLSInput({
                    ...tlsInput,
                    isTLSKeyDataClearedAfterInitialConfig: true,
                    isTLSKeyDataPresent: false,
                    tlsConfig: {
                        ...tlsInput.tlsConfig,
                        tlsKeyData: {
                            value: '',
                            error: '',
                        },
                        tlsCertData: {
                            ...tlsInput.tlsConfig.tlsCertData,
                            error: '',
                        },
                    },
                })
                break
        }
    }

    const deletePayload = {
        id: id || 0,
        name: state.name.value,
        url: state.url.value,
        gitHostId: gitHost?.value?.value || 0,
        authMode: state.auth.value || '',
        active,
        username: customState.username.value || '',
        password: customState.password.value || '',
        accessToken: customState.accessToken.value || '',
        sshPrivateKey: customState.sshInput.value || '',
    }

    return (
        <form onSubmit={handleOnSubmit} className="git-form" autoComplete="off">
            <div className="mb-16">
                <CustomInput
                    dataTestid="git-account-name-textbox"
                    value={state.name.value}
                    onChange={handleOnChange}
                    name="name"
                    error={state.name.error}
                    label="Name"
                    isRequiredField
                />
            </div>
            <div className="form__row--two-third mb-16">
                <div>
                    <SelectPicker
                        label="Git host"
                        required
                        inputId="git-account-host-select"
                        name="host"
                        value={gitHost.value}
                        classNamePrefix="select-git-account-host"
                        placeholder="Select git host"
                        isSearchable
                        isClearable={false}
                        options={hostListOption}
                        renderMenuListFooter={renderGitHostBottom}
                        onChange={(e) => handleGithostChange(e)}
                        isDisabled={gitHostId}
                        size={ComponentSizeType.large}
                    />
                    <div className="cr-5 fs-11">{gitHost.error}</div>
                </div>
                <CustomInput
                    dataTestid="git-account-host-url-textbox"
                    value={state.url.value}
                    onChange={handleOnChange}
                    name="url"
                    error={state.url.error}
                    label="URL"
                    isRequiredField
                />
            </div>
            <div className="form__label dc__required-field">Authentication type</div>
            <div className={` form__row--auth-type  ${!id ? 'pointer' : ''}`}>
                {AuthType.map(({ label: Lable, value }, index) => (
                    <div
                        data-testid={`git-account-auth-type-${index}`}
                        className={` ${canSelectAuth(value) ? 'pointer' : 'wrapper-pointer-disabled'}`}
                        onChange={handleOnChange}
                        style={{ borderRight: '1px solid #d6d4d9', height: '48px' }}
                    >
                        <Tippy
                            className={` default-tt ${canSelectAuth(value) ? 'w-0 h-0' : 'w-200'}`}
                            arrow={false}
                            placement="bottom"
                            content={`${canSelectAuth(value) ? '' : TippyMessage.authMessage}`}
                        >
                            <label
                                key={value}
                                className={`${canSelectAuth(value) ? 'pointer' : 'pointer-disabled'} flex left `}
                            >
                                <input type="radio" name="auth" value={value} checked={value === state.auth.value} />
                                {Lable}
                            </label>
                        </Tippy>
                    </div>
                ))}
            </div>
            <div className="flex fs-12 left pt-4 mb-16" style={{ color: '#6b778c' }}>
                <Warn className="icon-dim-16 mr-4 " />
                Once configured, authentication type cannot be switched from HTTPS (user auth/anonymous) to SSH or vice
                versa.
            </div>
            {state.auth.value === AuthenticationType.ANONYMOUS && (
                <InfoColourBar
                    message="Applications using ‘anonymous’ git accounts, will be able to access only ‘public repositories’ from the git account."
                    classname="info_bar cn-9 mb-16 lh-20"
                    Icon={Info}
                    iconClass="icon-dim-20"
                />
            )}
            {state.auth.error && <div className="form__error">{state.auth.error}</div>}
            {state.auth.value === 'USERNAME_PASSWORD' && (
                <div className="form__row form__row--two-third">
                    <CustomInput
                        dataTestid="git-account-user-auth-username"
                        value={customState.username.value}
                        onChange={customHandleChange}
                        name="username"
                        error={customState.username.error}
                        label="Username"
                        isRequiredField
                    />
                    <div>
                        <CustomInput
                            dataTestid="git-account-user-auth-password"
                            value={customState.password.value}
                            onChange={customHandleChange}
                            onFocus={handleOnFocus}
                            name="password"
                            error={customState.password.error}
                            label="Password/Auth token"
                            isRequiredField
                            handleOnBlur={id && handleOnBlur}
                        />
                        <div className="flex fs-12 left pt-4 mb-20" style={{ color: '#6b778c' }}>
                            <Warn className="icon-dim-16 mr-4 " />
                            If using Github, use token instead of password.
                        </div>
                    </div>
                </div>
            )}
            {state.auth.value === 'SSH' && (
                <div className="form__row ">
                    <div className="form__label dc__required-field">Private SSH key</div>
                    <textarea
                        data-testid="git-account-ssh-key-textbox"
                        placeholder="Enter key text"
                        className="form__input w-100"
                        style={{ height: '100px', backgroundColor: '#f7fafc' }}
                        onChange={customHandleChange}
                        onBlur={id && handleOnBlur}
                        onFocus={handleOnFocus}
                        name="sshInput"
                        value={customState.sshInput.value}
                    />
                    {customState.sshInput.error && <div className="form__error">{customState.sshInput.error}</div>}
                </div>
            )}

            {state.auth.value === 'USERNAME_PASSWORD' && (
                <TLSConnectionForm
                    enableTLSVerification={tlsInput.enableTLSVerification}
                    handleChange={handleTLSConfigChange}
                    caData={tlsInput.tlsConfig.caData}
                    tlsCertData={tlsInput.tlsConfig.tlsCertData}
                    tlsKeyData={tlsInput.tlsConfig.tlsKeyData}
                    isCADataPresent={tlsInput.isCADataPresent}
                    isTLSCertDataPresent={tlsInput.isTLSCertDataPresent}
                    isTLSKeyDataPresent={tlsInput.isTLSKeyDataPresent}
                    isTLSInitiallyConfigured={isTLSInitiallyConfigured}
                    rootClassName="mb-16"
                />
            )}

            <div className="form__row form__buttons">
                {id && (
                    <button
                        className="cta delete dc__m-auto ml-0"
                        data-testid="delete-git-repo"
                        type="button"
                        onClick={() => toggleConfirmation(true)}
                    >
                        {deleting ? <Progressing /> : 'Delete'}
                    </button>
                )}
                <button
                    className="cta cancel"
                    data-testid="add-git-account-cancel-button"
                    type="button"
                    onClick={(e) => toggleCollapse((t) => !t)}
                >
                    Cancel
                </button>
                <button className="cta" data-testid="add-git-account-save-button" type="submit" disabled={loading}>
                    {loading ? <Progressing /> : id ? 'Update' : 'Save'}
                </button>
            </div>
            {confirmation && (
                <DeleteComponent
                    setDeleting={setDeleting}
                    deleteComponent={deleteGitProvider}
                    payload={deletePayload}
                    title={state.name.value}
                    toggleConfirmation={toggleConfirmation}
                    component={DeleteComponentsName.GitProvider}
                    confirmationDialogDescription={DC_GIT_PROVIDER_CONFIRMATION_MESSAGE}
                    reload={reload}
                />
            )}
        </form>
    )
}
