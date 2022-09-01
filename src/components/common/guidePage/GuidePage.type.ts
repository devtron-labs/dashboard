export interface GettingStartedType {
  className: string
  showHelpCard: boolean
  hideGettingStartedCard: (count?: string) => void
  loginCount: number
}

export interface GuidedPageType {
  openDevtronAppCreateModel: (event) => void
}