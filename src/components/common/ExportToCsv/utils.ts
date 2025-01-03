import { ExportConfigurationProps } from './types'

export const getDefaultValueFromConfiguration = <ConfigValueType extends string>(
    configuration: ExportConfigurationProps<ConfigValueType>['configuration'],
): ExportConfigurationProps<ConfigValueType>['selectedConfig'] =>
    configuration?.options.reduce<ExportConfigurationProps<ConfigValueType>['selectedConfig']>(
        (acc, { value }) => {
            acc[value] = true

            return acc
        },
        {} as ExportConfigurationProps<ConfigValueType>['selectedConfig'],
    ) ?? ({} as ExportConfigurationProps<ConfigValueType>['selectedConfig'])
