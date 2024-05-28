import React from 'react'
import { PluginType, PluginDetailType, VariableType } from '@devtron-labs/devtron-fe-common-lib'
import { PluginCard } from './PluginCard'

export const PluginCardListContainer = ({
    pluginListTitle,
    pluginList,
    setPluginType,
}: {
    pluginListTitle: string
    pluginList: PluginDetailType[]
    setPluginType: (
        PluginType: PluginType,
        pluginId: number,
        pluginName: string,
        pluginDescription: string,
        inputVariables: VariableType[],
        outputVariables: VariableType[],
    ) => void
}) => {
    return (
        pluginList.length > 0 && (
            <div className="plugin-container">
                <div data-testid="preset-plugin-heading" className="cn-5 fw-6 fs-13 mt-20 mb-8">
                    {pluginListTitle}
                </div>
                {pluginList.map((pluginDetails) => (
                    <div
                        key={pluginDetails.id}
                        onClick={() =>
                            setPluginType(
                                PluginType.PLUGIN_REF,
                                pluginDetails.id,
                                pluginDetails.name,
                                pluginDetails.description,
                                pluginDetails.inputVariables ?? [],
                                pluginDetails.outputVariables ?? [],
                            )
                        }
                    >
                        <PluginCard
                            dataTestId={`${pluginDetails.name}-button`}
                            imgSource={pluginDetails.icon}
                            title={pluginDetails.name}
                            subTitle={pluginDetails.description}
                            tags={pluginDetails.tags}
                        />
                    </div>
                ))}
            </div>
        )
    )
}
