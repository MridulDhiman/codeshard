"use server";
import { HttpMethod } from "../utils/enums";
import { redirect } from "next/navigation";

const apiOrigin = process.env.NEXT_PUBLIC_BACKEND_URL;
const apiVersion = "v1";
let backendEndpoint = `${apiOrigin}/api/${apiVersion}`;
/************************************UTILITY FUNCTIONS***********************************/
 function jsonify(content) {
    return JSON.stringify(content);
  }

  export function protectedRouteHeaders(userId, hasJsonBody= false) {
    let headers = {
      "Authorization": `Bearer ${userId}`
    }
  
    if(hasJsonBody) {
      headers["Content-Type"] = "application/json"
    }
  
    return headers;
  }
  
  export function throwFailureCb(out,metadata) {
    let errorMessage = metadata.src + " response does not contain valid output: " + out;
    if(userDetails.error) errorMessage = userDetails.error.message;
    throw new Error(errorMessage);
  }

  export function logFailureCb(out, metadata) {
    if (out.error) console.log("error message: ", out.error.message)
        console.log("unexpected error happened while invoking" + `${metadata.src}: ` + out);
    redirect(metadata.redirectUri)
  }

  export function handleFailureCase(out, successDataFields, metadata, failureCb) {
    if (!out || typeof out !== "object" || out.error || !out.data || !successDataFields.every((field) => field in out.data)) {
        failureCb(out, metadata);
      }
  }
  

/**************************************USER ROUTES ******************************/

export async function getUserInfo(userId) {
    try {
        let url = `${backendEndpoint}/users/${userId}`;
        const res = await fetch(url, {
            method: HttpMethod.Get
        });
    
        return res.json();
    }
        catch (error) {
            console.log("error occurred in saveUserMetadata", error)
            return null;
        }
}
export async function saveUserMetadata(userId) {
   try {
    let url = `${backendEndpoint}/users`;
    const res = await fetch(url, {
        method: HttpMethod.Post,
        body: jsonify({
            id: userId
        }),
        headers: {
            "Content-Type": "application/json"
        }
    });

    return res.json();
}
    catch (error) {
        console.log("error occurred in saveUserMetadata", error)
        return null;
    }
}

/************************************SHARD ROUTES *******************************/

export async function createShard(userId, content) {
    try {
        const res = await fetch(`${backendEndpoint}/shards`,{
            method: HttpMethod.Post,
            body: jsonify({
                templateType: content.templateType,
                mode: content.mode,
                type: content.type
            }),
            headers: protectedRouteHeaders(userId, true)
        });
        return res.json();

    } catch (error) {
        console.log("error occured in getComments", error)
        return null;
    }
}

export async function fetchShards(userId) {
    //protected route
    let url = new URL(`${backendEndpoint}/shards`);
    url.searchParams.append("limit", limit);
    url.searchParams.append("offset", offset);
    try {
        const res = await fetch(url.toString(), {
            method: HttpMethod.Get,
            headers: protectedRouteHeaders(userId)
        });
        return res.json();

    } catch (error) {
        console.log("error occured in fetchShards", error)
        return null;
    }
}

export async function saveShard(userId, shardId, content) {
    // protected route
    let url = `${backendEndpoint}/shards/${shardId}`;
    try {
        const res = await fetch(url, {
            method: HttpMethod.Put,
            body: jsonify({
                files: content.files,
                dependencies: content.dependencies
            }),
            headers: protectedRouteHeaders(userId, true)
        });

        return res.json();

    } catch (error) {
        console.log("error occurred in saveShard", error)
        return null;
    }
}

export async function fetchShardById(userId, shardId) {
    //protected route
    let url = `${backendEndpoint}/shards/${shardId}`;
    try {
        const res = await fetch(url, {
            method: HttpMethod.Get,
            headers: protectedRouteHeaders(userId)
        });
        return res.json();

    } catch (error) {
        console.log("error occured in fetchShardById", error)
        return null;
    }
}

export async function deleteShardById(userId, shardId) {
    let url = `${backendEndpoint}/shards/${shardId}`;
    try {
        const res = await fetch(url, {
            method: HttpMethod.Delete,
            headers: protectedRouteHeaders(userId)
        });
        return res.json();

    } catch (error) {
        console.log("error occured in deleteShardById", error)
        return null;
    }
}

export async function updateShard(userId, shardId, content) {
    let title = content.title ?? "";
    let type = content.type ?? "public";
    let url = new URL(`${backendEndpoint}/shards/${shardId}`);
    url.searchParams.append("title", title);
    url.searchParams.append("type", type);

    try {
        const res = await fetch(url.toString(), {
            method: HttpMethod.Patch,
            headers: protectedRouteHeaders(userId, true)
        });
        return res.json();

    } catch (error) {
        console.log("error occured in updateShard", error)
        return null;
    }
}

export async function getComments(userId, limit=10, offset=0) {
    let url = new URL(`${backendEndpoint}/shards/${shardId}/comments`);
    url.searchParams.append("limit", limit);
    url.searchParams.append("offset", offset);

    try {
        const res = await fetch(url.toString(), {
            method: HttpMethod.Get,
            headers: protectedRouteHeaders(userId)
        });
        return res.json();

    } catch (error) {
        console.log("error occured in getComments", error)
        return null;
    }
}

export async function addComment(userId, shardId, content) {
    let url =`${backendEndpoint}/shards/${shardId}/comments`;
   
if(message === "") throw new Error("message string empty");
    try {
        const res = await fetch(url, {
            method: HttpMethod.Post,
            body: jsonify({
                message: content.message,
                shardId: shardId
            }),
            headers: protectedRouteHeaders(userId, true)
        });
        return res.json();

    } catch (error) {
        console.log("error occured in addComment", error)
        return null;
    }
}

export async function likeShard(userId,shardId) {
    try {
        const res = await fetch(`${backendEndpoint}/shards/${shardId}/likes`, {
            method: HttpMethod.Post,
            headers: protectedRouteHeaders(userId)
        })
        return res.json();

    } catch (error) {
        console.log("error occured in likeShard", error)
        return null;
    }
}


export async function dislikeShard(userId,shardId) {
    try {
        const res = await fetch(`${backendEndpoint}/shards/${shardId}/likes`, {
            method: HttpMethod.Delete,
            headers: protectedRouteHeaders(userId)
        });

        return res.json();

    } catch (error) {
        console.log("error occured in dislikeShard", error)
        return null;
    }
}


/**************************COMMENT ROUTE************************/

export async function deleteComment(userId, commentId, content) {
    try {
        const res = await fetch(`${backendEndpoint}/comments/${commentId}`, {
            method: HttpMethod.Delete,
            body: jsonify({
                shardId: content.shardId
            }),
            headers: protectedRouteHeaders(userId, true)
        });
        return res.json();

    } catch (error) {
        console.log("error occured in getComments", error)
        return null;
    }
}

/************************************* ROOM ROUTES ******************************************/
export async function fetchAllRooms(userId, limit=10, offset=0) {
    let url = new URL(`${backendEndpoint}/rooms`);
    url.searchParams.append("limit", limit);
    url.searchParams.append("offset", offset);

    try {
        const res = await fetch(url.toString(), {
            method: HttpMethod.Get,
            headers: protectedRouteHeaders(userId)
        });
        return res.json();

    } catch (error) {
        console.log("error occured in fetchAllRooms", error)
        return null;
    }
}

export async function fetchLatestRoomFilesState(userId, shardId) {
    let url = new URL(`${backendEndpoint}/rooms/${shardId}`);

    try {
        const res = await fetch(url.toString(), {
            method: HttpMethod.Get,
            headers: protectedRouteHeaders(userId)
        });
        return res.json();

    } catch (error) {
        console.log("error occured in fetchAllRooms", error)
        return null;
    }
}

export async function createNewRoom(userId, content) {
    try {
        const res = await fetch(`${backendEndpoint}/rooms`,{
            method: HttpMethod.Post,
            body: jsonify({
                templateType: content.templateType
            }),
            headers: protectedRouteHeaders(userId, true)
        });
        return res.json();

    } catch (error) {
        console.log("error occured in getComments", error)
        return null;
    }
}

