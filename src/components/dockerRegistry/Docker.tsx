import React, { useState } from 'react';
import { showError, useForm, Select, Progressing, useAsync, sortCallback, CustomInput, not } from '../common';
import { getDockerRegistryList } from '../../services/service';
import { saveRegistryConfig, updateRegistryConfig, deleteDockerReg } from './service';
import { List, ProtectedInput } from '../globalConfigurations/GlobalConfiguration';
import { toast } from 'react-toastify';
import awsRegionList from '../common/awsRegionList.json';
import { DOCUMENTATION } from '../../config';
import Tippy from '@tippyjs/react';
import { ReactComponent as Dropdown } from '../../assets/icons/ic-chevron-down.svg';
import { ReactComponent as Question } from '../../assets/icons/ic-help-outline.svg';
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg';
import { ReactComponent as Info } from '../../assets/icons/ic-info-outlined.svg';
import { ReactComponent as Error } from '../../assets/icons/ic-warning.svg';
import { types } from 'util';
import DeleteComponent from '../../util/DeleteComponent';

const DockerRegistryType = [
    { label: 'docker hub', value: 'docker-hub' },
    { label: 'ecr', value: 'ecr' },
    { label: 'other', value: 'other' },
];

enum CERTTYPE {
    SECURE = 'secure',
    INSECURE = 'insecure',
    SECURE_WITH_CERT = 'secure-with-cert',
}

export default function Docker({ ...props }) {
    const [loading, result, error, reload] = useAsync(getDockerRegistryList);
    if (loading && !result) return <Progressing pageLoader />;
    if (error) {
        showError(error);
        if (!result) return null;
    }
    let dockerRegistryList = result.result || [];
    dockerRegistryList = dockerRegistryList.sort((a, b) => sortCallback('id', a, b));
    dockerRegistryList = [{ id: null }].concat(dockerRegistryList);
    return (
        <section className="mt-16 mb-16 ml-20 mr-20 global-configuration__component flex-1">
            <h2 className="form__title">Container registries</h2>
            <h5 className="form__subtitle">
                Manage your organization’s container registries.&nbsp;
                <a
                    className="learn-more__href"
                    href={DOCUMENTATION.GLOBAL_CONFIG_DOCKER}
                    rel="noopener noreferrer"
                    target="_blank"
                >
                    Learn more
                </a>
            </h5>
            {dockerRegistryList.map((docker) => (
                <CollapsedList reload={reload} {...docker} key={docker.id || Math.random().toString(36).substr(2, 5)} />
            ))}
        </section>
    );
}

function CollapsedList({
    id = '',
    pluginId = null,
    registryUrl = '',
    registryType = '',
    awsAccessKeyId = '',
    awsSecretAccessKey = '',
    awsRegion = '',
    isDefault = false,
    active = true,
    username = '',
    password = '',
    reload,
    connection = '',
    cert = '',
    ...rest
}) {
    const [collapsed, toggleCollapse] = useState(true);
    return (
        <article className={`collapsed-list collapsed-list--docker collapsed-list--${id ? 'update' : 'create dashed'}`}>
            <List onClick={(e) => toggleCollapse((t) => !t)}>
                {id ? (
                    <List.Logo>
                        {' '}
                        <div className="docker list__logo git-logo"></div>
                    </List.Logo>
                ) : (
                    <List.Logo>
                        <Add className="icon-dim-24 fcb-5 vertical-align-middle" />
                    </List.Logo>
                )}

                <div className="flex left">
                    <List.Title
                        title={id || 'Add Container Registry'}
                        subtitle={registryUrl}
                        tag={isDefault ? 'DEFAULT' : ''}
                    />
                </div>
                {id && (
                    <List.DropDown
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleCollapse((t) => !t);
                        }}
                        className="rotate"
                        style={{ ['--rotateBy' as any]: `${Number(!collapsed) * 180}deg` }}
                    />
                )}
            </List>
            {!collapsed && (
                <DockerForm
                    {...{
                        id,
                        pluginId,
                        registryUrl,
                        registryType,
                        awsAccessKeyId,
                        awsSecretAccessKey,
                        awsRegion,
                        isDefault,
                        active,
                        username,
                        password,
                        reload,
                        toggleCollapse,
                        connection,
                        cert,
                    }}
                />
            )}
        </article>
    );
}

function DockerForm({
    id,
    pluginId,
    registryUrl,
    registryType,
    awsAccessKeyId,
    awsSecretAccessKey,
    awsRegion,
    isDefault,
    active,
    username,
    password,
    reload,
    toggleCollapse,
    connection,
    cert,
    ...rest
}) {
    const { state, disable, handleOnChange, handleOnSubmit } = useForm(
        {
            id: { value: id, error: '' },
            registryType: { value: registryType || 'ecr', error: '' },
            advanceSelect: { value: connection || CERTTYPE.SECURE, error: '' },
            certInput: { value: cert || '', error: '' },
        },
        {
            id: {
                required: true,
                validator: { error: 'Name is required', regex: /^.*$/ },
            },
            registryType: {
                required: true,
                validator: { error: 'Type is required', regex: /^.*$/ },
            },
            advanceSelect: {
                required: true,
                validator: { error: 'Mode is required', regex: /^.*$/ },
            },
            certInput: {
                required: false,
            },
        },
        onValidation,
    );
    const [loading, toggleLoading] = useState(false);
    const [Isdefault, toggleDefault] = useState(isDefault);
    const [toggleCollapsedAdvancedRegistry, setToggleCollapsedAdvancedRegistry] = useState(false);
    const [certError, setCertInputError] = useState('');

    let awsRegionMap = awsRegionList.reduce((agg, curr) => {
        agg.set(curr.value, curr.name);
        return agg;
    }, new Map());

    const [customState, setCustomState] = useState({
        awsAccessKeyId: { value: awsAccessKeyId, error: '' },
        awsSecretAccessKey: { value: awsSecretAccessKey, error: '' },
        registryUrl: { value: registryUrl, error: '' },
        awsRegion: { value: awsRegion, error: '' },
        username: { value: username, error: '' },
        password: { value: password, error: '' },
    });
    const [deleting, setDeleting] = useState(false);
    const [confirmation, toggleConfirmation] = useState(false);

    function customHandleChange(e) {
        setCustomState((st) => ({ ...st, [e.target.name]: { value: e.target.value, error: '' } }));
    }

    async function onSave() {
        let payload = {
            id: state.id.value,
            pluginId: 'cd.go.artifact.docker.registry',
            registryType: state.registryType.value,
            isDefault: Isdefault,
            registryUrl: customState.registryUrl.value,
            ...(state.registryType.value === 'ecr'
                ? {
                      awsAccessKeyId: customState.awsAccessKeyId.value,
                      awsSecretAccessKey: customState.awsSecretAccessKey.value,
                      awsRegion: customState.awsRegion.value,
                  }
                : {}),
            ...(state.registryType.value === 'docker-hub'
                ? { username: customState.username.value, password: customState.password.value }
                : {}),
            ...(state.registryType.value === 'other'
                ? {
                      username: customState.username.value,
                      password: customState.password.value,
                      connection: state.advanceSelect.value,
                      cert: state.advanceSelect.value !== CERTTYPE.SECURE_WITH_CERT ? '' : state.certInput.value,
                  }
                : {}),
        };

        const api = id ? updateRegistryConfig : saveRegistryConfig;
        try {
            toggleLoading(true);
            const { result } = await api(payload, id);
            if (!id) {
                toggleCollapse(true);
            }
            await reload();
            toast.success('Successfully saved.');
        } catch (err) {
            showError(err);
        } finally {
            toggleLoading(false);
        }
    }

    function onValidation() {
        if (state.registryType.value === 'ecr') {
            if (
                !customState.awsRegion.value ||
                !customState.awsAccessKeyId.value ||
                !customState.awsSecretAccessKey.value ||
                !customState.registryUrl.value
            ) {
                setCustomState((st) => ({
                    ...st,
                    awsRegion: { ...st.awsRegion, error: st.awsRegion.value ? '' : 'Mandatory' },
                    awsAccessKeyId: { ...st.awsAccessKeyId, error: st.awsAccessKeyId.value ? '' : 'Mandatory' },
                    awsSecretAccessKey: {
                        ...st.awsSecretAccessKey,
                        error: st.awsSecretAccessKey.value ? '' : 'Mandatory',
                    },
                    registryUrl: { ...st.registryUrl, error: st.registryUrl.value ? '' : 'Mandatory' },
                }));
                return;
            }
        } else if (state.registryType.value === 'docker-hub') {
            if (!customState.username.value || !customState.password.value) {
                setCustomState((st) => ({
                    ...st,
                    username: { ...st.username, error: st.username.value ? '' : 'Mandatory' },
                    password: { ...st.password, error: st.password.value ? '' : 'Mandatory' },
                }));
                return;
            }
        } else if (state.registryType.value === 'other') {
            let error = false;
            if (
                !customState.username.value ||
                !customState.password.value ||
                !customState.registryUrl.value ||
                !customState.registryUrl.value
            ) {
                setCustomState((st) => ({
                    ...st,
                    username: { ...st.username, error: st.username.value ? '' : 'Mandatory' },
                    password: { ...st.password, error: st.password.value ? '' : 'Mandatory' },
                    registryUrl: { ...st.registryUrl, error: st.registryUrl.value ? '' : 'Mandatory' },
                }));
                error = true;
            }
            if (state.advanceSelect.value === CERTTYPE.SECURE_WITH_CERT) {
                if (state.certInput.value === '') {
                    if (!toggleCollapsedAdvancedRegistry) {
                        setToggleCollapsedAdvancedRegistry(not);
                    }
                    setCertInputError('Mandatory');
                    error = true;
                } else {
                    setCertInputError('');
                }
            }
            if (error) {
                return;
            }
        }
        onSave();
    }

    let selectedDckerRegistryType = DockerRegistryType.find((type) => type.value === state.registryType.value);
    let advanceRegistryOptions = [
        { label: 'Allow only secure connection', value: CERTTYPE.SECURE, tippy: '' },
        {
            label: 'Allow secure connection with CA certificate',
            value: CERTTYPE.SECURE_WITH_CERT,
            tippy: 'Use to verify self-signed TLS Certificate',
        },
        {
            label: 'Allow insecure connection',
            value: CERTTYPE.INSECURE,
            tippy: 'This will enable insecure registry communication',
        },
    ];

    let payload = {
        id: state.id.value,
        pluginId: 'cd.go.artifact.docker.registry',
        registryType: state.registryType.value,
        isDefault: Isdefault,
        registryUrl: customState.registryUrl.value,
        awsAccessKeyId: customState.awsAccessKeyId.value || '',
        awsSecretAccessKey: customState.awsSecretAccessKey.value || '',
        awsRegion: customState.awsRegion.value || '',
        username: customState.username.value || '',
        password: customState.password.value,
        connection: state.advanceSelect.value,
        cert: state.advanceSelect.value !== CERTTYPE.SECURE_WITH_CERT ? '' : state.certInput.value,
        active: true,
    };

    return (
        <form onSubmit={(e) => handleOnSubmit(e)} className="docker-form" autoComplete="off">
            <div className="form__row">
                <CustomInput
                    name="id"
                    autoFocus={true}
                    value={state.id.value}
                    autoComplete={'off'}
                    error={state.id.error}
                    tabIndex={1}
                    onChange={handleOnChange}
                    label="Name*"
                    disabled={!!id}
                />
            </div>
            <div className="form__row form__row--two-third">
                <div className="flex left column top">
                    <label htmlFor="" className="form__label w-100">
                        Registry type*
                    </label>
                    <Select
                        name="registryType"
                        tabIndex={2}
                        rootClassName="w-100"
                        onChange={handleOnChange}
                        value={state.registryType.value}
                    >
                        <Select.Button rootClassName="select-button--docker-register">
                            {selectedDckerRegistryType?.label || `Select Container Registry`}
                        </Select.Button>
                        {DockerRegistryType.map((type) => (
                            <Select.Option value={type.value} key={type.value}>
                                {type.label}
                            </Select.Option>
                        ))}
                    </Select>
                    {state.registryType.error && <div className="form__error">{state.registryType.error}</div>}
                </div>
                <CustomInput
                    name="registryUrl"
                    tabIndex={3}
                    label={state.registryType.value !== 'docker-hub' ? 'Registry URL*' : 'Registry URL'}
                    value={customState.registryUrl.value}
                    autoComplete="off"
                    helperText={
                        state.registryType.value === 'docker-hub'
                            ? 'If registry exists on hub.docker.com then leave registry url empty'
                            : ''
                    }
                    error={customState.registryUrl.error}
                    onChange={customHandleChange}
                    disabled={!!registryUrl}
                />
            </div>
            {state.registryType.value === 'ecr' && (
                <>
                    <div className="form__row">
                        <div className="flex left column">
                            <label htmlFor="" className="form__label">
                                AWS region*
                            </label>
                            <Select
                                tabIndex={4}
                                rootClassName="form__input form__input--aws-region"
                                name="awsRegion"
                                onChange={customHandleChange}
                                value={customState.awsRegion.value}
                            >
                                <Select.Button>
                                    {customState.awsRegion.value
                                        ? awsRegionMap.get(customState.awsRegion.value)
                                        : 'Select AWS region'}
                                </Select.Button>
                                {Array.from(awsRegionMap).map(([value, name]) => (
                                    <Select.Option value={value} key={value}>
                                        {name}
                                    </Select.Option>
                                ))}
                            </Select>
                            {customState.awsRegion.error && (
                                <div className="form__error">{customState.awsRegion.error}</div>
                            )}
                        </div>
                    </div>
                    <div className="form__row form__row--two-third">
                        <CustomInput
                            name="awsAccessKeyId"
                            tabIndex={5}
                            value={customState.awsAccessKeyId.value}
                            error={customState.awsAccessKeyId.error}
                            onChange={customHandleChange}
                            label="Access key ID*"
                            autoComplete={'off'}
                        />
                        <ProtectedInput
                            name="awsSecretAccessKey"
                            tabIndex={6}
                            value={customState.awsSecretAccessKey.value}
                            error={customState.awsSecretAccessKey.error}
                            onChange={customHandleChange}
                            label="Secret access key*"
                            type="password"
                        />
                    </div>
                </>
            )}
            {state.registryType.value === 'docker-hub' && (
                <>
                    <div className="form__row form__row--two-third">
                        <CustomInput
                            name="username"
                            tabIndex={5}
                            value={customState.username.value}
                            autoComplete={'off'}
                            error={customState.username.error}
                            onChange={customHandleChange}
                            label="Username*"
                        />
                        <ProtectedInput
                            name="password"
                            tabIndex={6}
                            value={customState.password.value}
                            error={customState.password.error}
                            onChange={customHandleChange}
                            label="Password*"
                            type="password"
                        />
                    </div>
                </>
            )}
            {state.registryType.value === 'other' && (
                <>
                    <div className="form__row form__row--two-third">
                        <CustomInput
                            name="username"
                            tabIndex={5}
                            value={customState.username.value}
                            autoComplete={'off'}
                            error={customState.username.error}
                            onChange={customHandleChange}
                            label="Username*"
                        />
                        <ProtectedInput
                            name="password"
                            tabIndex={6}
                            value={customState.password.value}
                            error={customState.password.error}
                            onChange={customHandleChange}
                            label="Password*"
                            type="password"
                        />
                    </div>
                </>
            )}
            {state.registryType.value === 'other' && <hr className="cn-1 bcn-1 en-1" style={{ height: 0.5 }} />}
            {state.registryType.value === 'other' && (
                <div className={`form__buttons flex left ${toggleCollapsedAdvancedRegistry ? '' : 'mb-22'}`}>
                    <Dropdown
                        onClick={(e) => setToggleCollapsedAdvancedRegistry(not)}
                        className="rotate icon-dim-18 pointer fcn-6"
                        style={{ ['--rotateBy' as any]: !toggleCollapsedAdvancedRegistry ? '-90deg' : '0deg' }}
                    />
                    <label className="fs-13 mb-0 ml-8 pointer" onClick={(e) => setToggleCollapsedAdvancedRegistry(not)}>
                        Advanced Registry URL Connection Options
                    </label>
                    <a target="_blank" href="https://docs.docker.com/registry/insecure/">
                        <Info className="icon-dim-16 ml-4 mt-5" />
                    </a>
                </div>
            )}
            {toggleCollapsedAdvancedRegistry && (
                <div className="form__row ml-3" style={{ width: '100%' }}>
                    {advanceRegistryOptions.map(({ label: Lable, value, tippy }) => (
                        <div>
                            <label
                                key={value}
                                className={`flex left pointer secureFont workflow-node__text-light ${
                                    value != CERTTYPE.SECURE ? 'mt-20' : 'mt-18'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="advanceSelect"
                                    value={value}
                                    onChange={handleOnChange}
                                    checked={value === state.advanceSelect.value}
                                />
                                <span className="ml-10 fs-13">{Lable}</span>
                                {value != CERTTYPE.SECURE && (
                                    <Tippy
                                        className="default-tt ml-10"
                                        arrow={false}
                                        placement="top"
                                        content={<span style={{ display: 'block', width: '160px' }}>{tippy}</span>}
                                    >
                                        <Question className="icon-dim-16 ml-4" />
                                    </Tippy>
                                )}
                            </label>
                            {value == CERTTYPE.SECURE_WITH_CERT &&
                                state.advanceSelect.value == CERTTYPE.SECURE_WITH_CERT && (
                                    <div className="ml-20">
                                        <textarea
                                            name="certInput"
                                            placeholder="Begins with -----BEGIN CERTIFICATE-----"
                                            className="form__input"
                                            style={{ height: '100px', backgroundColor: '#f7fafc' }}
                                            onChange={handleOnChange}
                                            value={state.certInput.value}
                                        />
                                        {certError && (
                                            <div className="form__error">
                                                <Error className="form__icon form__icon--error" />
                                                {certError}
                                            </div>
                                        )}
                                    </div>
                                )}
                        </div>
                    ))}
                </div>
            )}
            <div className="form__row form__buttons  ">
                <label
                    htmlFor=""
                    className="docker-default flex left "
                    onClick={
                        isDefault
                            ? () => {
                                  toast.success('Please mark another as default.');
                              }
                            : (e) => toggleDefault((t) => !t)
                    }
                >
                    <input type="checkbox" className="cursor" name="default" checked={Isdefault} onChange={(e) => {}} />
                    <div className="mr-4"> Set as default </div>
                    <Tippy
                        className="default-tt"
                        arrow={false}
                        placement="top"
                        content={
                            <span style={{ display: 'block', width: '160px' }}>
                                {' '}
                                Default container registry is automatically selected while creating an application.{' '}
                            </span>
                        }
                    >
                        <Question className="icon-dim-20" />
                    </Tippy>
                </label>
            </div>
            <div className={`${id ? 'mb-20 flex content-space' : ''}`}>
                <div>
                    <button className="cta delete" type="button" onClick={() => toggleConfirmation(true)}>
                        Delete
                    </button>
                </div>
                <div>
                    <button className="cta mr-16 cancel" type="button" onClick={(e) => toggleCollapse((t) => !t)}>
                        Cancel
                    </button>
                    <button className="cta" type="submit" disabled={loading}>
                        {loading ? <Progressing /> : 'Save'}
                    </button>
                </div>
            </div>

            {confirmation && (
                <DeleteComponent
                    setDeleting={setDeleting}
                    deleteComponent={deleteDockerReg}
                    payload={payload}
                    title={id}
                    toggleConfirmation={toggleConfirmation}
                    component={'chart repository'}
                    confirmationDialogDescription={'Some applications are currently using this container registry. Please change the container registry in use and try again.'}
                />
            )}
        </form>
    );
}
