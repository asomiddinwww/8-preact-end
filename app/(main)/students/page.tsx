"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { Search, Plus, MoreHorizontal, X, ChevronDown } from "lucide-react";

interface Student {
  _id: string;
  first_name: string;
  last_name: string;
  phone: string;
  status: "faol" | "ta'tilda" | "yakunladi" | string;
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

const Students = () => {
  const [data, setData] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [filterStatus, setFilterStatus] = useState("");

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
  });

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:7070";
  const token = Cookies.get("token");

  const fetchStudents = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const url = filterStatus
        ? `${BASE_URL}/api/student/get-all-students?status=${filterStatus}`
        : `${BASE_URL}/api/student/get-all-students`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } catch (err) {
      console.error("Xatolik");
    } finally {
      setTimeout(() => setLoading(false), 600);
    }
  }, [BASE_URL, token, filterStatus]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      await axios.post(`${BASE_URL}/api/student/create-student`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsModalOpen(false);
      setFormData({ first_name: "", last_name: "", phone: "" });
      fetchStudents();
    } catch (err) {
      alert("Qo'shishda xatolik");
    }
  };

  const handleDelete = async (id: string) => {
    if (!token || !confirm("Tasdiqlaysizmi?")) return;
    try {
      await axios.delete(`${BASE_URL}/api/student/delete-student`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { _id: id },
      });
      fetchStudents();
      setActiveMenu(null);
    } catch (err) {
      alert("Xatolik");
    }
  };

  const handleLeaveReturn = async (student: Student) => {
    if (!token) return;

    try {
      if (student.status === "ta'tilda" || student.status === "yakunladi") {
        if (!confirm(`O'quvchini faol holatga qaytarishni tasdiqlaysizmi?`))
          return;

        await axios.post(
          `${BASE_URL}/api/student/return-student`,
          { _id: student._id },
          { headers: { Authorization: `Bearer ${token}` } },
        );
      } else if (student.status === "faol") {
        const days = prompt("Necha kunlik ta'til? (Masalan: 4)", "4");
        const reason = prompt("Sababi?", "Tobi yo'q");

        if (!days || !reason) return;

        await axios.post(
          `${BASE_URL}/api/student/leave-student`,
          {
            student_id: student._id,
            leave_days: days,
            reason: reason,
          },
          { headers: { Authorization: `Bearer ${token}` } },
        );
      }

      fetchStudents();
      setActiveMenu(null);
      alert("Muvaffaqiyatli bajarildi!");
    } catch (err: any) {
      console.error("Xato:", err.response?.data);
      alert(err.response?.data?.message || "Amalda xatolik yuz berdi");
    }
  };

  return (
    <div className="w-full p-2 sm:p-6 min-h-screen">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <h1 className="text-lg font-bold">Studentlar ro'yxati</h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <select
                className="w-full appearance-none border rounded-lg py-2 pl-4 pr-10 text-sm outline-none bg-white text-black cursor-pointer"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All</option>
                <option value="faol">Faol</option>
                <option value="ta'tilda">Ta'tilda</option>
                <option value="yakunladi">Yakunladi</option>
              </select>
              <ChevronDown
                className="absolute right-3 top-2.5 pointer-events-none text-black"
                size={16}
              />
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="sm:hidden border p-2 rounded-lg flex items-center justify-center"
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Qidiruv..."
              className="w-full border rounded-lg py-2 pl-10 pr-4 text-sm outline-none"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="hidden sm:flex border px-4 py-2 rounded-lg text-sm font-bold items-center gap-2 whitespace-nowrap"
          >
            <Plus size={18} /> Student Qo'shish
          </button>
        </div>
      </div>

      <div className="border rounded-2xl overflow-x-auto">
        <div className="min-w-[600px]">
          <table className="w-full text-left">
            <thead className="text-xs uppercase border-b">
              <tr>
                <th className="p-4">Ism</th>
                <th className="p-4">Familiya</th>
                <th className="p-4">Telefon</th>
                <th className="p-4">Holat</th>
                <th className="p-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading
                ? [...Array(10)].map((_, i) => <SkeletonRow key={i} />)
                : data
                    .filter((s) =>
                      s.first_name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()),
                    )
                    .map((student) => (
                      <tr
                        key={student._id}
                        className="border-b last:border-0 hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="p-4">{student.first_name}</td>
                        <td className="p-4">{student.last_name}</td>
                        <td className="p-4">{student.phone}</td>
                        <td className="p-4">
                          <span className="border px-2 py-1 rounded text-[10px] uppercase font-bold whitespace-nowrap">
                            {student.status}
                          </span>
                        </td>
                        <td className="p-4 text-right relative">
                          <button
                            onClick={() =>
                              setActiveMenu(
                                activeMenu === student._id ? null : student._id,
                              )
                            }
                            className="p-1 hover:bg-gray-100 rounded-full"
                          >
                            <MoreHorizontal size={20} />
                          </button>

                          {activeMenu === student._id && (
                            <>
                              <div
                                className="fixed inset-0 z-[90]"
                                onClick={() => setActiveMenu(null)}
                              />
                              <div className="absolute right-4 mt-2 w-48 border rounded-lg z-[100] text-black border-black shadow-lg bg-white">
                                <button
                                  onClick={() => handleLeaveReturn(student)}
                                  className="w-full text-left px-4 py-2 text-xs border-b hover:bg-gray-50"
                                >
                                  {student.status === "ta'tilda"
                                    ? "Markazga qaytarish"
                                    : "Ta'tilga chiqarish"}
                                </button>
                                <button
                                  onClick={() => handleDelete(student._id)}
                                  className="w-full text-left px-4 py-2 text-xs hover:bg-gray-50"
                                >
                                  O'chirish
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
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[200] bg-black/50 p-4">
          <div className="bg-white text-black p-6 rounded-xl w-full max-w-[320px] border shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-sm sm:text-base">
                Student qo'shish
              </h2>
              <button onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddStudent} className="flex flex-col gap-4">
              <input
                required
                placeholder="Ism"
                className="border border-black p-2 rounded text-sm outline-none"
                value={formData.first_name}
                onChange={(e) =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
              />
              <input
                required
                placeholder="Familiya"
                className="border p-2 rounded border-black text-sm outline-none"
                value={formData.last_name}
                onChange={(e) =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
              />
              <input
                required
                placeholder="Telefon"
                className="border p-2 rounded border-black text-sm outline-none"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
              <button
                type="submit"
                className="border bg-black text-white py-2 rounded font-bold transition-opacity hover:opacity-90 text-sm"
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

export default Students;
