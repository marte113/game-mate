import ProfileImageSection from "./components/imageSection"
import ProfileInfoSection from "./components/infoSection"
import ProfileImageCard from "./components/imageSection/ProfileImageCard"
import AlbumGalleryCard from "./components/imageSection/AlbumGalleryCard"
import QuerySectionBoundary from "@/components/query/QuerySectionBoundary"
import { queryKeys } from "@/constants/queryKeys"

export default function ProfileSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ProfileImageSection>
        <QuerySectionBoundary keys={queryKeys.profile.image()}>
          <ProfileImageCard />
        </QuerySectionBoundary>
        <QuerySectionBoundary keys={queryKeys.profile.albumImages()}>
          <AlbumGalleryCard />
        </QuerySectionBoundary>
      </ProfileImageSection>

      <QuerySectionBoundary keys={[queryKeys.profile.info(), queryKeys.games.all()]}>
        <ProfileInfoSection />
      </QuerySectionBoundary>
    </div>
  )
}
