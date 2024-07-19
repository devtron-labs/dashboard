import { useState } from 'react'
import { ReactComponent as ICSave } from '@Icons/ic-save.svg'
import { CreatePluginModal } from '../CreatePluginModal'

const CreatePluginButton = () => {
    const [openCreatePluginModal, setOpenCreatePluginModal] = useState<boolean>(false)

    const handleOpenCreatePluginModal = () => {
        setOpenCreatePluginModal(true)
    }

    const handleCloseCreatePluginModal = () => {
        setOpenCreatePluginModal(false)
    }

    return (
        <>
            <button
                type="button"
                className="flex h-20 br-4 dc__hover-b50-imp dc__no-shrink dc__gap-4 p-0 dc__no-background dc__no-border dc__outline-none-imp dc__tab-focus"
                onClick={handleOpenCreatePluginModal}
                data-testid="open-create-plugin-modal-button"
            >
                <ICSave className="dc__no-shrink icon-dim-16 scb-5" />
                <span className="cb-5 fs-13 fw-6 lh-20">Save as plugin</span>
            </button>

            <div className="h-16 dc__border-right-n1" />

            {openCreatePluginModal && <CreatePluginModal handleClose={handleCloseCreatePluginModal} />}
        </>
    )
}

export default CreatePluginButton
