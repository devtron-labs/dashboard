import { useContext } from 'react'
import { PluginType } from '@devtron-labs/devtron-fe-common-lib'
import ReactSelect from 'react-select'
import { pipelineContext } from '@Components/workflowEditor/workflowEditor'
import { ReactComponent as ICUpdateAnimated } from '@Icons/ic-update-animated.svg'
import { PluginVersionSelectOption, pluginVersionSelectStyle } from '../ciPipeline.utils'
import { PluginVersionSelectOptionType, PluginVersionSelectProps } from '../types'

// Here assumption is step type is always PLUGIN_REF
const PluginVersionSelect = ({ handlePluginVersionChange }: PluginVersionSelectProps) => {
    const { formData, activeStageName, selectedTaskIndex, pluginDataStore } = useContext(pipelineContext)
    const { stepType } = formData[activeStageName].steps[selectedTaskIndex]

    if (stepType !== PluginType.PLUGIN_REF) {
        return null
    }

    const selectedPluginId = formData[activeStageName].steps[selectedTaskIndex].pluginRefStepDetail.pluginId
    const { parentPluginId, id, isLatest, pluginVersion } = pluginDataStore.pluginVersionStore[selectedPluginId]
    const pluginVersionList = pluginDataStore.parentPluginStore[parentPluginId].pluginVersions
    const options: PluginVersionSelectOptionType[] = pluginVersionList.map((plugin) => ({
        label: plugin.pluginVersion,
        value: plugin.id,
        isLatest: plugin.isLatest,
    }))

    const handleChange = (selectedOption: PluginVersionSelectOptionType) => {
        if (selectedOption.value === selectedPluginId) {
            return
        }

        // No need to await this change since either will call the API which would unmount this component else will update the plugin version
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        handlePluginVersionChange(selectedOption.value)
    }

    return (
        <>
            <ReactSelect<PluginVersionSelectOptionType, false>
                options={options}
                value={{
                    label: pluginVersion,
                    value: id,
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
                        <ICUpdateAnimated className="dc__no-shrink icon-dim-14" />
                        <span className="cg-6 fs-12 fw-6 lh-16">New version available</span>
                    </div>
                </>
            )}
        </>
    )
}

export default PluginVersionSelect
