import {
    BaseURLParams,
    DeploymentTemplateTabsType,
    DTApplicationMetricsFormField,
    Progressing,
    Tooltip,
} from '@devtron-labs/devtron-fe-common-lib'
import { useParams } from 'react-router-dom'
import { DEPLOYMENT_TEMPLATE_LABELS_KEYS } from '@Components/deploymentConfig/constants'
import { ReactComponent as ICArrowRight } from '@Icons/ic-arrow-right.svg'
import { DeploymentTemplateCTAProps } from './types'

// For protect we will have a separate component
const DeploymentTemplateCTA = ({
    isLoading,
    isDisabled,
    isAppMetricsEnabled,
    showApplicationMetrics,
    showReadMe,
    selectedChart,
    selectedTab,
    isInheriting,
    isCiPipeline,
    handleSave,
    toggleAppMetrics,
}: DeploymentTemplateCTAProps) => {
    const { envId } = useParams<BaseURLParams>()

    const renderCTAContent = (): JSX.Element | string => {
        if (!envId && !isCiPipeline) {
            return (
                <>
                    Save & Next
                    <ICArrowRight className={`icon-dim-16 dc__no-shrink ${isDisabled ? 'scn-4' : 'scn-0'}`} />
                </>
            )
        }

        return 'Save changes'
    }

    return (
        <footer className="flexbox dc__content-space py-16 px-20 bcn-0 dc__border-top">
            {selectedTab === DeploymentTemplateTabsType.COMPARE && !showReadMe && <div className="w-50" />}

            <div className="flexbox dc__content-space flex-grow-1">
                <DTApplicationMetricsFormField
                    showApplicationMetrics={showApplicationMetrics}
                    isLoading={isLoading}
                    selectedChart={selectedChart}
                    isDisabled={isDisabled}
                    toggleAppMetrics={toggleAppMetrics}
                    isAppMetricsEnabled={isAppMetricsEnabled}
                    showReadMe={showReadMe}
                    selectedTab={selectedTab}
                />

                <Tooltip
                    alwaysShowTippyOnHover={isInheriting}
                    content={DEPLOYMENT_TEMPLATE_LABELS_KEYS.baseTemplate.allowOverrideText}
                >
                    <button
                        type="button"
                        className={`cta flex h-32 ${isDisabled ? 'dc__disabled' : ''}`}
                        disabled={isDisabled}
                        onClick={handleSave}
                        data-testid={
                            !envId && !isCiPipeline
                                ? 'base-deployment-template-save-and-next-button'
                                : 'base-deployment-template-save-changes-button'
                        }
                    >
                        {isLoading ? <Progressing /> : renderCTAContent()}
                    </button>
                </Tooltip>
            </div>
        </footer>
    )
}

export default DeploymentTemplateCTA
