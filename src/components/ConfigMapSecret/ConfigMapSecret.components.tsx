import React, { useState, useEffect, useRef } from 'react'
import {
    DeleteDialog,
    Progressing,
    not,
    showError,
    stopPropagation,
    useThrottledEffect,
} from '@devtron-labs/devtron-fe-common-lib'
import YAML from 'yaml'
import { PATTERNS } from '../../config'
import arrowTriangle from '../../assets/icons/ic-chevron-down.svg'
import { ReactComponent as File } from '../../assets/icons/ic-file.svg'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import { ReactComponent as Trash } from '../../assets/icons/ic-delete.svg'
import { ReactComponent as WarningIcon } from '../../assets/icons/ic-warning-y6.svg'
import { ReactComponent as InfoIcon } from '../../assets/icons/ic-info-filled.svg'
import { ReactComponent as DeleteIcon } from '../../assets/icons/ic-delete-interactive.svg'
import {
    ConfigMapSecretProps,
    KeyValue,
    KeyValueInputInterface,
    KeyValueValidated,
    ResizableTextareaProps,
    keyValueYaml,
} from './Types'
import { ConfigMapSecretForm } from './ConfigMapSecretForm'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { deleteConfig, deleteEnvConfigMap, deleteEnvSecret, deleteSecret } from './service'
import { CM_SECRET_STATE } from './Constants'
import './ConfigMap.scss'

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
    isJobView
}: ConfigMapSecretProps) {
    const [collapsed, toggleCollapse] = useState(true)
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false)
    const { appId, envId } = useParams<{ appId; envId }>()
    let cmSecretStateLabel = CM_SECRET_STATE.BASE
    if (isOverrideView) {
        if (
            data &&
            data.global &&
            (data.external ||
                Object.keys(data.defaultData ?? {}).length ||
                (componentType === 'secret' &&
                    (Object.keys(data.defaultSecretData ?? {}).length ||
                        Object.keys(data.defaultESOSecretData ?? {}).length)))
        ) {
            cmSecretStateLabel =
                data.external || // TODO: need to work on external type as this will always show overridden
                data.data ||
                (componentType === 'secret' && (data.esoSecretData?.secretStore || data.secretData))
                    ? CM_SECRET_STATE.OVERRIDDEN
                    : CM_SECRET_STATE.INHERITED
        } else {
            cmSecretStateLabel = CM_SECRET_STATE.ENV
        }
    }

    const updateCollapsed = (): void => {
        toggleCollapse(!collapsed)
    }

    const closeDeleteModal = (): void => {
        setShowDeleteModal(false)
    }

    const openDeleteModal = (e): void => {
        stopPropagation(e)
        setShowDeleteModal(true)
    }

    const handleDelete = async () => {
        try {
            if (!envId) {
                componentType === 'secret' ? await deleteSecret(id, appId, title) : await deleteConfig(id, appId, title)
            } else {
                componentType === 'secret'
                    ? await deleteEnvSecret(id, appId, +envId, title)
                    : await deleteEnvConfigMap(id, appId, envId, title)
            }
            update(index, null)
            toggleCollapse(not)
            toast.success('Successfully deleted')
        } catch (err) {
            showError(err)
        }
    }

    const renderDeleteCMModal = () => {
        return (
            <DeleteDialog
                title={`Delete ${componentType === 'secret' ? 'Secret' : 'ConfigMap'} '${title}' ?`}
                description={`'${title}' will not be used in future deployments. Are you sure?`}
                closeDelete={closeDeleteModal}
                delete={handleDelete}
            />
        )
    }

    const renderIcon = (): JSX.Element => {
        if (!title) {
            return <Add className="configuration-list__logo icon-dim-24 fcb-5" />
        } else {
            if (componentType === 'secret') {
                return <File className="configuration-list__logo icon-dim-24" />
            } else {
                return <File className="configuration-list__logo icon-dim-24" />
            }
        }
    }

    const renderDetails = (): JSX.Element => {
        return (
            <ConfigMapSecretForm
                appChartRef={appChartRef}
                toggleCollapse={toggleCollapse}
                configMapSecretData={data}
                id={id}
                isOverrideView={isOverrideView}
                componentType={componentType}
                update={update}
                index={index}
                cmSecretStateLabel={cmSecretStateLabel}
                isJobView={isJobView}
            />
        )
    }

    return (
        <>
            <section className={`white-card ${title ? 'mb-16' : 'en-3 bw-1 dashed mb-20'}`}>
                <article
                    className="dc__configuration-list pointer"
                    onClick={updateCollapsed}
                    data-testid="click-to-add-configmaps-secret"
                >
                    {renderIcon()}
                    <div
                        data-testid={`add-${componentType}-button`}
                        className={`flex left ${!title ? 'fw-5 fs-14 cb-5' : 'fw-5 fs-14 cn-9'}`}
                    >
                        {title || `Add ${componentType === 'secret' ? 'Secret' : 'ConfigMap'}`}
                        {cmSecretStateLabel && <div className="flex tag ml-12">{cmSecretStateLabel}</div>}
                    </div>
                    <div className="flex right">
                        {!collapsed && title && (
                            <Trash className="icon-n4 cursor icon-delete" onClick={openDeleteModal} />
                        )}
                        {title && <img className="configuration-list__arrow pointer" src={arrowTriangle} />}
                    </div>
                </article>
                {!collapsed && renderDetails()}
            </section>
            {showDeleteModal && renderDeleteCMModal()}
        </>
    )
}

export const ResizableTextarea: React.FC<ResizableTextareaProps> = ({
    minHeight,
    maxHeight,
    value,
    onChange = null,
    onBlur = null,
    onFocus = null,
    className = '',
    placeholder = 'Enter your text here..',
    lineHeight = 14,
    padding = 12,
    disabled = false,
    dataTestId,
    ...props
}) => {
    const [text, setText] = useState('')
    const _textRef = useRef(null)

    useEffect(() => {
        setText(value)
    }, [value])

    function handleChange(e) {
        e.persist()
        setText(e.target.value)
        if (typeof onChange === 'function') onChange(e)
    }

    function handleBlur(e) {
        if (typeof onBlur === 'function') onBlur(e)
    }

    function handleFocus(e) {
        if (typeof onFocus === 'function') onFocus(e)
    }

    useThrottledEffect(
        () => {
            _textRef.current.style.height = 'auto'
            let nextHeight = _textRef.current.scrollHeight
            if (minHeight && nextHeight < minHeight) {
                nextHeight = minHeight
            }
            if (maxHeight && nextHeight > maxHeight) {
                nextHeight = maxHeight
            }
            _textRef.current.style.height = nextHeight + 2 + 'px'
        },
        500,
        [text],
    )

    return (
        <textarea
            data-testid={dataTestId}
            ref={(el) => (_textRef.current = el)}
            value={text}
            placeholder={placeholder}
            className={`dc__resizable-textarea ${className}`}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            style={{ lineHeight: `${lineHeight}px`, padding: `${padding}px` }}
            spellCheck={false}
            disabled={disabled}
            {...props}
        />
    )
}

export function ListComponent({ Icon, title, subtitle = '', onClick, className = '', collapsible = false }) {
    return (
        <article
            className={`dc__configuration-list pointer ${className}`}
            onClick={typeof onClick === 'function' ? onClick : function () {}}
        >
            {!title ? (
                <Add className="configuration-list__logo icon-dim-24 fcb-5" />
            ) : (
                <Icon className="configuration-list__logo icon-dim-24" />
            )}
            <div data-testid={`add-secret-button`} className="configuration-list__info">
                <div className="">{title}</div>
                {subtitle && <div className="configuration-list__subtitle">{subtitle}</div>}
            </div>
            {collapsible && <img className="configuration-list__arrow pointer" src={arrowTriangle} />}
        </article>
    )
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

export function useKeyValueYaml(keyValueArray, setKeyValueArray, keyPattern, keyError): keyValueYaml {
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
                    obj[k] && ['object', 'number'].includes(typeof obj[k])
                        ? YAML.stringify(obj[k], { indent: 2 })
                        : obj[k]
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

export function Override({ overridden, onClick, loading = false, type }) {
    return (
        <div className={`override-container mb-24 ${overridden ? 'override-warning' : ''}`}>
            {overridden ? <WarningIcon className="icon-dim-20" /> : <InfoIcon className="icon-dim-20" />}
            <div className="flex column left">
                <div className="override-title" data-testid="env-override-title">
                    {overridden ? 'Base configurations are overridden' : 'Inheriting base configurations'}
                </div>
                <div className="override-subtitle" data-testid="env-override-subtitle">
                    {overridden
                        ? 'Deleting will discard the current overrides and base configuration will be applicable to this environment.'
                        : `Overriding will fork the ${type} for this environment. Updating the base values will no longer affect this configuration.`}
                </div>
            </div>
            <button
                data-testid={`button-override-${overridden ? 'delete' : 'allow'}`}
                className={`cta override-button ${overridden ? 'delete scr-5' : 'ghosted'}`}
                onClick={onClick}
            >
                {loading ? (
                    <Progressing />
                ) : overridden ? (
                    <>
                        <DeleteIcon className="icon-dim-16 mr-8" />
                        <span>Delete override</span>
                    </>
                ) : (
                    'Allow override'
                )}
            </button>
        </div>
    )
}
