import { DEFAULT_SHIMMER_LOADING_TABLE_ROWS } from '../../../../../config'
import { PermissionGroup } from '../../types'

// eslint-disable-next-line import/prefer-default-export
export const permissionGroupLoading: PermissionGroup[] = Array.from(
    Array(DEFAULT_SHIMMER_LOADING_TABLE_ROWS).keys(),
).map((index) => ({
    id: index,
    name: '',
    roleFilters: [],
    superAdmin: false,
}))

export enum SortableKeys {
    name = 'name',
}
