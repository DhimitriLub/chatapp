import { useState } from "react";
import { useAuthStore } from "../store/userAuthStore";
import { Camera, User, Mail } from "lucide-react";
import toast from "react-hot-toast";

const MAX_FILE_SIZE = 1024 * 1024; // 1MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const ProfilePage = () => {
  const { authUser, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const validateImage = (file) => {
    if (!file) return "Please select an image";
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return "Only JPG, PNG and WebP images are allowed";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "Image size should be less than 1MB";
    }
    return null;
  };

  const handleImageUpload = async (e) => {
    try {
      const file = e.target.files[0];
      const error = validateImage(file);
      if (error) {
        toast.error(error);
        return;
      }

      setIsUploading(true);
      const reader = new FileReader();

      reader.onload = async () => {
        try {
          const base64Image = reader.result;
          setSelectedImg(base64Image);
          const result = await updateProfile({ profilePic: base64Image });
          if (!result.success) {
            setSelectedImg(null);
            throw new Error(result.error?.message || "Failed to update profile picture");
          }
        } catch (error) {
          toast.error(error.message);
          setSelectedImg(null);
        } finally {
          setIsUploading(false);
        }
      };

      reader.onerror = () => {
        toast.error("Error reading file");
        setIsUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("Error uploading image");
      setIsUploading(false);
    }
  };

  return(
    <div className="h-screen pt-20">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          <div className="text-center">
            <h1 className="text=2xl font-semibold ">Profile</h1>
            <p className="mt-2">Your profile information</p>
          </div>

          {/* avatar upload */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={selectedImg || authUser.profilePic || "/avatar.png"}
                alt="Profile"
                className="size-32 rounded-full object-cover border-4"
                onError={(e) => {
                  if (e.target.src !== "/avatar.png") {
                    e.target.src = "/avatar.png";
                  }
                }}
              />
              <label
                htmlFor="avatar-upload"
                className={`
                  absolute bottom-0 right-0
                  bg-base-content hover:scale-105
                  p-2 rounded-full cursor-pointer
                  transition-all duration-200
                  ${isUploading ? "animate-pulse pointer-events-none" : ""}
                `}
              >
                <Camera className="w-5 h-5 text-base-200" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept={ALLOWED_FILE_TYPES.join(',')}
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
              </label>
            </div>
            <p className="text-sm text-zinc-400">
              {isUploading ? "Uploading..." : "Click the camera icon to update your photo"}
            </p>
            <p className="text-xs text-zinc-500">
              Maximum file size: 1MB. Supported formats: JPG, PNG, WebP
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.fullName}</p>
            </div>

            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.email}</p>
            </div>
          </div>

          <div className="mt-6 bg-base-300 rounded-xl p-6">
            <h2 className="text-lg font-medium mb-4">Account Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                <span>Member Since</span>
                <span>{authUser.createdAt?.split("T")[0]}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Account Status</span>
                <span className="text-green-500">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;