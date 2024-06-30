import React, { useContext } from 'react'
import { TippyCustomized, TippyTheme, OptionType } from '@devtron-labs/devtron-fe-common-lib'
import ReactSelect from 'react-select'
import { pipelineContext } from '../workflowEditor/workflowEditor'
import { PluginDetailHeaderProps } from './types'
import { ReactComponent as ICBookOpen } from '../../assets/icons/ic-book-open.svg'
import { ReactComponent as ICHelp } from '../../assets/icons/ic-help.svg'

const PluginDetailHeader = ({ handlePluginVersionChange }: PluginDetailHeaderProps) => {
    const { formData, activeStageName, selectedTaskIndex, pluginDataStore } = useContext(pipelineContext)

    const selectedPluginId = formData[activeStageName].steps[selectedTaskIndex].pluginRefStepDetail.pluginId
    const pluginData = pluginDataStore.pluginVersionStore[selectedPluginId]
    const pluginVersionList = pluginDataStore.parentPluginStore[pluginData.parentPluginId].pluginVersions
    const options = pluginVersionList.map((plugin) => ({
        label: plugin.pluginVersion,
        value: String(plugin.id),
    }))

    const handleChange = (selectedOption: OptionType) => {
        if (selectedOption.value === selectedPluginId) {
            return
        }

        // No need to await this change since either will call the API which would unmount this component else will update the plugin version
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        handlePluginVersionChange(+selectedOption.value)
    }

    return (
        <div className="flexbox dc__align-items-center dc__content-space py-12 px-20 dc__border-bottom-n1">
            <div className="flexbox dc__gap-8 dc__align-items-center">
                {/* FIXME: ImageWithFallback is needed */}
                <img src={pluginData.icon} alt={pluginData.name} width={24} height={24} className="p-2" />
                <h4 className="cn-9 fs-14 fw-4 lh-24 dc__truncate dc__mxw-120">{pluginData.name}</h4>

                <ReactSelect
                    options={options}
                    value={{
                        label: pluginData.pluginVersion,
                        value: String(pluginData.id),
                    }}
                    placeholder="Version"
                    onChange={handleChange}
                    inputId="plugin-detail-header__version-select"
                />

                {!pluginData.isLatest && (
                    <>
                        <div className="dc__border-right--n1" />
                        <div className="flexbox dc__gap-4">
                            {/* TODO: Use as ReactComponent after asking for its name from product */}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="none"
                            >
                                <rect x="1.33337" y="1.33334" width="13.3333" height="13.3333" rx="4" fill="#1DAD70" />
                                <path
                                    d="M8.00039 10.78V5.22444M8.00039 5.22444L5.72766 7.49717M8.00039 5.22444L10.2731 7.49717"
                                    stroke="white"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>

                            <span className="cg-6 fs-12 fw-6 lh-16">New version available</span>
                        </div>
                    </>
                )}
            </div>

            {pluginData.docLink && (
                <TippyCustomized
                    theme={TippyTheme.white}
                    Icon={ICHelp}
                    className="w-300"
                    heading={pluginData.name}
                    infoText={pluginData.description}
                    iconClass="fcv-5"
                    showCloseButton
                    trigger="click"
                    interactive
                    documentationLink={pluginData.docLink}
                    documentationLinkText="View documentation"
                >
                    <button
                        type="button"
                        className="p-0 dc__no-background dc__no-border dc__outline-none-imp flex dc__tab-focus icon-dim-24 flex"
                        aria-label="Info Icon"
                    >
                        <ICBookOpen className="dc__no-shrink icon-dim-16 scn-6" />
                    </button>
                </TippyCustomized>
            )}
        </div>
    )
}

export default PluginDetailHeader
