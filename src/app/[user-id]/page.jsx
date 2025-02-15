import { redirect } from "next/navigation";
import Profile from "../../components/profile/Profile";
import { auth, currentUser } from "@clerk/nextjs/server";
import { Suspense } from "react";
import NextTopLoader from "nextjs-toploader";
import { fetchClerkUser } from "@/src/lib/clerk";
import { getUserInfo, handleFailureCase, throwFailureCb } from "@/src/lib/actions";

export const fetchUserDetails = async (userId) => {
  try {
    const userDetails = await getUserInfo(userId);
    // consider all the failing cases first
    handleFailureCase(userDetails, ["user"], {
      src: "fetchUserDetails()"
    }, throwFailureCb);
    return userDetails.data.user;
  } catch (error) {
    console.log("could not fetch user details", error);
    return null;
  }
};

export default async function UserProfile({ params }) {
  const { userId } = await auth();
  let loginnedUser = await currentUser();

  if (!loginnedUser) {
    redirect("/");
  }
  const user = params["user-id"];
  const userDetails = await fetchUserDetails(user);
  const clerkUser = await fetchClerkUser(user);

  if (!userDetails || !clerkUser) {
    redirect("/");
  }
  const isOwner = userId === userDetails.id ? true : false;

  console.log("user Details: ", userDetails);
  let { followers, following, shards } = userDetails;

  return (
    <>
      <Suspense fallback={<NextTopLoader />}>
        <Profile
          shards={shards}
          followers={followers}
          followersCount={followers?.length}
          following={following?.length}
          name={clerkUser.fullName}
          id={user?._id.toString()}
          isOwner={isOwner}
        />
      </Suspense>
    </>
  );
}
