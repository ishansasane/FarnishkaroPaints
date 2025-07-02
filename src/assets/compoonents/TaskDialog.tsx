import { useEffect, useState } from "react";
import { setTaskDialogOpen, setTasks } from "../Redux/dataSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchWithLoading } from "../Redux/fetchWithLoading";

interface TaskDialogProps {
  onClose: () => void;
  name: string;
  setrefresh: (val: boolean) => void;
  setAdded: (val: boolean) => void;
  isEditing: any;
  setediting: (val: any) => void;
  refresh: boolean;
  projectData: any[];
  taskDialogOpen: boolean;
  setProjectFlag: (val: boolean) => void;
  dashboard?: boolean;
}

const fetchTaskData = async () => {
  const response = await fetchWithLoading(
    "https://sheeladecor.netlify.app/.netlify/functions/server/getPaintstasks"
  );
  const data = await response.json();
  return data.body || [];
};

const TaskDialog: React.FC<TaskDialogProps> = ({
  setAdded,
  onClose,
  isEditing,
  setediting,
  name,
  setrefresh,
  refresh,
  projectData,
  taskDialogOpen,
  setProjectFlag,
  dashboard,
}) => {
  const [taskName, setTaskName] = useState("");
  const [description, setDescription] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [assignee, setAssignee] = useState("");
  const [project, setProject] = useState("");
  const [priority, setPriority] = useState("Moderate");
  const [status, setStatus] = useState("To Do");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (isEditing) {
      setTaskName(isEditing[0]);
      setDescription(isEditing[1]);
      setDateTime(isEditing[2]);
      setAssignee(isEditing[4]);
      setProject(isEditing[5]);
      setPriority(isEditing[6]);
      setStatus(isEditing[7]);
    }
  }, [isEditing]);

  const addTask = async () => {
    if (!dateTime) {
      alert("Please select a date");
      return;
    }

    try {
      const existingTasks = await fetchTaskData();
      const isDuplicate = existingTasks.some(
        (task) => task[0]?.toLowerCase() === taskName.toLowerCase()
      );

      if (isDuplicate) {
        alert("Task name already exists.");
        return;
      }

      const date = new Date().toISOString().slice(0, 16);

      const response = await fetchWithLoading(
        "https://sheeladecor.netlify.app/.netlify/functions/server/addPaintstask",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            title: taskName,
            description,
            dateTime,
            date,
            assigneeLink: assignee,
            projectLink: project,
            priority,
            status,
          }),
        }
      );

      if (response.status === 200) {
        alert("Task Added");
        const updatedTasks = await fetchTaskData();
        const sortedTasks = updatedTasks.sort(
          (a, b) => new Date(a[2]).getTime() - new Date(b[2]).getTime()
        );

        dispatch(setTasks(sortedTasks));
        localStorage.setItem(
          "taskData",
          JSON.stringify({ data: sortedTasks, time: Date.now() })
        );

        setediting(null);
        setrefresh(!refresh);
        onClose();
      } else {
        alert("Error adding task");
      }
    } catch (error) {
      console.error("Add error:", error);
      alert("Something went wrong while adding the task.");
    }
  };

  const editTask = async () => {
    try {
      const date = isEditing[3];

      const response = await fetchWithLoading(
        "https://sheeladecor.netlify.app/.netlify/functions/server/updatePaintstask",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            title: taskName,
            description,
            dateTime,
            date,
            assigneeLink: assignee,
            projectLink: project,
            priority,
            status,
          }),
        }
      );

      if (response.status === 200) {
        alert("Task updated");

        const updatedTasks = await fetchTaskData();
        const sortedTasks = updatedTasks.sort(
          (a, b) => new Date(a[2]).getTime() - new Date(b[2]).getTime()
        );

        dispatch(setTasks(sortedTasks));
        localStorage.setItem(
          "taskData",
          JSON.stringify({ data: sortedTasks, time: Date.now() })
        );

        setediting(null);
        setrefresh(true);
        onClose();
      } else {
        alert("Error updating task");
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("Something went wrong while updating the task.");
    }
  };

  const cancel = () => {
    if (taskDialogOpen) {
      dispatch(setProjectFlag(true));
      if (!dispatch) navigate("/projects");
      dispatch(setTaskDialogOpen(false));
    }
    setediting(null);
    onClose();
  };

  return (
    <div className="absolute top-10 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-lg">
      <div className="relative bg-white shadow-lg rounded-lg p-6 w-full border">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          📝 {isEditing ? "Edit Task" : "Add Task"}
        </h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            isEditing ? editTask() : addTask();
          }}
        >
          {/* Task Name */}
          {!isEditing && (
            <input
              type="text"
              placeholder="Task Name"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              className="w-full border p-2 rounded mb-3"
              required
            />
          )}
          {isEditing && (
            <input
              type="text"
              placeholder="Task Name"
              value={taskName}
              className="w-full border p-2 rounded mb-3"
              required
            />
          )}

          {/* Description */}
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border p-2 rounded mb-3"
          />

          {/* Date */}
          <input
            type="date"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
            className="w-full border p-2 rounded mb-3"
            required
          />

          {/* Assignee */}
          <input
            type="text"
            placeholder="Assignee"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            className="w-full border p-2 rounded mb-3"
          />

          {/* Project Selection */}
          <select
            value={project}
            onChange={(e) => setProject(e.target.value)}
            className="w-full border p-2 rounded mb-3"
          >
            <option value="">Select Project</option>
            {projectData.map((project, index) => (
              <option key={index} value={project.projectName}>
                {project.projectName}
              </option>
            ))}
          </select>

          {/* Priority */}
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full border p-2 rounded mb-3"
          >
            <option value="High">High</option>
            <option value="Moderate">Moderate</option>
            <option value="Low">Low</option>
          </select>

          {/* Status */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border p-2 rounded mb-3"
          >
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          {/* Buttons */}
          <div className="flex justify-end gap-4 mt-4">
            <button
              type="button"
              onClick={cancel}
              className="px-4 py-2 bg-gray-400 text-white rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {isEditing ? "Edit Task" : "Add Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskDialog;
