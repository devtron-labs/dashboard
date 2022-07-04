import React, { useEffect } from 'react'
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

    const pathIn = property.key.split('/')
    if (valuesYamlDocument.hasIn(pathIn)) {
        valuesYamlDocument.setIn(pathIn, _newValue)
    }

    dispatch({
        type: ChartValuesViewActionTypes.multipleOptions,
        payload: {
            schemaJson,
            modifiedValuesYaml: valuesYamlDocument.toString(),
        },
    })
}

const renderGUIWidget = (
    props: any,
    schemaJson: Map<string, any>,
    valuesYamlDocument: YAML.Document.Parsed,
    dispatch: React.Dispatch<ChartValuesViewAction>,
    fromParent?: boolean,
) => {
    if (props.type === 'formBox') {
        return (
            <StyledFormBox key={props.key} {...props}>
                {props.children?.map((_child) => {
                    const _childProps = schemaJson.get(_child)
                    if (_childProps.type === 'formBox' && _childProps.children) {
                        return renderGUIWidget(_childProps, schemaJson, valuesYamlDocument, dispatch, true)
                    } else {
                        return getGUIWidget(_childProps, (_newValue) => {
                            updateYamlDocument(_newValue, _childProps, schemaJson, valuesYamlDocument, dispatch)
                        })
                    }
                })}
            </StyledFormBox>
        )
    } else if (!props.parentRef || fromParent) {
        return getGUIWidget(props, (_newValue) => {
            updateYamlDocument(_newValue, props, schemaJson, valuesYamlDocument, dispatch)
        })
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

        useEffect(() => {
            console.log(props.schemaJson)
        }, [])

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
