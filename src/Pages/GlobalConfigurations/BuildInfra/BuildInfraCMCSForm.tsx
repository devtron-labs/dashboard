import { BuildInfraCMCSFormProps, CM_SECRET_STATE } from '@devtron-labs/devtron-fe-common-lib'
import { ConfigMapSecretForm } from '@Pages/Shared/ConfigMapSecret/ConfigMapSecretForm'

const BuildInfraCMCSForm = ({ parsedData, useFormProps, componentType }: BuildInfraCMCSFormProps) => (
    <ConfigMapSecretForm
        isCreateView={!parsedData.canOverride && parsedData.isOverridden}
        configMapSecretData={parsedData.initialResponse}
        inheritedConfigMapSecretData={parsedData.initialResponse}
        cmSecretStateLabel={CM_SECRET_STATE.BASE}
        isJob
        appChartRef={null}
        isApprovalPolicyConfigured={false}
        areScopeVariablesResolving={false}
        disableDataTypeChange={false}
        componentType={componentType}
        // TODO: Check if isSubmitting is required here?
        useFormProps={useFormProps}
        isExternalSubmit
    />
)

export default BuildInfraCMCSForm
