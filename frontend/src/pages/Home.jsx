import React, { useState, useEffect, useRef } from "react";
import ForceGraph2D from "react-force-graph-2d";
import api from "../utils/api";
import Navbar from "../components/Navbar";
import NoteModal from "../components/NoteModal";
import CreateNodeModal from "../components/CreateNodeModal";

const Home = () => {
  const fgRef = useRef();
  const containerRef = useRef();
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [selectedNote, setSelectedNote] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const fetchGraph = async () => {
    try {
      const res = await api.get("/graph");
      const { nodes, links } = res.data;

      // Create a lookup table for nodes by ID
      const nodeMap = Object.fromEntries(nodes.map(node => [node.id, node]));

      // Collect all target IDs
      const targetIds = new Set(links.map(link => link.target));

      // Mark nodes as root if they never appear as target
      const nodesWithRoot = nodes.map(node => ({
        ...node,
        isRoot: !targetIds.has(node.id), // true if node never appears as a target
      }));
      setGraphData({ nodes: nodesWithRoot, links });
    } catch (err) {
      console.error("Fetch graph error", err);
    }
  };

  useEffect(() => {
    fetchGraph();
  }, []);

  const handleNodeClick = async (node) => {
    try {
      const res = await api.get(`/notes/${node.id}`);
      setSelectedNote(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveNote = async () => {
    if (!selectedNote) return;
    try {
      await api.put(`/notes/${selectedNote.id}`, {
        title: selectedNote.title,
        content: selectedNote.content,
        parentId: selectedNote.parentId || null,
      });
      setSelectedNote(null);
      fetchGraph();
    } catch (err) {
      console.error("Failed to save note:", err);
    }
  };

  const handleDeleteNote = async () => {
    if (!window.confirm("Delete this note?")) return;
    try {
      await api.delete(`/notes/${selectedNote.id}`);
      setSelectedNote(null);
      fetchGraph();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col w-full h-[100dvh] overflow-hidden">
      <Navbar onCreateNode={() => setShowCreate(true)} />

      {/* Graph */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden">
        <ForceGraph2D
          ref={fgRef}
          graphData={graphData}
          width={dimensions.width}
          height={dimensions.height}
          nodeLabel="title"
          nodeAutoColorBy="id"
          onNodeClick={handleNodeClick}
          nodeVal={(node) => (node.isRoot ? 6 : 2)}
        />
      </div>

      {/* Create Node Modal */}
      {showCreate && (
        <CreateNodeModal
          parentNode={selectedNote}
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            fetchGraph();
            setShowCreate(false);
          }}
        />
      )}

      {/* Note Modal */}
      <NoteModal
        note={selectedNote}
        setNote={setSelectedNote}
        onClose={() => setSelectedNote(null)}
        onSave={handleSaveNote}
        onDelete={handleDeleteNote}
      />
    </div>
  );
};

export default Home;
