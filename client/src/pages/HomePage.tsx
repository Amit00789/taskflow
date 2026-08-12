import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    getTodos,
    createTodo,
    updateTodoById,
    deleteTodoById,
    completeAllTodos,
    deleteAllTodos,
} from "../api/todo.api";
import { useAuth } from "../context/AuthContext";
import "./HomePage.css";

interface Todo {
    _id: string;
    title: string;
    description?: string;
    completed: boolean;
    startDate?: string;
    expectedCompletionDate?: string;
    completedAt?: string | null;
}

type ModalMode =
    | "add"
    | "edit"
    | "delete"
    | "completeAll"
    | "deleteAll"
    | null;

interface TodoForm {
    title: string;
    description: string;
    startDate: string;
    expectedCompletionDate: string;
}

const emptyForm: TodoForm = {
    title: "",
    description: "",
    startDate: "",
    expectedCompletionDate: "",
};

export default function HomePage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [todos, setTodos] = useState<Todo[]>([]);
    const [loading, setLoading] = useState(true);

    const [modalMode, setModalMode] =
        useState<ModalMode>(null);

    const [selectedTodo, setSelectedTodo] =
        useState<Todo | null>(null);

    const [form, setForm] =
        useState<TodoForm>(emptyForm);

    const [submitting, setSubmitting] =
        useState(false);

    const [actionLoading, setActionLoading] =
        useState(false);

    const [error, setError] = useState("");

    useEffect(() => {
        loadTodos();
    }, []);

    async function loadTodos() {
        try {
            setLoading(true);

            const result = await getTodos();

            /*
             * Your API response is:
             *
             * {
             *   success: true,
             *   data: [...]
             * }
             *
             * Keep ALL todos here, including completed ones.
             */
            const data = Array.isArray(result.data?.data)
                ? result.data.data
                : [];

            setTodos(data);
        } catch (error) {
            console.error(
                "Failed to load todos",
                error
            );

            setTodos([]);
        } finally {
            setLoading(false);
        }
    }

    async function handleLogout() {
        try {
            await logout();
            navigate("/auth");
        } catch (error) {
            console.error(
                "Logout failed",
                error
            );
        }
    }

    function openAddModal() {
        setError("");
        setSelectedTodo(null);
        setForm(emptyForm);
        setModalMode("add");
    }

    function openEditModal(todo: Todo) {
        setError("");
        setSelectedTodo(todo);

        setForm({
            title: todo.title,
            description: todo.description || "",
            startDate: todo.startDate
                ? formatDateForInput(todo.startDate)
                : "",
            expectedCompletionDate:
                todo.expectedCompletionDate
                    ? formatDateForInput(
                          todo.expectedCompletionDate
                      )
                    : "",
        });

        setModalMode("edit");
    }

    function openDeleteModal(todo: Todo) {
        setError("");
        setSelectedTodo(todo);
        setModalMode("delete");
    }

    function openCompleteAllModal() {
        if (pendingTodos.length === 0) return;

        setError("");
        setModalMode("completeAll");
    }

    function openDeleteAllModal() {
        if (todos.length === 0) return;

        setError("");
        setModalMode("deleteAll");
    }

    function closeModal() {
        if (submitting || actionLoading) return;

        setModalMode(null);
        setSelectedTodo(null);
        setForm(emptyForm);
        setError("");
    }

    function formatDateForInput(date: string) {
        return new Date(date)
            .toISOString()
            .split("T")[0];
    }

    function handleInputChange(
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement
        >
    ) {
        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    }

    async function handleSubmit(
        e: React.FormEvent
    ) {
        e.preventDefault();

        setError("");

        if (!form.title.trim()) {
            setError("Task title is required.");
            return;
        }

        if (
            form.startDate &&
            form.expectedCompletionDate &&
            form.expectedCompletionDate <
                form.startDate
        ) {
            setError(
                "Expected completion date cannot be before the start date."
            );

            return;
        }

        try {
            setSubmitting(true);

            if (modalMode === "add") {
                await createTodo({
                    title: form.title.trim(),
                    description:
                        form.description.trim(),
                    startDate:
                        form.startDate || undefined,
                    expectedCompletionDate:
                        form.expectedCompletionDate ||
                        undefined,
                });
            }

            if (
                modalMode === "edit" &&
                selectedTodo
            ) {
                await updateTodoById(
                    selectedTodo._id,
                    {
                        title: form.title.trim(),
                        description:
                            form.description.trim(),
                        startDate:
                            form.startDate || undefined,
                        expectedCompletionDate:
                            form.expectedCompletionDate ||
                            undefined,
                    }
                );
            }

            setModalMode(null);
            setSelectedTodo(null);
            setForm(emptyForm);

            await loadTodos();
        } catch (error: any) {
            setError(
                error?.response?.data?.error
                    ?.message ||
                    error?.response?.data?.message ||
                    "Unable to save task."
            );
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDeleteTodo() {
        if (!selectedTodo) return;

        try {
            setActionLoading(true);
            setError("");

            await deleteTodoById(
                selectedTodo._id
            );

            setTodos((current) =>
                current.filter(
                    (todo) =>
                        todo._id !==
                        selectedTodo._id
                )
            );

            setModalMode(null);
            setSelectedTodo(null);
        } catch (error: any) {
            setError(
                error?.response?.data?.error
                    ?.message ||
                    error?.response?.data?.message ||
                    "Unable to delete task."
            );
        } finally {
            setActionLoading(false);
        }
    }

    async function handleComplete(
        todo: Todo
    ) {
        try {
            setActionLoading(true);
            setError("");

            const today = new Date()
                .toISOString()
                .split("T")[0];

            const result =
                await updateTodoById(
                    todo._id,
                    {
                        title: todo.title,
                        description:
                            todo.description || "",
                        startDate: todo.startDate
                            ? formatDateForInput(
                                  todo.startDate
                              )
                            : "",
                        expectedCompletionDate:
                            today,
                        completed: true,
                    }
                );

            /*
             * Update only this task.
             * Completed tasks remain visible.
             */
            setTodos((current) =>
                current.map((item) =>
                    item._id === todo._id
                        ? result.data?.data ||
                          result.data ||
                          {
                              ...item,
                              completed: true,
                              expectedCompletionDate:
                                  today,
                              completedAt:
                                  new Date().toISOString(),
                          }
                        : item
                )
            );
        } catch (error: any) {
            console.error(
                "Failed to complete task",
                error
            );

            setError(
                error?.response?.data?.error
                    ?.message ||
                    error?.response?.data?.message ||
                    "Unable to complete task."
            );
        } finally {
            setActionLoading(false);
        }
    }

    async function handleCompleteAll() {
        try {
            setActionLoading(true);
            setError("");

            await completeAllTodos();

            /*
             * IMPORTANT:
             *
             * Do NOT call:
             *
             * setTodos([])
             *
             * and do not filter completed tasks.
             *
             * Complete All changes the existing tasks
             * into completed tasks.
             */

            const completedAt =
                new Date().toISOString();

            const today =
                completedAt.split("T")[0];

            setTodos((current) =>
                current.map((todo) => {
                    if (todo.completed) {
                        return todo;
                    }

                    return {
                        ...todo,
                        completed: true,
                        completedAt,
                        expectedCompletionDate:
                            today,
                    };
                })
            );

            setModalMode(null);
        } catch (error: any) {
            console.error(
                "Failed to complete all tasks",
                error
            );

            setError(
                error?.response?.data?.error
                    ?.message ||
                    error?.response?.data?.message ||
                    "Unable to complete all tasks."
            );
        } finally {
            setActionLoading(false);
        }
    }

    async function handleDeleteAll() {
        try {
            setActionLoading(true);
            setError("");

            await deleteAllTodos();

            /*
             * Delete All really should empty
             * the frontend list.
             */
            setTodos([]);

            setModalMode(null);
        } catch (error: any) {
            console.error(
                "Failed to delete all tasks",
                error
            );

            setError(
                error?.response?.data?.error
                    ?.message ||
                    error?.response?.data?.message ||
                    "Unable to delete all tasks."
            );
        } finally {
            setActionLoading(false);
        }
    }

    function getTaskStatus(todo: Todo) {
        if (todo.completed) {
            return "completed";
        }

        if (todo.expectedCompletionDate) {
            const today = new Date();

            today.setHours(
                0,
                0,
                0,
                0
            );

            const dueDate = new Date(
                todo.expectedCompletionDate
            );

            dueDate.setHours(
                0,
                0,
                0,
                0
            );

            if (dueDate < today) {
                return "overdue";
            }

            if (
                dueDate.getTime() ===
                today.getTime()
            ) {
                return "due-today";
            }
        }

        return "pending";
    }

    function formatDate(
        date?: string | null
    ) {
        if (!date) return "—";

        return new Date(
            date
        ).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    }

    const pendingTodos = todos.filter(
        (todo) => !todo.completed
    );

    const completedTodos = todos.filter(
        (todo) => todo.completed
    );

    const overdueTodos =
        pendingTodos.filter(
            (todo) =>
                getTaskStatus(todo) ===
                "overdue"
        );

    return (
        <div className="dashboard">

            {/* ================= NAVBAR ================= */}

            <header className="navbar">
                <div className="brand">
                    <div className="brand-mark">
                        T
                    </div>

                    <span>TaskFlow</span>
                </div>

                <div className="nav-right">

                    <div className="user-profile">
                        <div className="user-avatar">
                            {user?.name
                                ?.charAt(0)
                                .toUpperCase()}
                        </div>

                        <div className="user-details">
                            <span className="user-name">
                                {user?.name}
                            </span>

                            <span className="user-workspace">
                                Workspace
                            </span>
                        </div>
                    </div>

                    <button
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>
            </header>

            {/* ================= MAIN ================= */}

            <main className="dashboard-content">

                {/* ================= WELCOME ================= */}

                <section className="welcome-section">

                    <div>
                        <p className="eyebrow">
                            YOUR WORKSPACE
                        </p>

                        <h1>
                            Welcome,{" "}
                            {user?.name}
                            <span className="welcome-wave">
                                👋
                            </span>
                        </h1>

                        <p className="welcome-text">
                            Stay focused and keep
                            your work moving.
                        </p>
                    </div>

                    <button
                        className="primary-button add-main-button"
                        onClick={openAddModal}
                    >
                        <span>+</span>
                        Add Task
                    </button>
                </section>

                {/* ================= OVERDUE ================= */}

                {overdueTodos.length > 0 && (
                    <div className="warning-banner">
                        <div className="warning-icon">
                            !
                        </div>

                        <div>
                            <strong>
                                {overdueTodos.length}{" "}
                                {overdueTodos.length ===
                                1
                                    ? "task is"
                                    : "tasks are"}{" "}
                                overdue
                            </strong>

                            <p>
                                Review your deadlines
                                and update the
                                expected completion
                                dates if needed.
                            </p>
                        </div>
                    </div>
                )}

                {/* ================= STATS ================= */}

                <section className="stats-grid">

                    <div className="stat-card">
                        <div className="stat-icon">
                            ✓
                        </div>

                        <div className="stat-content">
                            <span className="stat-label">
                                TOTAL TASKS
                            </span>

                            <strong>
                                {todos.length}
                            </strong>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon pending-icon">
                            ○
                        </div>

                        <div className="stat-content">
                            <span className="stat-label">
                                PENDING
                            </span>

                            <strong>
                                {pendingTodos.length}
                            </strong>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon completed-icon">
                            ✓
                        </div>

                        <div className="stat-content">
                            <span className="stat-label">
                                COMPLETED
                            </span>

                            <strong>
                                {completedTodos.length}
                            </strong>
                        </div>
                    </div>

                    <div className="stat-card danger-stat">
                        <div className="stat-icon danger-icon">
                            !
                        </div>

                        <div className="stat-content">
                            <span className="stat-label">
                                OVERDUE
                            </span>

                            <strong>
                                {overdueTodos.length}
                            </strong>
                        </div>
                    </div>

                </section>

                {/* ================= TASK SECTION ================= */}

                <section className="todo-section">

                    <div className="section-header">

                        <div>
                            <p className="eyebrow">
                                TASK MANAGEMENT
                            </p>

                            <h2>
                                My Tasks
                            </h2>

                            <p className="section-subtitle">
                                {pendingTodos.length}{" "}
                                pending ·{" "}
                                {completedTodos.length}{" "}
                                completed
                            </p>
                        </div>

                        {todos.length > 0 && (
                            <div className="task-toolbar">

                                <button
                                    className="secondary-button complete-all-button"
                                    onClick={
                                        openCompleteAllModal
                                    }
                                    disabled={
                                        actionLoading ||
                                        pendingTodos.length ===
                                            0
                                    }
                                >
                                    ✓ Complete All
                                </button>

                                <button
                                    className="danger-button"
                                    onClick={
                                        openDeleteAllModal
                                    }
                                    disabled={
                                        actionLoading
                                    }
                                >
                                    Delete All
                                </button>

                            </div>
                        )}

                    </div>

                    {/* ================= TASK BODY ================= */}

                    {loading ? (

                        <div className="empty-state">
                            <div className="loading-spinner" />

                            <p>
                                Loading your tasks...
                            </p>
                        </div>

                    ) : todos.length === 0 ? (

                        <div className="empty-state">

                            <div className="empty-icon">
                                +
                            </div>

                            <h3>
                                Your workspace is empty
                            </h3>

                            <p>
                                Create your first task
                                and start organizing
                                your work.
                            </p>

                            <button
                                className="primary-button"
                                onClick={
                                    openAddModal
                                }
                            >
                                Create your first task
                            </button>

                        </div>

                    ) : (

                        <div className="todo-list">

                            {todos.map((todo) => {

                                const status =
                                    getTaskStatus(
                                        todo
                                    );

                                return (
                                    <article
                                        className={`todo-card ${status}`}
                                        key={todo._id}
                                    >

                                        <div className="todo-card-content">

                                            <div className="todo-title-row">

                                                <h3>
                                                    {
                                                        todo.title
                                                    }
                                                </h3>

                                                <span
                                                    className={`status ${status}`}
                                                >
                                                    <span className="status-dot" />

                                                    {status ===
                                                    "completed"
                                                        ? "Completed"
                                                        : status ===
                                                          "overdue"
                                                        ? "Overdue"
                                                        : status ===
                                                          "due-today"
                                                        ? "Due Today"
                                                        : "Pending"}
                                                </span>

                                            </div>

                                            {todo.description && (
                                                <p className="todo-description">
                                                    {
                                                        todo.description
                                                    }
                                                </p>
                                            )}

                                            <div className="todo-meta">

                                                {todo.startDate && (
                                                    <span>
                                                        <small>
                                                            Start
                                                        </small>

                                                        <strong>
                                                            {formatDate(
                                                                todo.startDate
                                                            )}
                                                        </strong>
                                                    </span>
                                                )}

                                                {todo.expectedCompletionDate && (
                                                    <span>
                                                        <small>
                                                            Expected
                                                        </small>

                                                        <strong>
                                                            {formatDate(
                                                                todo.expectedCompletionDate
                                                            )}
                                                        </strong>
                                                    </span>
                                                )}

                                                {todo.completedAt && (
                                                    <span className="completed-date">
                                                        <small>
                                                            Completed
                                                        </small>

                                                        <strong>
                                                            {formatDate(
                                                                todo.completedAt
                                                            )}
                                                        </strong>
                                                    </span>
                                                )}

                                            </div>

                                        </div>

                                        <div className="todo-actions">

                                            <button
                                                className="secondary-button"
                                                onClick={() =>
                                                    openEditModal(
                                                        todo
                                                    )
                                                }
                                                disabled={
                                                    actionLoading
                                                }
                                            >
                                                Edit
                                            </button>

                                            {!todo.completed && (
                                                <button
                                                    className="primary-button small"
                                                    onClick={() =>
                                                        handleComplete(
                                                            todo
                                                        )
                                                    }
                                                    disabled={
                                                        actionLoading
                                                    }
                                                >
                                                    Complete
                                                </button>
                                            )}

                                            <button
                                                className="icon-danger-button"
                                                onClick={() =>
                                                    openDeleteModal(
                                                        todo
                                                    )
                                                }
                                                disabled={
                                                    actionLoading
                                                }
                                                title="Delete task"
                                            >
                                                ×
                                            </button>

                                        </div>

                                    </article>
                                );
                            })}

                        </div>
                    )}

                </section>

            </main>

            {/* =================================================
                ADD / EDIT MODAL
               ================================================= */}

            {(modalMode === "add" ||
                modalMode === "edit") && (

                <div
                    className="modal-overlay"
                    onMouseDown={(e) => {
                        if (
                            e.target ===
                            e.currentTarget
                        ) {
                            closeModal();
                        }
                    }}
                >

                    <div className="task-modal">

                        <div className="modal-header">

                            <div>
                                <p className="eyebrow">
                                    TASKFLOW
                                </p>

                                <h2>
                                    {modalMode ===
                                    "add"
                                        ? "Create a task"
                                        : "Edit task"}
                                </h2>

                                <p>
                                    {modalMode ===
                                    "add"
                                        ? "Add something you want to accomplish."
                                        : "Update the details and deadline for this task."}
                                </p>
                            </div>

                            <button
                                type="button"
                                className="modal-close"
                                onClick={
                                    closeModal
                                }
                                disabled={
                                    submitting
                                }
                            >
                                ×
                            </button>

                        </div>

                        <form
                            className="task-form"
                            onSubmit={
                                handleSubmit
                            }
                        >

                            <div className="form-group">

                                <label htmlFor="title">
                                    Task title
                                </label>

                                <input
                                    id="title"
                                    name="title"
                                    type="text"
                                    placeholder="e.g. Learn AWS"
                                    value={
                                        form.title
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    required
                                />

                            </div>

                            <div className="form-group">

                                <label htmlFor="description">
                                    Description
                                </label>

                                <textarea
                                    id="description"
                                    name="description"
                                    placeholder="What do you need to accomplish?"
                                    value={
                                        form.description
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    rows={4}
                                />

                            </div>

                            <div className="date-grid">

                                <div className="form-group">

                                    <label htmlFor="startDate">
                                        Start date
                                    </label>

                                    <input
                                        id="startDate"
                                        name="startDate"
                                        type="date"
                                        value={
                                            form.startDate
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                    />

                                </div>

                                <div className="form-group">

                                    <label htmlFor="expectedCompletionDate">
                                        Expected completion
                                    </label>

                                    <input
                                        id="expectedCompletionDate"
                                        name="expectedCompletionDate"
                                        type="date"
                                        value={
                                            form.expectedCompletionDate
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                    />

                                </div>

                            </div>

                            {error && (
                                <div className="form-error">
                                    <span>!</span>
                                    {error}
                                </div>
                            )}

                            <div className="modal-actions">

                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={
                                        closeModal
                                    }
                                    disabled={
                                        submitting
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="primary-button"
                                    disabled={
                                        submitting
                                    }
                                >
                                    {submitting
                                        ? "Saving..."
                                        : modalMode ===
                                          "add"
                                        ? "Create Task"
                                        : "Save Changes"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

            {/* =================================================
                DELETE SINGLE TASK MODAL
               ================================================= */}

            {modalMode === "delete" &&
                selectedTodo && (

                <div
                    className="modal-overlay"
                    onMouseDown={(e) => {
                        if (
                            e.target ===
                            e.currentTarget
                        ) {
                            closeModal();
                        }
                    }}
                >

                    <div className="confirmation-modal">

                        <div className="confirmation-icon danger">
                            !
                        </div>

                        <p className="eyebrow">
                            DELETE TASK
                        </p>

                        <h2>
                            Delete this task?
                        </h2>

                        <p className="confirmation-text">
                            You're about to delete{" "}
                            <strong>
                                "{selectedTodo.title}"
                            </strong>
                            . This action cannot be
                            undone.
                        </p>

                        {error && (
                            <div className="form-error">
                                <span>!</span>
                                {error}
                            </div>
                        )}

                        <div className="modal-actions">

                            <button
                                className="secondary-button"
                                onClick={
                                    closeModal
                                }
                                disabled={
                                    actionLoading
                                }
                            >
                                Cancel
                            </button>

                            <button
                                className="danger-button danger-confirm"
                                onClick={
                                    handleDeleteTodo
                                }
                                disabled={
                                    actionLoading
                                }
                            >
                                {actionLoading
                                    ? "Deleting..."
                                    : "Delete Task"}
                            </button>

                        </div>

                    </div>

                </div>
            )}

            {/* =================================================
                COMPLETE ALL MODAL
               ================================================= */}

            {modalMode ===
                "completeAll" && (

                <div
                    className="modal-overlay"
                    onMouseDown={(e) => {
                        if (
                            e.target ===
                            e.currentTarget
                        ) {
                            closeModal();
                        }
                    }}
                >

                    <div className="confirmation-modal">

                        <div className="confirmation-icon success">
                            ✓
                        </div>

                        <p className="eyebrow">
                            COMPLETE TASKS
                        </p>

                        <h2>
                            Complete all tasks?
                        </h2>

                        <p className="confirmation-text">
                            This will mark all{" "}
                            <strong>
                                {pendingTodos.length}
                            </strong>{" "}
                            pending{" "}
                            {pendingTodos.length ===
                            1
                                ? "task"
                                : "tasks"}{" "}
                            as completed and record
                            today as their completion
                            date.
                        </p>

                        {error && (
                            <div className="form-error">
                                <span>!</span>
                                {error}
                            </div>
                        )}

                        <div className="modal-actions">

                            <button
                                className="secondary-button"
                                onClick={
                                    closeModal
                                }
                                disabled={
                                    actionLoading
                                }
                            >
                                Cancel
                            </button>

                            <button
                                className="primary-button"
                                onClick={
                                    handleCompleteAll
                                }
                                disabled={
                                    actionLoading
                                }
                            >
                                {actionLoading
                                    ? "Completing..."
                                    : "Complete All"}
                            </button>

                        </div>

                    </div>

                </div>
            )}

            {/* =================================================
                DELETE ALL MODAL
               ================================================= */}

            {modalMode ===
                "deleteAll" && (

                <div
                    className="modal-overlay"
                    onMouseDown={(e) => {
                        if (
                            e.target ===
                            e.currentTarget
                        ) {
                            closeModal();
                        }
                    }}
                >

                    <div className="confirmation-modal">

                        <div className="confirmation-icon danger">
                            !
                        </div>

                        <p className="eyebrow">
                            DELETE ALL
                        </p>

                        <h2>
                            Delete all tasks?
                        </h2>

                        <p className="confirmation-text">
                            This will permanently
                            delete all{" "}
                            <strong>
                                {todos.length}
                            </strong>{" "}
                            tasks in your workspace.
                            This action cannot be
                            undone.
                        </p>

                        {error && (
                            <div className="form-error">
                                <span>!</span>
                                {error}
                            </div>
                        )}

                        <div className="modal-actions">

                            <button
                                className="secondary-button"
                                onClick={
                                    closeModal
                                }
                                disabled={
                                    actionLoading
                                }
                            >
                                Cancel
                            </button>

                            <button
                                className="danger-button danger-confirm"
                                onClick={
                                    handleDeleteAll
                                }
                                disabled={
                                    actionLoading
                                }
                            >
                                {actionLoading
                                    ? "Deleting..."
                                    : "Delete All"}
                            </button>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
}