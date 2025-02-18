import WorkCard from "./WorkCard";
import { redirect } from "next/navigation";
import { makeFilesAndDependenciesUIStateLike } from "@/src/utils";
import { CommentContextProvider } from "@/src/context/CommentContext";
import { auth, currentUser } from "@clerk/nextjs/server";
import { fetchShards, handleFailureCase, throwFailureCb } from "@/src/lib/actions";

const fetchShardsByUserId = async (userId) => {
  try {

    const out = await fetchShards(userId);
    handleFailureCase(out, ["shards"], {src: "fetchShards()"}, throwFailureCb);
    return out.data.shards;
  } catch (error) {
    console.log("error in fetching shards: ", error);
    return null;
  }
};

async function Work() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId) {
    redirect("/signin");
  }

  const shards = await fetchShardsByUserId(userId);
  if (!shards) {
    redirect("/");
  }
  console.log("Shards: ", shards);
  if (shards.length == 0) {
    return <>No Shards Yet...</>;
  }
  const shardsCollection = shards.map(async (shard) => {
    const [files, dependencies, devDependencies] =
      makeFilesAndDependenciesUIStateLike(shard.files, shard.dependencies);

    const ind = shard.likes.findIndex(
      (temp) => temp.shardId === shard.id && temp.likedBy === userId,
    );
    let likeStatus = ind === -1 ? "unliked" : "liked";

    return (
      <CommentContextProvider key={shard.id}>
        <WorkCard
          likeStatus={likeStatus}
          likes={shard.likes.length}
          isTemplate={shard.isTemplate}
          content={{
            templateType: shard.templateType,
            files,
            dependencies,
            devDependencies,
          }}
          mode={shard.mode}
          type={shard.type}
          title={shard.title}
          id={shard.id}
        />
      </CommentContextProvider>
    );
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
      {shardsCollection}
    </div>
  );
}

export default Work;
