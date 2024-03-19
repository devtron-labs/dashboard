import { LinkedCIApp } from './types'
import { DEFAULT_SHIMMER_LOADING_TABLE_ROWS } from '../../../config'

export const appListLoading: LinkedCIApp[] = Array.from(Array(DEFAULT_SHIMMER_LOADING_TABLE_ROWS).keys()).map(
    (index) => ({
        appId: index,
        appName: '',
        deploymentStatus: 'succeeded',
        environmentId: 0,
        environmentName: '',
        triggerMode: '',
    }),
)

export enum SortableKeys {
    appName = 'appName',
}
