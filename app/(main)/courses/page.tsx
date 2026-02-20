"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import {
  Plus,
  Pencil,
  Trash2,
  Snowflake,
  Flame,
  Users,
  Clock,
  Search,
  Loader2,
} from "lucide-react";

const safeStr = (value: any): string => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (typeof value === "object") {
    return value.name || value.title || value.label || "";
  }
  return "";
};

export default function Courses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterFreeze, setFilterFreeze] = useState<string>("all");

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:7070";

  const fetchCourses = useCallback(async () => {
    const token = Cookies.get("token");
    try {
      setLoading(true);
      const queryParams: any = {};
      if (searchTerm) queryParams.search = searchTerm;
      if (filterFreeze !== "all")
        queryParams.is_freeze = filterFreeze === "true";

      const res = await axios.get(`${BASE_URL}/api/course/get-courses`, {
        headers: { Authorization: `Bearer ${token}` },
        params: queryParams,
      });

      const rawData = Array.isArray(res.data?.data) ? res.data.data : [];

      const cleanedData = rawData.map((c: any) => ({
        ...c,
        _id: safeStr(c._id),
        name: safeStr(c.name),
        description: safeStr(c.description),
        duration: safeStr(c.duration),
        price: Number(c.price) || 0,
        students_count: Number(c.students_count) || 0,
        is_freeze: Boolean(c.is_freeze),
      }));

      setCourses(cleanedData);
    } catch (err) {
      console.error("Xatolik:", err);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [filterFreeze, searchTerm, BASE_URL]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleToggleFreeze = async (course: any) => {
    const token = Cookies.get("token");
    const endpoint = course.is_freeze ? "unfreeze-course" : "freeze-course";
    try {
      await axios.put(
        `${BASE_URL}/api/course/${endpoint}`,
        { course_id: course._id },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      fetchCourses();
    } catch (err) {
      alert("Xatolik yuz berdi!");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Haqiqatan ham o'chirmoqchimisiz?")) return;
    const token = Cookies.get("token");
    try {
      await axios.delete(`${BASE_URL}/api/course/delete-course`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { course_id: id },
      });
      fetchCourses();
    } catch (err) {
      alert("O'chirishda xatolik!");
    }
  };

  return (
    <div className="w-full p-3 sm:p-6 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Kurslar</h1>
        <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:flex-none md:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
              size={18}
            />
            <input
              type="text"
              placeholder="Kurs qidirish..."
              className="border border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-sm outline-none w-full focus:border-zinc-600 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <select
              className="flex-1 border border-zinc-800 rounded-xl py-2 px-2 sm:px-3 text-sm outline-none cursor-pointer h-[38px] min-w-0"
              value={filterFreeze}
              onChange={(e) => setFilterFreeze(e.target.value)}
            >
              <option value="all">Barchasi</option>
              <option value="false">Faol</option>
              <option value="true">Muzlatilgan</option>
            </select>
            <button className="flex items-center justify-center gap-2 px-3 sm:px-5 py-2 rounded-xl text-sm font-bold border border-zinc-800 hover:bg-zinc-100 transition-all whitespace-nowrap">
              <Plus size={18} />{" "}
              <span className="hidden min-[350px]:inline">Qo'shish</span>
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-zinc-500" size={40} />
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-10 px-4 border border-dashed border-zinc-800 rounded-3xl text-sm text-zinc-500">
          Kurslar topilmadi (Bazani tekshiring)
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {courses.map((course) => (
            <div
              key={course._id}
              className="border border-zinc-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 relative group hover:border-zinc-700 transition-all shadow-sm"
            >
              <div className="inline-block sm:absolute sm:top-6 sm:right-6 border border-zinc-800 px-3 py-1 rounded-lg sm:rounded-xl text-[11px] sm:text-[12px] font-medium mb-4 sm:mb-0">
                {Number(course.price).toLocaleString()} UZS
              </div>

              <div className="mb-4 sm:mb-6 mt-2 sm:mt-0">
                <h3 className="text-lg sm:text-xl font-bold mb-1 break-words">
                  {course.name}
                </h3>
                <p className="text-zinc-500 text-xs sm:text-sm italic line-clamp-2">
                  {course.description || "Yangi kurs"}
                </p>
              </div>

              <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                <div className="flex items-center gap-2 text-zinc-400 text-xs sm:text-sm font-medium">
                  <Clock size={14} className="text-zinc-500" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-400 text-xs sm:text-sm font-medium">
                  <Users size={14} className="text-zinc-500" />
                  <span>{course.students_count} o'quvchi</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex gap-2 w-full">
                  <button className="flex-1 flex justify-center items-center gap-1.5 border border-zinc-800 hover:bg-zinc-800 hover:text-white px-2 py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-semibold transition-all">
                    <Pencil size={12} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(course._id)}
                    className="flex-1 flex justify-center items-center gap-1.5 bg-[#ff3b30] hover:bg-red-600 text-white px-2 py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-semibold transition-all"
                  >
                    <Trash2 size={12} /> O'chirish
                  </button>
                </div>
                <button
                  onClick={() => handleToggleFreeze(course)}
                  className={`w-full flex justify-center items-center gap-2 py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-semibold transition-all ${
                    course.is_freeze
                      ? " border border-zinc-800 hover:bg-zinc-800 hover:text-white"
                      : "bg-[#ff3b30] text-white hover:bg-red-600"
                  }`}
                >
                  {course.is_freeze ? (
                    <>
                      <Flame size={12} /> Eritish
                    </>
                  ) : (
                    <>
                      <Snowflake size={12} /> Muzlatish
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
