import {
    applyCompareDiffOnUneditedDocument,
    getGuiSchemaFromChartName,
    handleUTCTime,
    ResponseType,
    TemplateListDTO,
    TemplateListType,
    YAMLStringify,
} from '@devtron-labs/devtron-fe-common-lib'
import YAML from 'yaml'

export const getCompareWithTemplateOptionsLabel = (template: TemplateListDTO, chartLabel: string = ''): string => {
    switch (template.type) {
        case TemplateListType.DefaultVersions:
            return `v${template.chartVersion} (Default)`
        case TemplateListType.PublishedOnEnvironments:
        case TemplateListType.DeployedOnOtherEnvironment:
            return `${template.environmentName ? template.environmentName : ''} ${
                template.chartVersion ? `(v${template.chartVersion})` : `(${chartLabel.split(' ')[0]})`
            }`
        case TemplateListType.DeployedOnSelfEnvironment:
            return `${handleUTCTime(template.finishedOn)} ${
                template.chartVersion ? `(v${template.chartVersion})` : `(${chartLabel.split(' ')[0]})`
            }`
        default:
            return ''
    }
}

export const makeObjectFromJsonPathArray = (index: number, paths: string[]) => {
    if (index >= paths.length) {
        return {
            'ui:widget': 'hidden',
        }
    }
    if (paths[index] === '$') {
        return makeObjectFromJsonPathArray(index + 1, paths)
    }
    const key = paths[index]
    const isKeyNumber = !Number.isNaN(Number(key)) || key === '*'
    if (isKeyNumber) {
        return { items: makeObjectFromJsonPathArray(index + 1, paths) }
    }
    return { [key]: makeObjectFromJsonPathArray(index + 1, paths) }
}

/**
 * This method will compare and calculate the diffs between @unedited and @edited
 * documents and apply these diffs onto the @unedited document and return this new document
 * @param {string} unedited - The unedited document onto which we want to patch the changes from @edited
 * @param {string} edited - The edited document whose changes we want to patch onto @unedited
 */
export const applyCompareDiffOfTempFormDataOnOriginalData = (
    unedited: string,
    edited: string,
    updateTempFormData?: (data: string) => void,
) => {
    const updated = applyCompareDiffOnUneditedDocument(YAML.parse(unedited), YAML.parse(edited))
    // TODO: Can add simpleKeys?
    updateTempFormData?.(YAMLStringify(updated))
    return updated
}

export const addGUISchemaIfAbsent = (response: ResponseType, chartName: string) => {
    if (response && response.result && !response.result.guiSchema) {
        return {
            ...response,
            result: {
                ...response.result,
                guiSchema: JSON.stringify(getGuiSchemaFromChartName(chartName)),
            },
        }
    }
    return response
}
