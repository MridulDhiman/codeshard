"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import Heart from "../ui/icons/Heart";
import Comment from "../ui/icons/Comment";
import Delete from "../ui/icons/Delete";
import Lock from "../ui/icons/Lock";
import Unlock from "../ui/icons/Unlock";
import FullScreen from "../ui/icons/FullScreen";
import HorizontalThreeDots from "../ui/icons/HorizontalThreeDots";
import CustomSandpackPreview from "../editor/CustomSandpackPreview";
import Pencil from "../ui/icons/Pencil";
import {
  dislikeShard,
  getComments,
  likeShard,
  updateShard
} from "../../lib/actions";
import Button from "../ui/Button";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import CommentTextBox from "../comment/CommentTextbox";
import { CommentsArea } from "../comment/CommentsArea";
import { useActiveComment } from "@/src/hooks/useActiveComment";
import { marshalUsername } from "@/src/lib/utils";
import { useUser } from "@clerk/nextjs";

const ProfileCard = ({
  content: initialContent,
  isTemplate,
  title,
  id,
  creator,
  type: initialType,
  likes: initialLikes,
  likeStatus: initialLikeStatus,
  comments: initialComments,
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [content, setContent] = useState(initialContent);
  const [isDeleted, setIsDeleted] = useState(false);
  const [type, setType] = useState(initialType);
  const [pencilClicked, setPencilClick] = useState(false);
  const [shardName, setShardName] = useState(title);
  const [likes, setLikes] = useState(initialLikes);
  const [isOwner, setIsOwner] = useState(false);
  const [likeStatus, setLikeStatus] = useState(initialLikeStatus);
  const { comments, setComments, setShardId, parentComment, setParentComment } =
    useActiveComment();
  const { user, isSignedIn } = useUser();
  const modal = useRef();
  const router = useRouter();

  console.log("Initial comments: ", initialComments);

  if (!isSignedIn) {
    toast.error("Not Authenticated");
    return null;
  }

  useEffect(() => {
    if (user && creator) {
      if (marshalUsername(user.username) === marshalUsername(creator)) {
        setIsOwner(true);
      } else {
        setIsOwner(false);
      }
    } else {
      setIsOwner(false);
    }
  }, [creator, user]);

  useEffect(() => {
    if (id) {
      getComments(user.id, id)
        .then((result) => {
          console.log("Comments: ", result);
          setComments(JSON.parse(result));
        })
        .catch((error) => {
          console.log("Comment fetching error: ", error);
        });

      setShardId(id);
    }
  }, [id]);

  useEffect(() => {
    if (parentComment) {
      setParentComment(null);
    }
  }, [parentComment]);

  useEffect(() => {
    setType(type);
  }, [type]);

  const onClick = () => {
    setPencilClick(true);
  };

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Enter") {
        setPencilClick(false);
        if (shardName !== "") {
          updateShard(user?.id ?? "", id, {
            title: shardName
          })
            .then(() => console.log("success"))
            .catch((err) => {
              console.log("could not save shard name");
              setShardName(title);
              window.alert("Could not save shard title");
            });
        }
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  });

  useEffect(() => {
    if (initialContent) {
      setContent(initialContent);
    }
  }, [initialContent]);

  useEffect(() => {
    const handleBodyClick = (e) => {
      if (isPopoverOpen && modal.current && !modal.current.contains(e.target)) {
        setIsPopoverOpen(false);
      }
    };

    document.addEventListener("click", handleBodyClick);
    return () => {
      document.removeEventListener("click", handleBodyClick);
    };
  }, [isPopoverOpen]);

  const handleClick = () => {
    router.replace(`/shard/${id}`);
  };

  const handleDelete = async () => {
    setIsPopoverOpen(false);
    const isConfirmed = confirm(
      "Are you sure you want to proceed with this action?",
    );
    if (isConfirmed) {
      setIsDeleted(true);
      const { error, success } = await deleteShard(id);
      if (!success) {
        console.log("response error: ", error);
        setIsDeleted(false);
      }
    }
  };

  const toggleType = async () => {
    setIsPopoverOpen(false);

    setType((prev) => {
      if (prev === "private") {
        return "public";
      }
      return "private";
    });
    const { error, success } = await updateShardType(
      id,
      type === "private" ? "public" : "private",
    );

    if (!success) {
      setType(initialType);
      console.log("response error: ", error);
    }
  };

  const handleLikes = async () => {
    if (likeStatus === "liked") {
      setLikes((prev) => {
        return prev - 1;
      });
      setLikeStatus("unliked");
      await dislikeShard(user?.id ?? "", id);
    } else if (likeStatus === "unliked") {
      setLikes((prev) => {
        return prev + 1;
      });

      setLikeStatus("liked");
      await likeShard(user?.id ?? "", id);
    }
  };

  return (
    <div
      className={clsx(
        "flex flex-col bg-[#1E1F26] rounded-xl p-2 sm:p-4 gap-2 sm:gap-3",
        isDeleted && "hidden",
      )}
    >
      <div className="group relative w-full h-full">
        <span
          onClick={handleClick}
          className="text-slate-200 hidden group-hover:block z-20 bg-[#252830] hover:bg-slate-700 absolute right-0 m-1 rounded-md text-lg p-1 sm:p-2 cursor-pointer"
        >
          <FullScreen className="size-4 sm:size-5" />
        </span>

        {isTemplate && (
          <CustomSandpackPreview
            template={content.templateType}
            files={content.files}
            dependencies={content.dependencies}
            devDependencies={content.devDependencies}
            className="pointer-events-none bg-white h-[8rem] sm:h-[12rem] rounded-lg"
          />
        )}
      </div>

      <div className="flex items-center justify-between relative">
        <div className="flex gap-1 items-center max-w-[70%]">
          {isOwner && pencilClicked ? (
            <input
              className="bg-transparent outline-none text-sm sm:text-base w-full"
              type="text"
              onChange={(e) => setShardName(e.target.value)}
              value={shardName}
              placeholder={shardName}
            />
          ) : (
            <>
              <p className="text-sm sm:text-base truncate max-w-[150px] sm:max-w-[200px]">
                {shardName}
              </p>
              <Pencil
                onClick={onClick}
                className="size-4 sm:size-5 fill-white hover:fill-slate-400 hover:cursor-pointer"
              />
            </>
          )}
        </div>
        <div>
          {isOwner && isPopoverOpen && (
            <ul
              ref={modal}
              className="text-xs p-2 w-[12rem] rounded-md absolute right-0 bottom-5 bg-[#131417]"
            >
              {type === "public" && (
                <li
                  onClick={toggleType}
                  className="cursor-pointer flex items-center gap-2 hover:bg-green-500 p-1"
                >
                  <Lock className="size-4 fill-white" /> Make Private{" "}
                </li>
              )}
              {type === "private" && (
                <li
                  onClick={toggleType}
                  className="cursor-pointer flex items-center gap-2 hover:bg-green-500 p-1"
                >
                  <Unlock className="size-4 fill-white" /> Make Public
                </li>
              )}

              <li
                onClick={handleDelete}
                className="cursor-pointer flex items-center gap-2 hover:bg-red-500 p-1"
              >
                {" "}
                <Delete className="size-4 fill-white" /> Delete
              </li>
            </ul>
          )}

          {isOwner && (
            <HorizontalThreeDots
              onClick={() => setIsPopoverOpen(true)}
              className={clsx(
                "fill-[#5A5F73] size-5 cursor-pointer hover:fill-slate-200",
                isPopoverOpen && "fill-slate-200",
              )}
            />
          )}
        </div>
      </div>
      <div className="flex gap-2 flex-wrap">
        <Button
          onClick={handleLikes}
          className="flex items-center bg-black hover:bg-red-500 text-white text-xs sm:text-sm py-1 px-2 sm:py-2 sm:px-3"
          id="likes"
        >
          <Heart className="size-3 sm:size-4 fill-white mr-1" />{" "}
          <span>{likes}</span>
        </Button>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              className="flex items-center hover:bg-blue-500 bg-black text-white text-xs sm:text-sm py-1 px-2 sm:py-2 sm:px-3"
              id="comments"
            >
              <Comment className="size-3 sm:size-4 fill-white mr-1" />{" "}
              <span>{comments.length}</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white p-2 text-black max-w-[90vw] sm:max-w-[500px]">
            <CommentTextBox />
            <CommentsArea comments={comments} isReplyArea={true} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ProfileCard;
