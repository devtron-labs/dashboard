export interface CommonGuideType{
  loginCount: number
  title: string
  subtitle: string
  onClickCloseButton: () => void
  isGettingStartedClicked: boolean
}

export interface DeployManageGuide{
  isGettingStartedClicked: boolean
  loginCount: number
}

export interface OnboardingGuideProps {
    loginCount: number
    isSuperAdmin: boolean
    serverMode: string
    onClickedDeployManageCardClicked: () => void
    isGettingStartedClicked: boolean
}

export interface DeployManageGuideType {
    isGettingStartedClicked: boolean
    loginCount: number
}