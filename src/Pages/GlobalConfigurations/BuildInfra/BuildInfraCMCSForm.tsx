import { BuildInfraCMCSFormProps } from '@devtron-labs/devtron-fe-common-lib'
import { ConfigMapSecretForm } from '@Pages/Shared/ConfigMapSecret/ConfigMapSecretForm'

const BuildInfraCMCSForm = ({ parsedData, useFormProps, componentType }: BuildInfraCMCSFormProps) => (
    <ConfigMapSecretForm
        isCreateView={!parsedData.canOverride && parsedData.isOverridden}
        configMapSecretData={parsedData.initialResponse}
        inheritedConfigMapSecretData={parsedData.initialResponse}
        cmSecretStateLabel={null}
        isJob
        appChartRef={null}
        isApprovalPolicyConfigured={false}
        areScopeVariablesResolving={false}
        disableDataTypeChange={false}
        componentType={componentType}
        useFormProps={useFormProps}
        isExternalSubmit
        noContainerPadding
    />
)

export default BuildInfraCMCSForm
