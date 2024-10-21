import { ConfigurationType, InvalidYAMLTippyWrapper, Toggle } from '@devtron-labs/devtron-fe-common-lib'
import DTChartSelector from './DTChartSelector'
import { DeploymentTemplateOptionsHeaderProps } from './types'

const DeploymentTemplateOptionsHeader = ({
    disableVersionSelect,
    editMode,
    showReadMe,
    isUnSet,
    handleChangeToGUIMode,
    handleChangeToYAMLMode,
    parsingError,
    restoreLastSavedTemplate,
    handleChartChange,
    chartDetails,
    selectedChart,
    isCompareView,
    isGuiSupported,
    areChartsLoading,
    showDeleteOverrideDraftEmptyState,
}: DeploymentTemplateOptionsHeaderProps) => {
    if (isCompareView || showReadMe || showDeleteOverrideDraftEmptyState) {
        return null
    }

    const handleToggleEditMode = () => {
        if (editMode === ConfigurationType.YAML) {
            handleChangeToGUIMode()
            return
        }

        handleChangeToYAMLMode()
    }

    return (
        <div className="flexbox dc__align-items-center dc__content-space bcn-0 dc__gap-8">
            {isGuiSupported && (
                <>
                    <div className="flexbox dc__align-items-center dc__gap-6">
                        <InvalidYAMLTippyWrapper
                            parsingError={parsingError}
                            restoreLastSavedYAML={restoreLastSavedTemplate}
                        >
                            <div className="w-24 h-16">
                                <Toggle
                                    selected={editMode === ConfigurationType.YAML}
                                    onSelect={handleToggleEditMode}
                                    dataTestId="dt-switch-gui-yaml-mode"
                                    disabled={!!parsingError}
                                />
                            </div>
                        </InvalidYAMLTippyWrapper>

                        <span className="cn-7 fs-12 fw-4 lh-20">YAML</span>
                    </div>

                    <div className="dc__border-right-n1 h-16" />
                </>
            )}

            <DTChartSelector
                isUnSet={isUnSet}
                charts={chartDetails.charts}
                chartsMetadata={chartDetails.chartsMetadata}
                selectedChart={selectedChart}
                selectedChartRefId={selectedChart?.chartRefId}
                selectChart={handleChartChange}
                disableVersionSelect={disableVersionSelect}
                areChartsLoading={areChartsLoading}
                parsingError={parsingError}
                restoreLastSavedTemplate={restoreLastSavedTemplate}
            />
        </div>
    )
}

export default DeploymentTemplateOptionsHeader
