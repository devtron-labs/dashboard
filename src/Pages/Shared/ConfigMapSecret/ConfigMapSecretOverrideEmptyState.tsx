import { useState } from 'react'

import NoOverrideEmptyState from '@Pages/Applications/DevtronApps/Details/AppConfigurations/MainContent/NoOverrideEmptyState'

import { ConfigMapSecretOverrideEmptyStateProps } from './types'

export const ConfigMapSecretOverrideEmptyState = ({
    handleViewInheritedConfig,
    configName,
    envName,
    componentType,
    renderFormComponent,
}: ConfigMapSecretOverrideEmptyStateProps) => {
    const [showOverridableView, setShowOverridableView] = useState(false)

    const handleCancel = () => setShowOverridableView(false)
    const handleCreateOverride = () => setShowOverridableView(true)

    return showOverridableView ? (
        renderFormComponent({ onCancel: handleCancel })
    ) : (
        <NoOverrideEmptyState
            componentType={componentType}
            configName={configName}
            environmentName={envName}
            handleCreateOverride={handleCreateOverride}
            handleViewInheritedConfig={handleViewInheritedConfig}
        />
    )
}
