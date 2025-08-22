import config from "@/config";
import { getSEOTags } from "@/libs/seo/seo";

export const metadata = getSEOTags({
  title: `Sign-in to ${config.appName}`,
  canonicalUrlRelative: "/auth/login",
});

export default function Layout({ children }) {
  return <>{children}</>;
}
