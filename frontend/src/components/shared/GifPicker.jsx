import React, { useState, useEffect } from "react";

const GifPicker = ({ onSelect }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [gifs, setGifs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchGifs = async () => {
        setIsLoading(true);
        try {
            const endpoint = searchTerm
                ? `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(searchTerm)}&key=${import.meta.env.VITE_TENOR_API_KEY}&client_key=chat_app&limit=20`
                : `https://tenor.googleapis.com/v2/trending?key=${import.meta.env.VITE_TENOR_API_KEY}&client_key=chat_app&limit=20`;

            const response = await fetch(endpoint);
            const data = await response.json();
            setGifs(data.results || []);
        } catch (error) {
            console.error("Error fetching GIFs:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            fetchGifs();
        }, 500);

        return () => clearTimeout(debounceTimer);
    }, [searchTerm]);

    return (
        <div className="gif-picker">
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search GIFs..."
                className="input input-bordered w-full mb-4"
            />
            
            <div className="grid grid-cols-3 gap-2">
                {isLoading ? (
                    Array(6).fill(0).map((_, i) => (
                        <div key={i} className="aspect-video bg-base-300 animate-pulse rounded"></div>
                    ))
                ) : gifs.length === 0 ? (
                    <div className="col-span-3 text-center py-4 text-base-content/70">
                        No GIFs found
                    </div>
                ) : (
                    gifs.map((gif) => (
                        <img
                            key={gif.id}
                            src={gif.media_formats.tinygif.url}
                            alt={gif.content_description}
                            className="w-full aspect-video object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => onSelect(gif)}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default GifPicker; 