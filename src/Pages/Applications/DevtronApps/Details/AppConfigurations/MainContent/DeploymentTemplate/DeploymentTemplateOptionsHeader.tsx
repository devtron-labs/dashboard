import { SyntheticEvent } from 'react'
import {
    ConditionalWrap,
    ConfigurationType,
    DeploymentTemplateTabsType,
    StyledRadioGroup as RadioGroup,
    TippyCustomized,
    TippyTheme,
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
    selectedTab,
    handleChangeToGUIMode,
    handleChangeToYAMLMode,
    unableToParseYaml,
    canEditTemplate,
    restoreLastSavedTemplate,
    handleChartChange,
    chartDetails,
    selectedChart,
}: DeploymentTemplateOptionsHeaderProps) => {
    if (selectedTab === DeploymentTemplateTabsType.COMPARE || showReadMe) {
        return null
    }

    const handleChangeEditMode = (e: SyntheticEvent) => {
        const targetMode = (e.target as HTMLInputElement).value as ConfigurationType
        if (targetMode === editMode) {
            return
        }

        if (targetMode === ConfigurationType.GUI) {
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
            <span>{children}</span>
        </TippyCustomized>
    )

    const showRevertToLastSaved = unableToParseYaml && canEditTemplate

    return (
        <div className="flexbox dc__align-items-center dc__content-space pl-16 pr-16 bcn-0">
            <div className="flex">
                <DTChartSelector
                    isUnSet={isUnSet}
                    charts={chartDetails.charts}
                    chartsMetadata={chartDetails.chartsMetadata}
                    selectedChart={selectedChart}
                    selectedChartRefId={selectedChart?.chartRefId}
                    selectChart={handleChartChange}
                    disableVersionSelect={disableVersionSelect}
                />

                <ConditionalWrap condition={showRevertToLastSaved} wrap={invalidYamlTippyWrapper}>
                    <RadioGroup
                        className="gui-yaml-switch"
                        name="yaml-mode"
                        initialTab={editMode}
                        disabled={showRevertToLastSaved}
                        onChange={handleChangeEditMode}
                    >
                        <RadioGroup.Radio value={ConfigurationType.GUI} canSelect={false}>
                            GUI
                        </RadioGroup.Radio>
                        <RadioGroup.Radio
                            value={ConfigurationType.YAML}
                            canSelect={false}
                            dataTestId="base-deployment-template-advanced-button"
                            className="flexbox dc__gap-6"
                        >
                            {showRevertToLastSaved && (
                                <ErrorIcon className="icon-dim-12 dc__no-shrink dc__no-svg-stroke" />
                            )}
                            YAML
                        </RadioGroup.Radio>
                    </RadioGroup>
                </ConditionalWrap>
            </div>
        </div>
    )
}

export default DeploymentTemplateOptionsHeader
