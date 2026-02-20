"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { Pencil, Trash2, MoreHorizontal, X } from "lucide-react";

interface Manager {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  status: string;
}

const SkeletonRow = () => (
  <tr className="border-t border-zinc-200 dark:border-zinc-800 animate-pulse">
    <td className="p-4">
      <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4"></div>
    </td>
    <td className="p-4">
      <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-full"></div>
    </td>
    <td className="p-4">
      <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-12"></div>
    </td>
    <td className="p-4">
      <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-16"></div>
    </td>
    <td className="p-4 text-right">
      <div className="h-8 w-16 bg-zinc-200 dark:bg-zinc-800 rounded ml-auto"></div>
    </td>
  </tr>
);

const Managers = () => {
  const [data, setData] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedManager, setSelectedManager] = useState<Manager | null>(null);
  const [editFormData, setEditFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  const fetchManagers = useCallback(async () => {
    if (!BASE_URL) return;
    const token = Cookies.get("token");
    if (!token) return;

    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/api/staff/all-managers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const resData = response.data;
      setData(Array.isArray(resData) ? resData : resData?.data || []);
    } catch (error: any) {
      setErrorMsg("Ma'lumotlarni yuklashda xatolik");
    } finally {
      setTimeout(() => setLoading(false), 600);
    }
  }, [BASE_URL]);

  useEffect(() => {
    fetchManagers();
  }, [fetchManagers]);

  const handleEditClick = (manager: Manager) => {
    setSelectedManager(manager);
    setEditFormData({
      first_name: manager.first_name,
      last_name: manager.last_name,
      email: manager.email,
    });
    setIsEditModalOpen(true);
    setActiveMenu(null);
  };

  const handleUpdateManager = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = Cookies.get("token");
    if (!token || !selectedManager) return;

    try {
      await axios.post(
        `${BASE_URL}/api/staff/edited-manager`,
        {
          _id: selectedManager._id,
          first_name: editFormData.first_name,
          last_name: editFormData.last_name,
          email: editFormData.email,
          status: selectedManager.status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      setIsEditModalOpen(false);
      fetchManagers();
      alert("Muvaffaqiyatli saqlandi!");
    } catch (err: any) {
      alert(err.response?.data?.message || "Tahrirlashda xatolik");
    }
  };

  const handleDelete = async (id: string) => {
    if (!BASE_URL) return;
    const token = Cookies.get("token");
    if (!token || !confirm("O'chirmoqchimisiz?")) return;

    try {
      await axios.delete(`${BASE_URL}/api/staff/deleted-admin`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { _id: id },
      });
      setData((prev) => prev.filter((item) => item._id !== id));
      setActiveMenu(null);
    } catch (err: any) {
      alert("Xatolik yuz berdi");
    }
  };

  return (
    <div className="w-full p-3 sm:p-6 min-h-screen text-foreground">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
          Menejerlar ro'yxati
        </h1>
      </div>

      <div className="w-full overflow-x-auto border border-zinc-800 rounded-xl text-card-foreground shadow-sm ">
        <table className="w-full text-left min-w-[500px] sm:min-w-full">
          <thead className="text-[10px] sm:text-xs uppercase text-muted-foreground font-medium border-b border-zinc-800">
            <tr>
              <th className="p-3 sm:p-4">Ism</th>
              <th className="p-3 sm:p-4">Familiya</th>
              <th className="p-3 sm:p-4">Email</th>
              <th className="p-3 sm:p-4 text-right">Amallar</th>
            </tr>
          </thead>

          <tbody className="text-xs sm:text-sm">
            {loading
              ? [...Array(10)].map((_, i) => <SkeletonRow key={i} />)
              : data.map((item) => (
                  <tr
                    key={item._id}
                    className="border-t border-zinc-800 hover:bg-muted/50 transition-colors"
                  >
                    <td className="p-3 sm:p-4">{item.first_name}</td>
                    <td className="p-3 sm:p-4">{item.last_name}</td>
                    <td className="p-3 sm:p-4 text-muted-foreground truncate max-w-[120px] sm:max-w-none">
                      {item.email}
                    </td>
                    <td className="p-3 sm:p-4 text-right relative">
                      <button
                        onClick={() =>
                          setActiveMenu(
                            activeMenu === item._id ? null : item._id,
                          )
                        }
                        className="p-2 hover:bg-muted rounded-md transition-colors inline-flex items-center justify-center"
                      >
                        <MoreHorizontal size={18} />
                      </button>

                      {activeMenu === item._id && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setActiveMenu(null)}
                          />
                          <div className="absolute right-4 mt-2 w-32 sm:w-40 border bg-popover text-popover-foreground border-zinc-800 rounded-md z-50 shadow-lg overflow-hidden text-left animate-in fade-in zoom-in-95 duration-100">
                            <button
                              className="w-full px-3 py-2 text-[12px] sm:text-sm flex items-center gap-2 hover:bg-muted transition-colors border-b border-zinc-800"
                              onClick={() => handleEditClick(item)}
                            >
                              <Pencil size={14} /> Tahrirlash
                            </button>
                            <button
                              onClick={() => handleDelete(item._id)}
                              className="w-full px-3 py-2 text-[12px] sm:text-sm flex items-center gap-2 hover:bg-destructive/10 text-destructive transition-colors"
                            >
                              <Trash2 size={14} /> O'chirish
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[200]  backdrop-blur-sm p-4">
          <div className="bg-background text-foreground p-5 sm:p-6 rounded-lg w-full max-w-[280px] xs:max-w-md border border-zinc-800 shadow-xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-base sm:text-lg font-semibold tracking-tight">
                Menejerni tahrirlash
              </h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleUpdateManager}
              className="flex flex-col gap-4"
            >
              <div className="space-y-1.5">
                <label className="text-[12px] sm:text-sm font-medium leading-none text-muted-foreground">
                  Ism
                </label>
                <input
                  required
                  className="w-full border border-zinc-800 p-2 sm:p-2.5 rounded-md text-sm outline-none focus:ring-2 focus:ring-ring transition-all"
                  value={editFormData.first_name}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      first_name: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] sm:text-sm font-medium leading-none text-muted-foreground">
                  Familiya
                </label>
                <input
                  required
                  className="w-full border border-zinc-800 p-2 sm:p-2.5 rounded-md text-sm outline-none focus:ring-2 focus:ring-ring transition-all"
                  value={editFormData.last_name}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      last_name: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px]  sm:text-sm font-medium leading-none text-muted-foreground">
                  Email
                </label>
                <input
                  required
                  type="email"
                  className="w-full  border border-zinc-800 p-2 sm:p-2.5 rounded-md text-sm outline-none opacity-60 cursor-not-allowed"
                  value={editFormData.email}
                  disabled
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="order-2 sm:order-1 flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/80 py-2 sm:py-2.5 rounded-md text-sm font-medium transition-colors border border-zinc-800"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="order-1 sm:order-2 flex-1 bg-primary text-primary-foreground hover:bg-primary/90 py-2 sm:py-2.5 rounded-md text-sm font-medium transition-colors shadow-sm"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Managers;
