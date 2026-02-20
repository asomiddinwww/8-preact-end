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
    <div className="w-full p-6 min-h-screen ">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold">Kurslar</h1>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2"
              size={18}
            />
            <input
              type="text"
              placeholder="Kurs qidirish..."
              className=" border border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-sm outline-none w-full md:w-64 focus:border-zinc-600 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="border border-zinc-800 rounded-xl py-2 px-3 text-sm outline-none cursor-pointer h-[38px]"
            value={filterFreeze}
            onChange={(e) => setFilterFreeze(e.target.value)}
          >
            <option value="all">Barchasi</option>
            <option value="false">Faol kurslar</option>
            <option value="true">Muzlatilganlar</option>
          </select>
          <button className="flex items-center gap-2  px-5 py-2 rounded-xl text-sm font-bold hover:bg-zinc-200 transition-all">
            <Plus size={18} /> Kurs Qo'shish
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin " size={40} />
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-zinc-800 rounded-3xl">
          Kurslar topilmadi (Bazani tekshiring)
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course._id}
              className="border border-zinc-800 rounded-3xl p-6 relative group hover:border-zinc-700 transition-all shadow-sm"
            >
              <div className="absolute top-6 right-6  border border-zinc-800 px-3 py-1.5 rounded-xl text-[12px] font-medium">
                {Number(course.price).toLocaleString()} UZS
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-bold mb-1">{course.name}</h3>
                <p className="text-zinc-500 text-sm italic line-clamp-1">
                  {course.description || "Yangi kurs"}
                </p>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium">
                  <Clock size={16} className="text-zinc-500" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium">
                  <Users size={16} className="text-zinc-500" />
                  <span>{course.students_count} students</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2  border border-zinc-800 hover:bg-zinc-800 px-4 py-2 rounded-xl text-xs font-semibold transition-all">
                  <Pencil size={14} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(course._id)}
                  className="flex items-center gap-2 bg-[#ff3b30] hover:bg-red-600 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                >
                  <Trash2 size={14} /> O'chirish
                </button>
                <button
                  onClick={() => handleToggleFreeze(course)}
                  className={`flex-1 flex justify-center items-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all ${
                    course.is_freeze
                      ? " border border-zinc-800 hover:bg-zinc-800"
                      : "bg-[#ff3b30] text-white hover:bg-red-600"
                  }`}
                >
                  {course.is_freeze ? (
                    <>
                      <Flame size={14} /> Eritish
                    </>
                  ) : (
                    <>
                      <Snowflake size={14} /> Muzlatish
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
