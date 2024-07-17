import axios from "axios";
import { useEffect, useState } from "react";

interface Book {
  cover_i: number;
  title: string;
  author_name?: string[];
  first_publish_year: number;
  key: string;
  inFavorites?: boolean;
  read?: boolean;
}

interface FavoritesApi {
  _id: string,
  name: string,
  code: string,
  details: {cover_i: number, author: string[], year: number},
  active: boolean,
  delete: boolean,
}

const FetchApi = () => {
  const SEARCH_URL = "https://openlibrary.org/search.json";
  const FAVORITES_URL = "http://192.168.0.246:3000/test/";

  const [books, setBooks] = useState<Book[]>([]);
  const [inputSearch, setInputSearch] = useState("");
  const [searchType, setSearchType] = useState("title");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Book[]>([]);

  useEffect(() => {
    axios.post(`${FAVORITES_URL}get/all`).then((response) => {
      const data = response.data;
      const favoriteBooks =  data.map((book: FavoritesApi) => ({
        cover_i: book.details.cover_i,
        title: book.name,
        author_name: book.details.author,
        first_publish_year: book.details.year,
        key: book._id,
        inFavorites: true,
        read: book.active
      }))
      setFavorites(favoriteBooks)
    }).catch ((error) => {
      // setError("Error fetching favorites")
      console.error(error)
    })
  }, []);

  const searchBook = async () => {
    setLoading(true);

    try {
      if (searchType === "favorites") {
        const filteredFavorites = favorites.filter((book) => book.title.toLowerCase().includes(inputSearch.toLocaleLowerCase()));
        
        setBooks(filteredFavorites);
        setError(filteredFavorites.length === 0 ?
          "No se encontraron libros" : null
        )
      } else {
        const query = inputSearch.toLowerCase().replace(/\s+/g, "+");
        const response = await fetch(`${SEARCH_URL}?${searchType}=${query}`);
        if (!response.ok) {
          throw new Error("Error de concección");
        }
        const data = await response.json();
        if (data.docs === 0) {
          setError("No se encontraron libros");
        } else {
          const updatedBooks = data.docs.map((book: Book) => {
            const isInFavorites = favorites.some((fav) => fav.key === book.key);
            const isRead = isInFavorites ? favorites.find((fav) => fav.key === book.key)?.read : false;

            return {
              cover_i: book.cover_i,
              title: book.title,
              author_name: book.author_name,
              first_publish_year: book.first_publish_year,
              key: book.key,
              inFavorites: isInFavorites,
              read: isRead
            }
          });
          setBooks(updatedBooks);
          setError(null);
        }
      }
    } catch (error) {
      setError("Error en la búsqueda");
    } finally {
      setLoading(false);
    }
  };

  const handleEnter = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      searchBook();
    }
  };

  const coverUrl = (cover_i: number) => `https://covers.openlibrary.org/b/id/${cover_i}-M.jpg`;

  const addFavorite = async (book: Book) => {
    axios
      .post(`${FAVORITES_URL}create`, {
        _id: book.key,
        name: book.title,
        code: book.key,
        details: {cover_i: book.cover_i, author: book.author_name, year: book.first_publish_year},
        active: book.read,
        delete: false,
      })
      .then(function (response) {
        console.log(response);
        setFavorites((prevFavorites) => [
          ...prevFavorites,
          { ...book, inFavorites: true },
        ]);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const removeFavorite = async (book: Book) => {
    axios
      .post(`${FAVORITES_URL}delete`, {
        _id: book.key,
      })
      .then(function (response) {
        console.log(response);
        setFavorites((prevFavorites) =>
          prevFavorites.filter((fav) => fav.key !== book.key))
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const handleFavorite = (book: Book) => {
    book.inFavorites ? removeFavorite(book) : addFavorite(book);
  };

  const markAsRead = async (book: Book) => {
    try {
      const response = await axios.post(`${FAVORITES_URL}change/active`, {
        _id: book.key,
        active: !book.read
      });

      if(response.status === 200) {
        setFavorites((prevFavorites) =>
          prevFavorites.map((fav) =>
          fav.key === book.key ? { ...fav, read: !book.read } : fav )
        );
        setBooks((prevBooks) =>
          prevBooks.map((b) =>
          b.key === book.key ? { ...b, read: !book.read } : b )
        );
      }
    } catch (error) {
      console.error("Error marcando como leído")
    }
  }

  return (
    <div>
      <div className="inputs-contain">
        <div className="custom_input">
          <svg
            viewBox="0 0 16 16"
            className="svg_icon bi-search"
            xmlns="http://www.w3.org/2000/svg"
            onClick={searchBook}>
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
          </svg>
          <input
            placeholder={searchType === "favorites"?
               "Buscar en favoritos" 
            : "Explora en la librería"}
            value={inputSearch}
            onChange={(e) => setInputSearch(e.target.value)}
            onKeyDown={handleEnter}
            type="text"
            className="input"
          />
        </div>
        <div className="checkbox-wrapper">
          <input
            type="checkbox"
            className="check"
            id="check1-61"
            checked={searchType === "favorites"}
            onChange={(e) =>
              setSearchType(e.target.checked ? "favorites" : "title")
            }
          />
          <label
            htmlFor="check1-61"
            className="label">
            <svg
              width={40}
              height={40}
              viewBox="0 0 95 95">
              <rect
                x={30}
                y={20}
                width={50}
                height={50}
                stroke="#7c7c7c"
                fill="white"
              />
              <g transform="translate(0,-952.36222)">
                <path
                  d="m 56,963 c -102,122 6,9 7,9 17,-5 -66,69 -38,52 122,-77 -7,14 18,4 29,-11 45,-43 23,-4"
                  stroke="#262626"
                  strokeWidth={3}
                  fill="none"
                  className="path1"
                />
              </g>
            </svg>
            <span className="check-autor">Favoritos</span>
          </label>
        </div>
      </div>
      <div className="message">
        {loading && <h3>Buscando...</h3>}
        {error && !loading && <h3>{error}</h3>}
      </div>
      {books.length > 0 && !loading && (
        <div className="cards-container">
          {books.map((book) => (
            <div
              key={book.key}
              className="book">
              <img
                className="cover"
                src={
                  book.cover_i
                    ? coverUrl(book.cover_i)
                    : "https://i.pinimg.com/736x/5e/e7/8e/5ee78e0c955b614f3e71f824bfa9f78f.jpg"
                }
              />
              <div className="inside-book">
                <h3 className="title-book">{book.title}</h3>
                <div className="details">
                  <h5>
                    {book.author_name
                      ? book.author_name.join(", ")
                      : "Desconocido"}
                  </h5>
                  <h5>Año: {book.first_publish_year}</h5>
                </div>
                <div className="fav-contain">
                  <label className="ui-bookmark">
                    <input
                      type="checkbox"
                      checked={book.inFavorites}
                      onChange={() => handleFavorite(book)}
                    />
                    <div className="bookmark">
                      <svg viewBox="0 0 32 32">
                        <g>
                          <path d="M27 4v27a1 1 0 0 1-1.625.781L16 24.281l-9.375 7.5A1 1 0 0 1 5 31V4a4 4 0 0 1 4-4h14a4 4 0 0 1 4 4z" />
                        </g>
                      </svg>
                    </div>
                  </label>
                </div>
                <div className="mark-as-read">
                  <label className="container-eye">
                    <input
                      type="checkbox"
                      checked={book.read}
                      onChange={() => markAsRead(book)}
                    />
                    <svg
                      className="eye"
                      xmlns="http://www.w3.org/2000/svg"
                      height="0.7em"
                      viewBox="0 0 576 512"
                    >
                      <title>Marcar como no leído</title>
                      <path d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z" />
                    </svg>
                    <svg
                      className="eye-slash"
                      xmlns="http://www.w3.org/2000/svg"
                      height="0.7em"
                      viewBox="0 0 640 512"
                    >
                      <title>Marcar como leído</title>
                      <path d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L525.6 386.7c39.6-40.6 66.4-86.1 79.9-118.4c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C465.5 68.8 400.8 32 320 32c-68.2 0-125 26.3-169.3 60.8L38.8 5.1zM223.1 149.5C248.6 126.2 282.7 112 320 112c79.5 0 144 64.5 144 144c0 24.9-6.3 48.3-17.4 68.7L408 294.5c8.4-19.3 10.6-41.4 4.8-63.3c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3c0 10.2-2.4 19.8-6.6 28.3l-90.3-70.8zM373 389.9c-16.4 6.5-34.3 10.1-53 10.1c-79.5 0-144-64.5-144-144c0-6.9 .5-13.6 1.4-20.2L83.1 161.5C60.3 191.2 44 220.8 34.5 243.7c-3.3 7.9-3.3 16.7 0 24.6c14.9 35.7 46.2 87.7 93 131.1C174.5 443.2 239.2 480 320 480c47.8 0 89.9-12.9 126.2-32.5L373 389.9z" />
                    </svg>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {favorites.length === 0 && books.length === 0 && (
        <div className="load-contain">
          <div className="loader">
            <div className="book-load">
              <div className="page" />
              <div className="page page2" />
            </div>
          </div>
        </div>
      )
    }
    </div>
  );
};

export default FetchApi;
