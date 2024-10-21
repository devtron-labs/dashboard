import { ClipboardButton, CodeEditor, Progressing } from '@devtron-labs/devtron-fe-common-lib'

import { getConfigMapSecretReadOnlyValues, hasHashiOrAWS } from './utils'
import { ConfigMapSecretReadyOnlyProps } from './types'
import { renderHashiOrAwsDeprecatedInfo } from './helpers'

export const ConfigMapSecretReadyOnly = ({
    componentType,
    isJob,
    configMapSecretData,
    areScopeVariablesResolving,
}: ConfigMapSecretReadyOnlyProps) => {
    const displayValues = getConfigMapSecretReadOnlyValues({
        configMapSecretData,
        componentType,
        isJob,
    })

    return areScopeVariablesResolving ? (
        <Progressing fullHeight pageLoader />
    ) : (
        <div className="p-16 bcn-0 h-100 flexbox-col dc__gap-12 dc__overflow-auto">
            {hasHashiOrAWS(configMapSecretData?.externalType) && renderHashiOrAwsDeprecatedInfo()}
            <div className="configmap-secret-container__display-values-container dc__border br-4 px-16 py-10 dc__grid">
                {displayValues.configData.map(({ displayName, value }) =>
                    value ? (
                        <div key={displayName} className="dc__contents fs-13 lh-20 ">
                            <p className="m-0 w-150 cn-7">{displayName}</p>
                            <p className="m-0 flex-grow-1 cn-9 dc__word-break">{value}</p>
                        </div>
                    ) : null,
                )}
            </div>
            {displayValues.data && (
                <div className="dc__border br-4">
                    <div className="px-16 py-6 dc__border-bottom flex dc__content-space">
                        <p className="m-0 fs-13 lh-20 fw-6 cn-9">Data</p>
                        <ClipboardButton content={displayValues.data} />
                    </div>
                    <div className="dc__overflow-hidden br-4">
                        <CodeEditor value={displayValues.data} mode="yaml" inline height={350} readOnly />
                    </div>
                </div>
            )}
        </div>
    )
}
