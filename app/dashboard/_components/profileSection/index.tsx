import ProfileImageSection from "./components/imageSection";
import ProfileInfoSection from "./components/infoSection";
import ProfileImageCard from "./components/imageSection/ProfileImageCard";
import AlbumGalleryCard from "./components/imageSection/AlbumGalleryCard";

export default function ProfileSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ProfileImageSection>
        <ProfileImageCard />
        <AlbumGalleryCard />
      </ProfileImageSection>
      
      <ProfileInfoSection />
    </div>
  );
}
