import { ReactComponent as Upload } from '@Icons/ic-upload.svg'
import { Button } from '@devtron-labs/devtron-fe-common-lib'
import { UploadButtonProps } from '../types'

const UploadButton = ({ handleOpenUploadChartModal }: UploadButtonProps) => (
    <Button
        text="Upload Chart"
        startIcon={<Upload />}
        onClick={handleOpenUploadChartModal}
        dataTestId="upload-custom-chart-button"
    />
)

export default UploadButton
