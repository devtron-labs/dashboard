import { CIMaterialSidebarType } from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '@Components/common'

import MaterialSource from '../MaterialSource'
import { TriggerBuildSidebarProps } from './types'

const RuntimeParamTabs = importComponentFromFELibrary('RuntimeParamTabs', null, 'function')

const TriggerBuildSidebar = ({
    currentSidebarTab,
    handleSidebarTabChange,
    runtimeParamsErrorState,
    materialList,
    selectMaterial,
    clearSearch,
    refreshMaterial,
    ciNodeId,
}: TriggerBuildSidebarProps) => {
    const sidebarTabs = Object.values(CIMaterialSidebarType).map((tabValue) => ({
        value: tabValue,
        label: tabValue,
    }))

    return (
        <div className="material-list dc__overflow-hidden flexbox-col flex-grow-1 mh-0">
            {RuntimeParamTabs ? (
                <div className="flex pt-12 pb-12 pl-16 pr-16 dc__gap-4">
                    <RuntimeParamTabs
                        tabs={sidebarTabs}
                        initialTab={currentSidebarTab}
                        onChange={handleSidebarTabChange}
                        hasError={{
                            [CIMaterialSidebarType.PARAMETERS]: !runtimeParamsErrorState.isValid,
                        }}
                    />
                </div>
            ) : (
                <div className="material-list__title material-list__title--border-bottom pt-12 pb-12 pl-20 pr-20">
                    Git Repository
                </div>
            )}

            <MaterialSource
                material={materialList}
                selectMaterial={selectMaterial}
                refreshMaterial={{
                    pipelineId: ciNodeId,
                    refresh: refreshMaterial,
                }}
                clearSearch={clearSearch}
            />
        </div>
    )
}

export default TriggerBuildSidebar
