import React, { Fragment ,useEffect} from 'react'
import {
    StyledInput,
    StyledSelect,
    RangeSlider,
    CheckboxWithTippy,
    StyledFormBox,
} from '../../../common/formFields/Widgets/Widgets'
import { UpdateApplicationButton } from './ChartValuesView.component'
import { ChaartValuesGUIFormType, ChartValuesViewAction, ChartValuesViewActionTypes } from './ChartValuesView.type'
import YAML from 'yaml'
import { Progressing, CHECKBOX_VALUE, GenericEmptyState, noop } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as Error } from '../../../../assets/icons/ic-error-exclamation.svg'
import { ReactComponent as InfoIcon } from '../../../../assets/icons/info-filled.svg'
import { getPathAndValueToSetIn, isRequiredField } from './ChartValuesView.utils'
import { EMPTY_STATE_STATUS } from '../../../../config/constantMessaging'
import { ReactComponent as Add } from '../../../../assets/icons/ic-add.svg'
import { ReactComponent as Close } from '../../../../assets/icons/ic-close.svg'
import _ from 'lodash';




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
    type: string='',
    arrayIndex?:string,
    arrPath:string[]=[],
    arraySchema?:Map<string,any>
): void => {
    const index=type?arrayIndex:null
    if(arraySchema){
        arraySchema.set(property.key, {
            ...property,
            value: _newValue,
        })
    }
    else{
        schemaJson.set(property.key, {
            ...property,
            value: _newValue,
        })
    }
    
    const pathKey = property.key.split('/')
    pathKey.unshift(...arrPath)
    if(property.singleField)pathKey.pop()
    const newArrPath=arrPath.join('/').split('/')
    if (valuesYamlDocument.hasIn(newArrPath)) {
        valuesYamlDocument.setIn(newArrPath, property.type === 'select' ? _newValue.value : _newValue)
    } else {
        const { pathToSetIn, valueToSetIn } = getPathAndValueToSetIn(newArrPath, valuesYamlDocument, _newValue,type,arrayIndex)
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
    fromParent?: boolean,
    arrayIndex?:string,
    type?:string,
    arrPath:string[]=[],
    arrayScehma?:Map<string,any>
): JSX.Element | null => {
    const arraySchema = type ? schemaJson.get(type).items[arrayIndex] : null
    const originalSchemaJson=new Map<string, any>(schemaJson)
    schemaJson = type ? arraySchema : schemaJson
    const _childProps = schemaJson.get(_childKey)
    if (_childProps.type === 'formBox' && _childProps.children) {
        return renderGUIWidget(_childProps, schemaJson, valuesYamlDocument, formValidationError, dispatch,true,arrayIndex,type,arrPath,arrayScehma)
    } 
    else if(_childProps.type=='array')
    {
        return renderGUIWidget(_childProps, schemaJson, valuesYamlDocument, formValidationError, dispatch,true,arrayIndex,type,arrPath,arrayScehma)
    }
    else {
        if (isFieldHidden(_childProps, schemaJson)) {
            return null
        }

        const isRequired = isRequiredField(_childProps, true, schemaJson)
        if (_childProps.showField || isRequired) {
            _childProps['isRequired'] = isRequired
            return getGUIWidget(
                _childProps,
                (_newValue) => {
                    updateYamlDocument(_newValue, _childProps, originalSchemaJson, valuesYamlDocument, dispatch,type,arrayIndex,arrPath,arrayScehma)
                },
                formValidationError,
            )
        }
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
const addRow=(props,dispatch: React.Dispatch<ChartValuesViewAction>,schemaJson:Map<string, any>,valuesYamlDocument: YAML.Document.Parsed,arrPath:string[])=>{
    let childSchema
    if (arrPath.length > 1) {
        childSchema=schemaJson.get(arrPath[0]).items[arrPath[1]]
    }
    const parsedValuesYamlDocument=YAML.parseDocument(valuesYamlDocument.toString())
    const newItemSchema=_.cloneDeep(props.itemType);
    const newArray={...props.items,[Object.values(props.items).length]:newItemSchema}
    if(childSchema){
        childSchema.set(props.key, {
            ...props,
            items: newArray,
        })
    }
    else{
        schemaJson.set(props.key, {
            ...props,
            items: newArray,
        })
    }
    
    const newArrPath=arrPath.join('/').split('/')
    
    parsedValuesYamlDocument.setIn([...newArrPath,Object.values(props.items).length],props.defaultValue??"")

    dispatch({
        type: ChartValuesViewActionTypes.multipleOptions,
        payload: {
            schemaJson,
            valuesYamlDocument: parsedValuesYamlDocument,
            modifiedValuesYaml: parsedValuesYamlDocument.toString()    
        },
    })
}

const removeRow = (
    props,
    dispatch: React.Dispatch<ChartValuesViewAction>,
    schemaJson: Map<string, any>,valuesYamlDocument: YAML.Document.Parsed,
    arrPath:string[],
) => {
    const newSchemaJson = new Map<string, any>(schemaJson)
    let childSchema
    if(arrPath.length>2){
        console.log(newSchemaJson.get(arrPath[0]).items[arrPath[1]])
        childSchema=newSchemaJson.get(arrPath[0]).items[arrPath[1]]
    }
    const parsedValuesYamlDocument=YAML.parseDocument(valuesYamlDocument.toString())
    const elementIndex=arrPath.slice(-1)[0]
    const arrayElements = { ...props.items }
    delete arrayElements[elementIndex]
    

    const newArrayElements = {}
    let newIndex = 0
    for (const key in arrayElements) {
        newArrayElements[newIndex++] = arrayElements[key]
    }
    if(childSchema){
        childSchema.set(props.key, {
            ...props,
            items: newArrayElements,
        })
    }
    else{
        newSchemaJson.set(props.key, {
            ...props,
            items: newArrayElements,
        })
    }
    // newSchemaJson.set(props.key, {
    //     ...props,
    //     items: newArrayElements,
    // })
    const newArrPath=arrPath.join('/').split('/')
    console.log('arrpath',newArrPath.slice(0,-1))
    console.log('value',parsedValuesYamlDocument.getIn(newArrPath.slice(0,-1))['items'])
    const remainingItems=parsedValuesYamlDocument.getIn(newArrPath.slice(0,-1))['items'].splice(elementIndex,1)
    // console.log('remaing',remainingItems)
    // parsedValuesYamlDocument.setIn(arrPath,remainingItems)
    // console.log('ipdated yaml',parsedValuesYamlDocument.toString())
    dispatch({
        type: ChartValuesViewActionTypes.multipleOptions,
        payload: {
            schemaJson: newSchemaJson,
            valuesYamlDocument: parsedValuesYamlDocument,
            modifiedValuesYaml: parsedValuesYamlDocument.toString()      
        },
    })
}

const getArrayElements = (
    props: any,
    schemaJson: Map<string, any>,
    valuesYamlDocument: YAML.Document.Parsed,
    formValidationError: Record<string, boolean>,
    dispatch: React.Dispatch<ChartValuesViewAction>,
    arrPath:string[]
): JSX.Element[] => {
    const arrayElements = []
    
        for (const key in props.items) {
            console.log('key',props.items)
            arrayElements.push(
                <div key={Math.random()} className="flexbox">
                    <div>
                        {props.eachItemTitle && (
                            <div className="fs-14 fw-6 p-0 mb-16 lh-20"> {props.eachItemTitle}</div>
                        )}
                        {props.eachItemTitle && <hr />}
                        <div className="flexbox-col">
                            {[...props.items[key].values()].map((value, index) => {
                                return (
                                    <div key={value.key}>
                                        {renderGUIWidget(
                                            value,
                                            schemaJson,
                                            valuesYamlDocument,
                                            formValidationError,
                                            dispatch,
                                            false,
                                            key,
                                            props.key,
                                            arrPath.concat(key),
                                            props.items[key],
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                    <div>
                        {Object.values(props.items).length >= 1 && (
                            <Close
                                className="option-close-icon icon-dim-16 pointer scr-5 bw-1 br-4 en-2 ml-4"
                                onClick={() =>
                                    removeRow(props, dispatch, schemaJson, valuesYamlDocument, arrPath.concat(key))
                                }
                            />
                        )}
                    </div>
                </div>,
            )
        }
    return arrayElements
}

const renderGUIWidget = (
    props: any,
    schemaJson: Map<string, any>,
    valuesYamlDocument: YAML.Document.Parsed,
    formValidationError: Record<string, boolean>,
    dispatch: React.Dispatch<ChartValuesViewAction>,
    fromParent?: boolean,
    arrayIndex?:string,
    type?:string,
    arrPath:string[]=[],
    arrayScehma?:Map<string,any>
    
): JSX.Element | null => {
    if (!isFieldHidden(props, schemaJson) && (!props.parentRef || fromParent)) {
        if (props.type === 'formBox' && props.children) {
            return props.showField ? (
                <StyledFormBox key={props.key} {...props}>
                    {props.children.map((_childKey) =>
                        renderChildGUIWidget(
                            _childKey,
                            schemaJson,
                            valuesYamlDocument,
                            formValidationError,
                            dispatch,
                            false,
                            arrayIndex,
                            type,
                            arrPath,
                            arrayScehma
                        ),
                    )}
                </StyledFormBox>
            ) : (
                <Fragment key={props.key}>
                    {props.children.map((_childKey) =>
                        renderChildGUIWidget(
                            _childKey,
                            schemaJson,
                            valuesYamlDocument,
                            formValidationError,
                            dispatch,
                            false,
                            arrayIndex,
                            type,
                            arrPath,
                            arrayScehma
                        ),
                    )}
                </Fragment>
            )
        } else if (props.type == 'array') {
            const newArrPath=[...arrPath,props.key]
            props.defaultValue = props.defaultValue ?? valuesYamlDocument.getIn([props.key, 0])

            if (props.singleField) {
                return (
                    <Fragment key={props.key}>
                        {getArrayElements(
                            props,
                            schemaJson,
                            valuesYamlDocument,
                            formValidationError,
                            dispatch,
                            newArrPath,
                        )}
                        <div
                            className="flexbox flex-align-center pointer cb-5 fw-6 fs-13 lh-32 w-120"
                            onClick={() => addRow(props, dispatch, schemaJson, valuesYamlDocument, newArrPath)}
                        >
                            <Add className="icon-dim-20 fcb-5 mr-6" />
                            <div>Add Item</div>
                        </div>
                    </Fragment>
                )
            } else
                return (
                    <StyledFormBox {...props}>
                        {getArrayElements(
                            props,
                            schemaJson,
                            valuesYamlDocument,
                            formValidationError,
                            dispatch,
                            newArrPath,
                        )}
                        <div
                            className="flexbox flex-align-center pointer cb-5 fw-6 fs-13 lh-32 w-120"
                            onClick={() => addRow(props, dispatch, schemaJson, valuesYamlDocument, newArrPath)}
                        >
                            <Add className="icon-dim-20 fcb-5 mr-6" />
                            <div>Add Item</div>
                        </div>
                    </StyledFormBox>
                )
            
            
        } 
        else {
            props['isRequired'] = isRequiredField(props, fromParent, schemaJson)
            return getGUIWidget(
                props,
                (_newValue) => {
                    updateYamlDocument(_newValue, props, schemaJson, valuesYamlDocument, dispatch,type,arrayIndex,arrPath,arrayScehma)
                },
                formValidationError,
            )
        }
    }
    return null
}


const ChartValuesGUIForm = (props: ChaartValuesGUIFormType): JSX.Element => {
    if (props.fetchingSchemaJson) {
        return <Progressing size={32} fullHeight />
    } else if (!props.schemaJson?.size) {
        return (
            <GenericEmptyState
                SvgImage={Error}
                title=""
                subTitle={EMPTY_STATE_STATUS.CHART_VALUES_GUIT_VIEW.SUBTITLE}
            />
        )
    }
    console.log('here value',props.schemaJson)
    // console.log('here value',props.schemaJson.get('migrations').items[0].value)

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
