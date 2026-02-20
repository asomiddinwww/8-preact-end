"use client";

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { Camera, User, Loader2, Calendar } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [imgLoading, setImgLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    role: "",
    current_password: "",
    new_password: "",
  });

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:7070";
  const token = Cookies.get("token");

  useEffect(() => {
    const savedUser = Cookies.get("user") || localStorage.getItem("user");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      setFormData({
        first_name: parsed.first_name || "",
        last_name: parsed.last_name || "",
        email: parsed.email || "",
        role: parsed.role || "manager",
        current_password: "",
        new_password: "",
      });
    }
    setLoading(false);
  }, []);

  const handleUpdate = async () => {
    setBtnLoading(true);
    try {
      await axios.post(
        `${BASE_URL}/api/auth/edit-profile`,
        {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (formData.current_password && formData.new_password) {
        await axios.post(
          `${BASE_URL}/api/auth/edit-password`,
          {
            current_password: formData.current_password,
            new_password: formData.new_password,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
      }

      const updatedUser = { ...user, ...formData };
      Cookies.set("user", JSON.stringify(updatedUser));
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      toast.success("Muvaffaqiyatli yangilandi");
      setFormData({ ...formData, current_password: "", new_password: "" });
    } catch (error) {
      toast.error("Yangilashda xatolik");
    } finally {
      setBtnLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    setImgLoading(true);
    const form = new FormData();
    form.append("image", file);

    try {
      await axios.post(`${BASE_URL}/api/auth/edit-profile-img`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const updatedUser = { ...user, image: URL.createObjectURL(file) };
      Cookies.set("user", JSON.stringify(updatedUser));
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      toast.success("Rasm muvaffaqiyatli yangilandi");
    } catch (error) {
      toast.error("Rasmni yuklashda xatolik");
    } finally {
      setImgLoading(false);
    }
  };

  const getProfileImg = () => {
    if (!user?.image) return null;
    return user.image.startsWith("http")
      ? user.image
      : `${BASE_URL}/${user.image}`;
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <Loader2 className="animate-spin text-white" />
      </div>
    );

  return (
    <div className="w-full p-4 md:p-8">
      <Toaster position="top-center" />

      <div className="max-w-5xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div className="flex items-center gap-5">
            <div className="relative group">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-zinc-800 overflow-hidden bg-zinc-900">
                {getProfileImg() ? (
                  <img
                    src={getProfileImg()}
                    alt="User"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-600">
                    <User size={40} />
                  </div>
                )}
                {imgLoading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="animate-spin" size={20} />
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-white text-black p-1.5 rounded-full border-2 border-black hover:scale-110 transition-all"
              >
                <Camera size={14} />
              </button>
              <input
                type="file"
                hidden
                ref={fileInputRef}
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleImageUpload(e.target.files[0]);
                }}
              />
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-bold">
                {user?.first_name} {user?.last_name}
              </h2>
              <p className="text-zinc-500 text-sm">{user?.email}</p>
              <div className="flex items-center gap-2 text-zinc-500 text-xs mt-1">
                <Calendar size={12} /> Qo'shilgan: 2025-06-04
              </div>
            </div>
          </div>

          <div className="bg-red-600 text-white text-[10px] md:text-xs font-bold px-4 py-1.5 rounded-md uppercase tracking-widest">
            {user?.role || "manager"}
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold mb-1">Profil ma'lumotlari</h3>
            <p className="text-zinc-500 text-sm mb-6">
              Shaxsiy ma'lumotlaringiz va parolni yangilashingiz mumkin.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Ism</label>
                <input
                  className="w-full border border-zinc-800 rounded-lg px-4 py-3 text-sm focus:border-zinc-500 outline-none transition-all"
                  value={formData.first_name}
                  onChange={(e) =>
                    setFormData({ ...formData, first_name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">
                  Familiya
                </label>
                <input
                  className="w-full border border-zinc-800 rounded-lg px-4 py-3 text-sm focus:border-zinc-500 outline-none transition-all"
                  value={formData.last_name}
                  onChange={(e) =>
                    setFormData({ ...formData, last_name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">
                  Email
                </label>
                <input
                  className="w-full border border-zinc-800 rounded-lg px-4 py-3 text-sm focus:border-zinc-500 outline-none transition-all"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Rol</label>
                <input
                  className="w-full border border-zinc-800 rounded-lg px-4 py-3 text-sm cursor-not-allowed outline-none"
                  value={formData.role}
                  disabled
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">
                  Joriy parol
                </label>
                <input
                  type="password"
                  className="w-full border border-zinc-800 rounded-lg px-4 py-3 text-sm focus:border-zinc-500 outline-none transition-all"
                  value={formData.current_password}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      current_password: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">
                  Yangi parol
                </label>
                <input
                  type="password"
                  className="w-full border border-zinc-800 rounded-lg px-4 py-3 text-sm focus:border-zinc-500 outline-none transition-all"
                  value={formData.new_password}
                  onChange={(e) =>
                    setFormData({ ...formData, new_password: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={handleUpdate}
              disabled={btnLoading}
              className="px-10 py-2.5 bg-white text-black font-bold rounded-lg hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
            >
              {btnLoading && <Loader2 size={16} className="animate-spin" />}
              O'zgartirish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
