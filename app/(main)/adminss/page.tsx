"use client";

import { useState, useCallback, useMemo } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Pencil,
  Trash2,
  UserPlus,
  Search,
  X,
  ChevronDown,
  RotateCcw,
  Ban,
} from "lucide-react";

interface AdminUser {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  role: string;
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

const AdminPanel = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role: "admin",
    status: "faol",
  });

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const token = Cookies.get("token");

  // --- 1. FETCHING (GET) ---
  const { data: admins = [], isLoading: loading } = useQuery({
    queryKey: ["admins", filterStatus],
    queryFn: async () => {
      if (!token) return [];
      const res = await axios.get(
        `${BASE_URL}/api/staff/all-admins?status=${filterStatus}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return res.data?.data || [];
    },
    enabled: !!token,
  });

  // --- 2. STATUS TOGGLE MUTATION ---
  const statusMutation = useMutation({
    mutationFn: async (admin: AdminUser) => {
      const isRestoring = admin.status === "ishdan bo'shatilgan";
      const newStatus = isRestoring ? "faol" : "ishdan bo'shatilgan";
      return axios.post(
        `${BASE_URL}/api/staff/edited-admin`,
        {
          _id: admin._id,
          first_name: admin.first_name,
          last_name: admin.last_name,
          email: admin.email,
          status: newStatus,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
    },
    onError: () => alert("Xatolik yuz berdi"),
  });

  // --- 3. DELETE MUTATION ---
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return axios.delete(`${BASE_URL}/api/staff/deleted-admin`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { _id: id },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      alert("Muvaffaqiyatli o'chirildi");
    },
    onError: (err: any) => {
      alert(
        err.response?.status === 403
          ? "Huquqingiz yetarli emas!"
          : "Xatolik yuz berdi",
      );
    },
  });

  // --- 4. SAVE (CREATE/EDIT) MUTATION ---
  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      const endpoint = editingAdmin
        ? "/api/staff/edited-admin"
        : "/api/staff/create-admin";
      return axios.post(`${BASE_URL}${endpoint}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      setIsModalOpen(false);
      alert("Muvaffaqiyatli saqlandi!");
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || "Xatolik yuz berdi");
    },
  });

  const filteredData = useMemo(() => {
    return admins.filter((admin: AdminUser) =>
      `${admin.first_name} ${admin.last_name} ${admin.email}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm, admins]);

  const handleStatusToggle = (admin: AdminUser) => {
    const isRestoring = admin.status === "ishdan bo'shatilgan";
    if (
      confirm(
        isRestoring ? "Ishga qaytarmoqchimisiz?" : "Ishdan bo'shatmoqchimisiz?",
      )
    ) {
      statusMutation.mutate(admin);
    }
  };

  const handleDelete = (id: string) => {
    if (
      confirm("Haqiqatan ham ushbu adminni bazadan butunlay o'chirmoqchimisiz?")
    ) {
      deleteMutation.mutate(id);
    }
  };

  const openModal = (admin: AdminUser | null = null) => {
    if (admin) {
      setEditingAdmin(admin);
      setFormData({
        first_name: admin.first_name,
        last_name: admin.last_name,
        email: admin.email,
        role: admin.role,
        status: admin.status || "faol",
        password: "",
      });
    } else {
      setEditingAdmin(null);
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        role: "admin",
        status: "faol",
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const payload = editingAdmin
      ? {
          _id: editingAdmin._id,
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          status: formData.status,
        }
      : {
          ...formData,
          role: formData.role.toLowerCase(),
          work_date: new Date().toISOString().split("T")[0],
        };

    saveMutation.mutate(payload);
  };

  return (
    <div className="w-full p-2 sm:p-4 md:p-6 min-h-screen overflow-x-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h1 className="text-lg md:text-xl font-semibold">
            Adminlar boshqaruvi
          </h1>
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 min-w-[140px]">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                size={14}
              />
              <input
                type="text"
                placeholder="Qidiruv..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-background border border-zinc-800 rounded-lg py-1.5 pl-8 pr-2 text-xs md:text-sm outline-none focus:ring-1 focus:ring-zinc-700"
              />
            </div>

            <button
              onClick={() => openModal(null)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm bg-zinc-100 text-black hover:bg-zinc-300 transition-all whitespace-nowrap"
            >
              <UserPlus size={14} />{" "}
              <span className="hidden xs:inline">Qo'shish</span>
              <span className="xs:hidden">+</span>
            </button>

            <div className="relative min-w-[80px]">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full appearance-none bg-background border border-zinc-800 rounded-lg py-1.5 pl-2 pr-7 text-xs md:text-sm outline-none focus:ring-1 focus:ring-zinc-700 cursor-pointer text-zinc-400"
              >
                <option value="">All</option>
                <option value="faol">Faol</option>
                <option value="tatilda">Tatilda</option>
                <option value="ishdan bo'shatilgan">Nofaol</option>
              </select>
              <ChevronDown
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
                size={12}
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 overflow-hidden w-full overflow-x-auto">
          <table className="w-full text-left min-w-[600px] md:min-w-full">
            <thead className="text-zinc-500 text-[10px] md:text-[12px] uppercase ">
              <tr>
                <th className="p-3">Ism Familiya</th>
                <th className="p-3">Email</th>
                <th className="p-3">Rol</th>
                <th className="p-3">Holat</th>
                <th className="p-3 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="text-xs md:text-sm divide-y divide-zinc-800">
              {loading
                ? [...Array(10)].map((_, index) => (
                    <SkeletonRow key={`skeleton-${index}`} />
                  ))
                : filteredData.map((item: AdminUser) => (
                    <tr
                      key={item._id}
                      className="hover:bg-zinc-800/30 transition-colors group"
                    >
                      <td className="p-3 ">
                        {item.first_name} {item.last_name}
                      </td>
                      <td className="p-3 font-mono text-[10px] md:text-xs">
                        {item.email}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded  border border-zinc-700 text-zinc-400 text-[9px] md:text-[10px] font-bold uppercase whitespace-nowrap">
                          {item.role}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] md:text-[10px] font-bold border whitespace-nowrap ${
                            item.status === "faol"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : item.status === "tatilda"
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                : "bg-red-500/10 text-red-400 border-red-500/20"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-1 md:gap-2">
                          <button
                            onClick={() => openModal(item)}
                            className="p-1.5 hover:bg-zinc-700 rounded-md text-zinc-400 hover:text-white transition-all"
                            title="Tahrirlash"
                          >
                            <Pencil size={14} />
                          </button>

                          {item.status === "ishdan bo'shatilgan" && (
                            <button
                              onClick={() => handleStatusToggle(item)}
                              className="p-1.5 rounded-md text-emerald-500 hover:bg-emerald-900/20 transition-all"
                              title="Ishga qaytarish"
                            >
                              <RotateCcw size={14} />
                            </button>
                          )}

                          <button
                            onClick={() => handleDelete(item._id)}
                            className="p-1.5 hover:bg-red-900/40 rounded-md text-red-500 transition-all"
                            title="Butunlay o'chirish"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-2 md:p-4 animate-in fade-in duration-200">
          <div className="bg-background border border-border w-full max-w-[500px] xs:max-w-md rounded-xl p-4 md:p-6 shadow-lg animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-base md:text-lg font-semibold tracking-tight text-foreground">
                {editingAdmin ? "Tahrirlash" : "Yangi admin"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 p-1"
              >
                <X size={18} className="text-muted-foreground" />
                <span className="sr-only">Yopish</span>
              </button>
            </div>

            <form
              onSubmit={handleSave}
              className="space-y-3 md:space-y-4 text-xs md:text-sm"
            >
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 md:gap-4">
                <div className="space-y-1.5 md:space-y-2">
                  <label className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase ml-1">
                    Ism
                  </label>
                  <input
                    placeholder="Ism"
                    value={formData.first_name}
                    onChange={(e) =>
                      setFormData({ ...formData, first_name: e.target.value })
                    }
                    className="w-full flex h-9 md:h-10 rounded-md border border-input bg-background px-3 py-1 md:py-2 text-xs md:text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  />
                </div>
                <div className="space-y-1.5 md:space-y-2">
                  <label className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase ml-1">
                    Familiya
                  </label>
                  <input
                    placeholder="Familiya"
                    value={formData.last_name}
                    onChange={(e) =>
                      setFormData({ ...formData, last_name: e.target.value })
                    }
                    className="w-full flex h-9 md:h-10 rounded-md border border-input bg-background px-3 py-1 md:py-2 text-xs md:text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5 md:space-y-2">
                <label className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase ml-1">
                  Email
                </label>
                <input
                  placeholder="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full flex h-9 md:h-10 rounded-md border border-input bg-background px-3 py-1 md:py-2 text-xs md:text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  required
                />
              </div>

              {!editingAdmin && (
                <div className="space-y-1.5 md:space-y-2">
                  <label className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase ml-1">
                    Parol
                  </label>
                  <input
                    placeholder="Parol"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full flex h-9 md:h-10 rounded-md border border-input bg-background px-3 py-1 md:py-2 text-xs md:text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  />
                </div>
              )}

              <div className="flex flex-col xs:flex-row gap-2 md:gap-3 pt-2 md:pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="order-2 xs:order-1 flex-1 inline-flex items-center justify-center rounded-md text-xs md:text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 md:h-10 px-4 py-2"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="order-1 xs:order-2 flex-1 inline-flex items-center justify-center rounded-md text-xs md:text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring bg-primary text-primary-foreground hover:bg-primary/90 h-9 md:h-10 px-4 py-2"
                >
                  {saveMutation.isPending ? "Saqlanmoqda..." : "Saqlash"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
