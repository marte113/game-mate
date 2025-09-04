import ProfileSection from "./profileSection"
import TokenSection from "./tokenSection/TokenSection"

type Tab = "profile" | "token" | string

export default function DashboardContent({ currentTab }: { currentTab: Tab }) {
  switch (currentTab) {
    case "profile":
      return <ProfileSection />
    case "token":
      return <TokenSection />
    default:
      return <ProfileSection />
  }
}
