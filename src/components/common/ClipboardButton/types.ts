export default interface ClipboardProps {
    content: string
    copiedTippyText: string
    duration: number
    trigger: boolean
    setTrigger: React.Dispatch<React.SetStateAction<boolean>>
}
