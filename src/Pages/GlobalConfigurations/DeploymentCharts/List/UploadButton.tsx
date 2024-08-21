import { ReactComponent as Upload } from '@Icons/ic-upload.svg'
import { UploadButtonProps } from '../types'

const UploadButton = ({ handleOpenUploadChartModal }: UploadButtonProps) => (
    <button
        type="button"
        onClick={handleOpenUploadChartModal}
        data-testid="upload-custom-chart-button"
        className="cta h-32 flex"
    >
        <Upload className="icon-dim-14 dc__no-svg-fill mr-8" />
        Upload Chart
    </button>
)

export default UploadButton
