import { CDMaterialSidebarType } from '@devtron-labs/devtron-fe-common-lib'

import { FilterConditionViews } from '../types'
import { DeployViewStateType } from './types'

export const INITIAL_DEPLOY_VIEW_STATE: DeployViewStateType = {
    searchText: '',
    appliedSearchText: '',
    filterView: FilterConditionViews.ALL,
    showConfiguredFilters: false,
    currentSidebarTab: CDMaterialSidebarType.IMAGE,
    runtimeParamsErrorState: {
        isValid: true,
        cellError: {},
    },
    materialInEditModeMap: new Map(),
    showAppliedFilters: false,
    appliedFilterList: [],
    isLoadingOlderImages: false,
    showSearchBar: true,
}
