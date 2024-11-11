import { SortingOrder } from '@Common/Constants'

import {
    AppEnvDeploymentConfigDTO,
    ConfigMapSecretDataConfigDatumDTO,
    DeploymentTemplateDTO,
    EnvResourceType,
    TemplateListDTO,
} from '@Shared/Services'

import { ManifestTemplateDTO } from '@Pages/Applications'
import { DeploymentHistoryDetail } from '../CICDHistory'
import { CollapsibleListConfig, CollapsibleListItem } from '../CollapsibleList'
import { SelectPickerProps } from '../SelectPicker'
import { CollapseProps } from '../Collapse'

export enum DeploymentConfigDiffState {
    NO_DIFF = 'noDiff',
    HAS_DIFF = 'hasDiff',
    ADDED = 'added',
    DELETED = 'deleted',
}

export interface DeploymentConfigType {
    list: DeploymentHistoryDetail
    heading: React.ReactNode
}

export interface DeploymentConfigListItem {
    id: string
    title: string
    name?: string
    pathType: EnvResourceType
    primaryConfig: DeploymentConfigType
    secondaryConfig: DeploymentConfigType
    diffState: DeploymentConfigDiffState
    singleView?: boolean
    groupHeader?: string
}

export type DeploymentConfigDiffSelectPickerProps =
    | {
          type: 'string'
          id: string
          text: string | React.ReactNode
          selectPickerProps?: never
      }
    | {
          type: 'selectPicker'
          id: string
          text?: never
          selectPickerProps: SelectPickerProps
      }

export interface DeploymentConfigDiffNavigationItem
    extends Pick<CollapsibleListItem<'navLink'>, 'href' | 'title' | 'onClick'> {
    Icon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>
    diffState: DeploymentConfigListItem['diffState']
}

export interface DeploymentConfigDiffNavigationCollapsibleItem
    extends Pick<CollapsibleListConfig<'navLink'>, 'id' | 'header' | 'noItemsText'> {
    items: DeploymentConfigDiffNavigationItem[]
}

export interface DeploymentConfigDiffProps {
    isLoading?: boolean
    errorConfig?: {
        error: boolean
        code: number
        message?: string
        redirectURL?: string
        reload: () => void
    }
    configList: DeploymentConfigListItem[]
    showDetailedDiffState?: boolean
    hideDiffState?: boolean
    headerText?: string
    scrollIntoViewId?: string
    selectorsConfig: {
        primaryConfig: DeploymentConfigDiffSelectPickerProps[]
        secondaryConfig: DeploymentConfigDiffSelectPickerProps[]
        hideDivider?: boolean
    }
    sortingConfig?: {
        sortBy: string
        sortOrder: SortingOrder
        handleSorting: () => void
    }
    navList: DeploymentConfigDiffNavigationItem[]
    collapsibleNavList: DeploymentConfigDiffNavigationCollapsibleItem[]
    goBackURL?: string
    navHeading: string
    navHelpText?: string
    isNavHelpTextShowingError?: boolean
    tabConfig?: {
        tabs: string[]
        activeTab: string
        onClick: (tab: string) => void
    }
    scopeVariablesConfig?: {
        convertVariables: boolean
        onConvertVariablesClick: () => void
    }
    renderedInDrawer?: boolean
}

export interface DeploymentConfigDiffNavigationProps
    extends Pick<
        DeploymentConfigDiffProps,
        | 'isLoading'
        | 'navList'
        | 'collapsibleNavList'
        | 'goBackURL'
        | 'navHeading'
        | 'navHelpText'
        | 'tabConfig'
        | 'errorConfig'
        | 'isNavHelpTextShowingError'
        | 'showDetailedDiffState'
        | 'hideDiffState'
    > {}

export interface DeploymentConfigDiffMainProps
    extends Pick<
        DeploymentConfigDiffProps,
        | 'isLoading'
        | 'errorConfig'
        | 'headerText'
        | 'configList'
        | 'scrollIntoViewId'
        | 'selectorsConfig'
        | 'sortingConfig'
        | 'scopeVariablesConfig'
        | 'showDetailedDiffState'
        | 'hideDiffState'
    > {}

export type DeploymentConfigDiffAccordionProps = Pick<CollapseProps, 'onTransitionEnd'> &
    Pick<DeploymentConfigDiffProps, 'showDetailedDiffState' | 'hideDiffState'> & {
        id: string
        title: string
        children: React.ReactNode
        diffState: DeploymentConfigDiffState
        isExpanded?: boolean
        onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
    }

export type DiffHeadingDataType<DeploymentTemplate> = DeploymentTemplate extends true
    ? DeploymentTemplateDTO
    : ConfigMapSecretDataConfigDatumDTO

export type AppEnvDeploymentConfigListParams<IsManifestView> = (IsManifestView extends true
    ? {
          currentList: ManifestTemplateDTO
          compareList: ManifestTemplateDTO
          compareToTemplateOptions?: never
          compareWithTemplateOptions?: never
      }
    : {
          currentList: AppEnvDeploymentConfigDTO
          compareList: AppEnvDeploymentConfigDTO
          compareToTemplateOptions?: TemplateListDTO[]
          compareWithTemplateOptions?: TemplateListDTO[]
      }) & {
    getNavItemHref: (resourceType: EnvResourceType, resourceName: string) => string
    isManifestView?: IsManifestView
    convertVariables?: boolean
}
