import { RadioGroup, RadioGroupItem } from '@devtron-labs/devtron-fe-common-lib'
import React, { useContext, useState } from 'react'
import { ImageTagType } from './CustomImageTag.type'
import { ReactComponent as GeneratedImage } from '../../assets/icons/ic-generated-image.svg'
import { ReactComponent as Edit } from '../../assets/icons/ic-pencil.svg'
import { ReactComponent as DownArrow } from '../../assets/icons/ic-arrow-left.svg'
import { ValidationRules } from '../ciPipeline/validationRules'
import { ReactComponent as AlertTriangle } from '../../assets/icons/ic-alert-triangle.svg'
import { CustomErrorMessage, REQUIRED_FIELD_MSG } from '../../config/constantMessaging'
import { ReactComponent as Warning } from '../../assets/icons/ic-warning.svg'
import '../ciPipeline/ciPipeline.scss'
import { pipelineContext } from '../workflowEditor/workflowEditor'

function CustomImageTags({
    imageTagValue,
    setImageTagValue
}) {
    const {
        formData,
        setFormData,
        formDataErrorObj,
        setFormDataErrorObj,
    } = useContext(pipelineContext)
    const validationRules = new ValidationRules()
    const [showImageTagPatternDetails, setShowImageTagPatternDetails] = useState<boolean>(false)
    const isCustomTagError = formDataErrorObj.customTag.message.length > 0 && !formDataErrorObj.customTag.isValid

    const toggleEditAction = () => {
        setShowImageTagPatternDetails(!showImageTagPatternDetails)
    }

    const handleImageTagTypeChange = (event) => {
        setImageTagValue(event.target.value)
    }

    const renderInputErrorMessage = (errorMessage: string) => {
        return (
            <span className="flexbox cr-5 mt-4 fw-5 fs-11 flexbox">
                <AlertTriangle className="icon-dim-14 mr-5 ml-5 mt-2" />
                <span>{errorMessage}</span>
            </span>
        )
    }

    const renderImageTagPatternPreview = () => {
        return (
            <div className="pl-16 pr-16 pt-12 pb-12">
                <RadioGroup
                    value={imageTagValue}
                    name="image-type"
                    onChange={handleImageTagTypeChange}
                    className="chartrepo-type__radio-group dc__block-imp"
                >
                    <RadioGroupItem dataTestId="ci-default-image-tag" value={ImageTagType.Default}>
                        Use system generated image tag pattern
                        {imageTagValue === ImageTagType.Default && getDefaultTagValue()}
                    </RadioGroupItem>
                    <br />
                    <RadioGroupItem dataTestId="ci-custom-image-tag" value={ImageTagType.Custom}>
                        Create custom image tag pattern
                    </RadioGroupItem>
                </RadioGroup>
                {renderCustomImageDetails()}
            </div>
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
    }

    const renderCustomImageDetails = () => {
        return (
            imageTagValue === ImageTagType.Custom && (
                <div className="pl-26">
                    <span className="cn-7">Use mix of fixed pattern and variable {`{x}`}</span>
                    <textarea
                        tabIndex={1}
                        className="form__input form__input-no-bottom-radius"
                        placeholder="Example: v1.2.{x}"
                        name="image_tag"
                        autoComplete={'off'}
                        autoFocus={true}
                        data-testid="container-repository-textbox"
                        value={formData.customTag?.tagPattern}
                        onChange={onChangeCustomInput}
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
                                    {formData.customTag?.tagPattern.replace('{x}', formData.customTag?.counterX.toString())}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="mt-4 cn-7 fs-11 flex left">
                        <Warning className="mr-4 icon-dim-16 alert-icon-c9-imp" />
                        Build will fail if resulting image tag has already been built
                    </div>
                    <hr />
                    <div className="flex left">
                        <span className="cn-7">Value of variable {`{x}`} in the next build trigger will be</span>
                        <input
                            tabIndex={2}
                            type="number"
                            className="form__input form__input-p-2 w-80px-imp ml-8 dc__bg-n50"
                            name="image_counter"
                            autoComplete={'off'}
                            value={formData.customTag?.counterX}
                            onChange={onChangeCustomImageCounter}
                        />
                        <div></div>
                    </div>
                </div>
            )
        )
    }

    const getDefaultTagValue = () => {
        return (
            <div className="flex left cn-7">
                {formData.defaultTag?.map((tag, index) => {
                    return (
                        <div key={`tag-${index}`} className="flex left">
                            <div className="dc__bg-n50 br-6 pl-4 pr-4 flex left dc_width-max-content dc__lowercase">{tag}</div>
                            {index < 2 && <span className="bcn-0 pl-2 pr-2">-</span>}
                        </div>
                    )
                })}
            </div>
        )
    }

    const renderCustomTagCollapsedValue = () => {
        return (
            <div className="dc__ff-monospace  mt-4">
                <div>{formData.customTag?.tagPattern}</div>
                <div className="dc__italic-font-style cn-7">
                    {`{X}`} = {formData.customTag.counterX} in the next build trigger
                </div>
            </div>
        )
    }

    const getCustomTagCollapsedErrorText = (): string => {
        let errorMessage = ''
        if (
            formDataErrorObj.customTag.message.find(
                (errorMsg) => errorMsg === CustomErrorMessage.CUSTOM_TAG_ERROR_MSG || errorMsg === CustomErrorMessage.CUSTOM_TAG_MANDATORY_X,
            )
        ) {
            errorMessage = CustomErrorMessage.INVALID_IMAGE_PATTERN
        } else if (formDataErrorObj.customTag.message.find((errorMsg) => errorMsg === REQUIRED_FIELD_MSG)) {
            errorMessage = CustomErrorMessage.REQUIRED_IMAGE_PATTERN
        }
        return errorMessage
    }

    const getGeneratedTagDescription = (): JSX.Element => {
        if (!showImageTagPatternDetails) {
            if (isCustomTagError) {
                return renderInputErrorMessage(getCustomTagCollapsedErrorText())
            }
            if (formData.customTag.tagPattern.length > 0) {
                return renderCustomTagCollapsedValue()
            } else {
                return getDefaultTagValue()
            }
        }
    }

    const renderGeneratedImageTag = (): JSX.Element => {
        return (
            <div className="white-card mb-16 p-0 fs-13">
                <div
                    onClick={toggleEditAction}
                    className={`flex dc__content-space w-100 pl-16 pr-16 pt-12 pb-12 cursor ${
                        showImageTagPatternDetails ? 'dc__border-bottom' : ''
                    }`}
                >
                    <div className="flex left  ">
                        <GeneratedImage className="mr-12" />
                        <div>
                            <span className="fw-6">Pattern for generated image tag</span>
                            <span className="dc__italic-font-style ml-4">(Using default)</span>
                            {getGeneratedTagDescription()}
                        </div>
                    </div>
                    <button type="button" className="dc__transparent" data-testid="api-token-edit-button">
                        {showImageTagPatternDetails ? (
                            <DownArrow className="rotate icon-dim-20" style={{ ['--rotateBy' as any]: '90deg' }} />
                        ) : (
                            <Edit className="icon-dim-16" />
                        )}
                    </button>
                </div>
                {showImageTagPatternDetails && renderImageTagPatternPreview()}
            </div>
        )
    }

    return renderGeneratedImageTag()
}

export default CustomImageTags
