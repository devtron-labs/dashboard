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
    showDetailedDiffState,
    hideDiffState,
    renderedInDrawer,
    ...resProps
}: DeploymentConfigDiffProps) => (
    <div className={`deployment-config-diff ${renderedInDrawer ? 'deployment-config-diff--drawer' : ''}`}>
        <DeploymentConfigDiffNavigation
            isLoading={isLoading}
            collapsibleNavList={collapsibleNavList}
            navList={navList}
            goBackURL={goBackURL}
            navHeading={navHeading}
            navHelpText={navHelpText}
            isNavHelpTextShowingError={isNavHelpTextShowingError}
            tabConfig={tabConfig}
            showDetailedDiffState={showDetailedDiffState}
            hideDiffState={hideDiffState}
        />
        <DeploymentConfigDiffMain
            isLoading={isLoading}
            configList={configList}
            showDetailedDiffState={showDetailedDiffState}
            hideDiffState={hideDiffState}
            {...resProps}
        />
    </div>
)
