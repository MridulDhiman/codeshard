import { clsx } from "clsx";
import { redirect } from "next/navigation";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function protectedRouteHeaders(userId, hasJsonBody=false) {
  let headers = {
    "Authorization": `Bearer ${userId}`
  }

  if(hasJsonBody) {
    headers["Content-Type"] = "application/json"
  }

  return headers;
}

export function jsonify(content) {
  return JSON.stringify(content);
}

export function isJson(str) {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

export function throwFailureCb(out,metadata) {
  let errorMessage = metadata.src + " response does not contain valid output: " + out;
  if(userDetails.error) errorMessage = userDetails.error.message;
  throw new Error(errorMessage);
}

export function logFailureCb(out, metadata) {
  if (out?.error) console.log("error message: ", out?.error?.message)
      console.log("unexpected error happened while invoking" + `${metadata.src}: ` + out);
  redirect(metadata.redirectUri)
}

export function handleFailureCase(out, successDataFields, metadata, failureCb) {
  if (!out || typeof out !== "object" || out.error || !out.data || !successDataFields.every((field) => field in out.data)) {
      failureCb(out, metadata);
    }
}

export function debounce(fn, delay) {
  let timeoutId;
  return function (...args) {
    const context = this;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn.apply(context, args);
    }, delay);
  };
}


export function isRoomPath(pathname) {
  return pathname.match(/^\/room\/.*$/);
}

export const HttpMethod = {
  Post: "POST",
  Get: "GET",
  Delete: "DELETE",
  Put: "PUT",
  Patch: "PATCH"
}

export const writeToClipboard = (text) => {
  navigator.clipboard.writeText(`${text}`);
};
export const templates = [
  "static",
  "angular",
  "react",
  "react-ts",
  "solid",
  "svelte",
  "test-ts",
  "vanilla-ts",
  "vanilla",
  "vue",
  "vue-ts",
  "node",
  "nextjs",
  "astro",
  "vite",
  "vite-react",
  "vite-react-ts",
];

export const makeFilesAndDependenciesUIStateLike = (
  fileContent = [],
  dependencyContent = [],
) => {
  const nonDevDependenices = {};
  const devDependencies = {};
  const files = {};

  dependencyContent.forEach((dep) => {
    if (dep.isDevDependency) {
      devDependencies[dep.name] = dep.version;
    } else {
      nonDevDependenices[dep.name] = dep.version;
    }
  });

  fileContent.forEach(({ name, ...rest }) => {
    files[name] = {
      ...rest,
    };
  });

  return [files, nonDevDependenices, devDependencies];
};

export const getThreadedComments = (comments) => {
  // Process comments to create the thread structure
  let commentMap = new Map(
    comments.map((comment) => [
      comment._id.toString(),
      { ...comment, replies: [] },
    ]),
  );
  for (let comment of commentMap.values()) {
    if (comment.parentId !== null) {
      let parentComment = commentMap.get(comment.parentId.toString());
      if (parentComment) {
        parentComment.replies.push(comment);
      }
    }
  }
  // Filter out replies to get top-level comments
  let threadedComments = Array.from(commentMap.values()).filter(
    (comment) => !comment.parentId,
  );
  return threadedComments;
};

export const marshalUsername = (username) => {
  return username.toLowerCase().split(" ").join("-");
};

export const findParentComment = (comments, parentId) => {
  for (let comment of comments) {
    if (comment._id.toString() === parentId.toString()) {
      return comment;
    } else {
      return findParentComment(comment?.replies, parentId);
    }
  }

  return null;
};

export function getIncrementalHash(content) {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    hash = (hash << 5) - hash + content.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }

  return hash;
}

export const GlobalConstants = {
  GET_REQUEST_DEFAULT_LIMIT: 10,
  GET_REQUEST_DEFAULT_OFFSET: 0
}

export const RoomRole = {
  OWNER: "owner",
  EDITOR: "editor",
  VIEWER: "viewer"
}

export const assignUserColor = () => {
  const colors = ["#FF5733", "#33FF57", "#3357FF", "#FF33A1", "#A133FF", "#FFA133"];
  const numericId = Math.floor(Math.random() * 1000000);
  return colors[numericId % colors.length];
}
