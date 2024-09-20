import {
    applyCompareDiffOnUneditedDocument,
    CONFIGURATION_TYPE_VALUES,
    ConfigurationType,
    DEPLOYMENT_TEMPLATE_TAB_VALUES,
    DeploymentTemplateQueryParamsType,
    DeploymentTemplateTabsType,
    getGuiSchemaFromChartName,
    handleUTCTime,
    ResponseType,
    TemplateListDTO,
    TemplateListType,
    UseUrlFiltersProps,
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

export const getDTCodeEditorBackgroundClass = (isOverrideView: boolean, isOverridden: boolean): string => {
    if (!isOverrideView) {
        return 'bcn-1'
    }

    if (isOverridden) {
        return 'bcy-1'
    }

    return 'bcb-1'
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
    const isKeyNumber = !Number.isNaN(Number(key))
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

// FIXME: Will recieve one parser from fe-lib as well to restrict weird reload cases
const parseDeploymentTemplateQueryParams = (
    params: URLSearchParams,
    isSuperAdmin: boolean,
): DeploymentTemplateQueryParamsType => {
    const currentEditMode = params.get('editMode') as ConfigurationType
    const isCurrentEditModeValid = CONFIGURATION_TYPE_VALUES.includes(currentEditMode)

    const fallbackConfigurationType: ConfigurationType = isSuperAdmin ? ConfigurationType.YAML : ConfigurationType.GUI

    const currentSelectedTab = Number(params.get('selectedTab')) as DeploymentTemplateTabsType
    const isSelectedTabValid = DEPLOYMENT_TEMPLATE_TAB_VALUES.includes(currentSelectedTab)

    return {
        hideLockedKeys: params.get('hideLockedKeys') === 'true' || null,
        resolveScopedVariables: params.get('resolveScopedVariables') === 'true' || null,
        editMode: isCurrentEditModeValid ? currentEditMode : fallbackConfigurationType,
        selectedTab: isSelectedTabValid ? currentSelectedTab : DeploymentTemplateTabsType.EDIT,
        showReadMe: params.get('showReadMe') === 'true' || null,
    }
}

export const getDeploymentTemplateQueryParser =
    (isSuperAdmin: boolean): UseUrlFiltersProps<never, DeploymentTemplateQueryParamsType>['parseSearchParams'] =>
    (params) =>
        parseDeploymentTemplateQueryParams(params, isSuperAdmin)

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
