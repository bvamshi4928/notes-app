import { useState, useEffect } from "react";
import Toast from "../components/Toast";
import { useParams } from "react-router-dom";
import api, { API_BASE_URL } from "../utils/api";
import {
  MdMoreVert,
  MdArchive,
  MdDelete,
  MdContentCopy,
  MdImage,
} from "react-icons/md";

const Label = ({ viewMode }) => {
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };
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
        (l) => l.id === parseInt(labelId),
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
      showToast("Note updated successfully!");
    } catch (err) {
      showToast(
        err.response?.data?.message || err.message || "Failed to update note",
        "error",
      );
      console.error("Error updating note:", err);
    } finally {
      setUpdating(false);
    }
  };

  const handlePin = async (noteId, isPinned) => {
    try {
      await api.patch(`/notes/${noteId}/pin`);
      fetchNotesByLabel();
      showToast("Note pin status updated!");
    } catch (err) {
      showToast(
        err.response?.data?.message || err.message || "Failed to pin note",
        "error",
      );
      console.error("Error toggling pin:", err);
    }
  };

  const handleArchive = async (noteId) => {
    try {
      await api.patch(`/notes/${noteId}/archive`);
      fetchNotesByLabel();
      showToast("Note archived!");
    } catch (err) {
      showToast(
        err.response?.data?.message || err.message || "Failed to archive note",
        "error",
      );
      console.error("Error archiving note:", err);
    }
  };

  const handleDelete = async (noteId) => {
    if (!window.confirm("Move this note to trash?")) return;
    try {
      await api.delete(`/notes/${noteId}`);
      fetchNotesByLabel();
      showToast("Note moved to trash!");
    } catch (err) {
      showToast(
        err.response?.data?.message || err.message || "Failed to delete note",
        "error",
      );
      console.error("Error deleting note:", err);
    }
  };

  const handleRemoveLabel = async (noteId) => {
    if (!window.confirm("Remove this label from the note?")) return;
    try {
      await api.delete(`/labels/note/${noteId}/${labelId}`);
      fetchNotesByLabel();
      showToast("Label removed!");
    } catch (err) {
      showToast(
        err.response?.data?.message || err.message || "Failed to remove label",
        "error",
      );
      console.error("Error removing label:", err);
    }
  };

  // Copy note content to clipboard
  const handleCopyNote = (note) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = note.body;
    const plainText = tempDiv.textContent || tempDiv.innerText || "";
    navigator.clipboard.writeText(plainText).then(
      () => {
        showToast("Note content copied to clipboard!");
      },
      (err) => {
        showToast("Failed to copy note", "error");
        console.error("Copy failed:", err);
      },
    );
  };

  // Download attachment
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
      showToast("Attachment downloaded!");
    } catch (err) {
      showToast("Download failed", "error");
      console.error("Download failed", err);
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
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
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
                    {note.note_date && (
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(note.note_date).toLocaleDateString(
                          undefined,
                          {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}
                      </p>
                    )}
                    {note.body && (
                      <div
                        className="text-sm prose prose-sm max-w-none mt-2"
                        dangerouslySetInnerHTML={{ __html: note.body }}
                      />
                    )}
                    {note.labels && note.labels.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {note.labels.map((label) => (
                          <span
                            key={label.id}
                            className="badge badge-outline badge-sm cursor-pointer hover:badge-error"
                            onClick={() => handleRemoveLabel(note.id)}
                            title="Click to remove"
                          >
                            {label.name} ×
                          </span>
                        ))}
                      </div>
                    )}
                    {note.attachments && note.attachments.length > 0 && (
                      <div className="space-y-2 mt-2">
                        {note.attachments.some((att) =>
                          att.mime_type?.startsWith("image/"),
                        ) &&
                          (() => {
                            const images = note.attachments.filter((att) =>
                              att.mime_type?.startsWith("image/"),
                            );
                            const imageCount = images.length;
                            return (
                              <div
                                className={
                                  imageCount === 1
                                    ? "w-full"
                                    : "grid grid-cols-2 gap-2"
                                }
                              >
                                {images.map((att) => (
                                  <div key={att.id} className="relative group">
                                    <img
                                      src={
                                        att.s3_url ||
                                        `${API_BASE_URL}/notes/attachments/${att.id}/preview?token=${localStorage.getItem("token")}`
                                      }
                                      alt={att.original_name}
                                      className={`w-full object-cover rounded cursor-pointer hover:opacity-90 transition-opacity ${
                                        imageCount === 1 ? "h-48" : "h-24"
                                      }`}
                                      onClick={() => {}}
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "/default-note.svg";
                                      }}
                                    />
                                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b opacity-0 group-hover:opacity-100 transition-opacity truncate">
                                      {att.original_name || att.filename}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            );
                          })()}
                        {note.attachments.some(
                          (att) => !att.mime_type?.startsWith("image/"),
                        ) && (
                          <div>
                            <p className="text-xs font-semibold">
                              Other Attachments
                            </p>
                            <ul className="space-y-1">
                              {note.attachments
                                .filter(
                                  (att) => !att.mime_type?.startsWith("image/"),
                                )
                                .map((att) => (
                                  <li key={att.id}>
                                    <button
                                      type="button"
                                      className="link link-primary text-sm"
                                      onClick={() => {}}
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
                {/* Quick Action Icons at Bottom */}
                <div className="flex items-center justify-start gap-2 pt-2 border-t border-gray-200 dark:border-gray-700 mt-2">
                  <button
                    onClick={() => handleCopyNote(note)}
                    className="btn btn-ghost btn-sm btn-circle"
                    title="Copy Note"
                  >
                    <MdContentCopy className="h-5 w-5" />
                  </button>
                  {/* Download first attachment if present */}
                  {note.attachments && note.attachments.length > 0 && (
                    <button
                      onClick={() => handleDownload(note.attachments[0])}
                      className="btn btn-ghost btn-sm btn-circle"
                      title="Download Attachment"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="h-5 w-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 4.5v11.25m0 0l-4.5-4.5m4.5 4.5l4.5-4.5M3.75 19.5h16.5"
                        />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={() => openEditModal(note)}
                    className="btn btn-ghost btn-sm btn-circle"
                    title="Add Image"
                  >
                    <MdImage className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleArchive(note.id)}
                    className="btn btn-ghost btn-sm btn-circle"
                    title="Archive"
                  >
                    <MdArchive className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="btn btn-ghost btn-sm btn-circle text-error hover:bg-error hover:text-white"
                    title="Delete"
                  >
                    <MdDelete className="h-5 w-5" />
                  </button>
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
