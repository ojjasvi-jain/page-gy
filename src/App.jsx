import { useState } from "react";
import SearchPage from "./Component/SearchPage";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <SearchPage />
    </>
  );
}

export default App;
