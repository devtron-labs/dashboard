import { ReactComponent as ICErrorExclamation } from '@Icons/ic-error-exclamation.svg'
import { ReactComponent as ICWarning } from '@Icons/ic-warning.svg'

import { TabProps } from './TabGroup.types'

export const getTabIcon = ({
    icon: Icon,
    showError,
    showWarning,
    className,
}: Pick<TabProps, 'showError' | 'showWarning' | 'icon'> & { className: string }) => {
    if (showError) {
        return <ICErrorExclamation className={className} />
    }
    if (showWarning) {
        return <ICWarning className={`${className} warning-icon-y7`} />
    }
    if (Icon) {
        return <Icon className={`${className} tab-group__tab__icon`} />
    }
    return null
}

export const getTabBadge = (badge: TabProps['badge'], className: string) =>
    badge !== null && <div className={`tab-group__tab__badge bcn-1 cn-7 fw-6 flex px-4 ${className}`}>{badge}</div>

export const getTabIndicator = (showIndicator: TabProps['showIndicator']) =>
    showIndicator && <span className="tab-group__tab__indicator bcr-5 mt-4 dc__align-self-start" />

export const getTabDescription = (description: TabProps['description']) =>
    description && (
        <ul className="tab-group__tab__description m-0 p-0 fs-12 lh-16 fw-4 cn-7 flexbox dc__align-items-center dc__gap-4">
            {Array.isArray(description)
                ? description.map((desc, idx) => (
                      <li key={desc} className="flex dc__gap-4">
                          {!!idx && <span className="dc__bullet" />}
                          {desc}
                      </li>
                  ))
                : description}
        </ul>
    )
