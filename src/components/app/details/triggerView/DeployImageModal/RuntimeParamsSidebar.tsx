import { CD_MATERIAL_SIDEBAR_TABS, CDMaterialSidebarType, noop } from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '@Components/common'

import { RuntimeParamsSidebarProps } from './types'

const RuntimeParamTabs = importComponentFromFELibrary('RuntimeParamTabs', null, 'function')

const RuntimeParamsSidebar = ({
    areTabsDisabled,
    currentSidebarTab,
    handleSidebarTabChange,
    runtimeParamsErrorState,
    appName,
}: RuntimeParamsSidebarProps) => (
    <div className="flexbox-col bg__primary">
        {RuntimeParamTabs && (
            <div className={`px-16 py-12 flex ${areTabsDisabled ? 'dc__disabled' : ''}`}>
                <RuntimeParamTabs
                    tabs={CD_MATERIAL_SIDEBAR_TABS}
                    initialTab={currentSidebarTab}
                    onChange={areTabsDisabled ? noop : handleSidebarTabChange}
                    hasError={{
                        [CDMaterialSidebarType.PARAMETERS]: !runtimeParamsErrorState.isValid,
                    }}
                />
            </div>
        )}

        <div className="flexbox dc__align-items-center px-16 py-8">
            <span className="dc__uppercase cn-7 fs-12 fw-6 lh-20">Application</span>
        </div>

        <div className="flexbox dc__align-items-center px-16 py-12 bg__tertiary dc__border-bottom-n1">
            <span className="cn-9 fs-13 fw-6 lh-16">{appName}</span>
        </div>
    </div>
)

export default RuntimeParamsSidebar
