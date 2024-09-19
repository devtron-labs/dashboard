import { useParams } from 'react-router-dom'
import {
    BaseURLParams,
    CodeEditor,
    SelectPicker,
    SelectPickerVariantType,
    Tooltip,
} from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as ICPencil } from '@Icons/ic-pencil.svg'
import { ReactComponent as ICLocked } from '@Icons/ic-locked.svg'
import { DEPLOYMENT_TEMPLATE_LABELS_KEYS } from '@Components/deploymentConfig/constants'
import { importComponentFromFELibrary } from '@Components/common'
import { DeploymentTemplateEditorHeaderProps } from './types'
import { getDTCodeEditorBackgroundClass } from './utils'
import OverrideTemplateButton from './OverrideTemplateButton'

const CompareFromApprovalSelector = importComponentFromFELibrary('CompareFromApprovalSelector', null, 'function')

const DeploymentTemplateEditorHeader = ({
    showReadMe,
    isCompareView = false,
    readOnly,
    isUnSet,
    selectedChartVersion,
    isOverridden,
    handleOverride,
    showOverrideButton,
    environmentName,
    latestDraft,
    handleCompareWithOptionChange,
    selectedCompareWithOption,
    compareWithOptions,
    isApprovalView = false,
    compareFromSelectedOptionValue,
    handleCompareFromOptionSelection,
    draftChartVersion,
    isDeleteOverrideDraftState,
}: DeploymentTemplateEditorHeaderProps) => {
    const { envId } = useParams<BaseURLParams>()

    const showEditorHeader = isCompareView || showReadMe

    const getHeadingPrefix = (): string => {
        if (latestDraft) {
            return 'Last saved draft'
        }

        if (!!envId && environmentName) {
            return environmentName
        }

        return DEPLOYMENT_TEMPLATE_LABELS_KEYS.baseTemplate.label
    }

    const renderContent = () => {
        if (showEditorHeader) {
            return (
                <CodeEditor.Header className=" flex left p-0-imp dc__border-bottom" hideDefaultSplitHeader>
                    <div className="flex column w-100">
                        <div className="flexbox w-100">
                            {isCompareView && (
                                <div className="flexbox-col dc__no-shrink dc__border-right" style={{ width: '48.5%' }}>
                                    <div className="flexbox dc__gap-8 py-6 bcn-1 px-16">
                                        <span className="cn-9 fs-12 fw-4 lh-20">Compare with:</span>

                                        <SelectPicker
                                            inputId="compare-with-template-selector"
                                            options={compareWithOptions}
                                            value={selectedCompareWithOption}
                                            onChange={handleCompareWithOptionChange}
                                            variant={SelectPickerVariantType.BORDER_LESS}
                                        />
                                        {/* OG we were supposed to show its overridden status as well but due to some issue not working from past 12 months TODO: Ask about this */}
                                    </div>

                                    {isDeleteOverrideDraftState && (
                                        <div className="flexbox-col bcr-1 pt-8 pb-8 px-16">
                                            <span className="fs-12 fw-4 cn-7 lh-16">Configuration</span>
                                            <span className="fs-13 fw-4 cn-9 lh-20">Override base</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flexbox-col flex-grow-1">
                                <div
                                    className={`flexbox px-16 py-6 dc__content-space fs-12 fw-6 cn-9 ${getDTCodeEditorBackgroundClass(!!envId, isOverridden)}`}
                                >
                                    <div className="flexbox w-100 dc__gap-8 dc__align-items-center">
                                        {isApprovalView && CompareFromApprovalSelector ? (
                                            <CompareFromApprovalSelector
                                                selectedOptionValue={compareFromSelectedOptionValue}
                                                handleCompareFromOptionSelection={handleCompareFromOptionSelection}
                                                draftChartVersion={draftChartVersion || ''}
                                                currentEditorChartVersion={selectedChartVersion || ''}
                                            />
                                        ) : (
                                            <div className="flexbox dc__gap-8 dc__align-items-center">
                                                {!readOnly && <ICPencil className="icon-dim-16 dc__no-shrink" />}

                                                <span className="cn-9 fs-12 fw-6 lh-20">
                                                    {getHeadingPrefix()}
                                                    {selectedChartVersion && ` (v${selectedChartVersion})`}
                                                </span>
                                            </div>
                                        )}

                                        {!!envId && readOnly && (
                                            <Tooltip
                                                alwaysShowTippyOnHover
                                                arrow={false}
                                                placement="top"
                                                content={
                                                    !isOverridden
                                                        ? DEPLOYMENT_TEMPLATE_LABELS_KEYS.baseTemplate.allowOverrideText
                                                        : 'Base configurations are overridden for this file'
                                                }
                                            >
                                                <div className="flex">
                                                    <ICLocked className="icon-dim-16 fcn-6 dc__no-shrink" />
                                                </div>
                                            </Tooltip>
                                        )}
                                    </div>

                                    {!!envId && !isDeleteOverrideDraftState && (
                                        <div className="flex right dc__gap-8 dc__no-shrink">
                                            <span className="fs-12 fw-4 lh-20 dc__italic-font-style">
                                                {isOverridden ? 'Overridden' : 'Inheriting from base'}
                                            </span>

                                            {showOverrideButton && (
                                                <OverrideTemplateButton
                                                    isOverridden={isOverridden}
                                                    handleOverride={handleOverride}
                                                />
                                            )}
                                        </div>
                                    )}
                                </div>

                                {isDeleteOverrideDraftState && (
                                    <div className="flexbox-col px-16 bcg-1 pt-8 pb-8">
                                        <span className="fs-12 fw-4 cn-7 lh-16">Configuration</span>
                                        <span className="fs-13 fw-4 cn-9 lh-20">Inherit from base</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </CodeEditor.Header>
            )
        }

        if (isUnSet) {
            return <CodeEditor.Warning text={DEPLOYMENT_TEMPLATE_LABELS_KEYS.codeEditor.warning} />
        }

        return null
    }

    return renderContent()
}

export default DeploymentTemplateEditorHeader
