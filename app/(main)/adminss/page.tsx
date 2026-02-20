"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { Pencil, Trash2, UserPlus, Search, X } from "lucide-react";

interface AdminUser {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  role?: string;
}

const SkeletonRow = () => (
  <tr className="border-t border-zinc-800 animate-pulse">
    <td className="p-4">
      <div className="h-4 bg-zinc-800 rounded w-24 sm:w-32 "></div>
    </td>
    <td className="p-4">
      <div className="h-4 bg-zinc-800 rounded w-32 sm:w-48 "></div>
    </td>
    <td className="p-4">
      <div className="h-6 bg-zinc-800 rounded w-16 "></div>
    </td>
    <td className="p-4 text-right">
      <div className="flex justify-end gap-2">
        <div className="h-4 bg-zinc-800 w-4 rounded "></div>
        <div className="h-4 bg-zinc-800 w-4 rounded "></div>
      </div>
    </td>
  </tr>
);

const AdminPanel = () => {
  const [data, setData] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("faol");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    status: "faol",
    password: "",
    role: "admin",
    work_date: new Date().toISOString().slice(0, 10),
    active: true,
    is_deleted: false,
  });

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:7070";
  const token = Cookies.get("token");

  const fetchAdmins = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      const res = await axios.get(
        `${BASE_URL}/api/staff/all-admins?status=${filterStatus}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.data && res.data.data) {
        setData(res.data.data);
      } else {
        setData([]);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [BASE_URL, token, filterStatus]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const filteredData = useMemo(() => {
    return data.filter((admin) =>
      `${admin.first_name} ${admin.last_name} ${admin.email}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm, data]);

  const openModal = (admin: AdminUser | null = null) => {
    if (admin) {
      setEditingAdmin(admin);
      setFormData({
        ...formData,
        first_name: admin.first_name,
        last_name: admin.last_name,
        email: admin.email,
        status: admin.status,
        password: "",
      });
    } else {
      setEditingAdmin(null);
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        status: "all",
        password: "",
        role: "admin",
        work_date: new Date().toISOString().slice(0, 10),
        active: true,
        is_deleted: false,
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      if (editingAdmin) {
        await axios.post(
          `${BASE_URL}/api/staff/edited-admin`,
          {
            _id: editingAdmin._id,
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email,
            status: formData.status,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );
      } else {
        const payload = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          password: formData.password,
          role: "admin",
          status: formData.status || "faol",
          work_date: new Date().toISOString().split("T")[0],
        };

        await axios.post(`${BASE_URL}/api/staff/create-admin`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      }

      await fetchAdmins();
      setIsModalOpen(false);
      setEditingAdmin(null);
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        status: "all",
        password: "",
        role: "admin",
        work_date: new Date().toISOString().slice(0, 10),
        active: true,
        is_deleted: false,
      });

      alert("Muvaffaqiyatli saqlandi!");
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Server xatosi";
      console.error("Xatolik tafsiloti:", err.response?.data);
      alert(`Xatolik: ${errorMsg}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("O'chirmoqchimisiz?")) return;
    if (!token) return;

    try {
      await axios.delete(`${BASE_URL}/api/staff/deleted-admin`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { _id: id },
      });
      setData((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      console.error(err);
      alert("O'chirishda xatolik");
    }
  };

  return (
    <div className="w-full p-4 sm:p-6 min-h-screen ">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Adminlar</h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Qidiruv..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 border border-zinc-800 rounded-lg py-2 pl-10 pr-4 text-sm outline-none focus:border-white transition-all bg-transparent"
            />
          </div>

          <button
            onClick={() => openModal(null)}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-white text-black hover:bg-zinc-200 active:scale-95 transition-all w-full sm:w-auto"
          >
            <UserPlus size={18} /> Qo'shish
          </button>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full sm:w-auto  border border-zinc-700 rounded-lg px-4 py-2 outline-none focus:border-white transition-all text-sm  cursor-pointer"
          >
            <option value="" className="">
              All
            </option>
            <option value="faol" className="">
              Faol
            </option>
            <option value="ishdan bo'shatilgan" className="">
              Nofaol
            </option>
            <option value="ishdan bo'shatilgan" className="">
              Ishdan bo'shatilgan
            </option>
            <option value="ta'tilda" className="">
              Ta'tilda
            </option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto border border-zinc-800 rounded-2xl ">
        <table className="w-full text-left min-w-[500px]">
          <thead className="text-xs uppercase text-zinc-400 /50">
            <tr>
              <th className="p-4">F.I.SH</th>
              <th className="p-4">Email</th>
              <th className="p-4">Holat</th>
              <th className="p-4 text-right">Amallar</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {loading ? (
              [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
            ) : filteredData.length > 0 ? (
              filteredData.map((item) => (
                <tr
                  key={item._id}
                  className="border-t border-zinc-800 hover:/40 transition-colors group"
                >
                  <td className="p-4">
                    {item.first_name} {item.last_name}
                  </td>
                  <td className="p-4 text-zinc-400">{item.email}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-md text-[10px] uppercase font-bold whitespace-nowrap ${
                        item.status === "faol"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : item.status === "ta'tilda"
                            ? "bg-blue-500/10 text-blue-500"
                            : "bg-amber-500/10 text-amber-500"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => openModal(item)}
                      className="hover:text-blue-400 p-1"
                    >
                      <Pencil size={17} />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="hover:text-rose-500 p-1"
                    >
                      <Trash2 size={17} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="p-10 text-center italic text-zinc-500"
                >
                  Ma'lumot topilmadi
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className=" border border-zinc-800 w-full max-w-md rounded-2xl p-6 relative max-h-[95vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-zinc-400 hover:"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-6 ">
              {editingAdmin ? "Tahrirlash" : "Yangi Qo'shish"}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <input
                placeholder="Ism"
                value={formData.first_name}
                onChange={(e) =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
                className="w-full  border border-zinc-700 rounded-lg p-2.5  outline-none focus:border-white transition-all text-sm"
                required
              />
              <input
                placeholder="Familiya"
                value={formData.last_name}
                onChange={(e) =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
                className="w-full  border border-zinc-700 rounded-lg p-2.5  outline-none focus:border-white transition-all text-sm"
                required
              />
              <input
                placeholder="Email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full  border border-zinc-700 rounded-lg p-2.5  outline-none focus:border-white transition-all text-sm"
                required
              />
              {!editingAdmin && (
                <input
                  placeholder="Parol"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full  border border-zinc-700 rounded-lg p-2.5  outline-none focus:border-white transition-all text-sm"
                  required
                />
              )}
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full  border border-zinc-700 rounded-lg p-2.5  outline-none focus:border-white transition-all text-sm"
              >
                <option value="all">All</option>
                <option value="faol" className="">
                  Faol
                </option>
                <option value="nofaol" className="">
                  Nofaol
                </option>
                <option value="ishdan bo'shatilgan" className="">
                  Ishdan bo'shatilgan
                </option>
                <option value="ta'tilda" className="">
                  Ta'tilda
                </option>
              </select>
              <button
                type="submit"
                className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-zinc-200 active:scale-95 transition-all text-sm"
              >
                Saqlash
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
