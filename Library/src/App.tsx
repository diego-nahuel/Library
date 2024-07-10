import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const URL = "https://openlibrary.org/search.json";
  const [data, setData] = useState([]);
  const [searching, setSearching] = useState("");

  useEffect(() => {
    fetch(`${URL}?${searching}`)
      .then((res) => res.json())
      .then((data) => console.log(data));
  }, [searching]);

  const handleSearch = (e) => {
    setSearching(e.target.value);
  };

  return (
    <>
      <h1>Library</h1>
      <input
        className="search-input"
        type="text"
        placeholder="Busca un libro"
      />
      <button onChange={handleSearch}>Buscar</button>
    </>
  );
}

export default App;
