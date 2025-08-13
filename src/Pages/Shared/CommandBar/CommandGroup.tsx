import { Icon } from '@devtron-labs/devtron-fe-common-lib'

import { CommandBarItemType, CommandGroupProps } from './types'

const CommandGroup = ({
    title,
    id,
    items,
    isLoading,
    baseIndex,
    selectedItemIndex,
    updateItemRefMap,
    onItemClick,
}: CommandGroupProps) => {
    const updateItemRef = (elementId: string) => (el: HTMLDivElement) => {
        if (el) {
            updateItemRefMap(elementId, el)
        }
    }

    const getHandleItemClick = (item: CommandBarItemType) => () => {
        onItemClick(item)
    }

    const renderContent = () => {
        if (isLoading || !items?.length) {
            return (
                <div className="px-16 py-12 flexbox dc__align-items-center dc__gap-8">
                    <span className="cn-7 fs-13 fw-6 lh-20">{isLoading ? 'Loading...' : 'No items found'}</span>
                </div>
            )
        }

        return items.map((item, index) => (
            <div
                className={`flexbox px-16 py-12 cursor dc__align-items-center dc__gap-12 dc__content-space br-8 bg__hover ${selectedItemIndex === baseIndex + index ? 'command-bar__container--selected-item' : ''}`}
                role="option"
                aria-selected={selectedItemIndex === baseIndex + index}
                ref={updateItemRef(item.id)}
                onClick={getHandleItemClick(item)}
                tabIndex={0}
            >
                <div className="flexbox dc__align-items-center dc__gap-12">
                    <Icon name={item.icon} size={24} color="N700" />
                    <h3 className="m-0 cn-9 fs-14 fw-4 lh-20 dc__truncate">{item.title}</h3>
                </div>

                {selectedItemIndex === baseIndex + index && <Icon name="ic-key-enter" color="N700" size={20} />}
            </div>
        ))
    }

    return (
        <div className="flexbox-col p-8">
            <div className="flexbox px-16 py-6 dc__gap-4">
                <h2 className="m-0 cn-7 fs-13 fw-6 lh-20 dc__uppercase font-ibm-plex-mono" id={id}>
                    {title}
                </h2>
            </div>

            <div className="flexbox-col" key={id} role="group" aria-labelledby={id}>
                {renderContent()}
            </div>
        </div>
    )
}

export default CommandGroup
