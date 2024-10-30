import { useEffect } from 'react'
import { Prompt } from 'react-router-dom'

import {
    Button,
    ButtonStyleType,
    ButtonVariantType,
    Checkbox,
    CMSecretExternalType,
    ComponentSizeType,
    CustomInput,
    getSelectPickerOptionByValue,
    Progressing,
    RadioGroup,
    RadioGroupItem,
    SelectPicker,
    stopPropagation,
    useForm,
    usePrompt,
} from '@devtron-labs/devtron-fe-common-lib'

import { ROLLOUT_DEPLOYMENT, UNSAVED_CHANGES_PROMPT_MESSAGE } from '@Config/constants'
import { isChartRef3090OrBelow, isVersionLessThanOrEqualToTarget } from '@Components/common'

import { useConfigMapSecretFormContext } from './ConfigMapSecretFormContext'
import {
    CM_SECRET_COMPONENT_NAME,
    configMapDataTypeOptions,
    configMapSecretMountDataMap,
    getSecretDataTypeOptions,
} from './constants'
import { getConfigMapSecretFormInitialValues, hasESO, hasHashiOrAWS } from './utils'
import { getConfigMapSecretFormValidations } from './validations'
import {
    renderChartVersionBelow3090NotSupportedText,
    renderESOInfo,
    renderExternalInfo,
    renderHashiOrAwsDeprecatedInfo,
} from './helpers'
import {
    ConfigMapSecretFormProps,
    ConfigMapSecretDataTypeOptionType,
    ConfigMapSecretUseFormProps,
    CM_SECRET_STATE,
} from './types'
import { ConfigMapSecretData } from './ConfigMapSecretData'

export const ConfigMapSecretForm = ({
    id = null,
    configMapSecretData,
    cmSecretStateLabel,
    isJob,
    appChartRef,
    isDraft,
    componentType,
    isSubmitting,
    isProtected,
    areScopeVariablesResolving,
    resolvedFormData,
    restoreYAML,
    setRestoreYAML,
    onSubmit,
    onError,
    onCancel,
}: ConfigMapSecretFormProps) => {
    // HOOKS
    const { setFormState, formDataRef } = useConfigMapSecretFormContext()

    // INITIAL FORM VALUES
    const formInitialValues = getConfigMapSecretFormInitialValues({
        configMapSecretData,
        componentType,
        cmSecretStateLabel,
    })

    // FORM INITIALIZATION
    const useFormProps = useForm<ConfigMapSecretUseFormProps>({
        initialValues: formInitialValues,
        validations: getConfigMapSecretFormValidations,
    })
    const { data, errors, formState, setValue, register, handleSubmit, reset } = useFormProps

    // CONSTANTS
    const isCreateView = id === null
    const componentName = CM_SECRET_COMPONENT_NAME[componentType]
    const isUnAuthorized = configMapSecretData?.unAuthorized
    const isESO = data.isSecret && hasESO(data.externalType)
    const isHashiOrAWS = data.isSecret && hasHashiOrAWS(data.externalType)
    const isFormDisabled = isHashiOrAWS || data.isResolvedData || (data.isSecret && isUnAuthorized)
    const isChartVersion309OrBelow =
        appChartRef &&
        appChartRef.name === ROLLOUT_DEPLOYMENT &&
        isVersionLessThanOrEqualToTarget(appChartRef.version, [3, 9]) &&
        isChartRef3090OrBelow(appChartRef.id)
    /**
     * * In create mode, show the prompt only if the form has unsaved changes (i.e., form is dirty).
     * * This ensures the user is warned about losing data when navigating away during creation.
     * * Non-create mode is being handled by the parent component.
     */
    const shouldPrompt = isCreateView && formState.isDirty

    // USE EFFECTS
    useEffect(() => {
        /*
         * When resolved form data is available, we reset the form with this resolved form data.
         * isResolvedData check determines whether the current formState contains resolved data or not.
         * @note resolvedFormData means show scope variables is true.
         */
        if (resolvedFormData) {
            reset({ ...resolvedFormData, isResolvedData: true }, { keepDirty: true })
        } else if (formDataRef.current) {
            /*
             * We use formDataRef (is present) to restore form values after mounting & when `resolvedFormData` is null.
             * The form reset is triggered with the keepDirty option, which resets the form using the stored values while preserving the “dirty” state.
             * During the reset, we also ensure that yamlMode is preserved.
             */
            reset({ ...formDataRef.current, yamlMode: data.yamlMode, isResolvedData: false }, { keepDirty: true })
        }
    }, [resolvedFormData])

    useEffect(() => {
        /*
         * We update formDataRef whenever the form’s data state changes, \
         * but only if resolvedFormData is null. \
         * Since resolvedFormData represents a read-only view, it doesn’t require form updates. \
         * Also, formDataRef is required to restore the form data state when `resolvedFormData` is null.
         */
        if (!resolvedFormData) {
            setFormState({ type: 'SET_DATA', data, isDirty: formState.isDirty, errors })
        }
    }, [data, formState.isDirty, errors, resolvedFormData])

    useEffect(() => {
        /*
         * When the 'Restore Last Saved YAML' button is clicked, it sets the restoreYAML state to true. \
         * This triggers a reset of the YAML to its initial state (i.e., the latest valid state). \
         * Depending on the type of ConfigMap or Secret, we set the appropriate YAML form field accordingly. \
         * Once the above is done, we reset restoreYAML state back to false to denote YAML has been restored to initial state.
         */
        if (restoreYAML) {
            const yamlFormKey = isESO ? 'esoSecretYaml' : 'yaml'
            setValue(yamlFormKey, formInitialValues[yamlFormKey], { shouldDirty: true })
            setRestoreYAML(false)
        }
    }, [restoreYAML])

    // PROMPT FOR UNSAVED CHANGES
    usePrompt({ shouldPrompt })

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
        const dataTypeOptions = data.isSecret ? getSecretDataTypeOptions(isJob, isHashiOrAWS) : configMapDataTypeOptions
        const dataTypePlaceholder = data.isSecret ? 'Select Secret Type' : 'Select ConfigMap Type'

        return (
            <SelectPicker<string, false>
                inputId="cm-cs-data-type-selector"
                classNamePrefix="cm-cs-data-type"
                label="Data Type"
                placeholder={dataTypePlaceholder}
                required
                isDisabled={isFormDisabled}
                options={dataTypeOptions}
                size={ComponentSizeType.large}
                {...register('externalType', {
                    sanitizeFn: handleDataTypeSelectorChange,
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
                disabled={isFormDisabled}
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
        <p data-testid={`${componentName}-sub-path-checkbox`} className="flexbox-col m-0 cn-9 fs-13">
            <span>
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
                        ? `Please provide keys of ${componentName} to be mounted`
                        : 'Keys will be used as filename for subpath'}
                </span>
            )}
            {isChartVersion309OrBelow && renderChartVersionBelow3090NotSupportedText()}
        </p>
    )

    const renderSubPath = () => (
        <div className="flexbox-col dc__gap-8">
            <Checkbox
                isChecked={data.isSubPathChecked}
                onClick={stopPropagation}
                disabled={isFormDisabled || isChartVersion309OrBelow}
                rootClassName={`m-0 ${data.isSubPathChecked || isChartVersion309OrBelow ? 'configmap-secret-form__checkbox' : ''}`}
                {...register('isSubPathChecked', { sanitizeFn: () => !data.isSubPathChecked })}
                value="CHECKED"
            >
                {renderSubPathCheckBoxContent()}
            </Checkbox>
            {(isESO ||
                data.externalType === CMSecretExternalType.KubernetesSecret ||
                (!data.isSecret && data.external)) &&
                data.isSubPathChecked && (
                    <div className="ml-24">
                        <CustomInput
                            {...register('externalSubpathValues')}
                            value={data.externalSubpathValues}
                            tabIndex={0}
                            placeholder="Enter keys (Eg. username,configs.json)"
                            disabled={isFormDisabled}
                            error={errors.externalSubpathValues}
                            noTrim
                        />
                    </div>
                )}
        </div>
    )

    const renderFilePermission = () => (
        <div className="flexbox-col dc__gap-8">
            <Checkbox
                dataTestId={`${componentName}-file-permission-checkbox`}
                isChecked={data.isFilePermissionChecked}
                onClick={stopPropagation}
                rootClassName={`m-0 ${isChartVersion309OrBelow ? 'configmap-secret-form__checkbox' : ''}`}
                value="CHECKED"
                disabled={isFormDisabled || isChartVersion309OrBelow}
                {...register('isFilePermissionChecked', { sanitizeFn: () => !data.isFilePermissionChecked })}
            >
                <span className="cn-9 fs-13">
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
                    <br />
                    {isChartVersion309OrBelow ? renderChartVersionBelow3090NotSupportedText() : null}
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
                        disabled={isFormDisabled || isChartVersion309OrBelow}
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
                    disabled={isFormDisabled}
                    error={errors.volumeMountPath}
                    isRequiredField
                    noTrim
                />
                {renderSubPath()}
                {renderFilePermission()}
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
                    disabled={isFormDisabled}
                    error={errors.roleARN}
                    noTrim
                />
            </div>
        )

    const renderFormButtons = () => (
        <div className="py-12 px-16 dc__border-top-n1">
            <div className="flex left dc__gap-12 dc__mxw-1200">
                <Button
                    dataTestId="cm-secret-form-submit-btn"
                    text={`Save${!isCreateView ? ' Changes' : ''}${isProtected ? '...' : ''}`}
                    size={ComponentSizeType.medium}
                    onClick={handleSubmit(onSubmit, onError)}
                    isLoading={isSubmitting}
                    disabled={isSubmitting || areScopeVariablesResolving || isFormDisabled}
                />
                {!isDraft && (isCreateView || cmSecretStateLabel === CM_SECRET_STATE.INHERITED) && (
                    <Button
                        dataTestId="cm-secret-form-cancel-btn"
                        text="Cancel"
                        variant={ButtonVariantType.secondary}
                        style={ButtonStyleType.neutral}
                        size={ComponentSizeType.medium}
                        onClick={onCancel}
                        disabled={areScopeVariablesResolving}
                    />
                )}
            </div>
        </div>
    )

    return (
        <>
            <Prompt when={shouldPrompt} message={UNSAVED_CHANGES_PROMPT_MESSAGE} />
            <form className="configmap-secret flexbox-col h-100 dc__overflow-hidden">
                {areScopeVariablesResolving ? (
                    <Progressing fullHeight pageLoader />
                ) : (
                    <div className="p-16 flex-grow-1 dc__overflow-auto">
                        <div className="flexbox-col dc__gap-16 dc__mxw-1200">
                            {isHashiOrAWS && renderHashiOrAwsDeprecatedInfo()}
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
                                isESO={isESO}
                                isHashiOrAWS={isHashiOrAWS}
                                isUnAuthorized={isUnAuthorized}
                                useFormProps={useFormProps}
                                readOnly={isFormDisabled}
                            />
                        </div>
                    </div>
                )}
                {!isHashiOrAWS && renderFormButtons()}
            </form>
        </>
    )
}
