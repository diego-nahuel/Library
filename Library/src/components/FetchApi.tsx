import { useEffect, useState } from "react"

interface Book {
  cover_i: number
  title: string
  author_name?: string[]
  first_publish_year: number
  key: string
  inFavorites?: boolean
}

const FetchApi = () => {
  const SEARCH_URL = "https://openlibrary.org/search.json"
  const FAVORITES_URL = "http://192.168.0.246:6000/test/"

  const [books, setBooks] = useState<Book[]>([])
  const [inputSearch, setInputSearch] = useState("")
  const [searchType, setSearchType] = useState("title")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [favorites, setFavorites] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    fetchFavorites()
  }, [])

  const fetchFavorites = async () => {
    try {
      const response = await fetch(`${FAVORITES_URL}/get/all`)
      const data = await response.json()
      const favoriteBooks = data.reduce((acc: { [key: string]: boolean }, book: Book) => {
        acc[book.key] = true
        return acc
      }, {})
      setFavorites(favoriteBooks)
    } catch (error) {
      console.error('Error fetching favorites:', error)
    }
  }

  const searchBook = async () => {
    setLoading(true);
    const query = inputSearch.toLowerCase().replace(/\s+/g, "+")

    try {
      const response = await fetch(`${SEARCH_URL}?${searchType}=${query}`)
      if (!response.ok) {
        throw new Error("Error de concección")
      }
      const data = await response.json()
        if (data.docs === 0) {
          setError("No se encontraron libros")
        } else {
          const updatedBooks = data.docs.map((book: Book) => ({
           ...book,
           inFavorites: favorites[book.key] || false
         }))
         setBooks(updatedBooks)
         setError(null)
        }
    } catch (error) {
      setError("Error en la búsqueda")
    } finally {
      setLoading(false);
    }
  }

  const handleEnter = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if(event.key === "Enter") { searchBook()}
  }

  const addFavorite = async (book: Book) => {
    try {
      const response = await fetch(`${FAVORITES_URL}/create`, {
        method: "POST",
        headers: {"Contet-Type": "aplication/json"},
        body: JSON.stringify({
          _id: book.key,
          name: book.title,
          code: book.key,
          details: book,
          active: true,
          delete: false
        })
      })
      if(!response.ok) {
        throw new Error("Error al añadir a favoritos");
      }
      setFavorites((prev) => ({ ...prev, [book.key]: true }))
    } catch (error) {
      console.error(error)
    }
  }

  const removeFavorite = async (book: Book) => {
    try {
      const response = await fetch(`${FAVORITES_URL}/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "aplication/json"},
        body: JSON.stringify({
          _id: book.key
        })
      })
      if(!response.ok) {
        throw new Error("Error al eliminar de favoritos");        
      }
      setFavorites((prev) => {
        const updated = { ...prev}
        delete updated[book.key]
        return updated
      })
    } catch (error) {
      console.error(error)
    }
  }

  const handleFavorite = (book: Book) => {
    favorites[book.key] ? removeFavorite(book) : addFavorite(book)
  }

  const coverUrl = (cover_i: number) =>
    `https://covers.openlibrary.org/b/id/${cover_i}-M.jpg`

  return (
    <div>
      <div className="inputs-contain">
        <div className="custom_input">
          <svg
            viewBox="0 0 16 16"
            className="svg_icon bi-search"
            xmlns="http://www.w3.org/2000/svg"
            onClick={searchBook}
          >
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
          </svg>
          <input placeholder="¿Qué quieres leer?" value={inputSearch} onChange={(e) => setInputSearch(e.target.value)} onKeyDown={handleEnter} type="text" className="input" />
        </div>
        <div className="checkbox-wrapper">
          <input
            type="checkbox"
            className="check"
            id="check1-61"
            checked={searchType === 'author'}
            onChange={(e) => setSearchType(e.target.checked ? 'author' : 'title')}
          />
          <label htmlFor="check1-61" className="label">
            <svg width={40} height={40} viewBox="0 0 95 95">
              <rect x={30} y={20} width={50} height={50} stroke="#7c7c7c" fill="white" />
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
            <span className="check-autor">Autor</span>
          </label>
        </div>

      </div>
      <div className="message">
        {loading && <h3>Buscando...</h3>}
        {error && <h3>{error}</h3>}
      </div>
      {books.length > 0 && !loading && (
        <div className="cards-container">
          {books.map((book) => (
            <div key={book.key} className="book">
              <img className="cover" src={book.cover_i ? coverUrl(book.cover_i) : "https://i.pinimg.com/736x/5e/e7/8e/5ee78e0c955b614f3e71f824bfa9f78f.jpg"} />
              <div className="inside-book">
                <h3 className="title-book">{book.title}</h3>
                <div className="details">
                  <h5>
                    {book.author_name ? book.author_name.join(", ") : "Desconocido"}
                  </h5>
                  <h5>Año: {book.first_publish_year}</h5>
                </div>
                <div className="fav-contain">
                  <div className="fav-icon" onClick={() => handleFavorite(book)}>
                    {favorites[book.key] ?
                    <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="icon icon-tabler icons-tabler-filled icon-tabler-bookmark"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M14 2a5 5 0 0 1 5 5v14a1 1 0 0 1 -1.555 .832l-5.445 -3.63l-5.444 3.63a1 1 0 0 1 -1.55 -.72l-.006 -.112v-14a5 5 0 0 1 5 -5h4z" />
                      <title>Eliminar de favoritos</title>
                    </svg>
                    :
                    <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="icon icon-tabler icons-tabler-outline icon-tabler-bookmark"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M18 7v14l-6 -4l-6 4v-14a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4z" />
                      <title>Agregar a favoritos</title>
                    </svg>
                  }
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {books.length === 0 && <div className="load-contain">
          <div className="loader">
            <div className="book-load">
              <div className="page" />
              <div className="page page2" />
            </div>
          </div>
        </div>
      }
    </div>
  );
};

export default FetchApi;
