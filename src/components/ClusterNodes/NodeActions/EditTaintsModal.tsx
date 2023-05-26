import React, { useState } from 'react'
import {
    showError,
    Progressing,
    Drawer,
    TippyCustomized,
    TippyTheme,
    stopPropagation,
    InfoColourBar,
} from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as InfoIcon } from '../../../assets/icons/info-filled.svg'
import { ReactComponent as Add } from '../../../assets/icons/ic-add.svg'
import { ReactComponent as DeleteIcon } from '../../../assets/icons/ic-delete-interactive.svg'
import { ReactComponent as AlertTriangle } from '../../../assets/icons/ic-alert-triangle.svg'
import { ReactComponent as HelpIcon } from '../../../assets/icons/ic-help.svg'
import { ReactComponent as Close } from '../../../assets/icons/ic-close.svg'
import { updateTaints } from '../clusterNodes.service'
import ReactSelect from 'react-select'
import { OptionType } from '../../app/types'
import { Option, DropdownIndicator } from '../../v2/common/ReactSelect.utils'
import { containerImageSelectStyles } from '../../CIPipelineN/ciPipeline.utils'
import { EditTaintsModalType, EditTaintsRequest, EFFECT_TYPE, TaintErrorObj, TaintType } from '../types'
import { ValidationRules } from './validationRules'
import { EDIT_TAINTS_MODAL_MESSAGING, TAINT_OPTIONS } from '../constants'
import { toast } from 'react-toastify'
import { useParams } from 'react-router-dom'

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
        const index = e.currentTarget.dataset.index
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
        const index = e.currentTarget.dataset.index
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
                name: name,
                version: version,
                kind: kind,
                taints: taintList,
            }
            await updateTaints(payload)
            toast.success(EDIT_TAINTS_MODAL_MESSAGING.Actions.saving)
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

    const RenderInfoMessage = () => {
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
                    showCloseButton={true}
                    trigger="click"
                    interactive={true}
                    additionalContent={tippyContent()}
                >
                    <span className="cb-5 cursor" onClick={stopPropagation}>
                        {EDIT_TAINTS_MODAL_MESSAGING.infoLinkText}
                    </span>
                </TippyCustomized>
            </div>
        )
    }

    return (
        <Drawer position="right" width="75%" minWidth="1024px" maxWidth="1200px">
            <div className="bcn-0 h-100">
                <div className="flex flex-align-center flex-justify bcn-0 pt-16 pr-20 pb-16 pl-20 dc__border-bottom">
                    <h2 className="fs-16 fw-6 lh-1-43 m-0">
                        {`${EDIT_TAINTS_MODAL_MESSAGING.titlePrefix} '${name}'`}
                    </h2>
                    <button type="button" className="dc__transparent flex icon-dim-24" onClick={onClose}>
                        <Close className="icon-dim-24" />
                    </button>
                </div>
                <div className="pt-16 pr-20 pb-16 pl-20" style={{ height: 'calc(100vh - 125px)' }}>
                    <InfoColourBar
                        message={<RenderInfoMessage />}
                        classname="info_bar mb-16"
                        Icon={InfoIcon}
                        iconClass="icon-dim-20"
                    />
                    <div
                        className="cursor cb-5 fw-6 fs-13 flexbox mr-20 mb-12"
                        onClick={addNewTaint}
                    >
                        <Add className="icon-dim-20 fcb-5" /> {EDIT_TAINTS_MODAL_MESSAGING.addTaint}
                    </div>
                    {taintList?.map((taintDetails, index) => {
                        const _errorObj = errorObj?.taintErrorList[index]
                        return (
                            <div className="flexbox mb-8">
                                <div className="w-100 mr-8">
                                    <input
                                        type="text"
                                        name="key"
                                        data-index={index}
                                        value={taintDetails.key}
                                        className="form__input h-32"
                                        onChange={handleInputChange}
                                        placeholder="Key"
                                    />
                                    {_errorObj && !_errorObj['key'].isValid && (
                                        <span className="flexbox cr-5 mt-4 fw-5 fs-11 flexbox">
                                            <AlertTriangle className="icon-dim-14 mr-5 ml-5 mt-2" />
                                            <span>{_errorObj['key'].message}</span>
                                        </span>
                                    )}
                                </div>
                                <div className="w-100 mr-8">
                                    <input
                                        type="text"
                                        name="value"
                                        data-index={index}
                                        value={taintDetails.value}
                                        className="form__input h-32"
                                        onChange={handleInputChange}
                                        placeholder="Value"
                                    />
                                    {_errorObj && !_errorObj['value'].isValid && (
                                        <span className="flexbox cr-5 mt-4 fw-5 fs-11 flexbox">
                                            <AlertTriangle className="icon-dim-14 mr-5 ml-5 mt-2" />
                                            <span>{_errorObj['value'].message}</span>
                                        </span>
                                    )}
                                </div>

                                <div className="w-70 mr-8">
                                    <ReactSelect
                                        options={TAINT_OPTIONS}
                                        onChange={(selectedValue) => {
                                            onEffectChange(selectedValue, index)
                                        }}
                                        data-index={index}
                                        components={{
                                            IndicatorSeparator: null,
                                            DropdownIndicator,
                                            Option: (props) => (
                                                <Option
                                                    {...props}
                                                    tippyClass="default-tt w-200"
                                                    showTippy={true}
                                                    placement="left"
                                                    tippyContent={props.data['description']}
                                                />
                                            ),
                                        }}
                                        value={{
                                            label: taintDetails.effect,
                                            value: taintDetails.effect,
                                        }}
                                        styles={{
                                            ...containerImageSelectStyles,
                                            singleValue: (base, state) => ({
                                                ...base,
                                                padding: '5px 0',
                                            }),
                                        }}
                                    />
                                </div>
                                <div>
                                    <DeleteIcon
                                        className="icon-dim-20 mt-4 pointer"
                                        data-index={index}
                                        onClick={deleteTaint}
                                    />
                                </div>
                            </div>
                        )
                    })}
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
