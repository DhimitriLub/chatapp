import React, { useState, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, X, Send } from "lucide-react";
import GifPicker from "./GifPicker";
import toast from "react-hot-toast";
import ConfettiButton from "./ConfettiButton";
import { compressImage } from "../utils/imageUtils";
import { axiosInstance } from "../../../lib/axios";

// Custom GIF icon component
const GifIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M3 9h6m-6 0v6m0-6V5a2 2 0 0 1 2-2h2" />
    <path d="M13 5h-2m2 0v8m0-8h6a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-6m0-10v10" />
  </svg>
);

const MessageInput = ({ messageToEdit, setMessageToEdit, onMessageSent }) => {
  const [text, setText] = useState(messageToEdit?.text || "");
  const [imagePreview, setImagePreview] = useState(null);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const fileInputRef = useRef(null);
  const { selectedUser } = useChatStore();

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const compressedImage = await compressImage(file);
      setImagePreview(compressedImage);
    } catch (error) {
      toast.error("Error uploading image");
      console.error(error);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleGifSelect = (gifUrl) => {
    setImagePreview(gifUrl);
    setShowGifPicker(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if(!text.trim() && !imagePreview) return;
    if(!selectedUser) return;
    
    try {
      if (messageToEdit) {
        await axiosInstance.put(`/messages/${messageToEdit._id}`, {
          action: 'edit',
          text: text.trim()
        });
        setMessageToEdit(null);
      } else {
        await axiosInstance.post('/messages', {
          text: text.trim(),
          image: imagePreview,
          receiverId: selectedUser._id
        });
      }

      // Clear form
      setText("");
      setImagePreview(null);
      setShowGifPicker(false);
      if (fileInputRef.current) fileInputRef.current.value = "";

      // Refresh messages
      onMessageSent();
    } catch (error) {
      console.error("Failed to send message:", error);
      if (error.response?.data?.code === "ERRORS.IMAGE_UPLOAD_DISABLED") {
        toast.error("Image upload is currently disabled. Please send text only.");
      } else if (error.response?.data?.code === "ERRORS.IMAGE_UPLOAD_FAILED") {
        toast.error("Failed to upload image. Please try again or send without an image.");
      } else {
        toast.error(error.response?.data?.message || "Error sending message");
      }
    }
  };

  return (
    <form onSubmit={handleSendMessage} className="p-4 border-t border-base-300">
      {/* Preview */}
      {imagePreview && !messageToEdit && (
        <div className="mb-4 relative w-fit">
          <img
            src={imagePreview}
            alt="Preview"
            className="max-w-[200px] rounded-lg"
          />
          <button
            type="button"
            onClick={removeImage}
            className="absolute -top-2 -right-2 btn btn-circle btn-error btn-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Input area */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 bg-base-200 rounded-full px-4 py-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={messageToEdit ? "Edit message..." : "Type a message..."}
            className="flex-1 bg-transparent border-none outline-none"
          />

          <div className="flex items-center gap-1">
            {/* GIF button */}
            <button
              type="button"
              onClick={() => setShowGifPicker(!showGifPicker)}
              className="btn btn-ghost btn-circle btn-sm"
            >
              <GifIcon />
            </button>
            <GifPicker
              onSelect={handleGifSelect}
              onClose={() => setShowGifPicker(false)}
              isOpen={showGifPicker}
            />

            {/* Confetti button */}
            <ConfettiButton />

            {/* Image upload button */}
            <label className="btn btn-ghost btn-circle btn-sm">
              <Image className="w-5 h-5" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                ref={fileInputRef}
              />
            </label>
          </div>
        </div>

        {/* Send button */}
        <button
          type="submit"
          className="btn btn-circle btn-primary"
          disabled={!text.trim() && !imagePreview}
        >
          <Send className="w-5 h-5" />
        </button>

        {messageToEdit && (
          <button
            type="button"
            onClick={() => setMessageToEdit(null)}
            className="btn btn-circle btn-ghost btn-sm"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {showGifPicker && !messageToEdit && (
        <div className="absolute bottom-20 left-4">
          <GifPicker onSelect={handleGifSelect} />
        </div>
      )}
    </form>
  );
};

export default MessageInput;