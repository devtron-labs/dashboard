import { VisibleModal2 } from '@devtron-labs/devtron-fe-common-lib'
import { CreatePluginModalProps } from './types'

const CreatePluginModal = ({ handleClose }: CreatePluginModalProps) => {
    return (
        <VisibleModal2 close={handleClose}>
            <div>Placeholder text</div>
        </VisibleModal2>
    )
}

export default CreatePluginModal
