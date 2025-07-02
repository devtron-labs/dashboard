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
import Tippy from '@tippyjs/react'
import {
    Collapse,
    DTSwitch,
    OptionType,
    RegistryIcon,
    RegistryType,
    SelectPicker,
    Textarea,
} from '@devtron-labs/devtron-fe-common-lib'
import { CustomImageTagsType } from './CustomImageTag.type'
import { ValidationRules } from '../ciPipeline/validationRules'
import { CustomErrorMessage, REQUIRED_FIELD_MSG } from '../../config/constantMessaging'
import { ReactComponent as Edit } from '../../assets/icons/ic-pencil.svg'
import { ReactComponent as AlertTriangle } from '../../assets/icons/ic-alert-triangle.svg'
import { ReactComponent as GeneratedImage } from '../../assets/icons/ic-generated-image.svg'
import { getCDStageTypeSelectorValue, customTagStageTypeOptions } from './ciPipeline.utils'
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
    const [showCreateImageTagView, setShowCreateImageTagView] = useState<boolean>(false)

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
            <div className="flex left ml-8">
                <SelectPicker
                    inputId="custom-image-tag-cd-stage-type"
                    value={selectedCDStageTypeValue}
                    options={customTagStageTypeOptions}
                    classNamePrefix="select-custom-image-tag-cd-stage-type"
                    isSearchable={false}
                    onChange={handleCustomTagStageOnCD}
                />
            </div>
        )
    }

    const renderCounterXTippy = (variableX: string) => {
        return (
            <Tippy
                content={
                    <div>
                        {`{x}`} is an auto increasing number. It will increase by one on each{' '}
                        {isCDBuild ? getCDStageTypeSelectorValue(formData.customTagStage).label : ' build '} trigger.
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
                <Textarea
                    label={
                        <span>
                            <span>Use mix of fixed pattern and</span>
                            {renderCounterXTippy(`variable {x}`)}
                        </span>
                    }
                    placeholder="Example: v1.2.{x}"
                    name="image_tag"
                    autoFocus
                    value={formData.customTag?.tagPattern}
                    onChange={onChangeCustomInput}
                    warningText={!isCDBuild && 'Build will fail if resulting image tag has already been built'}
                    error={isCustomTagError && formDataErrorObj.customTag.message?.[0]}
                />

                {!isCustomTagError && (
                    <div className="image-tag-preview pt-6 pb-6 cn-7 flexbox">
                        Tag Preview:
                        <div className="ml-4 bg__secondary mono flexbox dc__w-fit-content pl-4 pr-4 br-4 dc__gap-4">
                            <RegistryIcon registryType={RegistryType.DOCKER} />
                            {formData.customTag?.tagPattern?.replace(
                                '{x}',
                                formData.customTag?.counterX?.toString() ?? '0',
                            )}
                        </div>
                    </div>
                )}
                <hr className="mt-12 mb-12" />
                <div className="flex left cn-7">
                    Value of {renderCounterXTippy(`{x}`)} will be
                    <input
                        tabIndex={2}
                        type="number"
                        className="form__input form__input-pl-8 w-80px-imp ml-8 mr-8 bg__secondary"
                        name="image_counter"
                        autoComplete="off"
                        value={formData.customTag?.counterX}
                        onChange={onChangeCustomImageCounter}
                        onKeyPress={handleCounterKeyPress}
                        defaultValue="0"
                    />
                    in the next {isCDBuild ? ' trigger of ' : ' build trigger '}
                    {isCDBuild ? renderCustomTagStageOnCD() : null}
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
        setShowCreateImageTagView(!showCreateImageTagView)
    }

    const renderCustomTagCollapsedValue = () => {
        return (
            <div className="white-card pl-12 pr-12 pt-8 pb-8 mt-12 mb-12 ml-54">
                <div className="flex dc__content-space mono">
                    <div className="bcn-1 pl-8 pr-8 br-4 mb-4">{formData.customTag?.tagPattern}</div>
                    <Edit className="icon-dim-20" onClick={toggleEditToShowCreateImageView} />
                </div>
                <div className="dc__italic-font-style cn-7">
                    {`{X}`} = {formData.customTag.counterX} in the next {!isCDBuild ? ' build ' : ''} trigger
                    {isCDBuild && formData.customTagStage
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
                    <DTSwitch
                        name="create-build-pipeline-custom-tag-enabled-toggle"
                        ariaLabel="Toggle enable custom image tag"
                        isChecked={formData.enableCustomTag}
                        onChange={handleCustomTagToggle}
                    />
                </div>
                <Collapse expand={formData.enableCustomTag}>
                    {renderCustomImageDetails()}
                </Collapse>
                <hr />
            </div>
        )
    }

    return renderCustomImageTagBody()
}

export default CustomImageTags
