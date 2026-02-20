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
  <tr className="border-t border-zinc-800 animate-pulse">
    <td className="p-4">
      <div className="h-4 bg-zinc-800 rounded w-8 mx-auto"></div>
    </td>
    <td className="p-4">
      <div className="h-4 bg-zinc-800 rounded w-32"></div>
    </td>
    <td className="p-4">
      <div className="h-4 bg-zinc-800 rounded w-40"></div>
    </td>
    <td className="p-4">
      <div className="h-4 bg-zinc-800 rounded w-12 mx-auto"></div>
    </td>
    <td className="p-4">
      <div className="h-4 bg-zinc-800 rounded w-24"></div>
    </td>
    <td className="p-4">
      <div className="h-4 bg-zinc-800 rounded w-24"></div>
    </td>
    <td className="p-4 text-right">
      <div className="h-4 bg-zinc-800 rounded w-8 ml-auto"></div>
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
      // Skeletonni biroz ko'proq ko'rinishi uchun ixtiyoriy setTimeout (shart emas)
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
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setSelectedGroup(response.data?.data || response.data);
      setIsDetailsOpen(true);
    } catch (err) {
      alert("Ma'lumotlarni yuklashda xatolik.");
    }
  };

  return (
    <div className="w-full p-6 min-h-screen font-sans">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Guruhlar ro'yxati</h1>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 "
              size={16}
            />
            <input
              type="text"
              placeholder="Ustoz nomi bo'yicha..."
              className="w-full bg-transparent border border-zinc-800 rounded-lg py-2 pl-10 pr-4 text-sm outline-none focus:border-white transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-zinc-200 transition-all active:scale-95 whitespace-nowrap"
          >
            <Plus size={18} /> Guruh Qo'shish
          </button>
        </div>
      </div>

      <div className="border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className=" text-[11px] uppercase tracking-widest border-b border-zinc-800 ">
            <tr>
              <th className="p-4 w-12 text-center">No</th>
              <th className="p-4">Guruh nomi</th>
              <th className="p-4">Ustoz</th>
              <th className="p-4 text-center">O'quvchilar soni</th>
              <th className="p-4">Boshlangan vaqti</th>
              <th className="p-4">Tugagan vaqti</th>{" "}
              <th className="p-4 text-right">Amallar</th>
            </tr>
          </thead>
          <tbody className="text-[13px] divide-y ">
            {loading ? (
              // --- Loading bo'lganda 5 ta skeleton qatori ko'rinadi ---
              [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-20 text-center ">
                  Hech qanday guruh topilmadi.
                </td>
              </tr>
            ) : (
              data.map((group, index) => (
                <tr key={group._id} className="hover:/40 transition-colors">
                  <td className="p-4 text-center ">{index + 1}</td>
                  <td className="p-4 font-semibold">{group.name}</td>
                  <td className="p-4 text-zinc-400">
                    {group.teacher
                      ? `${group.teacher.first_name} ${group.teacher.last_name}`
                      : "Tayinlanmagan"}
                  </td>
                  <td className="p-4 text-center">
                    <span className=" px-2 py-1 rounded ">
                      {group.students?.length || 0}
                    </span>
                  </td>
                  <td className="p-4 text-zinc-400">
                    {group.started_group
                      ? new Date(group.started_group).toLocaleDateString()
                      : "---"}
                  </td>
                  <td className="p-4 text-zinc-400">
                    {group.end_group ? (
                      new Date(group.end_group).toLocaleDateString()
                    ) : (
                      <span className="text-emerald-500/70 italic text-[11px]">
                        Faol (Tugallanmagan)
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleViewGroup(group._id)}
                      className=" hover:text-white transition-colors p-1 rounded-md hover:"
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
        <div className="fixed inset-0 flex items-center justify-center z-[110] p-4 backdrop-blur-sm">
          <div className=" border border-zinc-800 w-full max-w-lg rounded-2xl p-8 relative shadow-2xl">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute right-6 top-6  hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold mb-8">Guruh qo'shish</h2>

            <form onSubmit={handleAddGroup} className="space-y-6">
              <div className="space-y-2 relative">
                <label className="text-sm font-medium ">Guruh nomi</label>
                <div className="relative">
                  <input
                    required
                    className="w-full  border border-zinc-800 rounded-xl p-4 text-sm outline-none focus:border-zinc-500 transition-colors pr-10"
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
                      className="absolute right-4 top-1/2 -translate-y-1/2  hover:text-white"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2 relative">
                <label className="text-sm font-medium ">Ustoz</label>
                <div className="relative">
                  <select
                    required
                    className="w-full  border border-zinc-800 rounded-xl p-4 text-sm outline-none focus:border-zinc-500 transition-colors appearance-none"
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
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-2">
                    {formData.teacher_id && (
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, teacher_id: "" })
                        }
                        className="pointer-events-auto  hover:text-white mr-1"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium ">
                  Boshlanish sanasi
                </label>
                <input
                  required
                  type="date"
                  className="w-full  border border-zinc-800 rounded-xl p-4 text-sm outline-none focus:border-zinc-500"
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData({ ...formData, start_date: e.target.value })
                  }
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="bg-white text-black font-semibold py-3 px-8 rounded-xl hover:bg-zinc-200 transition-all active:scale-[0.98]"
                >
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDetailsOpen && selectedGroup && (
        <div className="fixed inset-0 flex items-center justify-center z-[110] p-4 backdrop-blur-sm">
          <div className=" border border-zinc-800 w-full max-w-lg rounded-2xl p-8 relative">
            <button
              onClick={() => setIsDetailsOpen(false)}
              className="absolute right-6 top-6  hover:text-white"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-6 italic">
              Guruh: {selectedGroup.name}
            </h2>
            <div className="grid gap-4">
              <div className="p-4 rounded-xl  border border-zinc-800">
                <p className="text-[10px]  uppercase mb-1">O'qituvchi</p>
                <p className="font-medium">
                  {selectedGroup.teacher?.first_name}{" "}
                  {selectedGroup.teacher?.last_name || "Tayinlanmagan"}
                </p>
              </div>
              <div className="flex gap-4">
                <div className="flex-1 p-4 rounded-xl  border border-zinc-800">
                  <p className="text-[10px]  uppercase mb-1">Talabalar soni</p>
                  <p className="text-xl font-bold">
                    {selectedGroup.students?.length || 0}
                  </p>
                </div>
                <div className="flex-1 p-4 rounded-xl  border border-zinc-800">
                  <p className="text-[10px]  uppercase mb-1">Holati</p>
                  <p className="text-emerald-500 font-bold uppercase text-xs">
                    {selectedGroup.status || "Faol"}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsDetailsOpen(false)}
              className="w-full bg-zinc-100 text-black font-bold py-3 rounded-xl mt-8"
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
