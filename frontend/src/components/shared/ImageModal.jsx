import React, { useState } from 'react';

const ImageModal = ({ imageUrl }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <img
                src={imageUrl}
                alt="Chat"
                className="max-w-[200px] cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setIsOpen(true)}
            />

            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    onClick={() => setIsOpen(false)}
                >
                    <div className="max-w-4xl max-h-[90vh] p-2">
                        <img
                            src={imageUrl}
                            alt="Full size"
                            className="max-w-full max-h-full object-contain"
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default ImageModal; 