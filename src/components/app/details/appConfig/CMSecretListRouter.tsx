import { NavLink, useHistory, useRouteMatch } from 'react-router-dom'
import React, { useEffect, useState } from 'react'
import { multiSelectStyles } from '@devtron-labs/devtron-fe-common-lib'
import Select from 'react-select'
import { CMSecretListRouterProps } from './appConfig.type'
import { APP_CONFIG_ENV_OVERRIDE_OPTIONS } from './AppConfig.utils'
import { ReactComponent as DownArrowFull } from '../../../../assets/icons/ic-down-arrow-full.svg'
import { ReactComponent as DownArrow } from '../../../../assets/icons/ic-chevron-down.svg'
import { URLS } from '../../../../config'
import cmSecretsMockData from './cm-secrets-mock'

// const baseConfigurationOption = { label: 'Base Configurations', value: -1 }

// const Options = () => {
//     return <div />
// }

const envSelectStyles = {
    ...multiSelectStyles,
    control: (base, state) => ({
        border: 'none',
        minHeight: '20px',
        display: 'grid',
        gridTemplateColumns: 'auto 20px',
        justifyContent: 'flex-start',
        gap: '4px',
        alignItems: 'center',
        // cursor: 'pointer',
        cursor: state.isDisabled ? 'not-allowed' : 'pointer',
    }),
    singleValue: (base) => ({
        ...base,
        padding: 0,
        margin: 0,
        color: 'var(--N700)',
        fontSize: '12px',
        fontWeight: '400',
    }),
    option: (base) => ({
        ...base,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    }),
    // indicatorsContainer: (base, state) => ({ ...base, height: '32px' }),
    dropdownIndicator: (base, state) => ({
        ...base,
        transition: 'all .2s ease',
        transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
        padding: 0,
    }),
    menu: (base) => ({ ...base, width: '200px' }),
}

const CMSecretListRouter = ({ environmentList }: CMSecretListRouterProps) => {
    const history = useHistory()
    const { url } = useRouteMatch()

    // @TODO: check how to use this setActiveSideNavOption
    const [activeSideNavOption, setActiveSideNavOption] = useState(
        APP_CONFIG_ENV_OVERRIDE_OPTIONS.DEPLOYMENT_TEMPLATE.key,
    )
    const [options, setOptions] = useState<{ label: string; value: number }[]>([])
    const [selectedEnv, setSelectedEnv] = useState<{ label: string; value: number }>(options[0])
    const [cmList, setCMList] = useState([])
    const [secretList, setSecretList] = useState([])
    const [configMapOptionCollapsed, setConfigMapOptionCollapsed] = useState<boolean>(false)
    const [secretOptionCollapsed, setSecretOptionCollapsed] = useState<boolean>(false)
    const [link, setLink] = useState<string>(`${url}/${URLS.APP_ENV_OVERRIDE_CONFIG}/${selectedEnv?.value}`)

    useEffect(() => {
        const opts = environmentList.map((env) => {
            return {
                label: env.environmentName,
                value: env.environmentId,
            }
        })
        setOptions(opts)

        // @TODO: Make the api call to get all the cms and secrets instead of reading it from the mock
        setCMList(cmSecretsMockData.result.resourceConfig.filter((cm) => cm.type === 'ConfigMap'))
        setSecretList(cmSecretsMockData.result.resourceConfig.filter((cs) => cs.type === 'Secret'))
        // @TODO: Check if this is needed
        setActiveSideNavOption('')
    }, [])

    useEffect(() => {
        if (selectedEnv?.value) {
            setLink(`${url}/${URLS.APP_ENV_OVERRIDE_CONFIG}/${selectedEnv?.value}`)
        }
    }, [selectedEnv?.value])

    const handleCollapsableNavOptionSelection = (navOptionKey: string) => {
        if (navOptionKey === 'configmap') {
            setConfigMapOptionCollapsed(!configMapOptionCollapsed)
        } else {
            setSecretOptionCollapsed(!secretOptionCollapsed)
        }
    }
    /**
     * Renders all of the navigation options for the selected environment
     * @returns all the options for the selected environment
     */
    const renderEnvOverrideOptions = () => {
        return (
            <div className="pb-8 bcn-0 h-100 dc__overflow-scroll">
                {Object.values(APP_CONFIG_ENV_OVERRIDE_OPTIONS).map((navOption) => {
                    if (navOption.isMulti) {
                        const options = navOption.key === 'configmap' ? cmList : secretList
                        return (
                            options.length > 0 && (
                                <React.Fragment key={`${navOption.key}`}>
                                    <h3
                                        className="cn-7 fs-12 fw-6 lh-20 m-0 pt-6 pb-6 pl-14-imp pr-18 dc__uppercase pointer"
                                        onClick={() => handleCollapsableNavOptionSelection(navOption.key)}
                                        key={`${navOption.key}`}
                                    >
                                        <DownArrowFull
                                            className="icon-dim-8 ml-6 mr-12 icon-color-grey rotate"
                                            style={{
                                                ['--rotateBy' as any]:
                                                    (navOption.key === 'configmap' && configMapOptionCollapsed) ||
                                                    (navOption.key === 'secrets' && secretOptionCollapsed)
                                                        ? '-90deg'
                                                        : '0deg',
                                            }}
                                        />
                                        {navOption.displayName}
                                    </h3>
                                    {((navOption.key === 'configmap' && !configMapOptionCollapsed) ||
                                        (navOption.key === 'secrets' && !secretOptionCollapsed)) &&
                                        options.map((_option) => {
                                            return (
                                                <div className="pt-1 pb-1 pr-10 ml-23 dc__border-left">
                                                    <NavLink
                                                        activeClassName="active"
                                                        className="app-compose__nav-item cursor"
                                                        to={`${link}/${navOption.key}/${_option.name}`}
                                                    >
                                                        {_option.name}
                                                    </NavLink>
                                                </div>
                                            )
                                        })}
                                </React.Fragment>
                            )
                        )
                    }
                    return (
                        <div
                            className={`flex left pointer ml-6 mr-6 pl-16 pr-18 fs-13 lh-20 dc__overflow-hidden dc__border-radius-4-imp ${
                                navOption.key === activeSideNavOption ? 'fw-6 cb-5 bcb-1' : 'fw-4 cn-9'
                            }`}
                            data-value={navOption.key}
                            key={navOption.key}
                        >
                            <NavLink
                                data-testid="env-deployment-template"
                                className="app-compose__nav-item cursor"
                                to={`${link}/${navOption.key}`}
                            >
                                {navOption.displayName}
                            </NavLink>
                        </div>
                    )
                })}
            </div>
        )
    }

    return (
        <div className="cm-secret-list-router dc__border-right h-100">
            <div
                data-testid="cm-secret-list-router-header"
                className="cm-secret-list-router__header flexbox dc__align-items-center pt-6"
            >
                <div
                    onClick={() => {
                        history.goBack()
                    }}
                    className="cm-secret-list-router__header__back-cta cursor dc__text-center dc__border dc__border-radius-4-imp h-20 w-20 ml-10 mt-1"
                >
                    <DownArrow className="icon-dim-16 dc__flip-90" />
                </div>
                <Select
                    value={selectedEnv}
                    options={options}
                    onChange={(selected) => {
                        // @TODO: How can we update the url with the new selected environment
                        // history.push(`${selected.label}`)
                        setSelectedEnv(selected)
                    }}
                    isSearchable
                    styles={envSelectStyles}
                    // @TODO: Check if the custom options are needed here
                    // components={{Option: }}
                />
            </div>
            <div className="dc__border-bottom-n1 mt-8 mb-8" />
            {renderEnvOverrideOptions()}
        </div>
    )
}

export default CMSecretListRouter
