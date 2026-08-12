import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../api/auth.api";
import { useAuth } from "../context/AuthContext";
import './AuthPage.css'

type Mode = "login" | "register";

export default function AuthPage() {
    const [mode, setMode] = useState<Mode>("login");

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    function switchMode(newMode: Mode) {
        setMode(newMode);

        setName("");
        setEmail("");
        setPassword("");
        setError("");
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            if (mode === "register") {
                await registerUser({
                    name,
                    email,
                    password,
                });

                setMode("login");
                setName("");
                setPassword("");
            } else {
                const result = await loginUser({
                    email,
                    password,
                });

                login(
                    result.data.accessToken,
                    result.data.user
                );

                setPassword("");

                navigate("/");
            }
        } catch (error: any) {
            setError(
                error?.response?.data?.error?.message ||
                error?.response?.data?.message ||
                "Something went wrong"
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-page">

            <div className="auth-layout">

                {/* ================= LEFT HERO ================= */}

                <section className="auth-hero">

                    <div className="auth-hero-content">

                        <div className="auth-hero-label">
                            TASKFLOW
                        </div>

                        <h1>
                            Turn your plans
                            <br />
                            into progress.
                        </h1>

                        <p className="auth-hero-description">
                            A focused workspace to organize your tasks,
                            track deadlines, and keep your work moving
                            forward.
                        </p>

                        <div className="auth-features">

                            <div className="auth-feature">
                                <div className="feature-icon">
                                    ✓
                                </div>

                                <div>
                                    <strong>
                                        Organize your work
                                    </strong>

                                    <span>
                                        Keep every task in one place.
                                    </span>
                                </div>
                            </div>

                            <div className="auth-feature">
                                <div className="feature-icon">
                                    ◷
                                </div>

                                <div>
                                    <strong>
                                        Track deadlines
                                    </strong>

                                    <span>
                                        Know what needs your attention.
                                    </span>
                                </div>
                            </div>

                            <div className="auth-feature">
                                <div className="feature-icon">
                                    →
                                </div>

                                <div>
                                    <strong>
                                        Stay focused
                                    </strong>

                                    <span>
                                        Turn plans into meaningful progress.
                                    </span>
                                </div>
                            </div>

                        </div>

                        <p className="auth-hero-footer">
                            Simple task management for focused work.
                        </p>

                    </div>

                </section>


                {/* ================= RIGHT FORM ================= */}

                <section className="auth-form-side">

                    <div className="auth-card">

                        {/* Brand */}

                        <div className="auth-brand">

                            <div className="brand-mark">
                                T
                            </div>

                            <span>
                                TaskFlow
                            </span>

                        </div>


                        {/* Header */}

                        <div className="auth-header">

                            <h2>
                                {mode === "login"
                                    ? "Welcome back"
                                    : "Create your account"}
                            </h2>

                            <p>
                                {mode === "login"
                                    ? "Sign in to continue to your workspace."
                                    : "Start organizing your work with TaskFlow."}
                            </p>

                        </div>


                        {/* Tabs */}

                        <div className="auth-tabs">

                            <button
                                type="button"
                                className={
                                    mode === "login"
                                        ? "auth-tab active"
                                        : "auth-tab"
                                }
                                onClick={() => switchMode("login")}
                            >
                                Login
                            </button>

                            <button
                                type="button"
                                className={
                                    mode === "register"
                                        ? "auth-tab active"
                                        : "auth-tab"
                                }
                                onClick={() => switchMode("register")}
                            >
                                Register
                            </button>

                        </div>


                        {/* Form */}

                        <form
                            onSubmit={handleSubmit}
                            autoComplete={
                                mode === "login"
                                    ? "on"
                                    : "off"
                            }
                        >

                            {mode === "register" && (
                                <div className="form-group">

                                    <label htmlFor="name">
                                        Name
                                    </label>

                                    <input
                                        id="name"
                                        type="text"
                                        placeholder="Your name"
                                        value={name}
                                        onChange={(e) =>
                                            setName(e.target.value)
                                        }
                                        autoComplete="off"
                                        required
                                    />

                                </div>
                            )}


                            <div className="form-group">

                                <label htmlFor="email">
                                    Email
                                </label>

                                <input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(e.target.value)
                                    }
                                    autoComplete={
                                        mode === "login"
                                            ? "username"
                                            : "off"
                                    }
                                    required
                                />

                            </div>


                            <div className="form-group">

                                <label htmlFor="password">
                                    Password
                                </label>

                                <input
                                    id="password"
                                    type="password"
                                    placeholder={
                                        mode === "login"
                                            ? "Enter your password"
                                            : "Create a password"
                                    }
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    autoComplete={
                                        mode === "login"
                                            ? "current-password"
                                            : "new-password"
                                    }
                                    required
                                />

                            </div>


                            {error && (
                                <div className="form-error">
                                    {error}
                                </div>
                            )}


                            <button
                                className="primary-button auth-submit"
                                type="submit"
                                disabled={loading}
                            >
                                {loading
                                    ? "Please wait..."
                                    : mode === "login"
                                        ? "Sign in"
                                        : "Create account"}
                            </button>

                        </form>


                        {/* Footer */}

                        <p className="auth-card-footer">

                            {mode === "login"
                                ? "Don't have an account? "
                                : "Already have an account? "}

                            <button
                                type="button"
                                onClick={() =>
                                    switchMode(
                                        mode === "login"
                                            ? "register"
                                            : "login"
                                    )
                                }
                            >
                                {mode === "login"
                                    ? "Create one"
                                    : "Sign in"}
                            </button>

                        </p>

                    </div>

                </section>

            </div>

        </div>
    );
}