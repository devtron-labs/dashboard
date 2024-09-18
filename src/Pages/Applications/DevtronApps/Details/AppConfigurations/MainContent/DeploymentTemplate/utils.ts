import { handleUTCTime, TemplateListDTO, TemplateListType } from '@devtron-labs/devtron-fe-common-lib'

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
