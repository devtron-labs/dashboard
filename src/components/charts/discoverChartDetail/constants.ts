import { ReactComponent as GotToBuildDeploy } from '../../../assets/icons/go-to-buildanddeploy.svg'
import { ReactComponent as GoToEnvOverride } from '../../../assets/icons/go-to-envoverride.svg'
import { DOCUMENTATION } from '../../../config'
import { PrimaryOptionType } from './types'

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
        noDataSubtitle: ['No preset values found for this chart.', 'Learn how to create and use preset values'],
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
