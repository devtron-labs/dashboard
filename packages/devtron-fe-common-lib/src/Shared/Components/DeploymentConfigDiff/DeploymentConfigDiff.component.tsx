import { DeploymentConfigDiffNavigation } from './DeploymentConfigDiffNavigation'
import { DeploymentConfigDiffMain } from './DeploymentConfigDiffMain'
import { DeploymentConfigDiffProps } from './DeploymentConfigDiff.types'
import './DeploymentConfigDiff.scss'

export const DeploymentConfigDiff = ({
    isLoading,
    configList = [],
    collapsibleNavList = [],
    navList = [],
    goBackURL,
    navHeading,
    navHelpText,
    isNavHelpTextShowingError,
    tabConfig,
    errorConfig,
    showDetailedDiffState,
    hideDiffState,
    renderedInDrawer,
    ...resProps
}: DeploymentConfigDiffProps) => (
    <div
        className={`deployment-config-diff dc__overflow-auto ${renderedInDrawer ? 'deployment-config-diff--drawer' : ''}`}
    >
        <DeploymentConfigDiffNavigation
            isLoading={isLoading}
            collapsibleNavList={collapsibleNavList}
            navList={navList}
            goBackURL={goBackURL}
            navHeading={navHeading}
            navHelpText={navHelpText}
            isNavHelpTextShowingError={isNavHelpTextShowingError}
            tabConfig={tabConfig}
            errorConfig={errorConfig}
            showDetailedDiffState={showDetailedDiffState}
            hideDiffState={hideDiffState}
        />
        <DeploymentConfigDiffMain
            isLoading={isLoading}
            configList={configList}
            errorConfig={errorConfig}
            showDetailedDiffState={showDetailedDiffState}
            hideDiffState={hideDiffState}
            {...resProps}
        />
    </div>
)
