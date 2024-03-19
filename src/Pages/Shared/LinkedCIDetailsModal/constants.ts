import { getCommonSelectStyle } from '@devtron-labs/devtron-fe-common-lib'
import { LinkedCIApp } from './types'
import { DEFAULT_SHIMMER_LOADING_TABLE_ROWS, DEPLOYMENT_STATUS, SELECT_ALL_VALUE, TriggerType } from '../../../config'

export const appListLoading: LinkedCIApp[] = Array.from(Array(DEFAULT_SHIMMER_LOADING_TABLE_ROWS).keys()).map(
    (index) => ({
        appId: index,
        appName: '',
        deploymentStatus: DEPLOYMENT_STATUS.SUCCEEDED,
        environmentId: 0,
        environmentName: '',
        triggerMode: TriggerType.Auto,
    }),
)

export enum SortableKeys {
    appName = 'app_name',
}

export const ALL_ENVIRONMENT_OPTION = { label: 'All Environments', value: SELECT_ALL_VALUE }

export const ENVIRONMENT_FILTER_SEARCH_KEY = 'environment'

const commonStyles = getCommonSelectStyle()

export const environmentFilterDropdownStyles = {
    ...commonStyles,
    control: (base, state) => ({
        ...commonStyles.control(base, state),
        width: 200,
        height: 32,
        minHeight: 32,
    }),
    menu: (base) => ({
        ...base,
        zIndex: 5,
    }),
}
