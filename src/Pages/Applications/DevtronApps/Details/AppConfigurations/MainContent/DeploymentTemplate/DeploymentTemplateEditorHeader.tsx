import { useParams } from 'react-router-dom'
import { BaseURLParams, CodeEditor, Tooltip } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as ICPencil } from '@Icons/ic-pencil.svg'
import { ReactComponent as ICLocked } from '@Icons/ic-locked.svg'
import { DEPLOYMENT_TEMPLATE_LABELS_KEYS } from '@Components/deploymentConfig/constants'
import { DeploymentTemplateEditorHeaderProps } from './types'
import { getDTCodeEditorBackgroundClass } from './utils'
import OverrideTemplateButton from './OverrideTemplateButton'

const DeploymentTemplateEditorHeader = ({
    showReadMe,
    isCompareView,
    readOnly,
    isUnSet,
    selectedChartVersion,
    isOverridden,
    handleOverride,
    showOverrideButton,
    environmentName,
    latestDraft,
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
                    <div
                        className={`flexbox fs-12 fw-6 cn-9 pl-12 pr-12 flex-grow-1 py-6 ${getDTCodeEditorBackgroundClass(!!envId, isOverridden)}`}
                    >
                        <div className="flexbox dc__content-space w-100 dc__gap-8 dc__align-items-center">
                            <div className="flexbox dc__gap-8 dc__align-items-center">
                                {!readOnly && <ICPencil className="icon-dim-16 dc__no-shrink" />}

                                <span className="cn-9 fs-12 fw-6 lh-20">
                                    {getHeadingPrefix()}
                                    {selectedChartVersion && ` (v${selectedChartVersion})`}
                                </span>
                            </div>

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

                        {!!envId && (
                            <div className="flex right dc__gap-8 dc__no-shrink">
                                {/* TODO: Add delete override from compare mode */}
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
                </CodeEditor.Header>
            )
        }

        return (
            <>
                {isUnSet && <CodeEditor.Warning text={DEPLOYMENT_TEMPLATE_LABELS_KEYS.codeEditor.warning} />}
                {/* Hello Work */}
            </>
        )
    }

    return renderContent()
}

export default DeploymentTemplateEditorHeader
