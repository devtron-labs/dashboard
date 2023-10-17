import { getGeneratedHelmManifest } from '../common/chartValues.api'
import { ChartValuesViewAction, ChartValuesViewActionTypes, ChartValuesViewState } from './ChartValuesView.type'
import YAML from 'yaml'
import { Collection } from 'yaml/types'
import { showError } from '@devtron-labs/devtron-fe-common-lib'
import {
    ChartDeploymentManifestDetailResponse,
    getDeploymentManifestDetails,
} from '../../chartDeploymentHistory/chartDeploymentHistory.service'
import { groupStyle } from '../../common/ReactSelect.utils'
import _ from 'lodash';

export const getCommonSelectStyle = (styleOverrides = {}) => {
    return {
        menuList: (base) => ({
            ...base,
            paddingTop: 0,
            paddingBottom: 0,
        }),
        control: (base, state) => ({
            ...base,
            minHeight: '32px',
            boxShadow: 'none',
            backgroundColor: 'var(--N50)',
            border: state.isFocused ? '1px solid var(--B500)' : '1px solid var(--N200)',
            cursor: 'pointer',
        }),
        option: (base, state) => ({
            ...base,
            color: 'var(--N900)',
            backgroundColor: state.isFocused ? 'var(--N100)' : 'white',
            padding: '10px 12px',
        }),
        dropdownIndicator: (base, state) => ({
            ...base,
            color: 'var(--N400)',
            padding: '0 8px',
            transition: 'all .2s ease',
            transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
        }),
        valueContainer: (base) => ({
            ...base,
            padding: '0 8px',
        }),
        loadingMessage: (base) => ({
            ...base,
            color: 'var(--N600)',
        }),
        noOptionsMessage: (base) => ({
            ...base,
            color: 'var(--N600)',
        }),
        ...styleOverrides,
    }
}

export const getCompareValuesSelectStyles = () => {
    return {
        control: (base) => ({
            ...base,
            backgroundColor: 'var(--N100)',
            border: 'none',
            boxShadow: 'none',
            minHeight: '32px',
        }),
        option: (base, state) => ({
            ...base,
            color: 'var(--N900)',
            backgroundColor: state.isFocused ? 'var(--N100)' : 'white',
        }),
        menu: (base) => ({
            ...base,
            marginTop: '2px',
            minWidth: '240px',
        }),
        menuList: (base) => ({
            ...base,
            position: 'relative',
            paddingBottom: 0,
            paddingTop: 0,
            maxHeight: '250px',
        }),
        dropdownIndicator: (base, state) => ({
            ...base,
            padding: 0,
            color: 'var(--N400)',
            transition: 'all .2s ease',
            transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
        }),
        noOptionsMessage: (base) => ({
            ...base,
            color: 'var(--N600)',
        }),
    }
}

const generateManifestGenerationKey = (
    isCreateValueView: boolean,
    isExternalApp: boolean,
    appName: string,
    valueName: string,
    commonState: ChartValuesViewState,
) => {
    return isCreateValueView
        ? `0_${valueName}_${commonState.chartValues?.id}_default_${commonState.selectedVersionUpdatePage?.id}`
        : isExternalApp
        ? `${commonState.releaseInfo.deployedAppDetail.environmentDetail.namespace}_${commonState.releaseInfo.deployedAppDetail.appName}_${commonState.chartValues?.id}_${commonState.selectedVersionUpdatePage?.id}`
        : `${commonState.selectedEnvironment?.value || 0}_${appName}_${commonState.chartValues?.id}_${
              commonState.selectedEnvironment?.namespace || 'default'
          }_${commonState.selectedVersionUpdatePage?.id}`
}

export const updateGeneratedManifest = (
    isCreateValueView: boolean,
    isUnlinkedCLIApp: boolean,
    isExternalApp: boolean,
    isDeployChartView: boolean,
    appName: string,
    valueName: string,
    commonState: ChartValuesViewState,
    appStoreApplicationVersionId: number,
    appId: string,
    deploymentVersion: number,
    valuesYaml: string,
    dispatch: (action: ChartValuesViewAction) => void,
) => {
    const _manifestGenerationKey = generateManifestGenerationKey(
        isCreateValueView,
        isExternalApp,
        appName,
        valueName,
        commonState,
    )

    if (commonState.manifestGenerationKey === _manifestGenerationKey && !commonState.valuesYamlUpdated) {
        return
    }

    dispatch({
        type: ChartValuesViewActionTypes.multipleOptions,
        payload: {
            generatingManifest: true,
            manifestGenerationKey: _manifestGenerationKey,
            valuesEditorError: '',
        },
    })

    if (isUnlinkedCLIApp) {
        getDeploymentManifestDetails(appId, deploymentVersion, isExternalApp).then(
            (response: ChartDeploymentManifestDetailResponse) => {
                dispatch({
                    type: ChartValuesViewActionTypes.multipleOptions,
                    payload: {
                        generatedManifest: response.result.manifest,
                        valuesYamlUpdated: false,
                        valuesEditorError: '',
                        generatingManifest: false,
                    },
                })
            },
        )

        return
    }

    if (isDeployChartView) {
        getGeneratedHelmManifest(
            commonState.selectedEnvironment.value,
            commonState.selectedEnvironment.clusterId || commonState.installedConfig.clusterId,
            commonState.selectedEnvironment.namespace,
            appName,
            appStoreApplicationVersionId,
            valuesYaml,
            dispatch,
        )
    } else if (isCreateValueView) {
        getGeneratedHelmManifest(0, 1, 'default', valueName, appStoreApplicationVersionId, valuesYaml, dispatch)
    } else {
        getGeneratedHelmManifest(
            commonState.installedConfig.environmentId,
            commonState.installedConfig.clusterId,
            commonState.installedConfig.namespace,
            commonState.installedConfig.appName,
            appStoreApplicationVersionId,
            valuesYaml,
            dispatch,
        )
    }
}

const getFieldType = (type: string, renderType: string, containsEnum): string => {
    switch (type) {
        case 'string':
            return containsEnum ? 'select' : renderType ? renderType : 'input'
        case 'object':
            return 'formBox'
        case 'boolean':
            return 'checkbox'
        case 'integer':
        case 'number':
            return 'numberInput'
        default:
            return type
    }
}

const isFieldEnabled = (property: any, isChild: boolean): boolean => {
    if (property.form && (isChild || !property.properties)) {
        return true
    } else if (!isChild && property.properties) {
        return Object.values(property.properties).some((_prop) => {
            if (_prop['properties']) {
                return isFieldEnabled(_prop, isChild)
            }

            return _prop['form']
        })
    }

    return false
}

export const isRequiredField = (property: any, isChild: boolean, schemaJson: Map<string, any>): boolean => {
    if (isChild) {
        const _parentValue = schemaJson.get(property.parentRef)

        if (_parentValue?.required) {
            return _parentValue.required.includes(property.key.split('/').slice(-1).join('/'))
        } else if (property.parentRef) {
            return isRequiredField(_parentValue, true, schemaJson)
        }
    }

    return !!property.required
}

export const convertItemsToObj = (items) => {
    const itemsObj = {}
    for (let item of items) {
        itemsObj[item.key.value] = item.value.value
    }
    return itemsObj
}

const getAvailalbePath = (parentPathKey: string[], valuesYamlDocument: YAML.Document.Parsed): string[] => {
    let currentPath: string[] = [],
        noValueInCurrentPath = false
    for (let _pathKey of parentPathKey) {
        if (noValueInCurrentPath) {
            break
        } else {
            const _currentPath = currentPath.concat(_pathKey)
            const _valueInCurrentPath = valuesYamlDocument.getIn(_currentPath)
            if (
                typeof _valueInCurrentPath === 'undefined' ||
                _valueInCurrentPath === null ||
                (_valueInCurrentPath instanceof Collection &&
                    _valueInCurrentPath.items &&
                    !_valueInCurrentPath.items.length)
            ) {
                noValueInCurrentPath = true
            } else {
                currentPath = _currentPath
            }
        }
    }

    return currentPath
}

export const getPathAndValueToSetIn = (
    pathKey: string[],
    valuesYamlDocument: YAML.Document.Parsed,
    _newValue: any,
    type?: string,
    arrIndex?: string,
): {
    pathToSetIn: string[]
    valueToSetIn: any
} => {
    let pathToSetIn = [],
        valueToSetIn
    const parentPathKey = pathKey.slice(0, pathKey.length - 1)
    const parentValue = valuesYamlDocument.getIn(parentPathKey)
    if(type)
    if (
        typeof parentValue === 'undefined' ||
        parentValue === null ||
        (parentValue instanceof Collection && parentValue.items && !parentValue.items.length)
    ) {
        const availablePath = getAvailalbePath(parentPathKey, valuesYamlDocument)
        const availablePathToSetIn = pathKey.slice(availablePath.length + 1)
        valueToSetIn = { [availablePathToSetIn.join('.')]: _newValue }
        pathToSetIn = pathKey.slice(0, availablePath.length + 1)
    } else if (typeof parentValue === 'object') {
        valueToSetIn = {
            ...(parentValue['items'] ? convertItemsToObj(parentValue['items']) : parentValue),
            [pathKey[pathKey.length - 1]]: _newValue,
        }
        pathToSetIn = parentPathKey
    }

    return { pathToSetIn, valueToSetIn }
}

export const getAndUpdateSchemaValue = (
    modifiedValuesYaml: string,
    schemaJson: Map<string, any>,
    dispatch: (action: ChartValuesViewAction) => void,
    arrPath?: string[],
): void => {
    const parsedValuesYamlDocument = YAML.parseDocument(modifiedValuesYaml || '')
    let updatedSchemaJson = schemaJson
    if (updatedSchemaJson?.size && parsedValuesYamlDocument?.contents) {
        for (let [key, value] of updatedSchemaJson) {
            const path=key.split('/')
            if(arrPath)path.unshift(...arrPath)
            // if(type)path.unshift(type,index)
            if(value.type==='array')
            {   
                const noOfItems = parsedValuesYamlDocument.getIn(path).items.length
                updateArrayElements(updatedSchemaJson, key, noOfItems, dispatch)
                
                let allItems=updatedSchemaJson.get(key).items
               Object.keys(allItems).forEach((arrIndex)=>{
                    //@ts-ignore
                    const _path = [...path, arrIndex]
                    getAndUpdateSchemaValue(modifiedValuesYaml,allItems[arrIndex],dispatch,_path)
               })
            }
            if(value.singleField)
            {
                path.pop()
            }
            const _value = parsedValuesYamlDocument.getIn(path) ?? updatedSchemaJson[key].default
            const updatedValue = updatedSchemaJson.get(key)
            updatedValue.value =
                updatedValue['type'] === 'select'
                    ? updatedValue['enum']?.includes(_value)
                        ? { label: _value, value: _value }
                        : null
                    : _value
            updatedSchemaJson.set(key, updatedValue)
        }
    }

    dispatch({
        type: ChartValuesViewActionTypes.multipleOptions,
        payload: {
            valuesYamlDocument: parsedValuesYamlDocument,
            schemaJson: updatedSchemaJson,
        },
    })
}

const updateArrayElements=(schema:Map<string, any>,key:string,noOfItems:number,dispatch)=>
{
    if(Object.values(schema.get(key).items).length===noOfItems)return schema
    // const newItemSchema=new Map<string, any>(schema)
    const props=schema.get(key)
    const newItems={}
    if(Object.values(props.items).length!==noOfItems)
    {
        // let count=Object.values(props.items).length
        for(let i=0;i<noOfItems;i++)
        {
            newItems[i]=_.cloneDeep(props.itemType);
            // new Map<string, any>(JSON.parse(JSON.stringify([...props.itemType])))
        }
    }
    const newArray={...newItems}
    schema.set(key, {
        ...props,
        items: newArray,
    })
    
}
const getPathKeyAndPropsPair = (
    schema,
    parentRef = '',
    pathKeyAndPropsPair = new Map<string, any>(),
): Map<string, any> => {
    if (schema?.properties) {
        const properties = schema.properties
        Object.keys(properties).forEach((propertyKey) => {
            const propertyPath = `${parentRef}${parentRef ? '/' : ''}${propertyKey}`
            const property = properties[propertyKey]
            if (properties[propertyKey].type === 'array' && properties[propertyKey].items) {
                const newProps={
                    ...property,
                    type: 'array',
                    key: propertyPath,
                    showBox: false,
                    showField: true,
                    parentRef: parentRef,
                    value:property.enum ? { label: property.enum[0], value: property.enum[0] } : property.default,
                    itemType: arrayItemType(property.items,property.title),
                    eachItemTitle:property.items.title,
                    items:{}
                }
                pathKeyAndPropsPair.set(propertyPath, newProps)
                
            } else 
            {
                const haveChildren = property.type === 'object' && property.properties
                
                const newProps = {
                    ...property,
                    key: propertyPath,
                    type: getFieldType(property.type, property.render, !!property.enum),
                    showBox: property.type === 'object' && property.form,
                    value: property.enum ? { label: property.enum[0], value: property.enum[0] } : property.default,
                    showField: property.required || isFieldEnabled(property, !!parentRef),
                    parentRef: parentRef,
                    children: haveChildren && Object.keys(property.properties).map((key) => `${propertyPath}/${key}`),
                }

                delete newProps['properties'] // Don't need properties as they're already being flatten
                pathKeyAndPropsPair.set(propertyPath, newProps)
                if (haveChildren) {
                    getPathKeyAndPropsPair(property, propertyPath, pathKeyAndPropsPair)
                }

            }
        })
    }
    return pathKeyAndPropsPair
}

const arrayItemType=(property,title)=>{
    const pathKeyAndPropsPair=new Map<string, any>()
    if(property.type==='object')
    {
        if(property.properties)
        {
            Object.keys(property.properties).forEach((key) =>{
                getSchemaForArrayType(property.properties[key],key,pathKeyAndPropsPair)
            })
        }
    }
    else{
        const singleField=property.type!== 'array' && property.type!== 'object'
        getSchemaForArrayType(property,title,pathKeyAndPropsPair,singleField)
    }
    return pathKeyAndPropsPair
}
const getSchemaForArrayType = (property, propertyKey, pathKeyAndPropsPair,singleField=false) => {
    if (property.type === 'array') {
        const newProps={
            ...property,
            type: 'array',
            key: propertyKey,
            showBox: false,
            showField: true,
            parentRef: '',
            value:property.enum ? { label: property.enum[0], value: property.enum[0] } : property.default,
            itemType: arrayItemType(property.items,property.title),
            items:{}
        }
        pathKeyAndPropsPair.set(propertyKey, newProps)
    } else {
        const haveChildren = property.type === 'object' && property.properties
        const newProps = {
            ...property,
            key: propertyKey,
            type: getFieldType(property.type, property.render, !!property.enum),
            showBox: property.type === 'object' && property.form,
            value: property.enum ? { label: property.enum[0], value: property.enum[0] } : property.default,
            showField: true,
            parentRef: '',
            singleField:singleField,
            children: haveChildren && Object.keys(property.properties).map((key) => `${propertyKey}/${key}`),
        }
        delete newProps['properties'] // Don't need properties as they're already being flatten
        pathKeyAndPropsPair.set(propertyKey, newProps)
        if (haveChildren) {
            getPathKeyAndPropsPair(property, propertyKey, pathKeyAndPropsPair)
        }
    }
    return pathKeyAndPropsPair
}

export const convertSchemaJsonToMap = (valuesSchemaJson: string): Map<string, any> | null => {
    if (valuesSchemaJson?.trim()) {
        try {
            console.log('schema',valuesSchemaJson)
            return getPathKeyAndPropsPair(JSON.parse(valuesSchemaJson))
        } catch (e) {
            showError(e)
        }
    }
    return null
}

export const envGroupStyle = {
    ...groupStyle(),
    control: (base) => ({
        ...base,
        border: '1px solid #d6dbdf',
        background: 'var(--N50)',
        minHeight: '32px',
    }),
    dropdownIndicator: (base, state) => ({
        ...base,
        color: 'var(--N400)',
        padding: '0 8px',
        transition: 'all .2s ease',
        transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
    }),
}