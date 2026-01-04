import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  MdLightbulbOutline,
  MdNotificationsNone,
  MdArchive,
  MdDeleteOutline,
  MdLabel,
  MdEdit,
  MdClose,
} from "react-icons/md";
import api from "../utils/api";

const menuItems = [
  { name: "Notes", path: "/", icon: MdLightbulbOutline },
  { name: "Reminders", path: "/reminders", icon: MdNotificationsNone },
  { name: "Archive", path: "/archive", icon: MdArchive },
  { name: "Trash", path: "/trash", icon: MdDeleteOutline },
];

const Sidebar = ({ isOpen }) => {
  const [labels, setLabels] = useState([]);
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [newLabelName, setNewLabelName] = useState("");
  const [editingLabel, setEditingLabel] = useState(null);

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

  const handleCreateLabel = async (e) => {
    e.preventDefault();
    if (!newLabelName.trim()) return;
    try {
      await api.post("/labels", { name: newLabelName });
      setNewLabelName("");
      fetchLabels();
    } catch (err) {
      console.error("Error creating label:", err);
    }
  };

  const handleUpdateLabel = async (labelId, newName) => {
    if (!newName.trim()) return;
    try {
      await api.put(`/labels/${labelId}`, { name: newName });
      setEditingLabel(null);
      fetchLabels();
    } catch (err) {
      console.error("Error updating label:", err);
    }
  };

  const handleDeleteLabel = async (labelId) => {
    if (!window.confirm("Delete this label?")) return;
    try {
      await api.delete(`/labels/${labelId}`);
      fetchLabels();
    } catch (err) {
      console.error("Error deleting label:", err);
    }
  };

  return (
    <>
      <aside
        className={`group fixed top-16 left-0 h-[calc(100vh-4rem)]
                   bg-base-100 border-r
                   transition-all duration-300
                   overflow-hidden z-40
                   ${isOpen ? "w-60" : "w-16 hover:w-60"}
                   flex flex-col`}
      >
        <ul className="menu p-2 gap-1 flex-shrink-0">
          {menuItems.map(({ name, path, icon: Icon }) => (
            <li key={name}>
              <NavLink
                to={path}
                end
                className={({ isActive }) =>
                  `flex items-center gap-4 rounded-full px-3 py-3
                   ${isActive ? "bg-base-200 font-semibold" : ""}
                   hover:bg-base-200 transition-colors`
                }
              >
                <Icon className="text-2xl" />
                <span
                  className={`whitespace-nowrap transition-opacity duration-300
                             ${
                               isOpen
                                 ? "opacity-100"
                                 : "opacity-0 group-hover:opacity-100"
                             }`}
                >
                  {name}
                </span>
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Labels section */}
        <div className="border-t flex-1 overflow-y-auto">
          <div className="p-2">
            <div className="flex items-center justify-between px-3 py-2">
              <span
                className={`text-sm font-semibold transition-opacity duration-300
                           ${
                             isOpen
                               ? "opacity-100"
                               : "opacity-0 group-hover:opacity-100"
                           }`}
              >
                Labels
              </span>
              <button
                onClick={() => setShowLabelModal(true)}
                className={`btn btn-ghost btn-xs transition-opacity duration-300
                           ${
                             isOpen
                               ? "opacity-100"
                               : "opacity-0 group-hover:opacity-100"
                           }`}
              >
                <MdEdit />
              </button>
            </div>
            <ul className="menu p-0 gap-1">
              {labels.map((label) => (
                <li key={label.id}>
                  <NavLink
                    to={`/label/${label.id}`}
                    className={({ isActive }) =>
                      `flex items-center gap-4 rounded-full px-3 py-2
                       ${isActive ? "bg-base-200 font-semibold" : ""}
                       hover:bg-base-200 transition-colors`
                    }
                  >
                    <MdLabel className="text-xl" />
                    <span
                      className={`whitespace-nowrap transition-opacity duration-300
                                 ${
                                   isOpen
                                     ? "opacity-100"
                                     : "opacity-0 group-hover:opacity-100"
                                 }`}
                    >
                      {label.name}
                    </span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>

      {/* Label Management Modal */}
      {showLabelModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Edit labels</h3>
              <button
                onClick={() => setShowLabelModal(false)}
                className="btn btn-ghost btn-sm btn-circle"
              >
                <MdClose className="text-xl" />
              </button>
            </div>

            {/* Create new label */}
            <form onSubmit={handleCreateLabel} className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Create new label"
                  className="input input-bordered flex-1"
                  value={newLabelName}
                  onChange={(e) => setNewLabelName(e.target.value)}
                />
                <button type="submit" className="btn btn-primary">
                  Add
                </button>
              </div>
            </form>

            {/* Label list */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {labels.map((label) => (
                <div key={label.id} className="flex items-center gap-2">
                  <MdLabel className="text-xl" />
                  {editingLabel === label.id ? (
                    <>
                      <input
                        type="text"
                        className="input input-bordered input-sm flex-1"
                        defaultValue={label.name}
                        autoFocus
                        onBlur={(e) =>
                          handleUpdateLabel(label.id, e.target.value)
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleUpdateLabel(label.id, e.target.value);
                          }
                        }}
                      />
                    </>
                  ) : (
                    <>
                      <span className="flex-1">{label.name}</span>
                      <button
                        onClick={() => setEditingLabel(label.id)}
                        className="btn btn-ghost btn-xs"
                      >
                        <MdEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteLabel(label.id)}
                        className="btn btn-ghost btn-xs text-error"
                      >
                        <MdClose />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => setShowLabelModal(false)}
          />
        </div>
      )}
    </>
  );
};

export default Sidebar;
