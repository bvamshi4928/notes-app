import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/api";
import { MdMoreVert, MdArchive, MdDelete } from "react-icons/md";

const Label = ({ viewMode }) => {
  const { labelId } = useParams();
  const [notes, setNotes] = useState([]);
  const [labelName, setLabelName] = useState("");
  const [loading, setLoading] = useState(true);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editNoteDate, setEditNoteDate] = useState("");
  const [editImageFile, setEditImageFile] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchNotesByLabel();
  }, [labelId]);

  const fetchNotesByLabel = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/labels/${labelId}/notes`);
      setNotes(res.data.data || []);

      // Get label name
      const labelsRes = await api.get("/labels");
      const label = labelsRes.data.data?.find(
        (l) => l.id === parseInt(labelId)
      );
      setLabelName(label?.name || "Label");
    } catch (err) {
      console.error("Error fetching notes:", err);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (note) => {
    setEditingNote(note);
    setEditTitle(note.title);
    setEditBody(note.body);
    setEditNoteDate(note.note_date ? note.note_date.split("T")[0] : "");
    setEditImageFile(null);
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingNote) return;

    setUpdating(true);
    try {
      const formData = new FormData();
      formData.append("title", editTitle);
      formData.append("body", editBody);
      if (editNoteDate) formData.append("note_date", editNoteDate);
      if (editImageFile) formData.append("image", editImageFile);

      await api.put(`/notes/${editingNote.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setShowEditModal(false);
      setEditingNote(null);
      fetchNotesByLabel();
    } catch (err) {
      console.error("Error updating note:", err);
    } finally {
      setUpdating(false);
    }
  };

  const handlePin = async (noteId, isPinned) => {
    try {
      await api.patch(`/notes/${noteId}/pin`);
      fetchNotesByLabel();
    } catch (err) {
      console.error("Error toggling pin:", err);
    }
  };

  const handleArchive = async (noteId) => {
    try {
      await api.patch(`/notes/${noteId}/archive`);
      fetchNotesByLabel();
    } catch (err) {
      console.error("Error archiving note:", err);
    }
  };

  const handleDelete = async (noteId) => {
    if (!window.confirm("Move this note to trash?")) return;
    try {
      await api.delete(`/notes/${noteId}`);
      fetchNotesByLabel();
    } catch (err) {
      console.error("Error deleting note:", err);
    }
  };

  const handleRemoveLabel = async (noteId) => {
    if (!window.confirm("Remove this label from the note?")) return;
    try {
      await api.delete(`/labels/note/${noteId}/${labelId}`);
      fetchNotesByLabel();
    } catch (err) {
      console.error("Error removing label:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{labelName}</h1>

      {notes.length === 0 ? (
        <div className="text-center text-gray-500 mt-12">
          <p>No notes with this label</p>
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              : "flex flex-col gap-2 max-w-2xl mx-auto"
          }
        >
          {notes.map((note) => (
            <div
              key={note.id}
              className="card bg-base-100 border hover:shadow-lg transition-shadow"
            >
              <div className="card-body p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    {note.title && (
                      <h3 className="card-title text-base">{note.title}</h3>
                    )}
                    {note.body && (
                      <p className="text-sm whitespace-pre-wrap mt-2">
                        {note.body}
                      </p>
                    )}
                    {note.note_date && (
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(note.note_date).toLocaleDateString()}
                      </p>
                    )}
                    {note.is_pinned && (
                      <span className="badge badge-sm mt-2">Pinned</span>
                    )}
                    {note.labels && note.labels.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {note.labels.map((label) => (
                          <span
                            key={label.id}
                            className="badge badge-outline badge-sm"
                          >
                            {label.name}
                          </span>
                        ))}
                      </div>
                    )}
                    {/* Image Attachments */}
                    {note.attachments && note.attachments.length > 0 && (
                      <div className="mt-2">
                        {note.attachments.some((att) =>
                          att.mime_type?.startsWith("image/")
                        ) && (
                          <div className="grid grid-cols-2 gap-2">
                            {note.attachments
                              .filter((att) =>
                                att.mime_type?.startsWith("image/")
                              )
                              .map((att) => (
                                <div key={att.id} className="relative">
                                  <img
                                    src={`http://localhost:5001/api/notes/attachments/${
                                      att.id
                                    }/preview?token=${localStorage.getItem(
                                      "token"
                                    )}`}
                                    alt={att.original_name}
                                    className="w-full h-32 object-cover rounded"
                                  />
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="dropdown dropdown-end">
                    <button
                      tabIndex={0}
                      className="btn btn-ghost btn-sm btn-circle"
                    >
                      <MdMoreVert className="text-lg" />
                    </button>
                    <ul
                      tabIndex={0}
                      className="dropdown-content z-10 menu p-2 shadow bg-base-100 rounded-box w-52"
                    >
                      <li>
                        <button onClick={() => openEditModal(note)}>
                          Edit
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => handlePin(note.id, note.is_pinned)}
                        >
                          {note.is_pinned ? "Unpin" : "Pin"}
                        </button>
                      </li>
                      <li>
                        <button onClick={() => handleRemoveLabel(note.id)}>
                          Remove label
                        </button>
                      </li>
                      <li>
                        <button onClick={() => handleArchive(note.id)}>
                          <MdArchive /> Archive
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => handleDelete(note.id)}
                          className="text-error"
                        >
                          <MdDelete /> Delete
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Note Modal */}
      {showEditModal && editingNote && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg mb-4">Edit Note</h3>
            <form onSubmit={handleUpdate} className="space-y-3">
              <input
                type="text"
                className="input input-bordered w-full"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Title"
                required
              />
              <textarea
                className="textarea textarea-bordered w-full"
                rows={6}
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                placeholder="Note content..."
                required
              />
              <div className="flex flex-col md:flex-row gap-3">
                <input
                  type="date"
                  className="input input-bordered flex-1"
                  value={editNoteDate}
                  onChange={(e) => setEditNoteDate(e.target.value)}
                  placeholder="Date (optional)"
                />
                <input
                  type="file"
                  accept="image/*"
                  className="file-input file-input-bordered flex-1"
                  onChange={(e) =>
                    setEditImageFile(e.target.files?.[0] || null)
                  }
                />
              </div>
              <div className="modal-action">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingNote(null);
                  }}
                  className="btn btn-ghost"
                  disabled={updating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={updating}
                >
                  {updating ? "Updating..." : "Update Note"}
                </button>
              </div>
            </form>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => {
              if (!updating) {
                setShowEditModal(false);
                setEditingNote(null);
              }
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Label;
