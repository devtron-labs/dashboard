import { useEffect } from 'react'
import { Prompt } from 'react-router-dom'

import {
    Button,
    ButtonStyleType,
    ButtonVariantType,
    Checkbox,
    ComponentSizeType,
    CustomInput,
    getSelectPickerOptionByValue,
    RadioGroup,
    RadioGroupItem,
    SelectPicker,
    stopPropagation,
    useForm,
    usePrompt,
} from '@devtron-labs/devtron-fe-common-lib'

import { UNSAVED_CHANGES_PROMPT_MESSAGE } from '@Config/constants'

import { useConfigMapSecretContext } from './ConfigMapSecretContext'
import {
    CM_SECRET_COMPONENT_NAME,
    configMapDataTypeOptions,
    configMapSecretMountDataMap,
    getSecretDataTypeOptions,
} from './constants'
import { getConfigMapSecretFormInitialValues, hasESO, hasHashiOrAWS } from './utils'
import { getConfigMapSecretFormValidations } from './validations'
import { renderESOInfo, renderExternalInfo } from './helpers'
import {
    CMSecretExternalType,
    ConfigMapSecretFormProps,
    ConfigMapSecretDataTypeOptionType,
    ConfigMapSecretUseFormProps,
    CM_SECRET_STATE,
} from './types'
import { ConfigMapSecretData } from './ConfigMapSecretData'

import './styles.scss'

export const ConfigMapSecretForm = ({
    id = null,
    configMapSecretData,
    cmSecretStateLabel,
    isJob,
    componentType,
    isSubmitting,
    isProtected,
    onSubmit,
    onError,
    onCancel,
}: ConfigMapSecretFormProps) => {
    // HOOKS
    const { setFormState } = useConfigMapSecretContext()

    // FORM INITIALIZATION
    const useFormProps = useForm<ConfigMapSecretUseFormProps>({
        initialValues: getConfigMapSecretFormInitialValues({
            configMapSecretData,
            componentType,
            cmSecretStateLabel,
        }),
        validations: getConfigMapSecretFormValidations,
    })
    const { data, errors, formState, setValue, register, handleSubmit } = useFormProps

    // CONSTANTS
    const isCreateView = id === null
    const componentName = CM_SECRET_COMPONENT_NAME[componentType]
    const isUnAuthorized = configMapSecretData?.unAuthorized
    const isESO = data.isSecret && hasESO(data.externalType)
    const isHashiOrAWS = data.isSecret && hasHashiOrAWS(data.externalType)

    // UPDATING FORM STATE CONTEXT
    useEffect(() => {
        setFormState(data, formState)
    }, [data, formState])

    // PROMPT FOR UNSAVED CHANGES
    usePrompt({ shouldPrompt: formState.isDirty })

    // METHODS
    const handleDataTypeSelectorChange = (item: ConfigMapSecretDataTypeOptionType) => {
        setValue('external', item.value !== '', { shouldTouch: true, shouldDirty: true })

        if (data.isSecret) {
            return item.value
        }
        // For ConfigMap, external type is always empty, it is controlled by external. (since, there are only 2 types)
        return CMSecretExternalType.Internal
    }

    // RENDERERS
    const renderDataTypeSelector = () => {
        const dataTypeOptions = data.isSecret ? getSecretDataTypeOptions(isJob) : configMapDataTypeOptions
        const dataTypePlaceholder = data.isSecret ? 'Select Secret Type' : 'Select ConfigMap Type'

        return (
            <SelectPicker<string, false>
                inputId="cm-cs-data-type-selector"
                classNamePrefix="cm-cs-data-type"
                label="Data Type"
                placeholder={dataTypePlaceholder}
                required
                options={dataTypeOptions}
                size={ComponentSizeType.large}
                {...register('externalType', handleDataTypeSelectorChange, {
                    isCustomComponent: true,
                })}
                value={getSelectPickerOptionByValue(
                    dataTypeOptions,
                    (data.external &&
                        data.externalType === '' &&
                        (data.isSecret
                            ? CMSecretExternalType.KubernetesSecret
                            : CMSecretExternalType.KubernetesConfigMap)) ||
                        data.externalType,
                )}
            />
        )
    }

    const renderName = () => (
        <CustomInput
            {...register('name')}
            autoFocus
            value={data.name}
            data-testid={`${componentName}-name`}
            label="Name"
            placeholder={`Eg. ${!data.isSecret ? 'sample-configmap' : 'sample-secret'}`}
            disabled={!isCreateView}
            isRequiredField
            error={errors.name}
            noTrim
        />
    )

    const renderMountData = () => (
        <div className="flexbox-col dc__gap-6">
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label className="m-0 fs-13 lh-20 dc__required-field fw-4">Mount data as</label>
            <RadioGroup
                className="configmap-secret-form__mount-data"
                value={data.selectedType}
                {...register('selectedType')}
            >
                {Object.keys(configMapSecretMountDataMap).map((key) => (
                    <RadioGroupItem
                        key={key}
                        dataTestId={`${componentName}-${configMapSecretMountDataMap[key].title
                            .toLowerCase()
                            .split(' ')
                            .join('-')}-radio-button`}
                        value={configMapSecretMountDataMap[key].value}
                    >
                        {configMapSecretMountDataMap[key].title}
                    </RadioGroupItem>
                ))}
            </RadioGroup>
        </div>
    )

    const renderSubPathCheckBoxContent = () => (
        <p data-testid={`${componentName}-sub-path-checkbox`} className="flexbox-col m-0 cn-9">
            <span className="m-0">
                <span>Set SubPath (same as</span>&nbsp;
                <a
                    href="https://kubernetes.io/docs/concepts/storage/volumes/#using-subpath"
                    className="anchor"
                    target="_blank"
                    rel="noreferrer"
                >
                    subPath
                </a>
                &nbsp;
                <span>for volume mount)</span>
            </span>
            {data.isSubPathChecked && (
                <span className="cn-7 fs-12 lh-18">
                    {data.external
                        ? 'Please provide keys of config map to be mounted'
                        : 'Keys will be used as filename for subpath'}
                </span>
            )}
        </p>
    )

    const renderSubPath = () => (
        <div className="flexbox-col dc__gap-8 dc__w-fit-content">
            <Checkbox
                isChecked={data.isSubPathChecked}
                onClick={stopPropagation}
                rootClassName={`m-0 ${data.isSubPathChecked ? 'configmap-secret-form__sub-path-checkbox' : ''}`}
                {...register('isSubPathChecked', () => !data.isSubPathChecked)}
                value="CHECKED"
            >
                {renderSubPathCheckBoxContent()}
            </Checkbox>
            {(data.externalType === CMSecretExternalType.KubernetesSecret || (!data.isSecret && data.external)) &&
                data.isSubPathChecked && (
                    <div className="ml-24">
                        <CustomInput
                            {...register('externalSubpathValues')}
                            value={data.externalSubpathValues}
                            tabIndex={0}
                            placeholder="Enter keys (Eg. username,configs.json)"
                            error={errors.externalSubpathValues}
                            noTrim
                        />
                    </div>
                )}
        </div>
    )

    const renderFilePermission = () => (
        <div className="flexbox-col dc__gap-8 dc__w-fit-content">
            <Checkbox
                isChecked={data.isFilePermissionChecked}
                onClick={stopPropagation}
                rootClassName="m-0"
                value="CHECKED"
                {...register('isFilePermissionChecked', () => !data.isFilePermissionChecked)}
            >
                <span data-testid="configmap-file-permission-checkbox">
                    Set File Permission (same as&nbsp;
                    <a
                        href="https://kubernetes.io/docs/concepts/configuration/secret/#secret-files-permissions"
                        className="anchor"
                        target="_blank"
                        rel="noreferrer"
                    >
                        defaultMode
                    </a>
                    &nbsp;for secrets in kubernetes)
                </span>
            </Checkbox>
            {data.isFilePermissionChecked && (
                <div className="ml-24">
                    <CustomInput
                        value={data.filePermission}
                        {...register('filePermission')}
                        autoComplete="off"
                        tabIndex={0}
                        dataTestid="configmap-file-permission-textbox"
                        placeholder="eg. 0400 or 400"
                        error={errors.filePermission}
                        noTrim
                    />
                </div>
            )}
        </div>
    )

    const renderVolumeMountPath = () =>
        data.selectedType === configMapSecretMountDataMap.volume.value && (
            <>
                <CustomInput
                    {...register('volumeMountPath')}
                    label="Volume mount path"
                    value={data.volumeMountPath}
                    placeholder="/directory-path"
                    helperText="Keys are mounted as files to volume"
                    error={errors.volumeMountPath}
                    isRequiredField
                    noTrim
                />
                <div className="flexbox-col dc__gap-12">
                    {renderSubPath()}
                    {renderFilePermission()}
                </div>
            </>
        )

    const renderRollARN = () =>
        (isHashiOrAWS || isESO) && (
            <div className="w-50">
                <CustomInput
                    dataTestid="enter-role-ARN"
                    {...register('roleARN')}
                    value={data.roleARN}
                    autoComplete="off"
                    label="Role ARN"
                    placeholder="Enter Role ARN"
                    error={errors.roleARN}
                    noTrim
                />
            </div>
        )

    const renderFormButtons = () => (
        <div className="py-12 px-16 dc__border-top-n1 flex right dc__gap-12">
            {(isCreateView || cmSecretStateLabel === CM_SECRET_STATE.INHERITED) && (
                <Button
                    dataTestId="cm-secret-form-cancel-btn"
                    text="Cancel"
                    variant={ButtonVariantType.secondary}
                    style={ButtonStyleType.neutral}
                    onClick={onCancel}
                />
            )}
            <Button
                dataTestId="cm-secret-form-submit-btn"
                text={`Save${!isCreateView ? ' Changes' : ''}${isProtected ? '...' : ''}`}
                buttonProps={{ type: 'submit' }}
                isLoading={isSubmitting}
            />
        </div>
    )

    return (
        <>
            <Prompt when={formState.isDirty} message={UNSAVED_CHANGES_PROMPT_MESSAGE} />
            <form
                className="configmap-secret flexbox-col h-100 dc__overflow-hidden"
                onSubmit={handleSubmit(onSubmit, onError)}
            >
                <div className="p-16 flex-grow-1 flexbox-col dc__gap-16 dc__overflow-auto">
                    <div className="configmap-secret-form__name-container dc__grid dc__gap-12">
                        {renderDataTypeSelector()}
                        {renderName()}
                    </div>
                    {renderESOInfo(isESO)}
                    {renderExternalInfo(
                        data.externalType === CMSecretExternalType.KubernetesSecret ||
                            (!data.isSecret && data.external),
                        componentType,
                    )}
                    {renderMountData()}
                    {renderVolumeMountPath()}
                    {renderRollARN()}
                    <ConfigMapSecretData
                        isJob={isJob}
                        componentType={componentType}
                        isESO={isESO}
                        isHashiOrAWS={isHashiOrAWS}
                        isUnAuthorized={isUnAuthorized}
                        useFormProps={useFormProps}
                    />
                </div>
                {renderFormButtons()}
            </form>
        </>
    )
}
