import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import debounce from 'lodash/debounce';

const TENOR_API_KEY = 'AIzaSyAmkjeCxuv78sTQPiErMEur1aol8pnGWUM'; // Replace with your Tenor API key
const TENOR_CLIENT_KEY = 'chat-app';

const GifPicker = ({ onSelect, onClose, isOpen }) => {
  const [gifs, setGifs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      searchInputRef.current?.focus();
      fetchTrendingGifs();
    }
  }, [isOpen]);

  const fetchTrendingGifs = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://tenor.googleapis.com/v2/featured?key=${TENOR_API_KEY}&client_key=${TENOR_CLIENT_KEY}&limit=20`
      );
      const data = await response.json();
      const formattedGifs = data.results.map(gif => ({
        id: gif.id,
        url: gif.media_formats.tinygif.url,
        previewUrl: gif.media_formats.tinygif.url,
        description: gif.content_description
      }));
      setGifs(formattedGifs);
    } catch (error) {
      console.error('Error fetching trending gifs:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchGifs = async (searchTerm) => {
    if (!searchTerm) {
      fetchTrendingGifs();
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `https://tenor.googleapis.com/v2/search?q=${searchTerm}&key=${TENOR_API_KEY}&client_key=${TENOR_CLIENT_KEY}&limit=20`
      );
      const data = await response.json();
      const formattedGifs = data.results.map(gif => ({
        id: gif.id,
        url: gif.media_formats.gif.url,
        previewUrl: gif.media_formats.tinygif.url,
        description: gif.content_description
      }));
      setGifs(formattedGifs);
    } catch (error) {
      console.error('Error searching gifs:', error);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = debounce(searchGifs, 500);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    debouncedSearch(e.target.value);
  };

  const handleSelect = (gif) => {
    onSelect(gif.url);
    onClose();
  };

  return (
    <div
      className={`
        fixed inset-x-0 bottom-0 z-50 bg-base-200 border-t border-base-300
        transition-transform duration-300 ease-out
        ${isOpen ? 'translate-y-0' : 'translate-y-full'}
      `}
      style={{ maxHeight: '60vh' }}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-base-200 border-b border-base-300 p-3">
        <div className="relative max-w-2xl mx-auto">
          <input
            ref={searchInputRef}
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="Search GIFs..."
            className="input input-sm w-full pl-9 pr-9 bg-base-100"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-base-content/50" />
          <button 
            onClick={onClose}
            className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-ghost btn-xs btn-circle"
          >
            <X className="size-3" />
          </button>
        </div>
      </div>

      {/* GIFs Grid */}
      <div className="overflow-y-auto" style={{ height: 'calc(60vh - 56px)' }}>
        <div className="grid grid-cols-4 gap-2 p-4 max-w-2xl mx-auto">
          {loading ? (
            Array(8).fill(0).map((_, i) => (
              <div 
                key={i} 
                className="aspect-video bg-base-300 animate-pulse rounded-lg"
              />
            ))
          ) : (
            gifs.map((gif) => (
              <button
                key={gif.id}
                onClick={() => handleSelect(gif)}
                className="aspect-video relative group rounded-lg overflow-hidden hover:ring-2 ring-primary transition-all bg-base-300"
              >
                <img
                  src={gif.previewUrl}
                  alt={gif.description}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default GifPicker; 