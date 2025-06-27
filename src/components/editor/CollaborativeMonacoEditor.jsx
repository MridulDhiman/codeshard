"use client";

import { Editor, useMonaco } from "@monaco-editor/react";
import React, { Fragment, useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  SandpackStack,
  useSandpack,
} from "@codesandbox/sandpack-react";
import { FileTabs } from "@codesandbox/sandpack-react";
import { snakeCase } from "./MonacoEditor";
import { useSocket } from "@/src/hooks/useSocket";
import { assignUserColor, debounce } from "@/src/lib/utils";
import { useAuth } from "@clerk/nextjs";
// import { debounce } from "@/src/lib/utils";

const CollaborativeMonacoEditor = ({ theme, roomId, roomFiles, readOnly = false }) => {
  const {
    sendMessage,
    latestData,
    latestVisibleFiles,
    sendVisibleFiles,
    joinRoom,
    propagateRoomState,
    sendCursorPosition,
    remoteCursorPositions,
    setRemoteCursorPositions,
  } = useSocket();
  const [isClient, setIsClient] = useState(false);
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);
  const monaco = useMonaco();
  const { sandpack } = useSandpack();
  const { files, activeFile, updateCurrentFile, visibleFiles, updateFile } =
    sandpack;
  const [editor, setEditor] = useState(null);
  const timeoutRef = useRef(null);
  const { userId } = useAuth();


  const code = files[activeFile]?.code || "";

  useEffect(() => {
    if (!window) {
      console.log("not window");
      return;
    }
  });

  useEffect(() => {
    if (monaco && theme !== "vs-dark" && theme !== "light") {
      console.log(theme);
      import(`monaco-themes/themes/${theme}.json`)
        .then((data) => {
          monaco.editor.defineTheme(snakeCase(theme), data);
          setIsThemeLoaded(true);
        })
        .then((_) => monaco.editor.setTheme(snakeCase(theme)));
    }
  }, [monaco, theme]);

  useEffect(() => {
    if (!roomId) return;
    joinRoom({
      roomId: roomId,
    });
  }, [roomId, joinRoom]);

  useEffect(() => {
    setIsClient(true);

    return () => {
      setIsClient(false);
    };
  }, []);

  useEffect(() => {
    if (latestVisibleFiles?.length > 0) {
      for (let file of latestVisibleFiles) {
        let newCode = latestData[file]?.code;
        if (newCode && files[file]?.code !== newCode) {
          updateFile(file, newCode, true);
          if (file === activeFile) {
            updateCurrentFile(newCode, true);
          }
        }
      }
    }
  }, [latestVisibleFiles]);

  useEffect(() => {
    if (visibleFiles?.length > 0) {
      const storedFiles = window.localStorage.getItem("visibleFiles");
      const parsedStoredFiles = storedFiles ? JSON.parse(storedFiles) : [];

      if (JSON.stringify(parsedStoredFiles) !== JSON.stringify(visibleFiles)) {
        sendVisibleFiles({
          visibleFiles,
          roomId: roomId
        });
        window.localStorage.setItem("visibleFiles", JSON.stringify(visibleFiles));
      }
    }
  }, [visibleFiles, roomId, sendVisibleFiles]);


  useEffect(() => {
    console.log("remoteCursorPositions", remoteCursorPositions);
    const currentUserId = userId; 
    if (monaco) {

    for(const remoteCursorPosition of Object.values(remoteCursorPositions)) {
      if(remoteCursorPosition?.userId !== currentUserId && remoteCursorPosition?.activeFile === activeFile) {
      const decorationId = remoteCursorPosition?.decorationId;
      const position = remoteCursorPosition?.position;
      const username = remoteCursorPosition?.username;
      const user_id = remoteCursorPosition?.userId;
      const color = remoteCursorPosition?.color;

      const isNewCursor = !decorationId;
      const newDecorations = editor.deltaDecorations(
        isNewCursor ? [] : [decorationId],
        [
          {
            range: new monaco.Range(
              position.lineNumber,
              position.column,
              position.lineNumber,
              position.column
            ),
            options: {
              // Use inline style for color
              inlineClassName: `remote-cursor-line-${user_id}`,
              afterContentClassName: `remote-cursor-label-${user_id}`,
            },
          },
        ]
      );
    
        // Inject dynamic CSS for cursor + label
  const styleElementId = `remote-cursor-style-${user_id}`;
  let styleElement = document.getElementById(styleElementId);

  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = styleElementId;
    document.head.appendChild(styleElement);
  }

  // Use Tailwind spacing/shape + inline color
  styleElement.innerHTML = `
    .remote-cursor-line-${user_id} {
      border-left: 2px solid ${color};
    }

    .remote-cursor-label-${user_id}::after {
      content: "${username}";
      background: ${color};
      color: white;
      padding: 0.125rem 0.25rem; /* Tailwind px-1 py-0.5 */
      border-radius: 0.25rem;     /* Tailwind rounded */
      font-size: 0.75rem;         /* Tailwind text-xs */
      position: absolute;
      margin-left: 0.25rem;       /* Tailwind ml-1 */
    }
  `;

      

      console.log("new decorations", newDecorations);
      if(newDecorations && newDecorations.length > 0) {

      setRemoteCursorPositions((prev) => {
          return {
            ...prev,
            [userId]: {
              ...prev[userId],
              decorationId: newDecorations?.[0] ?? undefined,
            },
          };
        });
    }
    else {
      console.log("no new decorations");
    }
  }
  
  }
}

return () => {
  for(const remoteCursorPosition of Object.values(remoteCursorPositions)) {
    if(remoteCursorPosition?.userId !== currentUserId && remoteCursorPosition?.activeFile === activeFile) {
      const decorationId = remoteCursorPosition?.decorationId;
      const _ = editor.deltaDecorations(
        [decorationId],
        []
      );
    }
  }
}

  }, [remoteCursorPositions, userId, monaco]);

  // useEffect(() => {
  //   if (!isClient || !editorRef.current || !roomId) {
  //     return;
  //   }

  //   let cleanup = () => {};

  //   const setupYjs = async () => {
  //     try {
  //       const { Doc } = await import("yjs");
  //       const { WebsocketProvider } = await import("y-websocket");
  //       const { MonacoBinding } = await import("y-monaco");

  //       const ydoc = new Doc();
  //       const ytext = ydoc.getText("monaco");

  //       const wsProvider = new WebsocketProvider(
  //         process.env.NEXT_PUBLIC_WS_ENDPOINT,
  //         roomId,
  //         ydoc,
  //       );

  //       const monacoBinding = new MonacoBinding(
  //         ytext,
  //         editorRef.current.getModel(),
  //         new Set([editorRef.current]),
  //         wsProvider.awareness,
  //       );

  //       cleanup = () => {
  //         monacoBinding.destroy();
  //         wsProvider.destroy();
  //         ydoc.destroy();
  //       };
  //     } catch (error) {
  //       console.error("Error setting up Yjs:", error);
  //       toast.error("Error setting up Yjs. Refresh and try again.");
  //     }
  //   };

  //   setupYjs();

  //   return () => cleanup();
  // }, [editorRef, isClient, roomId]);

  const onEditorChange = useCallback((value) => {
    // setEditorData(value);
    updateCurrentFile(value, true);
    // debounce(sendMessage, 500)({
    //   activeFile: activeFile, 
    //   data: value,
    //   roomId: roomId,
    // });
    sendMessage({
      activeFile: activeFile,
      data: value,
      roomId: roomId,
    });
  });

  useEffect(() => {
    if (editor) {
      editor.updateOptions({ readOnly });
    }
  }, [editor, readOnly]);

  const handleMount = useCallback((node) => {
    // console.log(monaco)
    setEditor(node);

    node.onDidChangeModelContent(() => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        propagateRoomState({
          roomId: roomId,
          fileName: activeFile,
          code: node.getValue(),
          updateType: "debounce"
        });
      }, 5000); // save after 5s of inactivity
    });

    // unnecessary doing it twice
    node.onDidBlurEditorText(() => {
      propagateRoomState({
        roomId: roomId,
        fileName: activeFile,
        code: node.getValue(),
        updateType: "blur"
      });
    });

    node.onDidChangeCursorPosition((e) => {
      const position = e.position;
      console.log("position", position);
      debounce(sendCursorPosition, 1000)({
        roomId: roomId,
        position: position,
        activeFile: activeFile,
        userId: userId,
        color: assignUserColor()
      });
    });
  });


  if (!isClient) {
    return null;
  }

  const jsTypes = ["js", "jsx"];
  const tsTypes = ["ts", "tsx"];
  const arr = activeFile?.split(".");
  const ext = arr[arr.length - 1];
  const fileType = jsTypes.includes(ext)
    ? "javascript"
    : tsTypes.includes(ext)
      ? "typescript"
      : ext === "html"
        ? "html"
        : ext === "css"
          ? "css"
          : ext === "json"
            ? "json"
            : null;

  return (
    <>
      <SandpackStack style={{ height: "92vh", margin: 0 }}>
        <FileTabs />
        <Editor
          key={activeFile}
          height={"100vh"}
          defaultLanguage="javascript"
          theme={
            theme === "vs-dark" || theme === "light"
              ? theme
              : isThemeLoaded
                ? theme
                : "vs-dark"
          }
          language={fileType}
          onChange={onEditorChange}
          defaultValue={code}
          value={latestData[activeFile]?.code || code}
          onMount={handleMount}
        />
      </SandpackStack>
    </>
  );
};

export default dynamic(() => Promise.resolve(CollaborativeMonacoEditor), {
  ssr: false,
});
