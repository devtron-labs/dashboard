import { SortingOrder } from '@Common/Constants'

import {
    AppEnvDeploymentConfigDTO,
    ConfigMapSecretDataConfigDatumDTO,
    DeploymentTemplateDTO,
    EnvResourceType,
    ManifestTemplateDTO,
} from '@Shared/Services'

import { DeploymentHistoryDetail } from '../CICDHistory'
import { CollapsibleListConfig, CollapsibleListItem } from '../CollapsibleList'
import { SelectPickerProps } from '../SelectPicker'
import { CollapseProps } from '../Collapse'

export interface DeploymentConfigType {
    list: DeploymentHistoryDetail
    heading: React.ReactNode
}

export interface DeploymentConfigListItem {
    id: string
    title: string
    primaryConfig: DeploymentConfigType
    secondaryConfig: DeploymentConfigType
    hasDiff?: boolean
    isDeploymentTemplate?: boolean
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

export interface DeploymentConfigDiffNavigationItem extends Pick<CollapsibleListItem, 'href' | 'title' | 'onClick'> {
    hasDiff?: boolean
}

export interface DeploymentConfigDiffNavigationCollapsibleItem
    extends Pick<CollapsibleListConfig, 'id' | 'header' | 'noItemsText'> {
    items: DeploymentConfigDiffNavigationItem[]
}

export interface DeploymentConfigDiffProps {
    isLoading?: boolean
    errorConfig?: {
        error: boolean
        code: number
        reload: () => void
    }
    configList: DeploymentConfigListItem[]
    headerText?: string
    scrollIntoViewId?: string
    selectorsConfig: {
        primaryConfig: DeploymentConfigDiffSelectPickerProps[]
        secondaryConfig: DeploymentConfigDiffSelectPickerProps[]
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
    tabConfig?: {
        tabs: string[]
        activeTab: string
        onClick: (tab: string) => void
    }
}

export interface DeploymentConfigDiffNavigationProps
    extends Pick<
        DeploymentConfigDiffProps,
        'isLoading' | 'navList' | 'collapsibleNavList' | 'goBackURL' | 'navHeading' | 'navHelpText' | 'tabConfig'
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
    > {}

export interface DeploymentConfigDiffAccordionProps extends Pick<CollapseProps, 'onTransitionEnd'> {
    id: string
    title: string
    children: React.ReactNode
    hasDiff?: boolean
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
          sortOrder?: never
      }
    : {
          currentList: AppEnvDeploymentConfigDTO
          compareList: AppEnvDeploymentConfigDTO
          sortOrder?: SortingOrder
      }) & {
    getNavItemHref: (resourceType: EnvResourceType, resourceName: string) => string
    isManifestView?: IsManifestView
}
