import { CreationMethodType, SidebarProps } from './types'
import { CREATION_METHOD_CONFIG } from './constants'

const Sidebar = ({ selectedCreationMethod, handleCreationMethodChange }: SidebarProps) => {
    const getHandleCreationMethodChange = (creationMethod: CreationMethodType) => () => {
        handleCreationMethodChange(creationMethod)
    }

    return (
        <div className="w-250 p-20 flexbox-col dc__gap-24 dc__no-shrink">
            <div className="flexbox-col">
                {CREATION_METHOD_CONFIG.map(({ label, value }) => {
                    const isSelected = value === selectedCreationMethod

                    return (
                        <button
                            className={`dc__transparent flex left dc__gap-8 py-6 px-8 ${isSelected ? 'br-4 bcb-1' : 'dc__hover-n50'}`}
                            key={value}
                            aria-label={`Creation method: ${label}`}
                            type="button"
                            onClick={getHandleCreationMethodChange(value)}
                        >
                            {/* TODO: Add icon */}
                            <span className={`fs-13 lh-20 dc__truncate ${isSelected ? 'cb-5 fw-6' : 'cn-9'}`}>
                                {label}
                            </span>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

export default Sidebar
