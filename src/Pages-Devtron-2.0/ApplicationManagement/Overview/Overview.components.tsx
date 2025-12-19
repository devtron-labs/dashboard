import { ChartHeaderTabProps } from './types'

export const ChartHeaderTab = ({ title, subtitle, onClick, isLoading, isActive = false }: ChartHeaderTabProps) => (
    <>
        <button
            type="button"
            className={`dc__unset-button-styles py-12 px-20 flexbox-col dc__align-start cn-9 ${isActive ? 'dc__border-bottom-2--b5' : ''}`}
            onClick={onClick}
            disabled={isLoading}
        >
            <span className="fs-13 lh-20 fw-4">{title}</span>
            {isLoading ? (
                <span className="shimmer h-20 w-40 mt-5 mb-5" />
            ) : (
                <span className="font-ibm-plex-sans fs-20 fw-6 lh-1-5">{subtitle}</span>
            )}
        </button>
        <div className="divider__secondary" />
    </>
)

export const SectionLoadingCard = () => (
    <div className="flexbox-col dc__gap-8 p-16">
        <div className="shimmer h-20 w-150" />
        <div className="shimmer h-20 w-120" />
        <div className="shimmer h-20 w-80px" />
        <div className="shimmer h-20 w-60" />
    </div>
)
