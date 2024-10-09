import {
    BaseURLParams,
    Button,
    ComponentSizeType,
    DTApplicationMetricsFormField,
    InvalidYAMLTippyWrapper,
} from '@devtron-labs/devtron-fe-common-lib'
import { useParams } from 'react-router-dom'
import { ReactComponent as ICArrowRight } from '@Icons/ic-arrow-right.svg'
import { DeploymentTemplateCTAProps } from './types'

// For protect we will have a separate component
const DeploymentTemplateCTA = ({
    isLoading,
    isDisabled,
    isAppMetricsEnabled,
    showApplicationMetrics,
    selectedChart,
    isCiPipeline,
    handleSave,
    toggleAppMetrics,
    parsingError,
    restoreLastSavedYAML,
    isDryRunView,
}: DeploymentTemplateCTAProps) => {
    const { envId } = useParams<BaseURLParams>()

    const renderAppMetrics = () => {
        if (isDryRunView) {
            return (
                <DTApplicationMetricsFormField
                    isAppMetricsEnabled={isAppMetricsEnabled}
                    showApplicationMetrics={showApplicationMetrics}
                    onlyShowCurrentStatus
                />
            )
        }

        return (
            <DTApplicationMetricsFormField
                showApplicationMetrics={showApplicationMetrics}
                isLoading={isLoading}
                selectedChart={selectedChart}
                isDisabled={isDisabled}
                toggleAppMetrics={toggleAppMetrics}
                isAppMetricsEnabled={isAppMetricsEnabled}
                parsingError={parsingError}
                restoreLastSavedYAML={restoreLastSavedYAML}
            />
        )
    }

    return (
        <footer className="flexbox dc__content-space p-12 bcn-0 dc__border-top dc__align-items-center">
            <div
                className={`flexbox ${showApplicationMetrics ? 'dc__content-space' : 'dc__content-end'} dc__align-items-center flex-grow-1`}
            >
                {renderAppMetrics()}

                <InvalidYAMLTippyWrapper parsingError={parsingError} restoreLastSavedYAML={restoreLastSavedYAML}>
                    <div>
                        <Button
                            dataTestId={
                                !envId && !isCiPipeline
                                    ? 'base-deployment-template-save-and-next-button'
                                    : 'base-deployment-template-save-changes-button'
                            }
                            disabled={isDisabled}
                            onClick={handleSave}
                            isLoading={isLoading}
                            text={!envId && !isCiPipeline ? 'Save & Next' : 'Save changes'}
                            endIcon={
                                !envId && !isCiPipeline ? (
                                    <ICArrowRight
                                        className={`icon-dim-16 dc__no-shrink ${isDisabled ? 'scn-4' : 'scn-0'}`}
                                    />
                                ) : null
                            }
                            size={ComponentSizeType.medium}
                        />
                    </div>
                </InvalidYAMLTippyWrapper>
            </div>
        </footer>
    )
}

export default DeploymentTemplateCTA
