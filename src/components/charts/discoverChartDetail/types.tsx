import { RouteComponentProps } from 'react-router'
import { ReactComponent as GotToBuildDeploy } from '../../../assets/icons/go-to-buildanddeploy@2x.svg'
import { ReactComponent as GoToEnvOverride } from '../../../assets/icons/go-to-envoverride@2x.svg'
import { DOCUMENTATION } from '../../../config'

export interface DiscoverChartDetailsProps extends RouteComponentProps<{ chartId: string }> {}

export interface DeploymentProps {
    icon?: string
    chartName?: string
    name?: string
    chartId: string
    appStoreApplicationName?: string
    deprecated: boolean
    isGitOpsConfigAvailable
    showGitOpsWarningModal
    toggleGitOpsWarningModal
    availableVersions: Map<number, { id; version }>
}

export interface PrimaryOptionType {
    icon: React.FunctionComponent<any>
    title: string
    subtitle: string
    valueType: string
    noDataSubtitle?: string[]
    helpLink?: string
}

export const ValueType = {
    PRESET: 'preset',
    DEPLOYED: 'deployed',
    NEW: 'new',
}

export const PrimaryOptions: PrimaryOptionType[] = [
    {
        icon: GotToBuildDeploy,
        title: 'Preset value',
        subtitle: 'Choose from a list of pre-defined values',
        valueType: ValueType.PRESET,
        noDataSubtitle: ['No saved values found for this chart.', 'Learn how to create and use saved values'],
        helpLink: DOCUMENTATION.CHART_DEPLOY,
    },
    {
        icon: GoToEnvOverride,
        title: 'Deployed value',
        subtitle: 'Choose from currently deployed values',
        valueType: ValueType.DEPLOYED,
        noDataSubtitle: [
            'No deployments found for this chart.',
            'If available, deployed values can be used for new deployments.',
        ],
    },
    {
        icon: GotToBuildDeploy,
        title: 'I want to start from scratch',
        subtitle: 'Start with the latest default value for this chart',
        valueType: ValueType.NEW,
    },
]
