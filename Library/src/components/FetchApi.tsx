import { useState } from "react";

interface Book {
  cover_i: number;
  title: string;
  author_name?: string[];
  first_publish_year: number;
  key: string;
}
interface Favorite {
    _id?: string
    name: string
    code: string
    details: object
    active: boolean
    delete: boolean
}

const FetchApi = () => {
  const SEARCH_URL = "https://openlibrary.org/search.json";
  const POST_URL = "http://192.168.0.246:6000/test/";
  const [books, setBooks] = useState<Book[]>([]);
  const [inputSearch, setInputSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favouriteBook, setFavouriteBook] = useState<Favorite>();


  const searchBook = async () => {
    setLoading(true);
    const query = inputSearch.toLowerCase().replace(/\s+/g, "+");

    try {
      const response = await fetch(`${SEARCH_URL}?q=${query}`);
      if (!response.ok) {
        throw new Error("Error de concección");
      }
      const data = await response.json();
      data.docs === 0
        ? setError("No encontramos el libro")
        : setBooks(data.docs);
    } catch (error) {
      setError("Error en la búsqueda");
    } finally {
      setLoading(false);
    }
  };

  const coverUrl = (cover_i: number) =>
    `https://covers.openlibrary.org/b/id/${cover_i}-L.jpg`;

  const saveFavourite = async (book: Book) => {
    const bookFavourite = ()
    const response = await fetch(`${POST_URL}/`, {
      method: "POST",
      body: book,
    });
  };

  return (
    <div>
      <input
        value={inputSearch}
        placeholder="Busca un libro"
        onChange={(e) => setInputSearch(e.target.value)}
      />
      <button onClick={searchBook}>Buscar</button>
      {loading && <h3>Buscando...</h3>}
      {error && <h3>{error}</h3>}
      {books.length > 0 && (
        <div>
          {books.map((book) => (
            <div key={book.key}>
              <h3>{book.title}</h3>
              <h5>
                {book.author_name ? book.author_name.join(", ") : "Desconocido"}
              </h5>
              <h6>Año: {book.first_publish_year}</h6>
              <img src={coverUrl(book.cover_i)} />
              <button onClick={() => saveFavourite(book)}>Agregar a favoritos</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FetchApi;
