import { useContext } from 'react'
import Tippy from '@tippyjs/react'
import { ActivityIndicator, PluginImageContainer, PluginType } from '@devtron-labs/devtron-fe-common-lib'
import { pipelineContext } from '@Components/workflowEditor/workflowEditor'
import { TaskTitleProps, TaskTitleTippyContentProps } from './types'
import { ReactComponent as ICEditFile } from '../../assets/icons/ic-edit-file.svg'
import { ReactComponent as ICCDStage } from '../../assets/icons/ic-cd-stage.svg'

const TaskTitleTippyContent = ({ isLatest, pluginName, pluginVersion, displayName }: TaskTitleTippyContentProps) => (
    <div className="flexbox-col dc__gap-6">
        <div className="flexbox-col dc__gap-4">
            <h4 className="m-0 cn-0 fs-12 fw-6 lh-18 dc__truncate">{displayName}</h4>

            <p className="m-0 dc__truncate c-n50">
                {pluginName}({pluginVersion})
            </p>
        </div>

        {!isLatest && (
            <>
                <div className="dc__border-bottom--n7" />

                <div className="px-2 flexbox dc__align-items-center dc__gap-4">
                    <ActivityIndicator
                        rootClassName="dc__no-shrink"
                        backgroundColorClass="bcg-5"
                        iconSizeClass="icon-dim-8"
                    />
                    <span className="cg-5 fs-12 fw-6 lh-16">New version available</span>
                </div>
            </>
        )}
    </div>
)

const TaskTitle = ({ taskDetail }: TaskTitleProps) => {
    const { pluginDataStore } = useContext(pipelineContext)
    const isInline = taskDetail.stepType === PluginType.INLINE
    const pluginId = taskDetail.pluginRefStepDetail?.pluginId
    const { isLatest, icon, name: pluginName, pluginVersion } = pluginDataStore.pluginVersionStore?.[pluginId] || {}

    const renderPluginImageContainer = () => (
        <PluginImageContainer
            fallbackImageClassName="icon-dim-20"
            imageProps={{
                src: icon,
                alt: `${pluginName} logo`,
                width: 20,
                height: 20,
                className: 'dc__no-shrink',
            }}
        />
    )

    const renderPluginIcon = () => {
        if (isInline) {
            return <ICCDStage className="dc__no-shrink icon-dim-20" />
        }

        if (!pluginId) {
            return <ICEditFile className="dc__no-shrink icon-dim-20 scn-6" />
        }

        if (isLatest) {
            return renderPluginImageContainer()
        }

        return (
            <div className="icon-dim-20 dc__no-shrink flexbox dc__position-rel dc__content-center">
                {renderPluginImageContainer()}

                <div className="icon-dim-8 dc__transparent dc__no-shrink dc__position-abs dc__bottom-0 dc__right-0 flex">
                    <ActivityIndicator
                        rootClassName="dc__no-shrink en-1 bw-1_5"
                        backgroundColorClass="bcg-5"
                        iconSizeClass="icon-dim-8"
                    />
                </div>
            </div>
        )
    }

    const renderContent = () => {
        return (
            <div className="flex left dc__gap-6">
                {renderPluginIcon()}
                <span className="w-100 dc__truncate">{taskDetail.name}</span>
            </div>
        )
    }

    if (isInline || !pluginId) {
        return renderContent()
    }

    return (
        <Tippy
            arrow={false}
            className="default-tt w-200"
            content={
                <TaskTitleTippyContent
                    isLatest={isLatest}
                    pluginName={pluginName}
                    pluginVersion={pluginVersion}
                    displayName={taskDetail.name}
                />
            }
        >
            {renderContent()}
        </Tippy>
    )
}

export default TaskTitle
