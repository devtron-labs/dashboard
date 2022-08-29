export interface GettingStartedType {
  className: string
  showHelpCard: boolean
  hideGettingStartedCard: (count?: string) => void
  loginCount: number
}

export interface GuidedPageType {
  openDevtronAppCreateModel: (event) => void
}

export interface OnboardingGuideProps {
  loginCount: number
  isSuperAdmin: boolean
  serverMode: string
  onClickedDeployManageCardClicked: () => void
}
export interface AppRouterType {
  isSuperAdmin?: boolean
  appListCount: number
  loginCount: number
}