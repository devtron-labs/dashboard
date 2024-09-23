import { DeploymentTemplateQueryParamsType } from '@devtron-labs/devtron-fe-common-lib'
import { FunctionComponent } from 'react'

export interface ConfigHeaderProps extends Pick<DeploymentTemplateQueryParamsType, 'configHeaderTab'> {
    handleTabChange: (tab: DeploymentTemplateQueryParamsType['configHeaderTab']) => void
}
export interface ConfigHeaderTabProps extends Pick<ConfigHeaderProps, 'handleTabChange'> {
    tab: DeploymentTemplateQueryParamsType['configHeaderTab']
    activeTabIndex: number
    currentTabIndex: number
}

export interface ConfigHeaderTabConfigType {
    text: string
    icon?: FunctionComponent<React.SVGProps<SVGSVGElement>> | null
}
