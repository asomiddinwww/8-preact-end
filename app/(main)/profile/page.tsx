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
      try {
        const parsed = JSON.parse(savedUser);
        // Backenddan kelgan strukturaga qarab user ma'lumotlarini o'qish
        const userData = parsed.data ? parsed.data : parsed;
        setUser(userData);
        setFormData({
          first_name: userData.first_name || "",
          last_name: userData.last_name || "",
          email: userData.email || "",
          role: userData.role || "manager",
          current_password: "",
          new_password: "",
        });
      } catch (e) {
        console.error("User parse error");
      }
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
    if (!file) return;

    setImgLoading(true);
    const form = new FormData();
    form.append("image", file); // Postman dagi 'image' key bilan bir xil

    try {
      const response = await axios.post(
        `${BASE_URL}/api/auth/edit-profile-img`,
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      // Backenddan qaytgan yangi rasm yo'lini olish (odatda response.data.image yoki response.data.data.image)
      const newImagePath = response.data?.image || response.data?.data?.image;

      // Agar backend yangi yo'lni qaytarmasa, vaqtinchalik ko'rsatish, lekin idealda backenddan kelishi kerak
      const updatedUser = {
        ...user,
        image: newImagePath || user.image,
      };

      // State va Storage ni yangilash
      Cookies.set("user", JSON.stringify(updatedUser));
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      toast.success("Rasm muvaffaqiyatli yangilandi");
    } catch (error: any) {
      console.error("Image upload error:", error);
      toast.error(error.response?.data?.message || "Rasmni yuklashda xatolik");
    } finally {
      setImgLoading(false);
      // Inputni tozalash (bir xil rasmni qayta tanlasa ishlashi uchun)
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const getProfileImg = () => {
    if (!user?.image) return null;
    // Agar rasm to'liq URL bo'lmasa, BASE_URL ni qo'shish
    return user.image.startsWith("http")
      ? user.image
      : `${BASE_URL}/${user.image}`;
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );

  return (
    <div className="w-full p-4 md:p-8 bg-background text-foreground">
      <Toaster position="top-center" />

      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div className="flex items-center gap-5">
            <div className="relative group">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-border overflow-hidden bg-muted">
                {getProfileImg() ? (
                  <img
                    src={getProfileImg()}
                    alt="User"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <User size={40} />
                  </div>
                )}
                {imgLoading && (
                  <div className="absolute inset-0 bg-background/60 flex items-center justify-center z-10">
                    <Loader2 className="animate-spin text-primary" size={24} />
                  </div>
                )}
              </div>
              <button
                type="button"
                disabled={imgLoading}
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full border-2 border-background hover:scale-110 transition-all shadow-md disabled:opacity-50"
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
              <p className="text-muted-foreground text-sm">{user?.email}</p>
              <div className="flex items-center gap-2 text-muted-foreground text-xs mt-1">
                <Calendar size={12} /> Qo'shilgan:{" "}
                {user?.createdAt?.split("T")[0] || "2025-06-04"}
              </div>
            </div>
          </div>

          <div className="bg-destructive text-destructive-foreground text-[10px] md:text-xs font-bold px-4 py-1.5 rounded-md uppercase tracking-widest shadow-sm">
            {user?.role || "manager"}
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold mb-1">Profil ma'lumotlari</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Shaxsiy ma'lumotlaringiz va parolni yangilashingiz mumkin.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium opacity-80">Ism</label>
                <input
                  className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  value={formData.first_name}
                  onChange={(e) =>
                    setFormData({ ...formData, first_name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium opacity-80">
                  Familiya
                </label>
                <input
                  className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  value={formData.last_name}
                  onChange={(e) =>
                    setFormData({ ...formData, last_name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium opacity-80">Email</label>
                <input
                  className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium opacity-80">Rol</label>
                <input
                  className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-sm cursor-not-allowed opacity-60 outline-none"
                  value={formData.role}
                  disabled
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium opacity-80">
                  Joriy parol
                </label>
                <input
                  type="password"
                  autoComplete="current-password"
                  className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
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
                <label className="text-sm font-medium opacity-80">
                  Yangi parol
                </label>
                <input
                  type="password"
                  autoComplete="new-password"
                  className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
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
              className="px-10 py-2.5 bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 disabled:opacity-50"
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
