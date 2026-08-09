import { useEffect, useState } from "react";
import { getHealth } from "./services/api";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    getHealth()
      .then((data) => {
        setMessage(data.message);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  return (
    <div>
      <h1>Todo App</h1>
      <p>{message}</p>
    </div>
  );
}

export default App;