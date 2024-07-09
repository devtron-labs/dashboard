import { useContext } from 'react'
import {
    TippyCustomized,
    TippyTheme,
    PluginTagsContainer,
    PluginImageContainer,
} from '@devtron-labs/devtron-fe-common-lib'
import ReactSelect from 'react-select'
import { pipelineContext } from '../workflowEditor/workflowEditor'
import { PluginDetailHeaderProps, PluginVersionSelectOptionType } from './types'
import { PluginVersionSelectOption, pluginVersionSelectStyle } from './ciPipeline.utils'
import { ReactComponent as ICBookOpen } from '../../assets/icons/ic-book-open.svg'
import { ReactComponent as ICHelp } from '../../assets/icons/ic-help.svg'
import { ReactComponent as ICNewVersion } from '../../assets/icons/ic-new-version.svg'

const PluginDetailHeader = ({ handlePluginVersionChange }: PluginDetailHeaderProps) => {
    const { formData, activeStageName, selectedTaskIndex, pluginDataStore } = useContext(pipelineContext)

    const selectedPluginId = formData[activeStageName].steps[selectedTaskIndex].pluginRefStepDetail.pluginId
    const { parentPluginId, icon, name, description, tags, id, isLatest, pluginVersion, docLink } =
        pluginDataStore.pluginVersionStore[selectedPluginId]
    const pluginVersionList = pluginDataStore.parentPluginStore[parentPluginId].pluginVersions
    const options: PluginVersionSelectOptionType[] = pluginVersionList.map((plugin) => ({
        label: plugin.pluginVersion,
        value: String(plugin.id),
        isLatest: plugin.isLatest,
    }))

    const handleChange = (selectedOption: PluginVersionSelectOptionType) => {
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
                <PluginImageContainer
                    fallbackImageClassName="icon-dim-24 p-2"
                    imageProps={{
                        src: icon,
                        alt: name,
                        width: 24,
                        height: 24,
                        className: 'p-2',
                    }}
                />
                <h4 className="cn-9 fs-14 fw-4 lh-24 dc__truncate dc__mxw-155">{name}</h4>

                <ReactSelect<PluginVersionSelectOptionType>
                    options={options}
                    value={{
                        label: pluginVersion,
                        value: String(id),
                        isLatest,
                    }}
                    placeholder="Version"
                    onChange={handleChange}
                    styles={pluginVersionSelectStyle}
                    components={{
                        IndicatorSeparator: null,
                        Option: PluginVersionSelectOption,
                    }}
                    className="dc__mxw-160"
                    inputId="plugin-detail-header__version-select"
                />

                {!isLatest && (
                    <>
                        <div className="dc__border-right--n1 h-16" />
                        <div className="flexbox dc__gap-4">
                            {/* TODO: Sync with product for animation */}
                            <ICNewVersion className="dc__no-shrink icon-dim-16" />

                            <span className="cg-6 fs-12 fw-6 lh-16">New version available</span>
                        </div>
                    </>
                )}
            </div>

            <TippyCustomized
                theme={TippyTheme.white}
                Icon={ICHelp}
                className="w-300"
                heading={name}
                infoText={description}
                additionalContent={<PluginTagsContainer tags={tags} rootClassName="px-12 pb-12" />}
                iconClass="fcv-5"
                showCloseButton
                trigger="click"
                interactive
                documentationLink={docLink}
                documentationLinkText="View documentation"
            >
                <button
                    type="button"
                    className="p-0 dc__no-background dc__no-border dc__outline-none-imp flex dc__tab-focus icon-dim-24"
                    aria-label="Info Icon"
                >
                    <ICBookOpen className="dc__no-shrink icon-dim-16 scn-6" />
                </button>
            </TippyCustomized>
        </div>
    )
}

export default PluginDetailHeader
