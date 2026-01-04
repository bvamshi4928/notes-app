import { useEffect, useState } from "react";
import api from "../utils/api";

const Archive = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editNoteDate, setEditNoteDate] = useState("");
  const [editImageFile, setEditImageFile] = useState(null);
  const [updating, setUpdating] = useState(false);

  const fetchArchivedNotes = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/notes/archived");
      setNotes(res.data?.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load archived notes"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchivedNotes();
  }, []);

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
    setError("");
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
      fetchArchivedNotes();
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to update note"
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleUnarchive = async (noteId) => {
    try {
      await api.patch(`/notes/${noteId}/archive`);
      fetchArchivedNotes();
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to unarchive"
      );
    }
  };

  const handleDelete = async (noteId) => {
    if (!window.confirm("Move this note to trash?")) return;
    try {
      await api.delete(`/notes/${noteId}`);
      fetchArchivedNotes();
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to delete"
      );
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Archived Notes</h1>

      {error && <div className="alert alert-error text-sm">{error}</div>}

      {loading ? (
        <div className="text-sm text-gray-500">Loading...</div>
      ) : notes.length === 0 ? (
        <div className="text-sm text-gray-500">No archived notes.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className="card bg-base-100 shadow p-4 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h2 className="font-semibold text-lg">{note.title}</h2>
                  {note.note_date && (
                    <p className="text-xs text-gray-500">
                      {new Date(note.note_date).toDateString()}
                    </p>
                  )}
                </div>
                <div className="dropdown dropdown-end">
                  <button
                    tabIndex={0}
                    className="btn btn-ghost btn-sm btn-circle"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                      />
                    </svg>
                  </button>
                  <ul
                    tabIndex={0}
                    className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 z-10"
                  >
                    <li>
                      <button onClick={() => openEditModal(note)}>Edit</button>
                    </li>
                    <li>
                      <button onClick={() => handleUnarchive(note.id)}>
                        Unarchive
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleDelete(note.id)}
                        className="text-error"
                      >
                        Delete
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
              <p className="text-sm whitespace-pre-wrap">{note.body}</p>

              {/* Labels */}
              {note.labels && note.labels.length > 0 && (
                <div className="flex flex-wrap gap-1">
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
                <div className="space-y-2">
                  {note.attachments.some((att) =>
                    att.mime_type?.startsWith("image/")
                  ) && (
                    <div className="grid grid-cols-2 gap-2">
                      {note.attachments
                        .filter((att) => att.mime_type?.startsWith("image/"))
                        .map((att) => (
                          <div key={att.id} className="relative">
                            <img
                              src={`http://localhost:5001/api/notes/attachments/${
                                att.id
                              }/preview?token=${localStorage.getItem("token")}`}
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

export default Archive;
