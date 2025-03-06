import React, { useState, useRef } from "react";
import { BsSend } from "react-icons/bs";
import { useChatStore } from "../../store/useChatStore";
import GifPicker from "../shared/GifPicker";
import { useAuthStore } from "../../store/userAuthStore";
import { toast } from "react-hot-toast";

const MessageInput = ({ messageToEdit, setMessageToEdit }) => {
    const [message, setMessage] = useState(messageToEdit?.text || "");
    const [showGifPicker, setShowGifPicker] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef(null);
    const { sendMessage, editMessage } = useChatStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        const trimmedMessage = message.trim();
        if (!trimmedMessage && !fileInputRef.current?.files[0]) return;

        setIsSubmitting(true);
        try {
            if (messageToEdit) {
                await editMessage(messageToEdit._id, trimmedMessage);
                setMessageToEdit(null);
            } else {
                const formData = new FormData();
                if (trimmedMessage) formData.append("text", trimmedMessage);
                
                const file = fileInputRef.current?.files[0];
                if (file) {
                    formData.append("image", file);
                }
                
                await sendMessage(formData);
                fileInputRef.current.value = "";
            }
            setMessage("");
        } catch (error) {
            console.error("Error sending/editing message:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGifSelect = async (gif) => {
        if (isSubmitting) return;
        
        setShowGifPicker(false);
        setIsSubmitting(true);
        
        try {
            const formData = new FormData();
            const gifUrl = gif.media_formats.gif.url;
            formData.append("gifUrl", gifUrl);
            
            await sendMessage(formData);
        } catch (error) {
            console.error("Error sending GIF:", error);
            toast.error("Failed to send GIF. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-base-200/50">
            <div className="flex items-center gap-2">
                {!messageToEdit && (
                    <>
                        <input
                            type="file"
                            className="hidden"
                            ref={fileInputRef}
                            accept="image/*"
                            onChange={() => {
                                // Trigger form submission when file is selected
                                if (fileInputRef.current?.files[0]) {
                                    handleSubmit({ preventDefault: () => {} });
                                }
                            }}
                        />
                        <button
                            type="button"
                            className="btn btn-circle btn-ghost btn-sm"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            📎
                        </button>
                        <button
                            type="button"
                            className="btn btn-circle btn-ghost btn-sm"
                            onClick={() => setShowGifPicker(!showGifPicker)}
                        >
                            GIF
                        </button>
                    </>
                )}
                
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={messageToEdit ? "Edit your message..." : "Type a message..."}
                    className="input input-bordered flex-1"
                />
                
                <button 
                    type="submit" 
                    className="btn btn-circle btn-primary"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <span className="loading loading-spinner"></span>
                    ) : (
                        <BsSend />
                    )}
                </button>

                {messageToEdit && (
                    <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => {
                            setMessageToEdit(null);
                            setMessage("");
                        }}
                    >
                        Cancel
                    </button>
                )}
            </div>

            {showGifPicker && (
                <div className="absolute bottom-full mb-4 left-0 right-0 h-96 bg-base-300 p-4 overflow-y-auto">
                    <GifPicker onSelect={handleGifSelect} />
                </div>
            )}
        </form>
    );
};

export default MessageInput; 