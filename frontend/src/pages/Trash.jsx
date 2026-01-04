import { useEffect, useState } from "react";
import api from "../utils/api";

const Trash = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchTrashedNotes = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/notes/trash");
      setNotes(res.data?.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to load trash"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrashedNotes();
  }, []);

  const handleRestore = async (noteId) => {
    try {
      await api.patch(`/notes/${noteId}/restore`);
      fetchTrashedNotes();
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to restore"
      );
    }
  };

  const handlePermanentDelete = async (noteId) => {
    if (!window.confirm("Permanently delete this note? This cannot be undone!"))
      return;
    try {
      await api.delete(`/notes/${noteId}/permanent`);
      fetchTrashedNotes();
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to delete"
      );
    }
  };

  const handleEmptyTrash = async () => {
    if (
      !window.confirm(
        "Permanently delete all notes in trash? This cannot be undone!"
      )
    )
      return;
    try {
      for (const note of notes) {
        await api.delete(`/notes/${note.id}/permanent`);
      }
      fetchTrashedNotes();
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to empty trash"
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Trash</h1>
        {notes.length > 0 && (
          <button onClick={handleEmptyTrash} className="btn btn-error btn-sm">
            Empty Trash
          </button>
        )}
      </div>

      <div className="alert alert-warning text-sm">
        <span>Notes in trash will remain here until manually deleted.</span>
      </div>

      {error && <div className="alert alert-error text-sm">{error}</div>}

      {loading ? (
        <div className="text-sm text-gray-500">Loading...</div>
      ) : notes.length === 0 ? (
        <div className="text-sm text-gray-500">Trash is empty.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className="card bg-base-100 shadow p-4 space-y-2 opacity-70"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h2 className="font-semibold text-lg">{note.title}</h2>
                  <p className="text-xs text-gray-500">
                    Deleted: {new Date(note.deleted_at).toDateString()}
                  </p>
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
                      <button onClick={() => handleRestore(note.id)}>
                        Restore
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handlePermanentDelete(note.id)}
                        className="text-error"
                      >
                        Delete Forever
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
              <p className="text-sm whitespace-pre-wrap line-clamp-3">
                {note.body}
              </p>

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
                              className="w-full h-32 object-cover rounded opacity-70"
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
    </div>
  );
};

export default Trash;
