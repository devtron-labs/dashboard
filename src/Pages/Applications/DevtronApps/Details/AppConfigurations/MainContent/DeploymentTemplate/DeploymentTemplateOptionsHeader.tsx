import {
    ConditionalWrap,
    ConfigurationType,
    TippyCustomized,
    TippyTheme,
    Toggle,
} from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as ErrorIcon } from '@Icons/ic-error-exclamation.svg'
import { ReactComponent as RestoreIcon } from '@Icons/ic-arrow-anticlockwise.svg'
import DTChartSelector from './DTChartSelector'
import { DeploymentTemplateOptionsHeaderProps } from './types'

const DeploymentTemplateOptionsHeader = ({
    disableVersionSelect,
    editMode,
    showReadMe,
    isUnSet,
    handleChangeToGUIMode,
    handleChangeToYAMLMode,
    unableToParseYaml,
    canEditTemplate,
    restoreLastSavedTemplate,
    handleChartChange,
    chartDetails,
    selectedChart,
    isCompareView,
    isGuiSupported,
    areChartsLoading,
}: DeploymentTemplateOptionsHeaderProps) => {
    if (isCompareView || showReadMe) {
        return null
    }

    const handleToggleEditMode = () => {
        if (editMode === ConfigurationType.YAML) {
            handleChangeToGUIMode()
            return
        }

        handleChangeToYAMLMode()
    }

    const getRestoreLastSavedCTA = () => (
        <button
            className="dc__transparent flex dc__gap-4 left fs-13 fw-6 cb-5 pb-12 pl-12 pr-12 cursor dc_width-max-content"
            type="button"
            onClick={restoreLastSavedTemplate}
        >
            <RestoreIcon className="icon-dim-14 scb-5" /> Restore last saved YAML
        </button>
    )

    const invalidYamlTippyWrapper = (children) => (
        <TippyCustomized
            theme={TippyTheme.white}
            className="w-250"
            placement="bottom"
            Icon={ErrorIcon}
            heading="Invalid YAML"
            infoText="The provided YAML is invalid. GUI view can only be generated for a valid YAML."
            additionalContent={getRestoreLastSavedCTA()}
            trigger="mouseenter click"
            interactive
            showCloseButton
        >
            <div>{children}</div>
        </TippyCustomized>
    )

    const showRevertToLastSaved = unableToParseYaml && canEditTemplate

    return (
        <div className="flexbox dc__align-items-center dc__content-space bcn-0 dc__gap-8">
            {isGuiSupported && (
                <>
                    <div className="flexbox dc__align-items-center dc__gap-6">
                        <ConditionalWrap condition={showRevertToLastSaved} wrap={invalidYamlTippyWrapper}>
                            <div className="w-24 h-16">
                                <Toggle
                                    selected={editMode === ConfigurationType.YAML}
                                    onSelect={handleToggleEditMode}
                                    dataTestId="dt-switch-gui-yaml-mode"
                                    disabled={showRevertToLastSaved}
                                />
                            </div>
                        </ConditionalWrap>

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
            />
        </div>
    )
}

export default DeploymentTemplateOptionsHeader
