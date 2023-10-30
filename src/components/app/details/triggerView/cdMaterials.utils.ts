import { CDMaterialResponseType, CDMaterialType, FilterStates } from '@devtron-labs/devtron-fe-common-lib'
import { FilterConditionViews, MATERIAL_TYPE } from './types'
import { LAST_SAVED_CONFIG_OPTION, SPECIFIC_TRIGGER_CONFIG_OPTION } from './TriggerView.utils'

export const getInitialState = (materialType: string, material: CDMaterialType[], searchImageTag: string) => ({
    isSecurityModuleInstalled: false,
    checkingDiff: false,
    diffFound: false,
    diffOptions: null,
    showConfigDiffView: false,
    loadingMore: false,
    showOlderImages: true,
    selectedConfigToDeploy:
        materialType === MATERIAL_TYPE.rollbackMaterialList ? SPECIFIC_TRIGGER_CONFIG_OPTION : LAST_SAVED_CONFIG_OPTION,
    selectedMaterial: material.find((_mat) => _mat.isSelected),
    isRollbackTrigger: materialType === MATERIAL_TYPE.rollbackMaterialList,
    recentDeploymentConfig: null,
    latestDeploymentConfig: null,
    specificDeploymentConfig: null,
    isSelectImageTrigger: materialType === MATERIAL_TYPE.inputMaterialList,
    materialInEditModeMap: new Map<number, boolean>(),
    showSearch: !!searchImageTag,
    areMaterialsPassingFilters:
        material.filter((materialDetails) => materialDetails.filterState === FilterStates.ALLOWED).length > 0,
    searchApplied: !!searchImageTag,
    searchText: searchImageTag ?? '',
    showConfiguredFilters: false,
    filterView: FilterConditionViews.ELIGIBLE,
    resourceFilters: [],
})

export const abortEarlierRequests = (
    abortControllerRef: React.MutableRefObject<AbortController>,
    callback: Function,
): Promise<CDMaterialResponseType> => {
    abortControllerRef.current.abort()
    abortControllerRef.current = new AbortController()
    return callback()
}
