export default interface HiddenInputProps {
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
    children?: React.ReactNode
    id: string
    accessibleFileExtensions?: string
}
