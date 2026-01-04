import { useEffect, useState } from "react";
import api, { API_BASE_URL } from "../utils/api";
import { MdLabel, MdPalette } from "react-icons/md";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "../quill-custom.css";
import Toast from "../components/Toast";

const getRelativeTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";

  const now = new Date();
  const diffMs = now - date;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "Just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString();
};

const COLORS = [
  { name: "Default", value: "default", bg: "bg-base-100" },
  { name: "Red", value: "red", bg: "bg-red-100" },
  { name: "Orange", value: "orange", bg: "bg-orange-100" },
  { name: "Yellow", value: "yellow", bg: "bg-yellow-100" },
  { name: "Green", value: "green", bg: "bg-green-100" },
  { name: "Blue", value: "blue", bg: "bg-blue-100" },
  { name: "Purple", value: "purple", bg: "bg-purple-100" },
  { name: "Pink", value: "pink", bg: "bg-pink-100" },
  { name: "Gray", value: "gray", bg: "bg-gray-100" },
];

const getColorClass = (color) => {
  const colorMap = {
    default: "bg-base-100",
    red: "bg-red-50 dark:bg-red-950",
    orange: "bg-orange-50 dark:bg-orange-950",
    yellow: "bg-yellow-50 dark:bg-yellow-950",
    green: "bg-green-50 dark:bg-green-950",
    blue: "bg-blue-50 dark:bg-blue-950",
    purple: "bg-purple-50 dark:bg-purple-950",
    pink: "bg-pink-50 dark:bg-pink-950",
    gray: "bg-gray-100 dark:bg-gray-800",
  };
  return colorMap[color] || colorMap.default;
};

const Home = ({ searchTerm, refreshKey, onRefresh, viewMode = "grid" }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [labels, setLabels] = useState([]);
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState(null);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editNoteDate, setEditNoteDate] = useState("");
  const [editImageFile, setEditImageFile] = useState(null);
  const [editColor, setEditColor] = useState("default");
  const [updating, setUpdating] = useState(false);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [noteDate, setNoteDate] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [color, setColor] = useState("default");
  const [creating, setCreating] = useState(false);
  const [formExpanded, setFormExpanded] = useState(false);
  const [sortBy, setSortBy] = useState("pinned");
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  useEffect(() => {
    fetchLabels();
  }, []);

  const fetchLabels = async () => {
    try {
      const res = await api.get("/labels");
      setLabels(res.data.data || []);
    } catch (err) {
      console.error("Error fetching labels:", err);
    }
  };

  const handleAddLabel = async (noteId, labelId) => {
    try {
      await api.post("/labels/note", { noteId, labelId });
      showToast("Label added!");
      onRefresh?.();
      setShowLabelModal(false);
    } catch (err) {
      showToast(
        err.response?.data?.message || err.message || "Failed to add label",
        "error"
      );
    }
  };

  const handleRemoveLabel = async (noteId, labelId) => {
    try {
      await api.delete(`/labels/note/${noteId}/${labelId}`);
      showToast("Label removed!");
      onRefresh?.();
    } catch (err) {
      showToast(
        err.response?.data?.message || err.message || "Failed to remove label",
        "error"
      );
    }
  };

  const openEditModal = (note) => {
    setEditingNote(note);
    setEditTitle(note.title);
    setEditBody(note.body);
    setEditNoteDate(note.note_date ? note.note_date.split("T")[0] : "");
    setEditColor(note.color || "default");
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
      formData.append("color", editColor);
      if (editNoteDate) formData.append("note_date", editNoteDate);
      if (editImageFile) formData.append("image", editImageFile);

      await api.put(`/notes/${editingNote.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setShowEditModal(false);
      setEditingNote(null);
      showToast("Note updated successfully!");
      onRefresh?.();
    } catch (err) {
      showToast(
        err.response?.data?.message || err.message || "Failed to update note",
        "error"
      );
    } finally {
      setUpdating(false);
    }
  };

  const handlePin = async (noteId) => {
    try {
      await api.patch(`/notes/${noteId}/pin`);
      showToast("Note pin status updated!");
      onRefresh?.();
    } catch (err) {
      showToast(
        err.response?.data?.message || err.message || "Failed to pin note",
        "error"
      );
    }
  };

  const handleArchive = async (noteId) => {
    try {
      await api.patch(`/notes/${noteId}/archive`);
      showToast("Note archived!");
      onRefresh?.();
    } catch (err) {
      showToast(
        err.response?.data?.message || err.message || "Failed to archive note",
        "error"
      );
    }
  };

  const handleDelete = async (noteId) => {
    if (!window.confirm("Move this note to trash?")) return;
    try {
      await api.delete(`/notes/${noteId}`);
      showToast("Note moved to trash!");
      onRefresh?.();
    } catch (err) {
      showToast(
        err.response?.data?.message || err.message || "Failed to delete note",
        "error"
      );
    }
  };

  const handleDownload = async (attachment) => {
    try {
      const res = await api.get(`/notes/attachments/${attachment.id}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download =
        attachment.original_name || attachment.filename || "attachment";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Download failed");
    }
  };

  const fetchNotes = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/notes", {
        params: { search: searchTerm || undefined },
      });
      setNotes(res.data?.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to load notes"
      );
    } finally {
      setLoading(false);
    }
  };

  const sortNotes = (notesToSort) => {
    const sorted = [...notesToSort];
    switch (sortBy) {
      case "pinned":
        return sorted.sort((a, b) => {
          if (a.is_pinned && !b.is_pinned) return -1;
          if (!a.is_pinned && b.is_pinned) return 1;
          return new Date(b.created_at) - new Date(a.created_at);
        });
      case "title":
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case "created":
        return sorted.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
      case "modified":
        return sorted.sort(
          (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
        );
      default:
        return sorted;
    }
  };

  useEffect(() => {
    fetchNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, refreshKey]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    try {
      if (!title || !body) throw new Error("Title and body are required");

      const formData = new FormData();
      formData.append("title", title);
      formData.append("body", body);
      formData.append("color", color);
      if (noteDate) formData.append("note_date", noteDate);
      if (imageFile) formData.append("image", imageFile);

      await api.post("/notes", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setTitle("");
      setBody("");
      setNoteDate("");
      setImageFile(null);
      setColor("default");
      setFormExpanded(false);
      showToast("Note created successfully!");
      onRefresh?.();
    } catch (err) {
      showToast(
        err.response?.data?.message || err.message || "Failed to create note",
        "error"
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Note Creation Form */}
      {!formExpanded ? (
        <div
          onClick={() => setFormExpanded(true)}
          className="card bg-base-100 shadow cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between p-4">
            <span className="text-gray-500">Take a note...</span>
            <div className="flex gap-2">
              <button type="button" className="btn btn-ghost btn-sm btn-circle">
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </button>
              <button type="button" className="btn btn-ghost btn-sm btn-circle">
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
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleCreate}
          className="card bg-base-100 shadow p-4 space-y-3"
        >
          <input
            className="input input-bordered w-full"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            required
            autoFocus
          />

          <ReactQuill
            theme="snow"
            value={body}
            onChange={setBody}
            placeholder="Take a note..."
            className="bg-base-100"
            modules={{
              toolbar: [
                ["bold", "italic", "underline", "strike"],
                [{ list: "ordered" }, { list: "bullet" }],
                ["link"],
                ["clean"],
              ],
            }}
          />

          <div className="flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setColor(c.value)}
                className={`w-8 h-8 rounded-full border-2 ${
                  color === c.value ? "border-primary" : "border-gray-300"
                } ${c.bg}`}
                title={c.name}
              />
            ))}
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="date"
              className="input input-bordered flex-1"
              value={noteDate}
              onChange={(e) => setNoteDate(e.target.value)}
              placeholder="Date (optional)"
            />
            <input
              type="file"
              accept="image/*"
              className="file-input file-input-bordered flex-1"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            />
          </div>

          {imageFile && (
            <div className="relative">
              <img
                src={URL.createObjectURL(imageFile)}
                alt="Preview"
                className="w-full max-h-48 object-contain rounded border"
              />
              <button
                type="button"
                onClick={() => setImageFile(null)}
                className="absolute top-2 right-2 btn btn-circle btn-sm btn-error"
              >
                ×
              </button>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setFormExpanded(false);
                setTitle("");
                setBody("");
                setNoteDate("");
                setImageFile(null);
                setColor("default");
              }}
              className="btn btn-ghost"
            >
              Close
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={creating}
            >
              {creating ? "Saving..." : "Add Note"}
            </button>
          </div>
        </form>
      )}

      {error && <div className="alert alert-error text-sm">{error}</div>}

      {!loading && notes.length > 0 && (
        <div className="flex flex-wrap justify-between items-center gap-4 mb-4 p-3 bg-base-200 rounded-lg">
          <p className="text-sm font-medium text-gray-700">
            {notes.length} note{notes.length !== 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Sort by:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="select select-bordered select-sm min-w-[140px]"
            >
              <option value="pinned">Pinned First</option>
              <option value="modified">Last Modified</option>
              <option value="created">Date Created</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-sm text-gray-500">Loading notes...</div>
      ) : notes.length === 0 ? (
        <div className="text-sm text-gray-500">No notes yet.</div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3"
              : "space-y-3"
          }
        >
          {sortNotes(notes).map((note) => (
            <div
              key={note.id}
              className={`card shadow p-4 space-y-2 relative ${getColorClass(
                note.color || "default"
              )}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-lg">{note.title}</h2>
                    {note.is_pinned && (
                      <span className="badge badge-sm badge-primary">
                        Pinned
                      </span>
                    )}
                  </div>
                  {note.note_date && (
                    <p className="text-xs text-gray-500">
                      {new Date(note.note_date).toDateString()}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 italic">
                    {getRelativeTime(note.updated_at)}
                  </p>
                </div>

                {/* Action buttons */}
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
                      <button onClick={() => handlePin(note.id)}>
                        {note.is_pinned ? "Unpin" : "Pin"}
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => {
                          setSelectedNoteId(note.id);
                          setShowLabelModal(true);
                        }}
                      >
                        <MdLabel /> Add label
                      </button>
                    </li>
                    <li>
                      <button onClick={() => handleArchive(note.id)}>
                        Archive
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
              <div
                className="text-sm prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: note.body }}
              />

              {/* Labels */}
              {note.labels && note.labels.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {note.labels.map((label) => (
                    <span
                      key={label.id}
                      className="badge badge-outline badge-sm cursor-pointer hover:badge-error"
                      onClick={() => handleRemoveLabel(note.id, label.id)}
                      title="Click to remove"
                    >
                      {label.name} ×
                    </span>
                  ))}
                </div>
              )}

              {note.attachments && note.attachments.length > 0 && (
                <div className="space-y-2">
                  {note.attachments.some((att) =>
                    att.mime_type?.startsWith("image/")
                  ) && (
                    <div className="grid grid-cols-2 gap-2">
                      {note.attachments
                        .filter((att) => att.mime_type?.startsWith("image/"))
                        .map((att) => (
                          <div key={att.id} className="relative group">
                            <img
                              src={`${API_BASE_URL}/notes/attachments/${
                                att.id
                              }/preview?token=${localStorage.getItem("token")}`}
                              alt={att.original_name}
                              className="w-full h-32 object-cover rounded cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => handleDownload(att)}
                              onError={(e) => {
                                console.error("Failed to load image:", att);
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "flex";
                              }}
                            />
                            <div
                              style={{ display: "none" }}
                              className="w-full h-32 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500"
                            >
                              Image failed to load
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b opacity-0 group-hover:opacity-100 transition-opacity truncate">
                              {att.original_name || att.filename}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                  {note.attachments.some(
                    (att) => !att.mime_type?.startsWith("image/")
                  ) && (
                    <div>
                      <p className="text-xs font-semibold">Other Attachments</p>
                      <ul className="space-y-1">
                        {note.attachments
                          .filter((att) => !att.mime_type?.startsWith("image/"))
                          .map((att) => (
                            <li key={att.id}>
                              <button
                                type="button"
                                className="link link-primary text-sm"
                                onClick={() => handleDownload(att)}
                              >
                                {att.original_name || att.filename}
                              </button>
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Label selection modal */}
      {showLabelModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Add label to note</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {labels.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No labels yet. Create labels from the sidebar.
                </p>
              ) : (
                labels.map((label) => (
                  <button
                    key={label.id}
                    onClick={() => handleAddLabel(selectedNoteId, label.id)}
                    className="btn btn-outline btn-sm w-full justify-start"
                  >
                    <MdLabel /> {label.name}
                  </button>
                ))
              )}
            </div>
            <div className="modal-action">
              <button
                onClick={() => setShowLabelModal(false)}
                className="btn btn-ghost"
              >
                Close
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => setShowLabelModal(false)}
          />
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
              <ReactQuill
                theme="snow"
                value={editBody}
                onChange={setEditBody}
                placeholder="Note content..."
                className="bg-base-100"
                modules={{
                  toolbar: [
                    ["bold", "italic", "underline", "strike"],
                    [{ list: "ordered" }, { list: "bullet" }],
                    ["link"],
                    ["clean"],
                  ],
                }}
              />
              <div className="flex flex-wrap gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setEditColor(c.value)}
                    className={`w-8 h-8 rounded-full border-2 ${
                      editColor === c.value
                        ? "border-primary"
                        : "border-gray-300"
                    } ${c.bg}`}
                    title={c.name}
                  />
                ))}
              </div>
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
              {editImageFile && (
                <div className="relative">
                  <img
                    src={URL.createObjectURL(editImageFile)}
                    alt="Preview"
                    className="w-full max-h-48 object-contain rounded border"
                  />
                  <button
                    type="button"
                    onClick={() => setEditImageFile(null)}
                    className="absolute top-2 right-2 btn btn-circle btn-sm btn-error"
                  >
                    ×
                  </button>
                </div>
              )}
              {editingNote?.attachments &&
                editingNote.attachments.some((att) =>
                  att.mime_type?.startsWith("image/")
                ) && (
                  <div>
                    <p className="text-xs font-semibold mb-2">Current Images</p>
                    <div className="grid grid-cols-2 gap-2">
                      {editingNote.attachments
                        .filter((att) => att.mime_type?.startsWith("image/"))
                        .map((att) => (
                          <div key={att.id} className="relative group">
                            <img
                              src={`${API_BASE_URL}/notes/attachments/${
                                att.id
                              }/preview?token=${localStorage.getItem("token")}`}
                              alt={att.original_name}
                              className="w-full h-32 object-cover rounded"
                              onError={(e) => {
                                console.error(
                                  "Failed to load image in modal:",
                                  att
                                );
                                e.target.style.border = "2px solid red";
                                e.target.alt = "Image not available";
                              }}
                            />
                            <button
                              type="button"
                              onClick={async () => {
                                if (window.confirm("Delete this image?")) {
                                  try {
                                    await api.delete(
                                      `/notes/attachments/${att.id}`
                                    );
                                    setEditingNote({
                                      ...editingNote,
                                      attachments:
                                        editingNote.attachments.filter(
                                          (a) => a.id !== att.id
                                        ),
                                    });
                                  } catch (err) {
                                    console.error(
                                      "Failed to delete image:",
                                      err
                                    );
                                    alert("Failed to delete image");
                                  }
                                }
                              }}
                              className="absolute top-1 right-1 btn btn-circle btn-xs btn-error opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              ×
                            </button>
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b truncate">
                              {att.original_name || att.filename}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
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

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Home;
