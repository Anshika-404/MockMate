import PageClient from "@/components/PageClient";
import { Header } from "@/components/Header";
import { getCurrentUser} from "@/lib/actions/auth.action"
import{ getInterviewsByUserId, getLatestInterviews } from "@/lib/actions/general.action";

export default async function Page() {
  const user = await getCurrentUser();

  const [userInterviews, latestInterviews] = await Promise.all([
    getInterviewsByUserId(user?.id!),
    getLatestInterviews({ userId: user?.id! }),
  ]);

  return (
    <>
    <PageClient
      user={user}
      userInterviews={userInterviews}
      latestInterviews={latestInterviews}
    />
    </>
  );
}
