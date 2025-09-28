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

  // Update note fields
  const handleChange = useCallback(
    (field, value) => {
      if (note) setNote((prev) => ({ ...prev, [field]: value }));
    },
    [setNote]
  );

  // Fetch nodes for parent selection
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

  // Scroll sync: editor → preview
  useEffect(() => {
    const editor = editorRef.current;
    const preview = previewRef.current;
    if (!editor || !preview) return;

    const handleScroll = () => {
      const ratio =
        editor.scrollTop / (editor.scrollHeight - editor.clientHeight);
      preview.scrollTop = ratio * (preview.scrollHeight - preview.clientHeight);
    };

    editor.addEventListener("scroll", handleScroll);
    return () => editor.removeEventListener("scroll", handleScroll);
  }, []);

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!note) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white text-black rounded-2xl shadow-2xl w-[90vw] max-w-5xl h-[85vh] flex flex-col p-6 animate-scaleIn">
        {/* Title Input */}
        <input
          type="text"
          value={note.title}
          onChange={(e) => handleChange("title", e.target.value)}
          className="mb-3 p-3 text-lg font-bold rounded-lg bg-black/10 text-black focus:outline-none focus:ring-2 focus:ring-black/20"
          placeholder="Note title"
        />

        {/* Parent Selector */}
        <select
          value={note.parentId || ""}
          onChange={(e) =>
            handleChange("parentId", e.target.value ? Number(e.target.value) : null)
          }
          className="mb-4 p-2 rounded-lg bg-black/10 text-black focus:outline-none focus:ring-2 focus:ring-black/20"
        >
          <option value="">No parent (top-level)</option>
          {allNodes.map((n) => (
            <option key={n.id} value={n.id}>
              {n.title}
            </option>
          ))}
        </select>

        {/* Split Pane: Editor + Preview */}
        <div className="flex flex-1 gap-4 overflow-hidden flex-col md:flex-row">
          <textarea
            ref={editorRef}
            value={note.content}
            onChange={(e) => handleChange("content", e.target.value)}
            className="flex-1 p-3 rounded-lg bg-black/10 text-black focus:outline-none focus:ring-2 focus:ring-black/20 resize-none overflow-auto"
            placeholder="Write Markdown..."
          />

          <div
            ref={previewRef}
            className="flex-1 p-3 rounded-lg bg-white overflow-auto max-w-none prose prose-slate"
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: (props) => <h1 className="text-3xl font-bold mb-2" {...props} />,
                h2: (props) => <h2 className="text-2xl font-semibold mb-2" {...props} />,
                h3: (props) => <h3 className="text-xl font-semibold mb-2" {...props} />,
                blockquote: (props) => (
                  <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 mb-2" {...props} />
                ),
                ul: (props) => <ul className="list-disc pl-6 mb-2" {...props} />,
                ol: (props) => <ol className="list-decimal pl-6 mb-2" {...props} />,
                li: (props) => <li className="mb-1" {...props} />,
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
                  <img src={src} alt={alt} className="max-w-full rounded mb-2" {...props} />
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
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-md font-semibold transition"
          >
            Delete
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-black rounded-lg font-semibold transition"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-md font-semibold transition"
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
