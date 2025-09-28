import React, { useState, useCallback, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import api from "../utils/api";

const NoteModal = ({ note, setNote, onClose, onSave, onDelete }) => {
  const [allNodes, setAllNodes] = useState([]);
  const editorRef = useRef(null);
  const previewRef = useRef(null);

  // Update note field
  const handleChange = useCallback(
    (field, value) => {
      if (!note) return;
      setNote({ ...note, [field]: value });
    },
    [note, setNote]
  );

  // Fetch all other nodes for parent selection
  useEffect(() => {
    if (!note) return;

    const fetchNodes = async () => {
      try {
        const res = await api.get("/graph");
        setAllNodes(res.data.nodes.filter((n) => n.id !== note.id));
      } catch (err) {
        console.error("Failed to fetch nodes", err);
      }
    };
    fetchNodes();
  }, [note]);
  // Scroll sync: editor ↔ preview (bi-directional, stable)
useEffect(() => {
  const editor = editorRef.current;
  const preview = previewRef.current;
  if (!editor || !preview) return;

  let isSyncingFromEditor = false;
  let isSyncingFromPreview = false;

  const getScrollRatio = (el) => {
    const scrollableHeight = el.scrollHeight - el.clientHeight;
    return scrollableHeight > 0 ? el.scrollTop / scrollableHeight : 0;
  };

  const syncFromEditor = () => {
    if (isSyncingFromPreview) return;
    isSyncingFromEditor = true;
    const ratio = getScrollRatio(editor);
    preview.scrollTop = ratio * (preview.scrollHeight - preview.clientHeight);
    requestAnimationFrame(() => (isSyncingFromEditor = false));
  };

  const syncFromPreview = () => {
    if (isSyncingFromEditor) return;
    isSyncingFromPreview = true;
    const ratio = getScrollRatio(preview);
    editor.scrollTop = ratio * (editor.scrollHeight - editor.clientHeight);
    requestAnimationFrame(() => (isSyncingFromPreview = false));
  };

  // Attach listeners
  editor.addEventListener("scroll", syncFromEditor);
  preview.addEventListener("scroll", syncFromPreview);

  // Force initial sync AFTER paint
  requestAnimationFrame(syncFromEditor);

  return () => {
    editor.removeEventListener("scroll", syncFromEditor);
    preview.removeEventListener("scroll", syncFromPreview);
  };
}, [note?.content]);



  if (!note) return null;
  

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white text-black rounded-3xl shadow-2xl w-[80vw] h-[80vh] flex flex-col p-6 transform transition-transform duration-200 hover:scale-105">

        {/* Title Input */}
        <input
          type="text"
          value={note.title}
          onChange={(e) => handleChange("title", e.target.value)}
          className="mb-2 p-3 text-lg font-bold rounded-lg bg-black/10 text-black focus:outline-none focus:ring-2 focus:ring-black/10 transition"
          placeholder="Note title"
        />

        {/* Parent Selector */}
        <select
          value={note.parentId || ""}
          onChange={(e) =>
            handleChange(
              "parentId",
              e.target.value ? Number(e.target.value) : null
            )
          }
          className="mb-4 p-2 rounded-lg bg-black/10 text-black focus:outline-none focus:ring-2 focus:ring-black/10 transition"
        >
          <option value="">No parent (top-level)</option>
          {allNodes.map((n) => (
            <option key={n.id} value={n.id}>
              {n.title}
            </option>
          ))}
        </select>

        {/* Split Pane: Editor + Preview */}
        <div className="flex flex-1 gap-4 overflow-hidden">
          <textarea
            ref={editorRef}
            value={note.content}
            onChange={(e) => handleChange("content", e.target.value)}
            className="flex-1 p-3 rounded-lg bg-black/10 text-black focus:outline-none focus:ring-2 focus:ring-black/10 resize-none overflow-auto"
            placeholder="Write Markdown..."
          />

          <div
            ref={previewRef}
            className="flex-1 p-3 rounded-lg bg-white overflow-auto max-w-none prose prose-slate"
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ node, ...props }) => (
                  <h1 className="text-3xl font-bold mb-2" {...props} />
                ),
                h2: ({ node, ...props }) => (
                  <h2 className="text-2xl font-semibold mb-2" {...props} />
                ),
                h3: ({ node, ...props }) => (
                  <h3 className="text-xl font-semibold mb-2" {...props} />
                ),
                blockquote: ({ node, ...props }) => (
                  <blockquote
                    className="border-l-4 border-gray-300 pl-4 italic text-gray-600 mb-2"
                    {...props}
                  />
                ),
                ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-2" {...props} />,
                ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-2" {...props} />,
                li: ({ node, ...props }) => <li className="mb-1" {...props} />,

                table: ({ node, ...props }) => (
                  <table className="table-auto border-collapse w-full text-left text-sm mb-4" {...props} />
                ),
                thead: ({ node, ...props }) => (
                  <thead className="bg-gray-100 text-gray-900 font-semibold" {...props} />
                ),
                tbody: ({ node, ...props }) => (
                  <tbody className="divide-y divide-gray-200" {...props} />
                ),
                tr: ({ node, ...props }) => <tr className="hover:bg-gray-50" {...props} />,
                th: ({ node, ...props }) => (
                  <th className="border px-3 py-2 font-semibold" {...props} />
                ),
                td: ({ node, ...props }) => (
                  <td className="border px-3 py-2 align-top" {...props} />
                ),

                code({ inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  if (!inline && match) {
                    return (
                      <SyntaxHighlighter
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    );
                  }
                  return (
                    <code className="bg-black/10 px-1 rounded" {...props}>
                      {children}
                    </code>
                  );
                },
                img: ({ alt, src, ...props }) => (
                  <img
                    src={src}
                    alt={alt}
                    className="max-w-full rounded mb-2"
                    {...props}
                  />
                ),
              }}
            >
              {note.content || "_Nothing to preview_"}
            </ReactMarkdown>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between mt-4">
          <button
            onClick={onDelete}
            className="px-4 py-2 bg-red-500 rounded-lg hover:bg-red-600 shadow-md font-semibold transition"
          >
            Delete
          </button>
          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 text-black font-semibold transition"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              className="px-4 py-2 bg-green-500 rounded-lg hover:bg-green-600 shadow-md font-semibold transition"
            >
              Save
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default React.memo(NoteModal);