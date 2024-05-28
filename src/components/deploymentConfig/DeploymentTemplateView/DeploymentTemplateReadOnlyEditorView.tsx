import React, { useContext } from 'react'
import { Progressing, YAMLStringify, getUnlockedJSON } from '@devtron-labs/devtron-fe-common-lib'
import YAML from 'yaml'
import { DeploymentConfigContextType, DeploymentTemplateReadOnlyEditorViewProps } from '../types'
import CodeEditor from '../../CodeEditor/CodeEditor'
import { DEPLOYMENT, MODES, ROLLOUT_DEPLOYMENT } from '../../../config'
import { MarkDown } from '../../charts/discoverChartDetail/DiscoverChartDetails'
import { DeploymentConfigContext } from '../DeploymentConfig'
import DeploymentTemplateGUIView from './DeploymentTemplateGUIView'
import { importComponentFromFELibrary } from '../../common'

const applyPatches = importComponentFromFELibrary('applyPatches', null, 'function')

export default function DeploymentTemplateReadOnlyEditorView({
    value,
    isEnvOverride,
    lockedConfigKeysWithLockType,
    hideLockedKeys,
    removedPatches,
}: DeploymentTemplateReadOnlyEditorViewProps) {
    const { state } = useContext<DeploymentConfigContextType>(DeploymentConfigContext)

    // filtereing the locked keys from the yaml
    if (applyPatches) {
        if (hideLockedKeys) {
            const filteredValue = getUnlockedJSON(YAML.parse(value), lockedConfigKeysWithLockType.config ?? [], false)
            removedPatches.current = filteredValue.removedPatches
            value = YAMLStringify(filteredValue.newDocument)
        } else {
            value = YAMLStringify(applyPatches(YAML.parse(value), removedPatches.current))
        }
    }

    const renderCodeEditor = (): JSX.Element => {
        return (
            <div className="form__row--code-editor-container dc__border-top-n1 dc__border-bottom read-only-mode">
                <CodeEditor
                    value={value}
                    mode={MODES.YAML}
                    validatorSchema={state.schema}
                    loading={state.chartConfigLoading || value === undefined || value === null}
                    height={isEnvOverride ? 'calc(100vh - 251px)' : 'calc(100vh - 218px)'}
                    readOnly
                />
            </div>
        )
    }

    return state.yamlMode ||
        (state.selectedChart?.name !== ROLLOUT_DEPLOYMENT && state.selectedChart?.name !== DEPLOYMENT) ? (
        <>
            {state.showReadme && (
                <div className="dt-readme dc__border-right dc__border-bottom-imp">
                    <div className="code-editor__header flex left fs-12 fw-6 cn-9">Readme</div>
                    {state.chartConfigLoading ? (
                        <Progressing pageLoader />
                    ) : (
                        <MarkDown markdown={state.readme} className="dt-readme-markdown" />
                    )}
                </div>
            )}
            {renderCodeEditor()}
        </>
    ) : (
        <DeploymentTemplateGUIView value={value} readOnly />
    )
}
