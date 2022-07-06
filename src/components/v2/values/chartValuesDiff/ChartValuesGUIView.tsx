import React, { Fragment, useEffect } from 'react'
import {
    StyledInput,
    StyledTextarea,
    StyledSelect,
    RangeSlider,
    CheckboxWithTippy,
    StyledFormBox,
} from '../../../common/formFields/Widgets/Widgets'
import { UpdateApplicationButton } from './ChartValuesView.component'
import { ChartValuesViewAction, ChartValuesViewActionTypes } from './ChartValuesView.type'
import YAML from 'yaml'
import { CHECKBOX_VALUE, Progressing } from '../../../common'
import EmptyState from '../../../EmptyState/EmptyState'
import { ReactComponent as Error } from '../../../../assets/icons/ic-error-exclamation.svg'
import { ReactComponent as InfoIcon } from '../../../../assets/icons/info-filled.svg'
import { getPathAndValueToSetIn, isRequiredField } from './ChartValuesView.utils'

const getGUIWidget = (props: any, callback): JSX.Element => {
    switch (props.type) {
        case 'input':
        case 'numberInput':
            return (
                <StyledInput
                    {...props}
                    onBlur={(e) => {
                        callback(e.target.value)
                    }}
                />
            )
        case 'textArea':
            return (
                <StyledTextarea
                    {...props}
                    onBlur={(e) => {
                        callback(e.target.value)
                    }}
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
) => {
    schemaJson.set(property.key, {
        ...property,
        value: _newValue,
    })

    const pathKey = property.key.split('/')

    if (valuesYamlDocument.hasIn(pathKey)) {
        valuesYamlDocument.setIn(pathKey, property.type === 'select' ? _newValue.value : _newValue)
    } else {
        const { pathToSetIn, valueToSetIn } = getPathAndValueToSetIn(pathKey, valuesYamlDocument, _newValue)

        if (typeof valueToSetIn !== 'undefined' && valueToSetIn !== null) {
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
    dispatch: React.Dispatch<ChartValuesViewAction>,
) => {
    const _childProps = schemaJson.get(_childKey)
    if (_childProps.type === 'formBox' && _childProps.children) {
        return renderGUIWidget(_childProps, schemaJson, valuesYamlDocument, dispatch, true)
    } else {
        const isRequired = isRequiredField(_childProps, true, schemaJson)
        if (_childProps.showField || isRequired) {
            _childProps['isRequired'] = isRequired
            return getGUIWidget(_childProps, (_newValue) => {
                updateYamlDocument(_newValue, _childProps, schemaJson, valuesYamlDocument, dispatch)
            })
        }
    }
}

const isFieldHidden = (props: any, valuesYamlDocument: YAML.Document.Parsed) => {
    if (!props.hidden) return false

    if (typeof props.hidden === 'object') {
        return props.hidden.value === valuesYamlDocument.getIn(props.hidden.path?.split('/'))
    } else if (typeof props.hidden === 'string') {
        return valuesYamlDocument.getIn(props.hidden.split('/'))
    }

    return props.hidden
}

const renderGUIWidget = (
    props: any,
    schemaJson: Map<string, any>,
    valuesYamlDocument: YAML.Document.Parsed,
    dispatch: React.Dispatch<ChartValuesViewAction>,
    fromParent?: boolean,
) => {
    if (!isFieldHidden(props, valuesYamlDocument) && (!props.parentRef || fromParent)) {
        if (props.type === 'formBox' && props.children) {
            return props.showField ? (
                <StyledFormBox key={props.key} {...props}>
                    {props.children.map((_childKey) =>
                        renderChildGUIWidget(_childKey, schemaJson, valuesYamlDocument, dispatch),
                    )}
                </StyledFormBox>
            ) : (
                <Fragment key={props.key}>
                    {props.children.map((_childKey) =>
                        renderChildGUIWidget(_childKey, schemaJson, valuesYamlDocument, dispatch),
                    )}
                </Fragment>
            )
        } else {
            props['isRequired'] = isRequiredField(props, fromParent, schemaJson)
            return getGUIWidget(props, (_newValue) => {
                updateYamlDocument(_newValue, props, schemaJson, valuesYamlDocument, dispatch)
            })
        }
    }
}

const SchemaNotAvailable = () => {
    return (
        <EmptyState>
            <EmptyState.Image>
                <Error className="icon-dim-20 mb-10" />
            </EmptyState.Image>
            <EmptyState.Subtitle>
                GUI view is not available as values.schema.json file does not exist for the selected version and values
            </EmptyState.Subtitle>
        </EmptyState>
    )
}

const ChartValuesGUIForm = React.memo(
    (props: {
        schemaJson: Map<string, any>
        valuesYamlDocument: YAML.Document.Parsed
        fetchingSchemaJson: boolean
        openReadMe: boolean
        isUpdateInProgress: boolean
        isDeleteInProgress: boolean
        isDeployChartView: boolean
        deployOrUpdateApplication: (forceUpdate?: boolean) => Promise<void>
        dispatch: React.Dispatch<ChartValuesViewAction>
    }) => {
        if (!props.schemaJson?.size) {
            return <SchemaNotAvailable />
        } else if (props.fetchingSchemaJson) {
            return <Progressing size={32} fullHeight />
        }

        return (
            <div
                className={`chart-values-view__gui-form-container ${
                    props.openReadMe ? 'chart-values-view__full-mode' : ''
                }`}
            >
                <div className="gui-form-info flex left bcb-1">
                    <span className="icon-dim-16">
                        <InfoIcon className="icon-dim-16" />
                    </span>
                    <span className="fs-12 cn-9 ml-10">
                        This feature is in BETA. If you find an issue please report it&nbsp;
                        <a
                            className="cb-5 fw-6"
                            href="https://github.com/devtron-labs/devtron/issues/new/choose"
                            target="_blank"
                        >
                            here.
                        </a>
                    </span>
                </div>
                <form className="chart-values-view__gui-form">
                    {[...props.schemaJson.values()].map((value) => {
                        return renderGUIWidget(value, props.schemaJson, props.valuesYamlDocument, props.dispatch)
                    })}
                </form>
                {!props.openReadMe && (
                    <UpdateApplicationButton
                        isUpdateInProgress={props.isUpdateInProgress}
                        isDeleteInProgress={props.isDeleteInProgress}
                        isDeployChartView={props.isDeployChartView}
                        deployOrUpdateApplication={props.deployOrUpdateApplication}
                    />
                )}
            </div>
        )
    },
)

export default ChartValuesGUIForm
