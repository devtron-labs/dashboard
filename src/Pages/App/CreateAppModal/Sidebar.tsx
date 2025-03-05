import { ModalSidebarPanel } from '@devtron-labs/devtron-fe-common-lib'
import { DOCUMENTATION } from '@Config/constants'
import { CreationMethodType, SidebarProps } from './types'

const Sidebar = ({
    selectedCreationMethod,
    handleCreationMethodChange,
    createMethodConfig,
    isJobView,
}: SidebarProps) => {
    const getHandleCreationMethodChange = (creationMethod: CreationMethodType) => () => {
        handleCreationMethodChange(creationMethod)
    }

    return (
        <div className="w-250 p-20 flexbox-col dc__gap-24 dc__no-shrink">
            <div className="flexbox-col">
                {createMethodConfig.map(({ label, value, startIcon, iconClass, selectedIconClass }) => {
                    const isSelected = value === selectedCreationMethod

                    return (
                        <button
                            className={`dc__transparent flex left dc__gap-8 py-6 px-8 br-4 ${isSelected ? 'bcb-1' : 'dc__hover-n50'}`}
                            key={value}
                            aria-label={`Creation method: ${label}`}
                            type="button"
                            onClick={getHandleCreationMethodChange(value)}
                        >
                            <span
                                className={`dc__fill-available-space dc__no-shrink icon-dim-16 ${isSelected ? selectedIconClass : iconClass}`}
                            >
                                {startIcon}
                            </span>
                            <span className={`fs-13 lh-20 dc__truncate ${isSelected ? 'cb-5 fw-6' : 'cn-9'}`}>
                                {label}
                            </span>
                        </button>
                    )
                })}
            </div>
            {!isJobView && (
                <>
                    <div className="divider__secondary--horizontal" />
                    <ModalSidebarPanel
                        heading={null}
                        documentationLink={DOCUMENTATION.APP_CREATE}
                        rootClassName="w-100 dc__no-background-imp"
                    >
                        <div className="flexbox-col dc__gap-24">
                            <p className="m-0">
                                In Devtron, an &quot;Application&quot; represents your software project or service.
                            </p>
                            <p className="m-0">
                                It serves as a container for your deployment configurations, environments, and other
                                settings. Define your application to start managing and monitoring its deployment
                                efficiently.
                            </p>
                            <p className="m-0">
                                Applications are not environment specific and can be deployed to multiple environments.
                            </p>
                        </div>
                    </ModalSidebarPanel>
                </>
            )}
        </div>
    )
}

export default Sidebar
