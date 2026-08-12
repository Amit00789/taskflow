import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import AuthPage from "./pages/AuthPages";
import HomePage from "./pages/HomePage";
import { useAuth } from "./context/AuthContext";

function App() {
  const {
    user,
    isInitializing,
  } = useAuth();

  if (isInitializing) {
    return (
      <div className="app-loading">
        Loading TaskFlow...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/auth"
          element={
            user
              ? <Navigate to="/" replace />
              : <AuthPage />
          }
        />

        <Route
          path="/"
          element={
            user
              ? <HomePage />
              : <Navigate to="/auth" replace />
          }
        />

        <Route
          path="*"
          element={
            <Navigate to="/" replace />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;