"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { Search, Plus, MoreHorizontal, X, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Group {
  _id: string;
  name: string;
  teacher?: {
    first_name: string;
    last_name: string;
  };
  students?: any[];
  started_group: string;
  end_group: string;
  status?: string;
}

const SkeletonRow = () => (
  <tr className="border-t border-border animate-pulse">
    <td className="p-4">
      <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
    </td>
    <td className="p-4">
      <div className="h-4 bg-muted rounded w-3/4"></div>
    </td>
    <td className="p-4">
      <div className="h-4 bg-muted rounded w-full"></div>
    </td>
    <td className="p-4">
      <div className="h-4 bg-muted rounded w-12 mx-auto"></div>
    </td>
    <td className="p-4">
      <div className="h-4 bg-muted rounded w-20"></div>
    </td>
    <td className="p-4">
      <div className="h-4 bg-muted rounded w-20"></div>
    </td>
    <td className="p-4 text-right">
      <div className="h-8 w-8 bg-muted rounded ml-auto"></div>
    </td>
  </tr>
);

const Groups = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    teacher_id: "",
    course_id: "",
    start_date: "",
  });

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:7070";
  const token = Cookies.get("token");

  // --- 1. Guruhlarni olish (Query) ---
  const { data: groups = [], isLoading: isGroupsLoading } = useQuery({
    queryKey: ["groups", searchTerm, filterStatus],
    queryFn: async () => {
      let response;
      if (searchTerm) {
        response = await axios.get(`${BASE_URL}/api/group/search-teacher`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { name: searchTerm },
        });
      } else {
        const url = filterStatus
          ? `${BASE_URL}/api/group/get-all-group?status=${filterStatus}`
          : `${BASE_URL}/api/group/get-all-group`;
        response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      return response.data?.data || [];
    },
    enabled: !!token,
  });

  // --- 2. Ustozlar va Kurslar (Initial Data) ---
  const { data: teachers = [] } = useQuery({
    queryKey: ["teachers-select"],
    queryFn: async () => {
      const res = await axios.get(`${BASE_URL}/api/teacher/get-all-teachers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data?.data || [];
    },
    enabled: !!token && isAddModalOpen, // Faqat modal ochilganda yuklanadi
  });

  const { data: courses = [] } = useQuery({
    queryKey: ["courses-select"],
    queryFn: async () => {
      const res = await axios.get(`${BASE_URL}/api/course/get-all-courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data?.data || [];
    },
    enabled: !!token && isAddModalOpen,
  });

  // --- 3. Bitta guruh tafsilotlari ---
  const { data: selectedGroup, isLoading: isDetailsLoading } = useQuery({
    queryKey: ["group-detail", selectedGroupId],
    queryFn: async () => {
      const res = await axios.get(
        `${BASE_URL}/api/group/one-group/${selectedGroupId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return res.data?.data || res.data;
    },
    enabled: !!selectedGroupId && isDetailsOpen,
  });

  // --- 4. Guruh qo'shish (Mutation) ---
  const addGroupMutation = useMutation({
    mutationFn: (newGroup: typeof formData) =>
      axios.post(`${BASE_URL}/api/group/create-group`, newGroup, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] }); // Guruhlar ro'yxatini yangilash
      setIsAddModalOpen(false);
      setFormData({ name: "", teacher_id: "", course_id: "", start_date: "" });
    },
    onError: () => alert("Guruh qo'shishda xatolik yuz berdi"),
  });

  // HANDLERS
  const handleAddGroup = (e: React.FormEvent) => {
    e.preventDefault();
    addGroupMutation.mutate(formData);
  };

  const handleViewGroup = (id: string) => {
    setSelectedGroupId(id);
    setIsDetailsOpen(true);
  };

  return (
    <div className="w-full p-3 sm:p-6 min-h-screen text-foreground font-sans overflow-x-hidden">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
          Guruhlar
        </h1>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={16}
            />
            <input
              type="text"
              placeholder="Ustoz nomi..."
              className="w-full border border-input rounded-lg py-2 pl-10 pr-4 text-sm outline-none focus:ring-1 focus:ring-ring transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex w-full sm:w-auto items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-all active:scale-95 whitespace-nowrap"
          >
            <Plus size={18} /> Qo'shish
          </button>
        </div>
      </div>

      <div className="border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead className="text-[11px] uppercase tracking-widest border-b border-border text-muted-foreground">
              <tr>
                <th className="p-4 w-12 text-center">No</th>
                <th className="p-4">Guruh nomi</th>
                <th className="p-4">Ustoz</th>
                <th className="p-4 text-center">O'quvchilar</th>
                <th className="p-4">Boshlanish</th>
                <th className="p-4">Tugash</th>
                <th className="p-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="text-[13px] divide-y divide-border">
              {isGroupsLoading ? (
                [...Array(10)].map((_, i) => <SkeletonRow key={i} />)
              ) : groups.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="p-12 text-center text-muted-foreground"
                  >
                    Hech qanday guruh topilmadi.
                  </td>
                </tr>
              ) : (
                groups.map((group: Group, index: number) => (
                  <tr
                    key={group._id}
                    className="hover:bg-accent/30 transition-colors"
                  >
                    <td className="p-4 text-center text-muted-foreground">
                      {index + 1}
                    </td>
                    <td className="p-4 font-semibold text-foreground">
                      {group.name}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {group.teacher
                        ? `${group.teacher.first_name} ${group.teacher.last_name}`
                        : "Tayinlanmagan"}
                    </td>
                    <td className="p-4 text-center">
                      <span className="bg-muted px-2 py-1 rounded text-foreground">
                        {group.students?.length || 0}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {group.started_group
                        ? new Date(group.started_group).toLocaleDateString()
                        : "---"}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {group.end_group ? (
                        new Date(group.end_group).toLocaleDateString()
                      ) : (
                        <span className="text-emerald-500 font-medium italic text-[11px]">
                          Faol
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleViewGroup(group._id)}
                        className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-accent"
                      >
                        <MoreHorizontal size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[110] p-3 bg-black/60 backdrop-blur-sm">
          <div className="border border-border w-full max-w-lg rounded-2xl p-5 sm:p-8 relative shadow-2xl animate-in fade-in zoom-in-95 duration-200 bg-background overflow-y-auto max-h-[95vh]">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <X size={20} />
            </button>
            <h2 className="text-lg sm:text-xl font-bold mb-6 text-foreground">
              Guruh qo'shish
            </h2>
            <form onSubmit={handleAddGroup} className="space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Guruh nomi
                </label>
                <input
                  required
                  className="w-full border border-input rounded-xl p-3 sm:p-4 text-sm outline-none focus:ring-1 focus:ring-ring transition-colors"
                  placeholder="Ingliz tili..."
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Ustoz
                </label>
                <select
                  required
                  className="w-full border border-input rounded-xl p-3 sm:p-4 text-sm outline-none focus:ring-1 focus:ring-ring appearance-none text-foreground"
                  value={formData.teacher_id}
                  onChange={(e) =>
                    setFormData({ ...formData, teacher_id: e.target.value })
                  }
                >
                  <option value="">Ustozni tanlang</option>
                  {teachers.map((t: any) => (
                    <option key={t._id} value={t._id}>
                      {t.first_name} {t.last_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Sana
                </label>
                <input
                  required
                  type="date"
                  className="w-full border border-input rounded-xl p-3 sm:p-4 text-sm outline-none focus:ring-1 focus:ring-ring text-foreground"
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData({ ...formData, start_date: e.target.value })
                  }
                />
              </div>
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={addGroupMutation.isPending}
                  className="w-full sm:w-auto bg-primary text-primary-foreground font-semibold py-3 px-8 rounded-xl hover:opacity-90 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {addGroupMutation.isPending && (
                    <Loader2 size={18} className="animate-spin" />
                  )}
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAILS MODAL */}
      {isDetailsOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[110] p-3 bg-black/60 backdrop-blur-sm">
          <div className="border border-border w-full max-w-lg rounded-2xl p-5 sm:p-8 relative shadow-2xl bg-background animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsDetailsOpen(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <X size={24} />
            </button>
            {isDetailsLoading ? (
              <div className="flex flex-col items-center py-10 gap-4">
                <Loader2 className="animate-spin text-primary" size={40} />
                <p className="text-sm text-muted-foreground">Yuklanmoqda...</p>
              </div>
            ) : selectedGroup ? (
              <>
                <h2 className="text-xl sm:text-2xl font-bold mb-6 italic text-foreground break-words">
                  Guruh: {selectedGroup.name}
                </h2>
                <div className="grid gap-3 sm:gap-4">
                  <div className="p-3 sm:p-4 rounded-xl border border-border bg-muted/30">
                    <p className="text-[10px] text-muted-foreground uppercase mb-1 font-bold">
                      O'qituvchi
                    </p>
                    <p className="font-medium text-foreground text-sm sm:text-base">
                      {selectedGroup.teacher?.first_name}{" "}
                      {selectedGroup.teacher?.last_name || "Tayinlanmagan"}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <div className="flex-1 p-3 sm:p-4 rounded-xl border border-border bg-muted/30">
                      <p className="text-[10px] text-muted-foreground uppercase mb-1 font-bold">
                        Talabalar
                      </p>
                      <p className="text-lg sm:text-xl font-bold text-foreground">
                        {selectedGroup.students?.length || 0}
                      </p>
                    </div>
                    <div className="flex-1 p-3 sm:p-4 rounded-xl border border-border bg-muted/30">
                      <p className="text-[10px] text-muted-foreground uppercase mb-1 font-bold">
                        Holati
                      </p>
                      <p className="text-emerald-500 font-extrabold uppercase text-[10px] sm:text-xs">
                        {selectedGroup.status || "Faol"}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-center py-10 text-muted-foreground">
                Ma'lumot topilmadi.
              </p>
            )}
            <button
              onClick={() => setIsDetailsOpen(false)}
              className="w-full bg-secondary text-secondary-foreground font-bold py-3 rounded-xl mt-6 sm:mt-8 hover:bg-secondary/80 transition-all text-sm sm:text-base"
            >
              Yopish
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Groups;
