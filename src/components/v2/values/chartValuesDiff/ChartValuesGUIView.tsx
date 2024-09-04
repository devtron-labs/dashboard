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

import React, { Fragment } from 'react'
import YAML from 'yaml'
import { Progressing, CHECKBOX_VALUE, GenericEmptyState } from '@devtron-labs/devtron-fe-common-lib'
import {
    StyledInput,
    StyledSelect,
    RangeSlider,
    CheckboxWithTippy,
    StyledFormBox,
} from '../../../common/formFields/Widgets/Widgets'
import { UpdateApplicationButton } from './ChartValuesView.component'
import { ChartValuesGUIFormType, ChartValuesViewAction, ChartValuesViewActionTypes } from './ChartValuesView.type'
import { ReactComponent as Error } from '../../../../assets/icons/ic-error-exclamation.svg'
import { ReactComponent as InfoIcon } from '../../../../assets/icons/info-filled.svg'
import { getPathAndValueToSetIn, isRequiredField } from './ChartValuesView.utils'
import { EMPTY_STATE_STATUS } from '../../../../config/constantMessaging'

const getGUIWidget = (
    props: any,
    callback: (newValue) => void,
    formValidationError: Record<string, boolean>,
): JSX.Element => {
    switch (props.type) {
        case 'input':
        case 'numberInput':
            return (
                <StyledInput
                    {...props}
                    onBlur={(e) => {
                        callback(props.type === 'numberInput' ? +e.target.value : e.target.value)
                    }}
                    errorMessage={formValidationError[props.key] && 'This is a required field'}
                />
            )
        case 'textArea':
            return (
                <StyledInput
                    {...props}
                    onBlur={(e) => {
                        callback(e.target.value)
                    }}
                    errorMessage={formValidationError[props.key] && 'This is a required field'}
                />
            )
        case 'select':
            return (
                <StyledSelect
                    {...props}
                    options={props.enum.map((option) => {
                        return { label: option, value: option }
                    })}
                    onChange={(selected) => {
                        callback(selected)
                    }}
                    errorMessage={formValidationError[props.key] && 'This is a required field'}
                />
            )
        case 'slider':
            return (
                <RangeSlider
                    {...props}
                    value={props.value ? props.value.replace(props.sliderUnit, '') : ''}
                    sliderMin={props.sliderMin ?? 1}
                    sliderMax={props.sliderMax ?? 1000}
                    onInputValue={(newValue) => {
                        callback(`${newValue}${props.sliderUnit}`)
                    }}
                    errorMessage={formValidationError[props.key] && 'This is a required field'}
                />
            )
        case 'checkbox':
            return (
                <CheckboxWithTippy
                    {...props}
                    isChecked={props.value}
                    value={CHECKBOX_VALUE.CHECKED}
                    onChange={(e) => {
                        callback(e.target.checked)
                    }}
                />
            )
        case 'formBox':
            return <StyledFormBox {...props} />
        default:
            return null
    }
}

const updateYamlDocument = (
    _newValue: any,
    property: any,
    schemaJson: Map<string, any>,
    valuesYamlDocument: YAML.Document.Parsed,
    dispatch: React.Dispatch<ChartValuesViewAction>,
): void => {
    schemaJson.set(property.key, {
        ...property,
        value: _newValue,
    })

    const pathKey = property.key.split('/')

    if (valuesYamlDocument.hasIn(pathKey)) {
        valuesYamlDocument.setIn(pathKey, property.type === 'select' ? _newValue.value : _newValue)
    } else {
        const { pathToSetIn, valueToSetIn } = getPathAndValueToSetIn(pathKey, valuesYamlDocument, _newValue)

        if (typeof valueToSetIn !== 'undefined' && valueToSetIn !== null && valuesYamlDocument.contents) {
            valuesYamlDocument.setIn(pathToSetIn, valueToSetIn)
        }
    }

    dispatch({
        type: ChartValuesViewActionTypes.multipleOptions,
        payload: {
            schemaJson,
            ...(valuesYamlDocument.contents && {
                valuesYamlDocument,
                modifiedValuesYaml: valuesYamlDocument.toString(),
            }),
        },
    })
}

const renderChildGUIWidget = (
    _childKey: string,
    schemaJson: Map<string, any>,
    valuesYamlDocument: YAML.Document.Parsed,
    formValidationError: Record<string, boolean>,
    dispatch: React.Dispatch<ChartValuesViewAction>,
): JSX.Element | null => {
    const _childProps = schemaJson.get(_childKey)
    if (_childProps.type === 'formBox' && _childProps.children) {
        return renderGUIWidget(_childProps, schemaJson, valuesYamlDocument, formValidationError, dispatch, true)
    }
    if (isFieldHidden(_childProps, schemaJson)) {
        return null
    }
    const isRequired = isRequiredField(_childProps, true, schemaJson)
    if (_childProps.showField || isRequired) {
        _childProps['isRequired'] = isRequired
        return getGUIWidget(
            _childProps,
            (_newValue) => {
                updateYamlDocument(_newValue, _childProps, schemaJson, valuesYamlDocument, dispatch)
            },
            formValidationError,
        )
    }
}

const checkIfChildIsHidden = (props: any, schemaJson: Map<string, any>) => {
    const parent = schemaJson.get(props.parentRef)
    const childPath = typeof props.hidden === 'object' ? props.hidden.path : props.hidden
    const childPathKey = `${parent.parentRef ? parent.parentRef : parent.key}/${childPath}`

    if (parent.children.includes(childPathKey)) {
        const _value = schemaJson.get(childPathKey).value
        return typeof props.hidden === 'object' ? props.hidden.value === _value : !!_value
    }

    return parent.parentRef && checkIfChildIsHidden(parent, schemaJson)
}

const isFieldHidden = (props: any, schemaJson: Map<string, any>): boolean => {
    if (typeof props.hidden !== 'object' && typeof props.hidden !== 'string') {
        return props.hidden ?? false
    }

    if (typeof props.hidden === 'object') {
        if (props.hidden.hasOwnProperty('condition')) {
            const _path = props.hidden.path || props.hidden.value
            if (_path && schemaJson.has(_path)) {
                return props.hidden.condition === schemaJson.get(_path).value
            }
        } else if (schemaJson.has(props.hidden.path)) {
            return props.hidden.value === schemaJson.get(props.hidden.path).value
        }
    } else if (typeof props.hidden === 'string') {
        return !!schemaJson.get(props.hidden)?.value
    }

    return props.parentRef && checkIfChildIsHidden(props, schemaJson)
}

const renderGUIWidget = (
    props: any,
    schemaJson: Map<string, any>,
    valuesYamlDocument: YAML.Document.Parsed,
    formValidationError: Record<string, boolean>,
    dispatch: React.Dispatch<ChartValuesViewAction>,
    fromParent?: boolean,
): JSX.Element | null => {
    if (!isFieldHidden(props, schemaJson) && (!props.parentRef || fromParent)) {
        if (props.type === 'formBox' && props.children) {
            return props.showField ? (
                <StyledFormBox key={props.key} {...props}>
                    {props.children.map((_childKey) =>
                        renderChildGUIWidget(_childKey, schemaJson, valuesYamlDocument, formValidationError, dispatch),
                    )}
                </StyledFormBox>
            ) : (
                <Fragment key={props.key}>
                    {props.children.map((_childKey) =>
                        renderChildGUIWidget(_childKey, schemaJson, valuesYamlDocument, formValidationError, dispatch),
                    )}
                </Fragment>
            )
        }
        props['isRequired'] = isRequiredField(props, fromParent, schemaJson)
        return getGUIWidget(
            props,
            (_newValue) => {
                updateYamlDocument(_newValue, props, schemaJson, valuesYamlDocument, dispatch)
            },
            formValidationError,
        )
    }

    return null
}

const ChartValuesGUIForm = (props: ChartValuesGUIFormType): JSX.Element => {
    if (props.fetchingSchemaJson) {
        return <Progressing size={32} fullHeight />
    }
    if (!props.schemaJson?.size) {
        return (
            <GenericEmptyState
                SvgImage={Error}
                title=""
                subTitle={EMPTY_STATE_STATUS.CHART_VALUES_GUIT_VIEW.SUBTITLE}
            />
        )
    }

    return (
        <div
            className={`chart-values-view__gui-form-container ${
                !props.isDeployChartView && !props.isCreateValueView ? 'values-update-view' : ''
            } ${props.openReadMe ? 'chart-values-view__full-mode' : ''}`}
        >
            <div className="gui-form-info flex left bcb-1">
                <span className="icon-dim-16">
                    <InfoIcon className="icon-dim-16" />
                </span>
                <span className="fs-12 cn-9 ml-10">
                    This feature is in BETA. If you find an issue please&nbsp;
                    <a
                        className="cb-5 fw-6"
                        href="https://github.com/devtron-labs/devtron/issues/new/choose"
                        target="_blank"
                        rel="noreferrer"
                    >
                        report it here.
                    </a>
                </span>
            </div>
            <form className="chart-values-view__gui-form">
                {[...props.schemaJson.values()].map((value) => {
                    return renderGUIWidget(
                        value,
                        props.schemaJson,
                        props.valuesYamlDocument,
                        props.formValidationError,
                        props.dispatch,
                    )
                })}
            </form>
            <UpdateApplicationButton
                isUpdateInProgress={props.isUpdateInProgress}
                isDeleteInProgress={props.isDeleteInProgress}
                isDeployChartView={props.isDeployChartView}
                isCreateValueView={props.isCreateValueView}
                deployOrUpdateApplication={props.deployOrUpdateApplication}
            />
        </div>
    )
}

export default ChartValuesGUIForm
