import { PropsWithChildren } from 'react'
import { OpenDetailViewButtonProps } from '../types'

const OpenDetailViewButton = ({
    children,
    detailViewData,
    setDetailViewData,
}: PropsWithChildren<OpenDetailViewButtonProps>) => {
    const handleClick = () => {
        setDetailViewData(detailViewData)
    }

    return (
        <button type="button" className="dc__unset-button-styles dc__align-left" onClick={handleClick}>
            {children}
        </button>
    )
}

export default OpenDetailViewButton
