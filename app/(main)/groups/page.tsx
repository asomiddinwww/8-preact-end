"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { Search, Plus, MoreHorizontal, X } from "lucide-react";

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
  const [data, setData] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    teacher_id: "",
    course_id: "",
    start_date: "",
  });

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:7070";
  const token = Cookies.get("token");

  const fetchGroups = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
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
      if (response.data && response.data.data) {
        setData(response.data.data);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error("Guruhlarni yuklashda xatolik:", error);
      setData([]);
    } finally {
      setTimeout(() => setLoading(false), 600);
    }
  }, [BASE_URL, searchTerm, filterStatus, token]);

  const fetchInitialData = useCallback(async () => {
    if (!token) return;
    try {
      const [tRes, cRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/teacher/get-all-teachers`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${BASE_URL}/api/course/get-all-courses`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setTeachers(tRes.data?.data || []);
      setCourses(cRes.data?.data || []);
    } catch (err) {
      console.error("Dastlabki ma'lumotlarda xato:", err);
    }
  }, [BASE_URL, token]);

  useEffect(() => {
    fetchGroups();
    fetchInitialData();
  }, [fetchGroups, fetchInitialData]);

  const handleAddGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      await axios.post(`${BASE_URL}/api/group/create-group`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsAddModalOpen(false);
      setFormData({ name: "", teacher_id: "", course_id: "", start_date: "" });
      fetchGroups();
    } catch (err) {
      alert("Guruh qo'shishda xatolik yuz berdi");
    }
  };

  const handleViewGroup = async (id: string) => {
    if (!token) return;
    try {
      const response = await axios.get(
        `${BASE_URL}/api/group/one-group/${id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setSelectedGroup(response.data?.data || response.data);
      setIsDetailsOpen(true);
    } catch (err) {
      alert("Ma'lumotlarni yuklashda xatolik.");
    }
  };

  return (
    <div className="w-full p-6 min-h-screen  text-foreground font-sans">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Guruhlar ro'yxati</h1>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={16}
            />
            <input
              type="text"
              placeholder="Ustoz nomi bo'yicha..."
              className="w-full  border border-input rounded-lg py-2 pl-10 pr-4 text-sm outline-none focus:ring-1 focus:ring-ring transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-all active:scale-95 whitespace-nowrap"
          >
            <Plus size={18} /> Guruh Qo'shish
          </button>
        </div>
      </div>

      <div className="border border-border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="text-[11px] uppercase tracking-widest border-b border-border text-muted-foreground">
            <tr>
              <th className="p-4 w-12 text-center">No</th>
              <th className="p-4">Guruh nomi</th>
              <th className="p-4">Ustoz</th>
              <th className="p-4 text-center">O'quvchilar soni</th>
              <th className="p-4">Boshlangan vaqti</th>
              <th className="p-4">Tugagan vaqti</th>
              <th className="p-4 text-right">Amallar</th>
            </tr>
          </thead>
          <tbody className="text-[13px] divide-y divide-border">
            {loading ? (
              [...Array(10)].map((_, i) => <SkeletonRow key={i} />)
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="p-20 text-center text-muted-foreground"
                >
                  Hech qanday guruh topilmadi.
                </td>
              </tr>
            ) : (
              data.map((group, index) => (
                <tr key={group._id} className="hover:transition-colors">
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
                        Faol (Tugallanmagan)
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

      {isAddModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[110] p-4 bg-black/60 backdrop-blur-sm">
          <div className="border border-border w-full max-w-lg rounded-2xl p-8 relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute right-6 top-6 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-8 text-foreground">
              Guruh qo'shish
            </h2>
            <form onSubmit={handleAddGroup} className="space-y-6">
              <div className="space-y-2 relative">
                <label className="text-sm font-medium text-foreground">
                  Guruh nomi
                </label>
                <div className="relative">
                  <input
                    required
                    className="w-full  border border-input rounded-xl p-4 text-sm outline-none focus:ring-1 focus:ring-ring transition-colors pr-10"
                    placeholder="Masalan: Ingliz tili"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                  {formData.name && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, name: "" })}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
              <div className="space-y-2 relative">
                <label className="text-sm font-medium text-foreground">
                  Ustoz
                </label>
                <div className="relative">
                  <select
                    required
                    className="w-full  border border-input rounded-xl p-4 text-sm outline-none focus:ring-1 focus:ring-ring transition-colors appearance-none text-foreground"
                    value={formData.teacher_id}
                    onChange={(e) =>
                      setFormData({ ...formData, teacher_id: e.target.value })
                    }
                  >
                    <option value="">Ustozni tanlang</option>
                    {teachers.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.first_name} {t.last_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Boshlanish sanasi
                </label>
                <input
                  required
                  type="date"
                  className="w-full  border border-input rounded-xl p-4 text-sm outline-none focus:ring-1 focus:ring-ring text-foreground"
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData({ ...formData, start_date: e.target.value })
                  }
                />
              </div>
              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="bg-primary text-primary-foreground font-semibold py-3 px-8 rounded-xl hover:opacity-90 transition-all active:scale-[0.98]"
                >
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDetailsOpen && selectedGroup && (
        <div className="fixed inset-0 flex items-center justify-center z-[110] p-4 bg-black/60 backdrop-blur-sm">
          <div className="border border-border w-full max-w-lg rounded-2xl p-8 relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsDetailsOpen(false)}
              className="absolute right-6 top-6 text-muted-foreground hover:text-foreground"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-6 italic text-foreground">
              Guruh: {selectedGroup.name}
            </h2>
            <div className="grid gap-4">
              <div className="p-4 rounded-xl border border-border bg-muted/30">
                <p className="text-[10px] text-muted-foreground uppercase mb-1 font-bold">
                  O'qituvchi
                </p>
                <p className="font-medium text-foreground">
                  {selectedGroup.teacher?.first_name}{" "}
                  {selectedGroup.teacher?.last_name || "Tayinlanmagan"}
                </p>
              </div>
              <div className="flex gap-4">
                <div className="flex-1 p-4 rounded-xl border border-border bg-muted/30">
                  <p className="text-[10px] text-muted-foreground uppercase mb-1 font-bold">
                    Talabalar soni
                  </p>
                  <p className="text-xl font-bold text-foreground">
                    {selectedGroup.students?.length || 0}
                  </p>
                </div>
                <div className="flex-1 p-4 rounded-xl border border-border bg-muted/30">
                  <p className="text-[10px] text-muted-foreground uppercase mb-1 font-bold">
                    Holati
                  </p>
                  <p className="text-emerald-500 font-extrabold uppercase text-xs">
                    {selectedGroup.status || "Faol"}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsDetailsOpen(false)}
              className="w-full bg-secondary text-secondary-foreground font-bold py-3 rounded-xl mt-8 hover:bg-secondary/80 transition-all"
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
