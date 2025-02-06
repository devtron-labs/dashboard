import { noop } from '@devtron-labs/devtron-fe-common-lib'
import MaterialList from '@Components/material/MaterialList'
import CIConfig from '@Components/ciConfig/CIConfig'
import { ComponentStates } from '@Pages/Shared/EnvironmentOverride/EnvironmentOverrides.types'
import { UpdateTemplateConfigProps } from './types'

const UpdateTemplateConfig = ({ formState, isJobView }: UpdateTemplateConfigProps) => {
    const stringTemplateId = formState.templateId.toString()

    return (
        <>
            <div className="divider__secondary--horizontal" />
            <div className="br-8 border__secondary bg__primary p-20 flexbox-col dc__gap-16">
                <h4 className="fs-14 fw-6 lh-20 cn-9 m-0">Code Source</h4>
                <MaterialList
                    isCreateAppView
                    respondOnSuccess={noop}
                    isWorkflowEditorUnlocked
                    toggleRepoSelectionTippy={noop}
                    setRepo={noop}
                    appId={stringTemplateId}
                    isJobView={isJobView}
                />
            </div>
            <div className="br-8 border__secondary bg__primary p-20 flexbox-col dc__gap-16">
                <h4 className="fs-14 fw-6 lh-20 cn-9 m-0">Build Configuration</h4>
                <CIConfig
                    isCreateAppView
                    appId={stringTemplateId}
                    configOverrideView={false}
                    allowOverride={false}
                    isCDPipeline={false}
                    respondOnSuccess={noop}
                    parentState={{
                        loadingState: ComponentStates.loading,
                        selectedCIPipeline: null,
                        dockerRegistries: null,
                        sourceConfig: null,
                        ciConfig: null,
                        defaultDockerConfigs: null,
                        currentCIBuildType: null,
                    }}
                    setParentState={noop}
                />
            </div>
        </>
    )
}

export default UpdateTemplateConfig
