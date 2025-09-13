import PageClient from "@/components/PageClient";
import { getCurrentUser, getInterviewsByUserId, getLatestInterviews } from "@/lib/actions/auth.action";

export default async function Page() {
  const user = await getCurrentUser();

  const [userInterviews, latestInterviews] = await Promise.all([
    getInterviewsByUserId(user?.id!),
    getLatestInterviews({ userId: user?.id! }),
  ]);

  return (
    <PageClient
      user={user}
      userInterviews={userInterviews}
      latestInterviews={latestInterviews}
    />
  );
}
