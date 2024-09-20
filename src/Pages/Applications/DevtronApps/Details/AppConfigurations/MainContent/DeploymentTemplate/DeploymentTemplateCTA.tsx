import {
    BaseURLParams,
    Button,
    DeploymentTemplateTabsType,
    DTApplicationMetricsFormField,
} from '@devtron-labs/devtron-fe-common-lib'
import { useParams } from 'react-router-dom'
import { ReactComponent as ICArrowRight } from '@Icons/ic-arrow-right.svg'
import { DeploymentTemplateCTAProps } from './types'
import { DEPLOYMENT_TEMPLATE_LABELS_KEYS } from './constants'

// For protect we will have a separate component
const DeploymentTemplateCTA = ({
    isLoading,
    isDisabled,
    isAppMetricsEnabled,
    showApplicationMetrics,
    showReadMe,
    selectedChart,
    selectedTab,
    shouldDisableEditingInheritedTemplate,
    isCiPipeline,
    handleSave,
    toggleAppMetrics,
}: DeploymentTemplateCTAProps) => {
    const { envId } = useParams<BaseURLParams>()

    return (
        <footer className="flexbox dc__content-space py-16 px-20 bcn-0 dc__border-top dc__align-items-center">
            {selectedTab === DeploymentTemplateTabsType.COMPARE && !showReadMe && <div className="w-50" />}

            <div
                className={`flexbox ${showApplicationMetrics ? 'dc__content-space' : 'dc__content-end'} dc__align-items-center flex-grow-1`}
            >
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

                <Button
                    dataTestId={
                        !envId && !isCiPipeline
                            ? 'base-deployment-template-save-and-next-button'
                            : 'base-deployment-template-save-changes-button'
                    }
                    disabled={isDisabled || shouldDisableEditingInheritedTemplate}
                    onClick={handleSave}
                    isLoading={isLoading}
                    text={!envId && !isCiPipeline ? 'Save & Next' : 'Save changes'}
                    showTooltip={shouldDisableEditingInheritedTemplate}
                    tooltipProps={{
                        content: DEPLOYMENT_TEMPLATE_LABELS_KEYS.baseTemplate.allowOverrideText,
                    }}
                    startIcon={
                        !envId && !isCiPipeline ? (
                            <ICArrowRight className={`icon-dim-16 dc__no-shrink ${isDisabled ? 'scn-4' : 'scn-0'}`} />
                        ) : null
                    }
                />
            </div>
        </footer>
    )
}

export default DeploymentTemplateCTA
