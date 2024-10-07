import { CodeEditor, Progressing } from '@devtron-labs/devtron-fe-common-lib'

import { getConfigMapSecretReadOnlyValues, hasHashiOrAWS } from './utils'
import { ConfigMapSecretReadyOnlyProps } from './types'
import { renderHashiOrAwsDeprecatedInfo } from './helpers'

export const ConfigMapSecretReadyOnly = ({
    componentType,
    isJob,
    configMapSecretData,
    areScopeVariablesResolving,
    isApprover,
}: ConfigMapSecretReadyOnlyProps) => {
    const displayValues = getConfigMapSecretReadOnlyValues({
        configMapSecretData,
        componentType,
        isJob,
        isApprover,
    })

    return areScopeVariablesResolving ? (
        <Progressing fullHeight size={48} />
    ) : (
        <div className="p-16 bcn-0 h-100 flexbox-col dc__gap-12">
            {hasHashiOrAWS(configMapSecretData.externalType) && renderHashiOrAwsDeprecatedInfo()}
            <div className="dc__border br-4 py-4">
                {displayValues.configData.map(({ displayName, value }) =>
                    value ? (
                        <div key={displayName} className="px-16 py-6 flex left dc__gap-8 fs-13 lh-20">
                            <p className="m-0 w-150 cn-7">{displayName}</p>
                            <p className="m-0 flex-grow-1 cn-9">{value}</p>
                        </div>
                    ) : null,
                )}
            </div>
            {displayValues.data && (
                <div className="dc__border br-4 dc__overflow-hidden">
                    <div className="px-16 py-6 dc__border-bottom">
                        <p className="m-0 fs-13 lh-20 fw-6 cn-9">Data</p>
                    </div>
                    <CodeEditor value={displayValues.data} mode="yaml" inline height={350} readOnly />
                </div>
            )}
        </div>
    )
}
