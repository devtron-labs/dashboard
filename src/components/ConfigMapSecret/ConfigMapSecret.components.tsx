import React, { useState, useEffect } from 'react'
import { Progressing, ResizableTextarea, ToastBody, noop, showError } from '@devtron-labs/devtron-fe-common-lib'
import YAML from 'yaml'
import { DEPLOYMENT_HISTORY_CONFIGURATION_LIST_MAP, PATTERNS } from '../../config'
import { ReactComponent as Dropdown } from '../../assets/icons/ic-chevron-down.svg'
import { ReactComponent as ProtectedIcon } from '../../assets/icons/ic-shield-protect-fill.svg'
import { ReactComponent as File } from '../../assets/icons/ic-file.svg'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import { ReactComponent as Trash } from '../../assets/icons/ic-delete.svg'
import { ReactComponent as WarningIcon } from '../../assets/icons/ic-warning-y6.svg'
import { ReactComponent as InfoIcon } from '../../assets/icons/ic-info-filled.svg'
import { ReactComponent as InfoIconOutlined } from '../../assets/icons/ic-info-outline-grey.svg'
import { ReactComponent as DeleteIcon } from '../../assets/icons/ic-delete-interactive.svg'
import { ReactComponent as KeyIcon } from '../../assets/icons/ic-key.svg'
import {
    ConfigMapSecretProps,
    KeyValue,
    KeyValueInputInterface,
    KeyValueValidated,
    KeyValueYaml,
    ProtectedConfigMapSecretDetailsProps,
} from './Types'
import { ConfigMapSecretForm } from './ConfigMapSecretForm'
import { CM_SECRET_STATE } from './Constants'
import { hasApproverAccess, importComponentFromFELibrary } from '../common'
import DeploymentHistoryDiffView from '../app/details/cdDetails/deploymentHistoryDiff/DeploymentHistoryDiffView'
import { DeploymentHistoryDetail } from '../app/details/cdDetails/cd.type'
import { prepareHistoryData } from '../app/details/cdDetails/service'
import './ConfigMapSecret.scss'
import { getCMSecret, getConfigMapList, getSecretList } from './service'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import Tippy from '@tippyjs/react'

const ConfigToolbar = importComponentFromFELibrary('ConfigToolbar')
const ApproveRequestTippy = importComponentFromFELibrary('ApproveRequestTippy')
const getDraftByResourceName = importComponentFromFELibrary('getDraftByResourceName', null, 'function')
export const KeyValueInput: React.FC<KeyValueInputInterface> = React.memo(
    ({
        keyLabel,
        valueLabel,
        k,
        v,
        index,
        onChange,
        onDelete,
        keyError = '',
        valueError = '',
        valueType = 'textarea',
        ...rest
    }) => {
        return (
            <article className="form__key-value-inputs">
                {typeof onDelete === 'function' && (
                    <Trash onClick={(e) => onDelete(e, index)} className="cursor icon-delete icon-n4" />
                )}
                <div className="form__field">
                    <label>
                        {keyLabel}
                        <input
                            data-testid={`secrets-gui-key-textbox-${index}`}
                            type="text"
                            autoComplete="off"
                            placeholder=""
                            value={k}
                            onChange={(e) => onChange(index, e.target.value, v)}
                            className="form__input"
                            disabled={typeof onChange !== 'function'}
                        />
                        {keyError ? <span className="form__error">{keyError}</span> : <div />}
                    </label>
                </div>
                <div className="form__field">
                    <label>{valueLabel}</label>
                    {valueType === 'textarea' ? (
                        <ResizableTextarea
                            value={v}
                            onChange={(e) => onChange(index, k, e.target.value)}
                            disabled={typeof onChange !== 'function'}
                            placeholder=""
                            maxHeight={300}
                            data-testid="Configmap-gui-value-textbox"
                        />
                    ) : (
                        <input
                            type="text"
                            autoComplete="off"
                            value={v}
                            onChange={(e) => onChange(index, k, e.target.value)}
                            className="form__input"
                            disabled={typeof onChange !== 'function'}
                        />
                    )}
                    {valueError ? <span className="form__error">{valueError}</span> : <div />}
                </div>
            </article>
        )
    },
)

export function ConfigMapSecretContainer({
    componentType,
    title,
    appChartRef,
    update,
    data,
    index,
    id,
    isOverrideView,
    isJobView,
    isProtected,
    toggleDraftComments,
    reduceOpacity,
    parentName,
    reloadEnvironments,
}: ConfigMapSecretProps) {
    const { appId, envId } = useParams<{ appId; envId }>()
    const [collapsed, toggleCollapse] = useState(true)
    const [isLoader, setLoader] = useState<boolean>(false)
    const [draftData, setDraftData] = useState(null)
    const [selectedTab, setSelectedTab] = useState(data?.draftState === 4 ? 2 : 3)

    let cmSecretStateLabel = !data?.isNew ? CM_SECRET_STATE.BASE : CM_SECRET_STATE.UNPUBLISHED
    if (isOverrideView) {
        if (data?.global) {
            cmSecretStateLabel = data.overridden ? CM_SECRET_STATE.OVERRIDDEN : CM_SECRET_STATE.INHERITED
        } else {
            cmSecretStateLabel = !data?.isNew ? CM_SECRET_STATE.ENV : CM_SECRET_STATE.UNPUBLISHED
        }
    }

    const getData = async () => {
        try {
            setLoader(true)
            const [_draftData, _cmSecretData] = await Promise.allSettled([
                isProtected && getDraftByResourceName
                    ? getDraftByResourceName(appId, envId ?? -1, componentType === 'secret' ? 2 : 1, data.name)
                    : null,
                !data?.isNew ? getCMSecret(componentType, id, appId, data?.name, envId) : null,
            ])
            let draftId, draftState
            if (
                _draftData?.status === 'fulfilled' &&
                _draftData.value?.result &&
                (_draftData.value.result.draftState === 1 || _draftData.value.result.draftState === 4)
            ) {
                setDraftData(_draftData.value.result)
                draftId = _draftData.value.result.draftId
                draftState = _draftData.value.result.draftState
            } else {
                setDraftData(null)
            }
            if (cmSecretStateLabel !== CM_SECRET_STATE.UNPUBLISHED && _cmSecretData?.status === 'fulfilled') {
                if (_cmSecretData.value?.result?.configData?.length) {
                    const _result = _cmSecretData.value.result
                    if (draftId || draftState) {
                        _result.configData[0].draftId = draftId
                        _result.configData[0].draftState = draftState
                    }
                    update(index, _result)
                } else {
                    toast.error(`The ${componentType} '${data?.name}' has been deleted`)
                    update(index, null)
                }
            } else if (
                cmSecretStateLabel === CM_SECRET_STATE.UNPUBLISHED &&
                _draftData?.status === 'fulfilled' &&
                _draftData.value.result
            ) {
                if (_draftData.value.result.draftState === 3) {
                    update(index, JSON.parse(_draftData.value.result.data))
                } else if (_draftData.value.result.draftState === 2) {
                    toast.error(`The ${componentType} '${data?.name}' has been deleted`)
                    update(index, null)
                }
            }
            toggleCollapse(false)
            if (
                (_cmSecretData?.status === 'rejected' && _cmSecretData?.reason?.code === 403) ||
                (_draftData?.status === 'rejected' && _draftData?.reason?.code === 403)
            ) {
                toast.warn(<ToastBody title="View-only access" subtitle="You won't be able to make any changes" />)
            }
        } catch (error) {
            toast.warn(<ToastBody title="View-only access" subtitle="You won't be able to make any changes" />)
            setDraftData(null)
            showError(error)
        } finally {
            setLoader(false)
        }
    }

    const updateCollapsed = (_collapsed?: boolean): void => {
        if (_collapsed !== undefined) {
            toggleCollapse(_collapsed)
        } else {
            if (collapsed && data?.name) {
                getData()
            } else {
                toggleCollapse(!collapsed)
                if (!collapsed) {
                    toggleDraftComments(null)
                    setDraftData(null)
                }
            }
        }
    }

    const handleTabSelection = (index: number): void => {
        setSelectedTab(index)
    }

    const toggleDraftCommentModal = () => {
        toggleDraftComments({ draftId: draftData?.draftId, draftVersionId: draftData?.draftVersionId, index: index })
    }

    const renderIcon = (): JSX.Element => {
        if (!title) {
            return <Add className="configuration-list__logo icon-dim-20 fcb-5" />
        } else {
            if (componentType === 'secret') {
                return <KeyIcon className="configuration-list__logo icon-dim-20" />
            } else {
                return <File className="configuration-list__logo icon-dim-20" />
            }
        }
    }

    const reload = (): void => {
        updateCollapsed()
        update()
    }

    const renderDetails = (): JSX.Element => {
        if (title && isProtected && draftData?.draftId) {
            return (
                <>
                    <ConfigToolbar
                        loading={isLoader}
                        draftId={draftData.draftId}
                        draftVersionId={draftData.draftVersionId}
                        selectedTabIndex={selectedTab}
                        handleTabSelection={handleTabSelection}
                        isDraftMode={draftData.draftState === 1 || draftData.draftState === 4}
                        noReadme={true}
                        showReadme={false}
                        isReadmeAvailable={false}
                        handleReadMeClick={noop}
                        handleCommentClick={toggleDraftCommentModal}
                        commentsPresent={draftData.commentsCount > 0}
                        isApprovalPending={draftData.draftState === 4}
                        approvalUsers={draftData.approvers}
                        reload={reload}
                    />
                    <ProtectedConfigMapSecretDetails
                        appChartRef={appChartRef}
                        updateCollapsed={updateCollapsed}
                        data={data}
                        id={id}
                        componentType={componentType}
                        update={update}
                        index={index}
                        cmSecretStateLabel={cmSecretStateLabel}
                        isJobView={isJobView}
                        selectedTab={selectedTab}
                        draftData={draftData}
                        parentName={parentName}
                        reloadEnvironments={reloadEnvironments}
                    />
                </>
            )
        }
        return (
            <ConfigMapSecretForm
                appChartRef={appChartRef}
                updateCollapsed={updateCollapsed}
                configMapSecretData={data}
                id={id}
                componentType={componentType}
                update={update}
                index={index}
                cmSecretStateLabel={cmSecretStateLabel}
                isJobView={isJobView}
                readonlyView={false}
                isProtectedView={isProtected}
                draftMode={false}
                latestDraftData={
                    draftData?.draftId
                        ? {
                              draftId: draftData?.draftId,
                              draftState: draftData?.draftState,
                              draftVersionId: draftData?.draftVersionId,
                          }
                        : null
                }
                reloadEnvironments={reloadEnvironments}
            />
        )
    }

    const renderDraftState = (): JSX.Element => {
        if (collapsed) {
            if (data.draftState === 1) {
                return <i className="mr-10 cr-5">In draft</i>
            } else if (data.draftState === 4) {
                return <i className="mr-10 cg-5">Approval pending</i>
            }
        }

        return null
    }

    const handleCMSecretClick = () => {
        if (title && isProtected && draftData?.draftId) {
            setSelectedTab(draftData.draftState === 4 ? 2 : 3)
        }
        updateCollapsed()
    }

    return (
        <>
            <section
                className={`pt-16 dc__border bcn-0 br-8 ${title ? 'mb-16' : 'en-3 bw-1 dashed mb-20'} ${
                    reduceOpacity ? 'dc__disable-click dc__blur-1_5' : ''
                }`}
            >
                <article
                    className="dc__configuration-list pointer pr-16 pl-16 mb-16"
                    onClick={handleCMSecretClick}
                    data-testid="click-to-add-configmaps-secret"
                >
                    {renderIcon()}
                    <div
                        data-testid={`add-${componentType}-button`}
                        className={`flex left lh-20 ${!title ? 'fw-5 fs-14 cb-5' : 'fw-5 fs-14 cn-9'}`}
                    >
                        {title || `Add ${componentType === 'secret' ? 'Secret' : 'ConfigMap'}`}
                        {cmSecretStateLabel && <div className="flex tag ml-12">{cmSecretStateLabel}</div>}
                    </div>
                    {title && (
                        <div className="flex right">
                            {isProtected && (
                                <>
                                    {renderDraftState()}
                                    <ProtectedIcon className="icon-dim-20 mr-10 fcv-5" />
                                </>
                            )}
                            {isLoader ? (
                                <span style={{ width: '20px' }}>
                                    <Progressing />
                                </span>
                            ) : (
                                <Dropdown className={`icon-dim-20 rotate ${collapsed ? '' : 'dc__flip-180'}`} />
                            )}
                        </div>
                    )}
                </article>
                {!collapsed && renderDetails()}
            </section>
        </>
    )
}

export function ProtectedConfigMapSecretDetails({
    appChartRef,
    updateCollapsed,
    data,
    id,
    componentType,
    update,
    index,
    cmSecretStateLabel,
    isJobView,
    selectedTab,
    draftData,
    parentName,
    reloadEnvironments,
}: ProtectedConfigMapSecretDetailsProps) {
    const { appId, envId } = useParams<{ appId; envId }>()
    const [isLoader, setLoader] = useState<boolean>(false)
    const [baseData, setBaseData] = useState(null)

    const getBaseData = async () => {
        try {
            setLoader(true)
            const { result } = await (componentType === 'secret' ? getSecretList(appId) : getConfigMapList(appId))
            let _baseData
            if (result?.configData?.length) {
                _baseData = result.configData.find((config) => config.name === data.name)
                if (componentType === 'secret' && !data.unAuthorized) {
                    const { result: secretResult } = await getCMSecret(componentType, result.id, appId, data?.name)
                    if (secretResult?.configData?.length) {
                        _baseData = secretResult.configData[0]
                    }
                }
            }
            setBaseData(_baseData)
        } catch (error) {
        } finally {
            setLoader(false)
        }
    }

    useEffect(() => {
        if (draftData.action === 3 && cmSecretStateLabel === CM_SECRET_STATE.OVERRIDDEN) {
            getBaseData()
        }
    }, [])

    const getData = () => {
        try {
            if (selectedTab === 3) {
                return draftData.action === 3 && cmSecretStateLabel === CM_SECRET_STATE.OVERRIDDEN
                    ? baseData
                    : JSON.parse(draftData.data).configData[0]
            } else if (cmSecretStateLabel === CM_SECRET_STATE.UNPUBLISHED) {
                return null
            } else {
                return data
            }
        } catch (error) {
            return null
        }
    }

    const getObfuscatedData = (codeEditorData) => {
        const _codeEditorData = { ...codeEditorData }
        if (componentType === 'secret' && data.unAuthorized && _codeEditorData) {
            for (const key in _codeEditorData) {
                _codeEditorData[key] = Array(8).fill('*').join('')
            }
        }
        return _codeEditorData
    }

    const getCodeEditorData = (cmSecretData, isOverridden) => {
        if (isOverridden) {
            if (Object.keys(cmSecretData.defaultData ?? {}).length > 0) {
                return getObfuscatedData(cmSecretData.defaultData)
            } else if (componentType === 'secret') {
                if (Object.keys(cmSecretData.defaultSecretData ?? {}).length > 0) {
                    return cmSecretData.defaultSecretData
                } else if (Object.keys(data.defaultESOSecretData ?? {}).length > 0) {
                    return cmSecretData.defaultESOSecretData
                }
            }
        }
        if (Object.keys(cmSecretData.data ?? {}).length > 0) {
            return getObfuscatedData(cmSecretData.data)
        } else if (componentType === 'secret') {
            if (Object.keys(cmSecretData.secretData ?? {}).length > 0) {
                return cmSecretData.secretData
            } else if (Object.keys(cmSecretData.esoSecretData ?? {}).length > 0) {
                return cmSecretData.esoSecretData
            }
        }
    }

    const getCurrentConfig = (): DeploymentHistoryDetail => {
        let currentConfigData = {},
            codeEditorValue = { displayName: 'data', value: '' }
        try {
            currentConfigData =
                draftData.action === 3 && cmSecretStateLabel === CM_SECRET_STATE.OVERRIDDEN
                    ? baseData
                    : JSON.parse(draftData.data).configData[0]
            codeEditorValue.value = JSON.stringify(getCodeEditorData(currentConfigData, false)) ?? ''
        } catch (error) {}
        return prepareHistoryData(
            { ...currentConfigData, codeEditorValue },
            componentType === 'secret'
                ? DEPLOYMENT_HISTORY_CONFIGURATION_LIST_MAP.SECRET.VALUE
                : DEPLOYMENT_HISTORY_CONFIGURATION_LIST_MAP.CONFIGMAP.VALUE,
            componentType === 'secret' && data.unAuthorized,
        )
    }

    const getBaseConfig = (): DeploymentHistoryDetail => {
        const _data = { ...data }
        if (cmSecretStateLabel === CM_SECRET_STATE.INHERITED && !_data.mountPath) {
            _data.mountPath = _data.defaultMountPath
        }
        const codeEditorValue = {
            displayName: 'data',
            value: JSON.stringify(getCodeEditorData(_data, cmSecretStateLabel === CM_SECRET_STATE.INHERITED)) ?? '',
        }
        return prepareHistoryData(
            { ..._data, codeEditorValue },
            componentType === 'secret'
                ? DEPLOYMENT_HISTORY_CONFIGURATION_LIST_MAP.SECRET.VALUE
                : DEPLOYMENT_HISTORY_CONFIGURATION_LIST_MAP.CONFIGMAP.VALUE,
            componentType === 'secret' && data.unAuthorized,
        )
    }

    const reload = (): void => {
        updateCollapsed()
        update()
    }

    const renderApproveButton = (): JSX.Element => {
        if (draftData.draftState !== 4 || !ApproveRequestTippy) {
            return null
        } else {
            const hasAccess = hasApproverAccess(draftData.approvers)
            return (
                <div
                    className={`flex right pr-16 pb-16 pl-16 dc__position-rel ${
                        hasAccess && draftData.canApprove ? 'tippy-over' : ''
                    }`}
                >
                    {hasAccess && draftData.canApprove ? (
                        <ApproveRequestTippy
                            draftId={draftData.draftId}
                            draftVersionId={draftData.draftVersionId}
                            resourceName={componentType}
                            reload={reload}
                            envName={parentName}
                        >
                            <button
                                data-testid="approve-config-button"
                                type="button"
                                className="cta dc__bg-g5 m-0-imp h-32 lh-20-imp p-6-12-imp"
                            >
                                Approve changes
                            </button>
                        </ApproveRequestTippy>
                    ) : (
                        <Tippy
                            className="default-tt w-200"
                            arrow={false}
                            placement="top-end"
                            content={
                                hasAccess
                                    ? 'You have made changes to this file. Users who have edited cannot approve the changes.'
                                    : 'You do not have permission to approve configuration changes for this application - environment combination.'
                            }
                        >
                            <button
                                data-testid="approve-config-button"
                                type="button"
                                className="cta dc__bg-g5 approval-config-disabled m-0-imp h-32 lh-20-imp p-6-12-imp"
                            >
                                Approve changes
                            </button>
                        </Tippy>
                    )}
                </div>
            )
        }
    }

    const renderDiffView = (): JSX.Element => {
        if (isLoader) {
            return (
                <div className="h-300">
                    <Progressing />
                </div>
            )
        }
        return (
            <>
                <div className="en-2 bw-1 mt-16 mr-20 ml-20 bcn-1 dc__top-radius-4 deployment-diff__upper dc__no-bottom-border">
                    <div className="pl-12 pr-12 pt-6 pb-6 fs-12 fw-6 cn-9 dc__border-right">
                        {cmSecretStateLabel === CM_SECRET_STATE.UNPUBLISHED
                            ? 'No published version available'
                            : 'Published'}
                    </div>
                    <div className="pl-12 pr-12 pt-6 pb-6 fs-12 fw-6 cn-9">Last saved draft</div>
                </div>
                {draftData.action === 3 && cmSecretStateLabel === CM_SECRET_STATE.OVERRIDDEN && (
                    <div className="en-2 bw-1 mr-20 ml-20 deployment-diff__upper dc__no-bottom-border">
                        <div className="pl-16 pr-16 pt-8 fs-12 cn-6 code-editor-red-diff">Configuration</div>
                        <div className="pl-16 pr-16 pt-8 fs-12 cn-6 code-editor-green-diff">Configuration</div>
                        <div className="pl-16 pr-16 pb-8 fs-13 cn-9 code-editor-red-diff">Override base</div>
                        <div className="pl-16 pr-16 pb-8 fs-13 cn-9 code-editor-green-diff">Inherit from base</div>
                    </div>
                )}
                <DeploymentHistoryDiffView
                    currentConfiguration={getBaseConfig()}
                    baseTemplateConfiguration={getCurrentConfig()}
                    previousConfigAvailable={true}
                    isUnpublished={cmSecretStateLabel === CM_SECRET_STATE.UNPUBLISHED}
                    isDeleteDraft={draftData.action === 3 && cmSecretStateLabel !== CM_SECRET_STATE.OVERRIDDEN}
                    rootClassName="dc__no-top-radius mt-0-imp"
                />
                {renderApproveButton()}
            </>
        )
    }

    const renderEmptyMessage = (message: string): JSX.Element => {
        return (
            <div className="h-200 flex">
                <div className="dc__align-center">
                    <InfoIconOutlined className="icon-dim-20 mb-8" />
                    <div className="fs-13 fw-4 cn-7">{message}</div>
                </div>
            </div>
        )
    }

    const renderForm = (): JSX.Element => {
        if (selectedTab === 1 && cmSecretStateLabel === CM_SECRET_STATE.UNPUBLISHED) {
            return renderEmptyMessage('No published version of this file is available')
        } else if (selectedTab === 3 && draftData.action === 3 && cmSecretStateLabel !== CM_SECRET_STATE.OVERRIDDEN) {
            return renderEmptyMessage(`This ${componentType} will be deleted on approval`)
        }
        return (
            <ConfigMapSecretForm
                appChartRef={appChartRef}
                updateCollapsed={updateCollapsed}
                configMapSecretData={getData()}
                id={id}
                componentType={componentType}
                update={update}
                index={index}
                cmSecretStateLabel={
                    selectedTab === 3 && draftData.action === 3 && cmSecretStateLabel === CM_SECRET_STATE.OVERRIDDEN
                        ? CM_SECRET_STATE.INHERITED
                        : cmSecretStateLabel
                }
                isJobView={isJobView}
                readonlyView={selectedTab === 1}
                isProtectedView={true}
                draftMode={
                    selectedTab === 3 && (draftData.action !== 3 || cmSecretStateLabel !== CM_SECRET_STATE.OVERRIDDEN)
                }
                latestDraftData={
                    draftData?.draftId
                        ? {
                              draftId: draftData?.draftId,
                              draftState: draftData?.draftState,
                              draftVersionId: draftData?.draftVersionId,
                              action: draftData.action,
                          }
                        : null
                }
                reloadEnvironments={reloadEnvironments}
            />
        )
    }

    return selectedTab === 2 ? renderDiffView() : renderForm()
}

export const convertToValidValue = (k: any): string => {
    if (k !== false && k !== true && !isNaN(Number(k))) {
        return Number(k).toString()
    }
    return k.toString()
}

export function validateKeyValuePair(arr: KeyValue[]): KeyValueValidated {
    let isValid = true
    arr = arr.reduce((agg, { k, v }) => {
        if (!k && typeof v !== 'string') {
            // filter when both are missing
            return agg
        }
        let keyError: string
        let valueError: string
        if (k && typeof v !== 'string') {
            valueError = 'value must not be empty'
            isValid = false
        }
        if (typeof v === 'string' && !PATTERNS.CONFIG_MAP_AND_SECRET_KEY.test(k)) {
            keyError = `Key '${k}' must consist of alphanumeric characters, '.', '-' and '_'`
            isValid = false
        }
        return [...agg, { k, v, keyError, valueError }]
    }, [])
    return { isValid, arr }
}

export function useKeyValueYaml(keyValueArray, setKeyValueArray, keyPattern, keyError): KeyValueYaml {
    //input containing array of [{k, v, keyError, valueError}]
    //return {yaml, handleYamlChange}
    const [yaml, setYaml] = useState('')
    const [error, setError] = useState('')
    useEffect(() => {
        if (!Array.isArray(keyValueArray)) {
            setYaml('')
            setError('')
            return
        }
        setYaml(
            YAML.stringify(
                keyValueArray.reduce((agg, { k, v }) => ({ ...agg, [k]: v }), {}),
                { indent: 2 },
            ),
        )
    }, [keyValueArray])

    function handleYamlChange(yamlConfig) {
        if (!yamlConfig) {
            setKeyValueArray([])
            return
        }
        try {
            let obj = YAML.parse(yamlConfig)
            if (typeof obj !== 'object') {
                setError('Could not parse to valid YAML')
                return null
            }
            let errorneousKeys = []
            let tempArray = Object.keys(obj).reduce((agg, k) => {
                if (!k && !obj[k]) return agg
                let v =
                    obj[k] && typeof obj[k] === 'object'
                        ? YAML.stringify(obj[k], { indent: 2 })
                        : convertToValidValue(obj[k])
                let keyErr: string
                if (k && keyPattern.test(k)) {
                    keyErr = ''
                } else {
                    keyErr = keyError
                    errorneousKeys.push(k)
                }
                return [...agg, { k, v: v ?? '', keyError: keyErr, valueError: '' }]
            }, [])
            setKeyValueArray(tempArray)
            let error = ''
            if (errorneousKeys.length > 0) {
                error = `Keys can contain: (Alphanumeric) (-) (_) (.) > Errors: ${errorneousKeys
                    .map((e) => `"${e}"`)
                    .join(', ')}`
            }
            setError(error)
        } catch (err) {
            setError('Could not parse to valid YAML')
        }
    }

    return { yaml, handleYamlChange, error }
}

export function Override({ overridden, onClick, loading = false, type, readonlyView, isProtectedView }) {
    const renderButtonContent = (): JSX.Element => {
        if (loading) {
            return <Progressing />
        } else if (overridden) {
            return (
                <>
                    <DeleteIcon className="icon-dim-16 mr-8" />
                    <span>Delete override{isProtectedView ? '...' : ''}</span>
                </>
            )
        } else {
            return <>Allow override</>
        }
    }
    return (
        <div className={`override-container ${overridden ? 'override-warning' : ''}`}>
            {overridden ? <WarningIcon className="icon-dim-20" /> : <InfoIcon className="icon-dim-20" />}
            <div className="flex column left">
                <div className="override-title" data-testid="env-override-title">
                    {overridden ? 'Base configurations are overridden' : 'Inheriting base configurations'}
                </div>
                {!readonlyView && (
                    <div className="override-subtitle" data-testid="env-override-subtitle">
                        {overridden
                            ? 'Deleting will discard the current overrides and base configuration will be applicable to this environment.'
                            : `Overriding will fork the ${type} for this environment. Updating the base values will no longer affect this configuration.`}
                    </div>
                )}
            </div>
            {!readonlyView && (
                <button
                    data-testid={`button-override-${overridden ? 'delete' : 'allow'}`}
                    className={`cta override-button h-32 lh-20-imp p-6-12-imp ${
                        overridden ? 'delete scr-5' : 'ghosted'
                    }`}
                    onClick={onClick}
                >
                    {renderButtonContent()}
                </button>
            )}
        </div>
    )
}
