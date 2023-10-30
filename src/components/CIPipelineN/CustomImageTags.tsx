import React, { useState } from 'react'
import { CustomImageTagsType } from './CustomImageTag.type'
import { ValidationRules } from '../ciPipeline/validationRules'
import { CustomErrorMessage, REQUIRED_FIELD_MSG } from '../../config/constantMessaging'
import { ReactComponent as Warning } from '../../assets/icons/ic-warning.svg'
import Tippy from '@tippyjs/react'
import { OptionType, Toggle } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as Edit } from '../../assets/icons/ic-pencil.svg'
import { ReactComponent as AlertTriangle } from '../../assets/icons/ic-alert-triangle.svg'
import { ReactComponent as GeneratedImage } from '../../assets/icons/ic-generated-image.svg'
import { Option, DropdownIndicator, styles, getCustomOptionSelectionStyle, getCommonSelectStyle } from '../v2/common/ReactSelect.utils'
import { getCDStageTypeSelectorValue, customTagStageTypeOptions } from './ciPipeline.utils'
import ReactSelect from 'react-select'
import '../ciPipeline/ciPipeline.scss'

function CustomImageTags({
    savedTagPattern,
    formData,
    setFormData,
    formDataErrorObj,
    setFormDataErrorObj,
    isCDBuild,
    selectedCDStageTypeValue,
    setSelectedCDStageTypeValue,
}: CustomImageTagsType) {
    const validationRules = new ValidationRules()
    const isCustomTagError = formDataErrorObj.customTag?.message.length > 0 && !formDataErrorObj.customTag?.isValid
    const [showCreateImageTagView, setCreateImageTagView] = useState<boolean>(false)

    const renderInputErrorMessage = (errorMessage: string) => {
        return (
            <span className="flexbox cr-5 mt-4 fw-5 fs-11 flexbox">
                <AlertTriangle className="icon-dim-14 mr-5 ml-5 mt-2" />
                <span>{errorMessage}</span>
            </span>
        )
    }

    const onChangeCustomInput = (event) => {
        const _form = { ...formData }
        _form.customTag = {
            ..._form.customTag,
            tagPattern: event.target.value,
        }
        setFormData(_form)
        const _formDataErrorObj = { ...formDataErrorObj }
        _formDataErrorObj.customTag = validationRules.customTag(event.target.value)
        setFormDataErrorObj(_formDataErrorObj)
    }

    const onChangeCustomImageCounter = (event) => {
        const _form = { ...formData }
        _form.customTag = {
            ..._form.customTag,
            counterX: event.target.value,
        }
        setFormData(_form)
        const _formDataErrorObj = { ...formDataErrorObj }
        _formDataErrorObj.counterX = validationRules.counterX(event.target.value)
        setFormDataErrorObj(_formDataErrorObj)
    }

    const handleCustomTagStageOnCD = (selectedValue: OptionType) => {
        setSelectedCDStageTypeValue(selectedValue)

        const _form = { ...formData }
        _form.customTagStage = selectedValue.value
        setFormData(_form)
    }

    const renderCustomTagStageOnCD = () => {
        return (
            <div className="flex left">
                <ReactSelect
                    value={selectedCDStageTypeValue}
                    options={customTagStageTypeOptions}
                    className="select-width w-200 p-0"
                    classNamePrefix="select-custom-image-tag-cd-stage-type"
                    isSearchable={false}
                    onChange={handleCustomTagStageOnCD}
                    components={{
                        IndicatorSeparator: null,
                        DropdownIndicator,
                        Option,
                    }}
                    styles={getCommonSelectStyle({
                        control: (base, state) => ({
                            ...base,
                            boxShadow: 'none',
                            backgroundColor: 'var(--N50)',
                            border: state.isFocused ? '1px solid var(--B500)' : '1px solid var(--N200)',
                            cursor: 'pointer',
                            minHeight: '28px',
                            margin: '0px 8px',
                        }),
                    })}
                />
            </div>
        )
    }

    const renderCounterXTippy = (variableX: string) => {
        return (
            <Tippy
                content={
                    <div className="fs-12">
                        {`{x}`} is an auto increasing number. It will increase by one on each build trigger.
                    </div>
                }
                placement="top"
                className="default-tt w-200"
                arrow={false}
            >
                <span className="pl-4 dc__underline mr-4">{variableX}</span>
            </Tippy>
        )
    }

    const handleCounterKeyPress = (event) => {
        if (event.key === '-' || event.key === '+') {
            event.preventDefault()
            return false
        }
    }

    const renderCreateCustomTagPattern = () => {
        return (
            <div className="white-card pl-12 pr-12 pt-8 pb-8 mt-12 ml-54">
                <div className="fw-6 pb-8">Create tag pattern</div>
                <div>
                    <span className="cn-7"> Use mix of fixed pattern and</span>
                    {renderCounterXTippy(`variable {x}`)}
                </div>
                <textarea
                    tabIndex={1}
                    className="form__input form__input-no-bottom-radius custom-tag__text-area"
                    placeholder="Example: v1.2.{x}"
                    name="image_tag"
                    autoComplete="off"
                    autoFocus={true}
                    data-testid="container-repository-textbox"
                    value={formData.customTag?.tagPattern}
                    onChange={onChangeCustomInput}
                    draggable={false}
                />

                <div className="image-tag-preview en-2 bw-1 dc__bottom-radius-4 dc__no-border-top-imp pl-8 pr-8 pt-6 pb-6 cn-7">
                    {isCustomTagError ? (
                        formDataErrorObj.customTag.message.map((_msg: string) => {
                            return renderInputErrorMessage(_msg)
                        })
                    ) : (
                        <div className="flexbox">
                            Tag Preview:
                            <div className="ml-4 dc__bg-n50 dc__ff-monospace flexbox dc__w-fit-content pl-4 pr-4 br-4">
                                <div className={'dc__registry-icon mr-5 '}></div>
                                {formData.customTag?.tagPattern?.replace(
                                    '{x}',
                                    formData.customTag?.counterX?.toString(),
                                )}
                            </div>
                        </div>
                    )}
                </div>
                <div className="mt-4 cn-7 fs-12 flex left">
                    <Warning className="mr-4 icon-dim-16 image-tag-alert-icon" />
                    Build will fail if resulting image tag has already been built
                </div>
                <hr className="mt-12 mb-12" />
                <div className="flex left cn-7">
                    Value of {renderCounterXTippy(`{x}`)} will be
                    <input
                        tabIndex={2}
                        type="number"
                        className="form__input form__input-pl-8 w-80px-imp ml-8 mr-8 dc__bg-n50"
                        name="image_counter"
                        autoComplete="off"
                        value={formData.customTag?.counterX}
                        onChange={onChangeCustomImageCounter}
                        min="0"
                        onKeyPress={handleCounterKeyPress}
                    />
                    in the next build trigger {isCDBuild ? renderCustomTagStageOnCD() : null}
                    {formDataErrorObj.counterX?.message.length > 0
                        ? renderInputErrorMessage(formDataErrorObj.counterX.message)
                        : null}
                </div>
            </div>
        )
    }

    const renderCustomImageDetails = () => {
        return savedTagPattern && !showCreateImageTagView
            ? getGeneratedTagDescription()
            : renderCreateCustomTagPattern()
    }

    const toggleEditToShowCreateImageView = () => {
        setCreateImageTagView(!showCreateImageTagView)
    }

    const renderCustomTagCollapsedValue = () => {
        return (
            <div className="white-card pl-12 pr-12 pt-8 pb-8 dc__ff-monospace mt-12 mb-12 ml-54">
                <div className="flex dc__content-space">
                    <div>{formData.customTag?.tagPattern}</div>
                    <Edit className="icon-dim-20" onClick={toggleEditToShowCreateImageView} />
                </div>
                <hr className="mt-8 mb-8" />
                <div className="dc__italic-font-style cn-7">
                    {`{X}`} = {formData.customTag.counterX} in the next build trigger
                    {isCDBuild && formData?.customTagStage
                        ? ` of ${getCDStageTypeSelectorValue(formData.customTagStage).label}`
                        : ''}
                </div>
            </div>
        )
    }

    const getCustomTagCollapsedErrorText = (): string => {
        let errorMessage = ''
        if (
            formDataErrorObj.customTag.message.find(
                (errorMsg) =>
                    errorMsg === CustomErrorMessage.CUSTOM_TAG_ERROR_MSG ||
                    errorMsg === CustomErrorMessage.CUSTOM_TAG_MANDATORY_X,
            )
        ) {
            errorMessage = CustomErrorMessage.INVALID_IMAGE_PATTERN
        } else if (formDataErrorObj.customTag.message.find((errorMsg) => errorMsg === REQUIRED_FIELD_MSG)) {
            errorMessage = CustomErrorMessage.REQUIRED_IMAGE_PATTERN
        }
        return errorMessage
    }

    const getGeneratedTagDescription = (): JSX.Element => {
        if (isCustomTagError) {
            return renderInputErrorMessage(getCustomTagCollapsedErrorText())
        }
        if (formData.customTag?.tagPattern?.length > 0) {
            return renderCustomTagCollapsedValue()
        }
    }

    const handleCustomTagToggle = (): void => {
        const _formData = { ...formData }
        _formData.enableCustomTag = !_formData.enableCustomTag
        setFormData(_formData)
    }

    const renderCustomImageTagBody = (): JSX.Element => {
        return (
            <div className="fs-13">
                <hr />
                <div className="flex dc__content-space w-100 cursor flex top">
                    <div
                        className={`flex ${
                            !formData.enableCustomTag && formData.customTag?.tagPattern?.length > 0 ? 'top' : ''
                        }`}
                    >
                        <div className="pc-icon-container bcn-1 br-8 mr-16 flexbox">
                            <GeneratedImage className="icon-dim-24" />
                        </div>
                        <div>
                            <span className="fw-6">Custom image tag pattern</span>
                            <div className="cn-7 ">
                                When enabled, generated image will use the custom defined tag pattern
                            </div>
                        </div>
                    </div>
                    <div className="" style={{ width: '32px', height: '20px' }}>
                        <Toggle
                            disabled={window._env_.FORCE_SECURITY_SCANNING && formData.enableCustomTag}
                            selected={formData.enableCustomTag}
                            onSelect={handleCustomTagToggle}
                            dataTestId="create-build-pipeline-custom-tag-enabled-toggle"
                        />
                    </div>
                </div>
                {formData.enableCustomTag && renderCustomImageDetails()}
                <hr />
            </div>
        )
    }

    return renderCustomImageTagBody()
}

export default CustomImageTags
