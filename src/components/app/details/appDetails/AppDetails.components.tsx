import { generatePath, useHistory, useParams, useRouteMatch } from 'react-router-dom'
import { GroupBase } from 'react-select'

import {
    AppEnvironment,
    EnvAppsMetaDTO,
    SelectPicker,
    SelectPickerOptionType,
    SelectPickerProps,
} from '@devtron-labs/devtron-fe-common-lib'

import { AppEnvSelectorProps } from './appDetails.type'
import { getEnvOptions } from './utils'

const AppEnvDropdown = ({
    name,
    options,
    onChange,
    value,
}: Pick<SelectPickerProps, 'name' | 'options' | 'onChange' | 'value'>) => (
    <>
        <div style={{ width: 'clamp( 100px, 30%, 100px )', height: '100%', position: 'relative' }}>
            <svg
                viewBox="0 0 200 40"
                preserveAspectRatio="none"
                style={{ width: '100%', height: '100%', display: 'flex' }}
            >
                <path d="M0 20 L200 20 Z" strokeWidth="1" stroke="var(--B500)" />
                <path d="M0 10 L0, 30" strokeWidth="2" stroke="var(--B500)" />
            </svg>
            <div
                className="bcb-5 br-10 cn-0 pl-8 pr-8"
                style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
            >
                {name.slice(0, 3).toUpperCase()}
            </div>
        </div>
        <div data-testid="app-deployed-env-name" className="app-details__selector w-200 dc__zi-12">
            <SelectPicker
                inputId="app-environment-select"
                placeholder={`Select ${name}`}
                options={options}
                value={value}
                onChange={onChange}
                closeMenuOnSelect
                isSearchable
                classNamePrefix="app-environment-select"
            />
        </div>
    </>
)

const AppSelector = ({ applications }: { applications: EnvAppsMetaDTO['apps'] }) => {
    const { push } = useHistory()
    const { path } = useRouteMatch()
    const { appId, envId } = useParams<{ appId: string; envId: string }>()

    const handleOnChange = (option: SelectPickerOptionType) => {
        const newUrl = generatePath(path, { appId: option.value, envId })
        push(newUrl)
    }

    const appIdVsNameMap = applications?.reduce((agg, curr) => {
        // eslint-disable-next-line no-param-reassign
        agg[curr.appId] = curr.appName
        return agg
    }, {})

    const appOptions = (applications ?? []).map((app) => ({
        label: app.appName,
        value: app.appId,
    }))

    return (
        <AppEnvDropdown
            name="Application"
            options={appOptions}
            value={appId ? { label: appIdVsNameMap[+appId], value: +appId } : null}
            onChange={handleOnChange}
        />
    )
}

const EnvSelector = ({ environments }: { environments: AppEnvironment[] }) => {
    const { push } = useHistory()
    const { path } = useRouteMatch()
    const { appId, envId } = useParams<{ appId: string; envId: string }>()

    const handleOnChange = (option: SelectPickerOptionType) => {
        const newUrl = generatePath(path, { appId, envId: option.value })
        push(newUrl)
    }

    const envIdVsNameMap = environments?.reduce((agg, curr) => {
        // eslint-disable-next-line no-param-reassign
        agg[curr.environmentId] = curr.environmentName
        return agg
    }, {})

    const isolatedEnvOptions = (environments ?? []).filter((env) => env.isVirtualEnvironment).map(getEnvOptions)

    const envOptions: Array<GroupBase<SelectPickerOptionType<number>> | SelectPickerOptionType<number>> = [
        ...(environments ?? []).filter((env) => !env.isVirtualEnvironment).map(getEnvOptions),
        ...(isolatedEnvOptions.length
            ? [
                  {
                      label: 'Isolated Environments',
                      options: isolatedEnvOptions,
                  },
              ]
            : []),
    ]

    return (
        <AppEnvDropdown
            name="Environment"
            options={envOptions}
            value={envId ? { label: envIdVsNameMap[+envId], value: +envId } : null}
            onChange={handleOnChange}
        />
    )
}

const AppEnvSelector = ({ isAppDetailsType, environments, applications }: AppEnvSelectorProps) =>
    isAppDetailsType ? <EnvSelector environments={environments} /> : <AppSelector applications={applications} />

export default AppEnvSelector
