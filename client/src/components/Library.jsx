"use client";
import { useState, useEffect } from "react";

function Library() {
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchBooks = async (query) => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=10`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch books");
      }
      
      const data = await response.json();
      
      // Transform the API data to match our component's expected format
      const formattedBooks = data.docs.map((book, index) => ({
        id: book.key || index,
        title: book.title,
        type: "E-Book",
        author: book.author_name ? book.author_name.join(", ") : "Unknown",
        format: "PDF",
        size: "Variable",
        downloads: book.edition_count || 0,
        coverUrl: book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : null,
        openLibraryUrl: `https://openlibrary.org${book.key}`
      }));
      
      setBooks(formattedBooks);
    } catch (err) {
      console.error("Error fetching books:", err);
      setError("Failed to fetch books. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchBooks(searchQuery);
  };

  // Initial search to show some results on page load
  useEffect(() => {
    searchBooks("computer science");
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-medium mb-2">Digital Library Resources</h1>
        <p className="text-gray-600">Search and access books from Open Library</p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="search"
            placeholder="Search for books..."
            className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button 
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Search
          </button>
        </div>
      </form>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-10">
          <p className="text-gray-600">Loading books...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Books List */}
      {!loading && !error && (
        <div className="grid gap-4">
          {books.length > 0 ? (
            books.map(book => (
              <div key={book.id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    {book.coverUrl && (
                      <img 
                        src={book.coverUrl} 
                        alt={`Cover for ${book.title}`} 
                        className="w-20 h-auto object-cover rounded"
                      />
                    )}
                    <div>
                      <h3 className="text-lg font-medium">{book.title}</h3>
                      <p className="text-gray-600 text-sm">{book.author}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                    {book.type}
                  </span>
                </div>
                <div className="mt-4 flex items-center text-sm text-gray-500 space-x-4">
                  <span>Format: {book.format}</span>
                  <span>{book.downloads} editions available</span>
                </div>
                <a 
                  href={book.openLibraryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 w-full block text-center"
                >
                  View on Open Library
                </a>
              </div>
            ))
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-600">No books found. Try a different search term.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Library;
