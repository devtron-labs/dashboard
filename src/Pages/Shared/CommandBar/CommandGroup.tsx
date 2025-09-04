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

    const getIsItemSelected = (itemIndex: number) => selectedItemIndex === baseIndex + itemIndex

    const renderContent = () => {
        if (isLoading || !items?.length) {
            return (
                <div className="px-16 py-12 flexbox dc__align-items-center dc__gap-8">
                    <span className="cn-7 fs-13 fw-6 lh-20">{isLoading ? 'Loading...' : 'No items found'}</span>
                </div>
            )
        }

        return items.map((item, index) => {
            const iconColorWithFallback = item.iconColor || 'N700'

            return (
                <div
                    className={`flexbox px-16 py-12 cursor dc__align-items-center dc__gap-12 dc__content-space br-8 bg__hover ${getIsItemSelected(index) ? 'command-bar__container--selected-item' : ''}`}
                    role="option"
                    id={item.id}
                    aria-selected={getIsItemSelected(index)}
                    ref={updateItemRef(item.id)}
                    onClick={getHandleItemClick(item)}
                    tabIndex={0}
                >
                    <div className="flexbox dc__align-items-center dc__gap-12">
                        <Icon
                            name={item.icon}
                            size={20}
                            color={iconColorWithFallback === 'none' ? null : iconColorWithFallback}
                        />
                        <h3 className="m-0 cn-9 fs-14 fw-4 lh-20 dc__truncate">{item.title}</h3>
                    </div>

                    {getIsItemSelected(index) && <Icon name="ic-key-enter" color="N700" size={20} />}
                </div>
            )
        })
    }

    return (
        <div className={`flexbox-col ${baseIndex === 0 ? 'px-8 pb-8 pt-16' : 'p-8'}`}>
            <div className="flexbox px-16 py-6 dc__gap-4 dc__position-sticky dc__top-0 dc__zi-1 bg__modal--primary">
                <h2 className="m-0 cn-7 fs-13 fw-6 lh-20 dc__uppercase font-ibm-plex-sans" id={id}>
                    {title}
                </h2>
            </div>

            <div className="flexbox-col" role="group" aria-labelledby={id}>
                {renderContent()}
            </div>
        </div>
    )
}

export default CommandGroup
