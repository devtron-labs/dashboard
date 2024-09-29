import { useParams } from 'react-router-dom'
import {
    APIResponseHandler,
    BaseURLParams,
    CodeEditor,
    DryRunEditorMode,
    GenericEmptyState,
    getDeploymentManifest,
    MODES,
    useAsync,
} from '@devtron-labs/devtron-fe-common-lib'
import { importComponentFromFELibrary } from '@Components/common'
import { ReactComponent as ICFilePlay } from '@Icons/ic-file-play.svg'
// FIXME: Placeholder icon since no sense of git merge icon as of now
import { ReactComponent as ICFileCode } from '@Icons/ic-file-code.svg'
import noArtifact from '@Images/no-artifact@2x.png'
import ToggleResolveScopedVariables from './ToggleResolveScopedVariables'
import { ConfigDryRunProps } from './types'

const DryRunEditorModeSelect = importComponentFromFELibrary('DryRunEditorModeSelect', null, 'function')

const ConfigDryRun = ({
    isLoading,
    handleToggleResolveScopedVariables,
    resolveScopedVariables,
    showManifest,
    editorTemplate,
    chartRefId,
    editorSchema,
    selectedChartVersion,
    dryRunEditorMode,
    handleChangeDryRunEditorMode,
    isDraftPresent,
    isPublishedConfigPresent,
}: ConfigDryRunProps) => {
    const { envId, appId } = useParams<BaseURLParams>()

    const [isManifestLoading, manifestResponse, manifestError, reloadManifest] = useAsync(
        () =>
            getDeploymentManifest({
                appId: +appId,
                envId: envId ? +envId : null,
                // Should this even be required?
                chartRefId,
                values: editorTemplate,
            }),
        [appId, envId, chartRefId, editorTemplate, showManifest, isLoading],
        !!showManifest && !isLoading && !!editorTemplate,
    )

    const renderEditorBody = () => {
        if (isDraftPresent && dryRunEditorMode === DryRunEditorMode.PUBLISHED_VALUES && !isPublishedConfigPresent) {
            return (
                <GenericEmptyState
                    image={noArtifact}
                    title="No published version"
                    subTitle="Published override for this file does not exist"
                />
            )
        }

        return (
            <CodeEditor
                value={editorTemplate}
                height="100%"
                readOnly
                mode={MODES.YAML}
                noParsing
                loading={isLoading}
                {...(editorSchema && { schema: editorSchema })}
                {...(selectedChartVersion && { chartVersion: selectedChartVersion?.replace(/\./g, '-') })}
            />
        )
    }

    return (
        <div className={`${showManifest ? 'dc__grid-half h-100' : 'flexbox-col w-100 h-100'}`}>
            <div className="flexbox-col">
                <div className="py-6 px-12 flexbox dc__content-space dc__border-bottom">
                    <div className="flexbox dc__gap-8">
                        <ICFileCode className="dc__no-shrink scn-9 icon-dim-16" />
                        {DryRunEditorModeSelect && isDraftPresent ? (
                            <DryRunEditorModeSelect
                                selectedOptionValue={dryRunEditorMode}
                                handleChangeDryRunEditorMode={handleChangeDryRunEditorMode}
                            />
                        ) : (
                            <span className="cn-9 fs-12 fw-6 lh-20">Values</span>
                        )}
                    </div>

                    <ToggleResolveScopedVariables
                        handleToggleScopedVariablesView={handleToggleResolveScopedVariables}
                        resolveScopedVariables={resolveScopedVariables}
                    />
                </div>

                {renderEditorBody()}
            </div>

            {showManifest && (
                <div className="flexbox-col dc__border-left">
                    <div className="py-6 px-12 flexbox dc__gap-8 dc__border-bottom">
                        <ICFilePlay className="icon-dim-16 dc__no-shrink scn-9" />
                        <span className="cn-9 fs-12 fw-6 lh-20">Manifest generated from merged</span>
                    </div>

                    <APIResponseHandler
                        isLoading={isManifestLoading}
                        error={manifestError}
                        genericSectionErrorProps={{
                            reload: reloadManifest,
                            rootClassName: 'flex-grow-1',
                        }}
                    >
                        <CodeEditor
                            value={manifestResponse?.result?.data || ''}
                            height="100%"
                            mode={MODES.YAML}
                            readOnly
                            noParsing
                        />
                    </APIResponseHandler>
                </div>
            )}
        </div>
    )
}

export default ConfigDryRun
