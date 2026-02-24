"use client";

import { useState, useMemo } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import {
  Trash2,
  Search,
  Plus,
  X,
  MoreHorizontal,
  RotateCcw,
  Info,
  Loader2,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Teacher {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: string;
}

const STATIC_COURSES = [
  { id: "6994723c9a3d056f54b7e4a2", name: "Ingliz tili" },
  { id: "681dcb7444fa70421ae9fb9d", name: "Frontend dasturlash" },
];

const SkeletonRow = () => (
  <tr className="border-t border-border animate-pulse">
    <td className="p-3 sm:p-4">
      <div className="h-4 rounded w-16 bg-muted"></div>
    </td>
    <td className="p-3 sm:p-4">
      <div className="h-4 rounded w-16 bg-muted"></div>
    </td>
    <td className="p-3 sm:p-4">
      <div className="h-4 rounded w-24 bg-muted"></div>
    </td>
    <td className="p-3 sm:p-4">
      <div className="h-4 rounded w-12 bg-muted"></div>
    </td>
    <td className="p-3 sm:p-4 text-right">
      <div className="h-4 w-4 rounded ml-auto bg-muted"></div>
    </td>
  </tr>
);

const Teachers = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    course_id: STATIC_COURSES[0].id,
  });

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const token = Cookies.get("token");

  const { data: teachers = [], isLoading: loading } = useQuery({
    queryKey: ["teachers", filterStatus],
    queryFn: async () => {
      const url = filterStatus
        ? `${BASE_URL}/api/teacher/get-all-teachers?status=${filterStatus}`
        : `${BASE_URL}/api/teacher/get-all-teachers`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return Array.isArray(res.data) ? res.data : res.data?.data || [];
    },
    enabled: !!token,
  });

  const createMutation = useMutation({
    mutationFn: async (newTeacher: typeof formData) => {
      return axios.post(`${BASE_URL}/api/teacher/create-teacher`, newTeacher, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      setIsModalOpen(false);
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        password: "",
        course_id: STATIC_COURSES[0].id,
      });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || "Xatolik!");
    },
  });

  const fireMutation = useMutation({
    mutationFn: async (id: string) => {
      return axios.delete(`${BASE_URL}/api/teacher/fire-teacher`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { _id: id },
      });
    },
    onSuccess: () => {
      alert("Ustoz ishdan bo'shatildi");
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      setActiveMenu(null);
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || "O'chirishda xatolik yuz berdi");
    },
  });

  const returnMutation = useMutation({
    mutationFn: async (id: string) => {
      return axios.post(
        `${BASE_URL}/api/teacher/return-teacher`,
        { _id: id },
        { headers: { Authorization: `Bearer ${token}` } },
      );
    },
    onSuccess: () => {
      alert("Ustoz faoliyatga qaytarildi");
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      setActiveMenu(null);
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || "Xatolik yuz berdi!");
    },
  });

  const filteredData = useMemo(() => {
    if (!Array.isArray(teachers)) return [];
    return teachers.filter((t: Teacher) =>
      `${t.first_name} ${t.last_name} ${t.email}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm, teachers]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleFireTeacher = (id: string) => {
    if (confirm("Ustozni ishdan bo'shatmoqchimisiz?")) {
      fireMutation.mutate(id);
    }
  };

  const handleReturnTeacher = (id: string) => {
    returnMutation.mutate(id);
  };

  return (
    <div className="w-full p-3 sm:p-6 min-h-screen text-foreground transition-colors duration-300">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
          Ustozlar ro'yxati
        </h1>

        <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full xl:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={16}
            />
            <input
              type="text"
              placeholder="Qidiruv..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-secondary/50 border border-input rounded-lg py-2 pl-9 pr-4 text-xs sm:text-sm outline-none focus:ring-1 focus:ring-ring transition-all"
            />
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex bg-primary text-primary-foreground items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold hover:opacity-90 transition-all active:scale-95"
          >
            <Plus size={16} />{" "}
            <span className="whitespace-nowrap">Ustoz Qo'shish</span>
          </button>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-secondary/50 border border-input rounded-lg py-2 px-3 text-xs sm:text-sm outline-none cursor-pointer focus:ring-1 focus:ring-ring"
          >
            <option value="">Barchasi</option>
            <option value="faol">Faol</option>
            <option value="ishdan bo'shatilgan">Nofaol</option>
          </select>
        </div>
      </div>

      <div className="w-full overflow-x-auto border border-border rounded-xl shadow-sm scrollbar-hide">
        <table className="w-full text-left min-w-[500px]">
          <thead className="text-[10px] sm:text-xs uppercase text-muted-foreground border-b border-border">
            <tr>
              <th className="p-3 sm:p-4 font-medium">Ism</th>
              <th className="p-3 sm:p-4 font-medium">Familiya</th>
              <th className="p-3 sm:p-4 font-medium">Email</th>
              <th className="p-3 sm:p-4 font-medium">Holat</th>
              <th className="p-3 sm:p-4 text-right font-medium">Amallar</th>
            </tr>
          </thead>
          <tbody className="text-xs sm:text-sm">
            {loading
              ? [...Array(10)].map((_, i) => <SkeletonRow key={i} />)
              : filteredData.map((t: Teacher) => (
                  <tr
                    key={t._id}
                    className="border-t border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-3 sm:p-4 font-medium truncate max-w-[100px]">
                      {t.first_name}
                    </td>
                    <td className="p-3 sm:p-4 text-muted-foreground truncate max-w-[100px]">
                      {t.last_name}
                    </td>
                    <td className="p-3 sm:p-4 text-muted-foreground truncate max-w-[150px]">
                      {t.email}
                    </td>
                    <td className="p-3 sm:p-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] uppercase font-bold tracking-wider ${
                          t.status === "faol"
                            ? "text-emerald-500 bg-emerald-500/10"
                            : "text-destructive bg-destructive/10"
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="p-3 sm:p-4 text-right relative">
                      <button
                        onClick={() =>
                          setActiveMenu(activeMenu === t._id ? null : t._id)
                        }
                        className="p-1.5 hover:bg-accent rounded-lg text-muted-foreground transition-colors"
                      >
                        <MoreHorizontal size={18} />
                      </button>
                      {activeMenu === t._id && (
                        <>
                          <div
                            className="fixed inset-0 z-[90]"
                            onClick={() => setActiveMenu(null)}
                          />
                          <div className="absolute right-4 mt-1 w-32 sm:w-40 bg-popover border border-border rounded-lg z-[100] shadow-xl py-1 animate-in fade-in zoom-in duration-150">
                            {t.status === "faol" ? (
                              <button
                                disabled={fireMutation.isPending}
                                onClick={() => handleFireTeacher(t._id)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-[10px] sm:text-xs text-destructive hover:bg-destructive/10 transition-colors"
                              >
                                {fireMutation.isPending ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <Trash2 size={14} />
                                )}
                                O'chirish
                              </button>
                            ) : (
                              <button
                                disabled={returnMutation.isPending}
                                onClick={() => handleReturnTeacher(t._id)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-[10px] sm:text-xs text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                              >
                                {returnMutation.isPending ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <RotateCcw size={14} />
                                )}
                                Qaytarish
                              </button>
                            )}
                            <button
                              onClick={() => router.push(`/teachers/${t._id}`)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-[10px] sm:text-xs hover:bg-accent text-foreground transition-colors"
                            >
                              <Info size={14} /> Ma'lumot
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[200] p-2 sm:p-4">
          <div className="bg-background border border-border w-full max-w-[450px] max-h-[95vh] overflow-y-auto rounded-xl p-5 sm:p-8 relative shadow-2xl animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl sm:text-2xl font-semibold mb-6">
              Ustoz Qo'shish
            </h2>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 text-left">
                {[
                  {
                    label: "Ism",
                    key: "first_name",
                    type: "text",
                    placeholder: "Ali",
                  },
                  {
                    label: "Familiya",
                    key: "last_name",
                    type: "text",
                    placeholder: "Valiyev",
                  },
                  {
                    label: "Email",
                    key: "email",
                    type: "email",
                    placeholder: "you@example.com",
                  },
                  {
                    label: "Telefon",
                    key: "phone",
                    type: "text",
                    placeholder: "+998 90 123 45 67",
                  },
                  {
                    label: "Parol",
                    key: "password",
                    type: "password",
                    placeholder: "••••••••",
                  },
                ].map((input) => (
                  <div key={input.key} className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">
                      {input.label}
                    </label>
                    <input
                      type={input.type}
                      placeholder={input.placeholder}
                      value={(formData as any)[input.key]}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [input.key]: e.target.value,
                        })
                      }
                      className="w-full bg-background border border-input rounded-lg px-3 py-2.5 text-xs sm:text-sm outline-none focus:ring-1 focus:ring-ring transition-all"
                      required
                    />
                  </div>
                ))}

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Ustoz Sohasi
                  </label>
                  <div className="relative">
                    <select
                      value={formData.course_id}
                      onChange={(e) =>
                        setFormData({ ...formData, course_id: e.target.value })
                      }
                      className="w-full bg-background border border-input rounded-lg px-3 py-2.5 text-xs sm:text-sm outline-none focus:ring-1 focus:ring-ring appearance-none"
                    >
                      {STATIC_COURSES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                      <MoreHorizontal size={14} className="rotate-90" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs sm:text-sm text-muted-foreground hover:bg-accent transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-xs sm:text-sm font-bold hover:opacity-90 transition-all active:scale-95 flex items-center gap-2"
                >
                  {createMutation.isPending && (
                    <Loader2 size={14} className="animate-spin" />
                  )}
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

export default Teachers;
