import { importComponentFromFELibrary } from '@Components/common'
import { ReactComponent as ICCheck } from '@Icons/ic-check.svg'
import { ReactComponent as ICFileEdit } from '@Icons/ic-file-edit.svg'
import { DeploymentHistoryDiffView, ErrorScreenManager } from '@devtron-labs/devtron-fe-common-lib'
import { CompareConfigViewProps } from './types'
import { getCompareViewHistoryDiffConfigProps } from './utils'

const CompareFromApprovalSelector = importComponentFromFELibrary('CompareFromApprovalSelector', null, 'function')

const CompareConfigView = ({
    compareFromSelectedOptionValue,
    handleCompareFromOptionSelection,
    isApprovalView,
    currentEditorConfig,
    currentEditorTemplate,
    publishedEditorConfig,
    publishedEditorTemplate,
    selectedChartVersion,
    draftChartVersion,
    isDeleteOverrideView,
    editorKey = `${compareFromSelectedOptionValue || 'compare'}-draft-editor-key`,
    className = '',
    errorInfo,
    handleErrorReload,
    displayName,
}: CompareConfigViewProps) => (
    <div className={`flexbox-col ${className ?? ''}`}>
        <div className="dc__grid-half bg__primary dc__position-sticky dc__top-0 dc__zi-10">
            <div className="dc__border-right px-12 py-6 flexbox dc__gap-8 dc__border-bottom dc__align-items-center">
                <ICCheck className="scn-9 icon-dim-16 dc__no-shrink" />
                <span className="cn-9 fs-12 fw-6 lh-20">Published</span>
            </div>

            <div className="px-12 py-6 dc__gap-8 dc__border-bottom flexbox dc__align-items-center">
                {CompareFromApprovalSelector && isApprovalView ? (
                    <CompareFromApprovalSelector
                        selectedOptionValue={compareFromSelectedOptionValue}
                        handleCompareFromOptionSelection={handleCompareFromOptionSelection}
                        draftChartVersion={draftChartVersion || ''}
                        currentEditorChartVersion={selectedChartVersion || ''}
                        isDeleteOverrideView={isDeleteOverrideView}
                    />
                ) : (
                    <>
                        <ICFileEdit className="scn-9 icon-dim-16 dc__no-shrink" />
                        <span className="cn-9 fs-12 fw-6 lh-20">Unsaved draft</span>
                    </>
                )}
            </div>
        </div>

        {errorInfo ? (
            <div className="flex flex-grow-1">
                <ErrorScreenManager code={errorInfo.code} reload={handleErrorReload} />
            </div>
        ) : (
            <div className="p-16">
                <DeploymentHistoryDiffView
                    key={editorKey}
                    currentConfiguration={getCompareViewHistoryDiffConfigProps(
                        publishedEditorTemplate,
                        publishedEditorConfig,
                        displayName,
                    )}
                    baseTemplateConfiguration={getCompareViewHistoryDiffConfigProps(
                        currentEditorTemplate,
                        currentEditorConfig,
                        displayName,
                    )}
                    previousConfigAvailable
                />
            </div>
        )}
    </div>
)

export default CompareConfigView
