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

import { ReactNode, useState } from 'react'
import {
    showError,
    Progressing,
    Drawer,
    TippyCustomized,
    TippyTheme,
    stopPropagation,
    InfoColourBar,
    SelectPicker,
    ToastVariantType,
    ToastManager,
    CustomInput,
    ComponentSizeType,
    Button,
    ButtonVariantType,
    ButtonStyleType,
    InfoBlock,
} from '@devtron-labs/devtron-fe-common-lib'
import { useParams } from 'react-router-dom'
import { ReactComponent as InfoIcon } from '../../../assets/icons/info-filled.svg'
import { ReactComponent as Add } from '../../../assets/icons/ic-add.svg'
import { ReactComponent as DeleteIcon } from '../../../assets/icons/ic-delete-interactive.svg'
import { ReactComponent as HelpIcon } from '../../../assets/icons/ic-help.svg'
import { ReactComponent as Close } from '../../../assets/icons/ic-close.svg'
import { updateTaints } from '../clusterNodes.service'
import { OptionType } from '../../app/types'
import { EditTaintsModalType, EditTaintsRequest, EFFECT_TYPE, TaintErrorObj, TaintType } from '../types'
import { ValidationRules } from './validationRules'
import { EDIT_TAINTS_MODAL_MESSAGING, TAINT_OPTIONS } from '../constants'

const TaintInfoMessage = ({ tippyContent }: { tippyContent: () => ReactNode }) => {
    return (
        <div className="fs-13 fw-4 lh-20">
            <span>{EDIT_TAINTS_MODAL_MESSAGING.infoText}</span> &nbsp;
            <TippyCustomized
                theme={TippyTheme.white}
                className="w-400"
                placement="top"
                Icon={HelpIcon}
                iconClass="fcv-5"
                heading={EDIT_TAINTS_MODAL_MESSAGING.tippyTitle}
                infoText=""
                showCloseButton
                trigger="click"
                interactive
                additionalContent={tippyContent()}
            >
                <span className="cb-5 cursor" onClick={stopPropagation}>
                    {EDIT_TAINTS_MODAL_MESSAGING.infoLinkText}
                </span>
            </TippyCustomized>
        </div>
    )
}

export default function EditTaintsModal({ name, version, kind, taints, closePopup }: EditTaintsModalType) {
    const { clusterId } = useParams<{ clusterId: string }>()
    const [apiCallInProgress, setAPICallInProgress] = useState(false)
    const [taintList, setTaintList] = useState<TaintType[]>(
        taints || [{ key: '', value: '', effect: EFFECT_TYPE.PreferNoSchedule }],
    )
    const [errorObj, setErrorObj] = useState<TaintErrorObj>(null)
    const validationRules = new ValidationRules()

    const onClose = (): void => {
        !apiCallInProgress && closePopup()
    }

    const deleteTaint = (e): void => {
        const { index } = e.currentTarget.dataset
        const _taintList = [...taintList]
        _taintList.splice(index, 1)
        setTaintList(_taintList)
        validateTaintList(_taintList)
    }

    const addNewTaint = (): void => {
        const _taintList = [...taintList, { key: '', value: '', effect: EFFECT_TYPE.PreferNoSchedule }]
        setTaintList(_taintList)
        validateTaintList(_taintList, true)
    }

    const handleInputChange = (e): void => {
        const _taintList = [...taintList]
        const { index } = e.currentTarget.dataset
        _taintList[index][e.target.name] = e.target.value
        setTaintList(_taintList)
        validateTaintList(_taintList)
    }

    const onEffectChange = (selectedValue: OptionType, index: number): void => {
        const _taintList = [...taintList]
        _taintList[index].effect = EFFECT_TYPE[selectedValue.label]
        setTaintList(_taintList)
        validateTaintList(_taintList)
    }

    const validateTaintList = (_taintList: TaintType[], ignoreNewlyAdded?: boolean): TaintErrorObj => {
        const _errorObj = { isValid: true, taintErrorList: [] }
        const uniqueTaintMap = new Map<string, boolean>()
        for (let index = 0; index < _taintList.length; index++) {
            const element = _taintList[index]
            const uniqueKey = `${element.key}-${element.effect}`
            const validateTaintValue = validationRules.taintValue(element.value)
            let validateTaintKey = validationRules.taintKey(element.key)
            if (uniqueTaintMap.get(uniqueKey)) {
                if (validateTaintKey.isValid) {
                    validateTaintKey = { isValid: false, message: 'Key and effect must be a unique combination.' }
                }
            } else {
                uniqueTaintMap.set(uniqueKey, true)
            }
            _errorObj.taintErrorList.push({
                key: validateTaintKey,
                value: validateTaintValue,
            })
            _errorObj.isValid = _errorObj.isValid && validateTaintKey.isValid && validateTaintValue.isValid
        }
        if (ignoreNewlyAdded) {
            _errorObj.taintErrorList.splice(-1, 1, {
                key: { isValid: true, message: null },
                value: { isValid: true, message: null },
            })
        }
        setErrorObj(_errorObj)
        return _errorObj
    }

    const onSave = async (): Promise<void> => {
        if (!validateTaintList(taintList).isValid) {
            return
        }
        try {
            setAPICallInProgress(true)
            const payload: EditTaintsRequest = {
                clusterId: Number(clusterId),
                name,
                version,
                kind,
                taints: taintList,
            }
            await updateTaints(payload)
            ToastManager.showToast({
                variant: ToastVariantType.success,
                description: EDIT_TAINTS_MODAL_MESSAGING.Actions.saving,
            })
            closePopup(true)
        } catch (err) {
            showError(err)
        } finally {
            setAPICallInProgress(false)
        }
    }

    const tippyContent = () => {
        return (
            <div className="p-12 fs-13">
                <div>{EDIT_TAINTS_MODAL_MESSAGING.tippyDescription.message}</div>
                <ul className="p-0" style={{ listStyleType: 'none' }}>
                    {EDIT_TAINTS_MODAL_MESSAGING.tippyDescription.messageList.map((message, index) => (
                        <li key={`msg-${index}`}>{message}</li>
                    ))}
                </ul>
            </div>
        )
    }

    return (
        <Drawer position="right" width="75%" minWidth="1024px" maxWidth="1200px">
            <div className="flexbox-col bg__primary h-100 flex-grow-1 mh-0">
                <div className="flex flex-align-center flex-justify bg__primary pt-16 pr-20 pb-16 pl-20 dc__border-bottom">
                    <h2 className="fs-16 fw-6 lh-1-43 m-0">{`${EDIT_TAINTS_MODAL_MESSAGING.titlePrefix} '${name}'`}</h2>
                    <button type="button" className="dc__transparent flex icon-dim-24" onClick={onClose}>
                        <Close className="icon-dim-24" />
                    </button>
                </div>
                <div className="flexbox-col px-20 py-16 dc__overflow-auto flex-grow-1 dc__gap-16">
                    <InfoBlock description={<TaintInfoMessage tippyContent={tippyContent} />} />
                    <div className="flexbox-col dc__gap-12">
                        <div className="cursor cb-5 fw-6 fs-13 flexbox dc__gap-8" onClick={addNewTaint}>
                            <Add className="icon-dim-20 fcb-5" /> {EDIT_TAINTS_MODAL_MESSAGING.addTaint}
                        </div>
                        {taintList?.map((taintDetails, index) => {
                            const _errorObj = errorObj?.taintErrorList[index]
                            return (
                                <div className="flex left dc__gap-8 mb-8">
                                    <CustomInput
                                        type="text"
                                        name="key"
                                        data-index={index}
                                        value={taintDetails.key}
                                        onChange={handleInputChange}
                                        placeholder="Key"
                                        error={errorObj && !_errorObj['key'].isValid ? _errorObj['key'].message : null}
                                        fullWidth
                                    />
                                    <CustomInput
                                        type="text"
                                        name="value"
                                        data-index={index}
                                        value={taintDetails.value}
                                        onChange={handleInputChange}
                                        placeholder="Value"
                                        error={
                                            errorObj && !_errorObj['value'].isValid ? _errorObj['value'].message : null
                                        }
                                        fullWidth
                                    />
                                    <div className="w-70">
                                        <SelectPicker
                                            inputId="select-taint-effect"
                                            options={TAINT_OPTIONS}
                                            onChange={(selectedValue: OptionType) => {
                                                onEffectChange(selectedValue, index)
                                            }}
                                            data-index={index}
                                            value={{
                                                label: taintDetails.effect,
                                                value: taintDetails.effect,
                                            }}
                                            size={ComponentSizeType.large}
                                        />
                                    </div>
                                    <Button
                                        icon={<DeleteIcon />}
                                        dataTestId={`delete-taint-${index}`}
                                        onClick={deleteTaint}
                                        data-index={index}
                                        ariaLabel="Delete Taint"
                                        showAriaLabelInTippy={false}
                                        size={ComponentSizeType.small}
                                        variant={ButtonVariantType.borderLess}
                                        style={ButtonStyleType.negativeGrey}
                                    />
                                </div>
                            )
                        })}
                    </div>
                </div>
                <div className="dc__border-top flex right p-16">
                    <button
                        className="cta cancel h-36 lh-36 mr-12"
                        type="button"
                        disabled={apiCallInProgress}
                        onClick={onClose}
                    >
                        {EDIT_TAINTS_MODAL_MESSAGING.Actions.cancel}
                    </button>
                    <button className="cta h-36 lh-36" disabled={apiCallInProgress} onClick={onSave}>
                        {apiCallInProgress ? <Progressing /> : EDIT_TAINTS_MODAL_MESSAGING.Actions.save}
                    </button>
                </div>
            </div>
        </Drawer>
    )
}
