import { getGeneratedHelmManifest } from '../common/chartValues.api'
import { ChartValuesViewAction, ChartValuesViewActionTypes, ChartValuesViewState } from './ChartValuesView.type'

const generateManifestGenerationKey = (isExternalApp: boolean, appName: string, commonState: ChartValuesViewState) => {
    return isExternalApp
        ? `${commonState.releaseInfo.deployedAppDetail.environmentDetail.namespace}_${commonState.releaseInfo.deployedAppDetail.appName}_${commonState.chartValues?.id}_${commonState.selectedVersionUpdatePage?.id}`
        : `${commonState.selectedEnvironment.value}_${appName}_${commonState.chartValues?.id}_${commonState.selectedEnvironment.namespace}_${commonState.selectedVersionUpdatePage?.id}`
}

export const updateGeneratedManifest = (
    isExternalApp: boolean,
    isDeployChartView: boolean,
    appName: string,
    commonState: ChartValuesViewState,
    appStoreApplicationVersionId: number,
    valuesYaml: string,
    dispatch: (action: ChartValuesViewAction) => void,
) => {
    const _manifestGenerationKey = generateManifestGenerationKey(isExternalApp, appName, commonState)

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
            return 'numberInput'
        default:
            return type
    }
}

// Todo: Revisit for child refs
export const convertJSONSchemaToMap = (schema, parentRef = '', keyValuePair = new Map<string, any>()) => {
    if (schema && schema.properties) {
        const properties = schema.properties!
        Object.keys(properties).forEach((propertyKey) => {
            const propertyPath = `${parentRef}${parentRef ? '/' : ''}${propertyKey}`
            const property = properties[propertyKey]
            const haveChildren = property.type === 'object' && property.properties
            const newProps = {
                ...property,
                type: getFieldType(property.type, property.render, !!property.enum),
                parentRef: parentRef,
                children: haveChildren && Object.keys(property.properties).map((key) => `${propertyPath}/${key}`),
            }

            keyValuePair.set(propertyPath, newProps)

            if (haveChildren) {
                convertJSONSchemaToMap(property, propertyPath, keyValuePair)
            }
        })
    }

    return keyValuePair
}
