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
  <tr className="border-t border-zinc-800 animate-pulse">
    <td className="p-4">
      <div className="h-4 bg-zinc-800 rounded w-24"></div>
    </td>
    <td className="p-4">
      <div className="h-4 bg-zinc-800 rounded w-28"></div>
    </td>
    <td className="p-4">
      <div className="h-4 bg-zinc-800 rounded w-40"></div>
    </td>
    <td className="p-4">
      <div className="h-4 bg-zinc-800 rounded w-16"></div>
    </td>
    <td className="p-4">
      <div className="h-4 bg-zinc-800 rounded w-14"></div>
    </td>
    <td className="p-4 text-right">
      <div className="flex justify-end gap-3">
        <div className="h-4 w-4 bg-zinc-800 rounded"></div>
        <div className="h-4 w-4 bg-zinc-800 rounded"></div>
      </div>
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
    <div className="w-full p-6 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold ">Menejerlar ro'yxati</h1>
      </div>

      <div className="overflow-visible border border-zinc-800 rounded-2xl ">
        <table className="w-full text-left">
          <thead className="text-xs uppercase text-zinc-500 font-medium">
            <tr>
              <th className="p-4">Ism</th>
              <th className="p-4">Familiya</th>
              <th className="p-4">Email</th>
              <th className="p-4 text-right">Amallar</th>
            </tr>
          </thead>

          <tbody className="text-sm ">
            {loading
              ? [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
              : data.map((item) => (
                  <tr
                    key={item._id}
                    className="border-t border-zinc-800 hover:/40"
                  >
                    <td className="p-4">{item.first_name}</td>
                    <td className="p-4">{item.last_name}</td>
                    <td className="p-4">{item.email}</td>
                    <td className="p-4 text-right relative">
                      <button
                        onClick={() =>
                          setActiveMenu(
                            activeMenu === item._id ? null : item._id,
                          )
                        }
                        className="p-1 hover: rounded-lg "
                      >
                        <MoreHorizontal size={20} />
                      </button>

                      {activeMenu === item._id && (
                        <div className="absolute right-4 mt-2 w-36 border bg-[#00000060] border-zinc-700 rounded-lg z-[50] shadow-xl   overflow-hidden text-left">
                          <button
                            className="w-full px-4 py-2 text-xs flex items-center gap-2 hover: border-b border-zinc-800"
                            onClick={() => handleEditClick(item)}
                          >
                            <Pencil size={14} className="" /> Tahrirlash
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="w-full px-4 py-2 text-xs flex items-center gap-2 hover: text-rose-500"
                          >
                            <Trash2 size={14} /> O'chirish
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[200]  backdrop-blur-sm p-4">
          <div className=" text-white p-6 rounded-2xl w-full max-w-md border border-zinc-800 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Menejerni tahrirlash</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className=" hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form
              onSubmit={handleUpdateManager}
              className="flex flex-col gap-5"
            >
              <div className="space-y-2">
                <label className="text-xs  uppercase tracking-wider font-semibold">
                  Ism
                </label>
                <input
                  required
                  className="w-full  border border-zinc-700 p-3 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  value={editFormData.first_name}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      first_name: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs  uppercase tracking-wider font-semibold">
                  Familiya
                </label>
                <input
                  required
                  className="w-full  border border-zinc-700 p-3 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  value={editFormData.last_name}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      last_name: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs  uppercase tracking-wider font-semibold">
                  Email
                </label>
                <input
                  required
                  type="email"
                  className="w-full  border border-zinc-700 p-3 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all opacity-70"
                  value={editFormData.email}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, email: e.target.value })
                  }
                />
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1  hover:bg-zinc-700 text-white py-3 rounded-xl font-medium transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1  hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition-colors shadow-lg shadow-blue-900/20"
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
