"use client";

import { useState, useMemo } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  X,
  CheckCircle2,
} from "lucide-react";

// --- Yordamchi funksiya ---
const safeStr = (value: any): string => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return value.name || value.title || "";
};

export default function Courses() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterFreeze, setFilterFreeze] = useState<string>("all");

  // --- MODAL STATES ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [editData, setEditData] = useState({ duration: "", price: "" });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addStep, setAddStep] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [newCourse, setNewCourse] = useState({
    _id: "",
    name: "",
    description: "Yangi kurs",
    duration: "1 yil",
    price: "0",
  });

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:7070";
  const token = Cookies.get("token");

  // --- 1. GET COURSES (Query) ---
  const { data: courses = [], isLoading: loading } = useQuery({
    queryKey: ["courses", searchTerm, filterFreeze],
    queryFn: async () => {
      const queryParams: any = {
        ...(searchTerm && { search: searchTerm }),
        ...(filterFreeze !== "all" && { is_freeze: filterFreeze === "true" }),
      };
      const res = await axios.get(`${BASE_URL}/api/course/get-courses`, {
        headers: { Authorization: `Bearer ${token}` },
        params: queryParams,
      });

      const rawData = Array.isArray(res.data?.data) ? res.data.data : [];
      return rawData.map((c: any) => ({
        ...c,
        _id: safeStr(c._id),
        name: safeStr(c.name),
        description: safeStr(c.description),
        duration: safeStr(c.duration),
        price: Number(c.price) || 0,
        students_count: Number(c.students_count) || 0,
        is_freeze: Boolean(c.is_freeze),
      }));
    },
    enabled: !!token,
  });

  // --- 2. CREATE CATEGORY (Mutation) ---
  const createCategoryMutation = useMutation({
    mutationFn: (name: string) =>
      axios.post(
        `${BASE_URL}/api/course/create-category`,
        { name },
        { headers: { Authorization: `Bearer ${token}` } },
      ),
    onSuccess: (res) => {
      const createdId = res.data?.data?._id || res.data?._id;
      setNewCourse((prev) => ({ ...prev, _id: createdId }));
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      setAddStep(2);
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || "Bunday nomli kategoriya mavjud!");
    },
  });

  // --- 3. SAVE / EDIT COURSE (Mutation) ---
  const saveCourseMutation = useMutation({
    mutationFn: (payload: any) =>
      axios.post(`${BASE_URL}/api/course/edit-course`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      setSelectedCourse(null); // State-ni tozalash
    },
    onError: () => alert("Xatolik yuz berdi!"),
  });

  // --- 4. TOGGLE FREEZE (Mutation) ---
  const toggleFreezeMutation = useMutation({
    mutationFn: (course: any) => {
      const endpoint = course.is_freeze ? "unfreeze-course" : "freeze-course";
      return axios.put(
        `${BASE_URL}/api/course/${endpoint}`,
        { course_id: course._id },
        { headers: { Authorization: `Bearer ${token}` } },
      );
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["courses"] }),
  });

  // --- 5. DELETE COURSE (Mutation) ---
  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      axios.delete(`${BASE_URL}/api/course/delete-course`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { course_id: id },
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["courses"] }),
    onError: () => alert("O'chirishda xatolik!"),
  });

  // --- HANDLERS ---
  const handleNextStep = () => {
    if (newCourse.name.trim()) {
      createCategoryMutation.mutate(newCourse.name);
    }
  };

  const handleCreateFinal = () => {
    saveCourseMutation.mutate({
      course_id: newCourse._id,
      name: newCourse.name,
      duration: newCourse.duration,
      price: Number(newCourse.price),
      description: newCourse.description,
    });
  };

  // BU YERDA ASOSIY HATOLIK TUZATILDI
  const handleUpdate = () => {
    // selectedCourse null emasligini tekshirish (TypeError oldini olish)
    if (!selectedCourse?._id) {
      alert("Kurs ma'lumotlari yuklanmadi!");
      return;
    }

    saveCourseMutation.mutate({
      course_id: selectedCourse._id,
      duration: editData.duration,
      price: Number(editData.price),
    });
  };

  const openEditModal = (course: any) => {
    setSelectedCourse(course);
    setEditData({ duration: course.duration, price: String(course.price) });
    setIsEditModalOpen(true);
  };

  const handleOpenAddModal = () => {
    setNewCourse({
      _id: "",
      name: "",
      description: "Yangi kurs",
      duration: "1 yil",
      price: "0",
    });
    setAddStep(1);
    setIsAddModalOpen(true);
  };

  return (
    <div className="w-full p-3 sm:p-6 min-h-screen bg-background text-foreground relative">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] bg-card border border-border text-card-foreground px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="text-green-500" size={20} />
          <span className="font-medium text-sm">
            Kategoriya muvaffaqiyatli qo'shildi
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Kurslar
        </h1>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={18}
            />
            <input
              type="text"
              placeholder="Kurs qidirish..."
              className="bg-transparent border border-input rounded-xl py-2 pl-10 pr-4 text-sm outline-none w-full focus:ring-1 focus:ring-ring"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
          >
            <Plus size={18} /> <span>Kurs Qo'shish</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-muted-foreground" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {courses.map((course: any) => (
            <div
              key={course._id}
              className="bg-card border border-border rounded-[2rem] p-6 hover:shadow-md transition-all relative"
            >
              <div className="absolute top-6 right-6 border border-border bg-muted/50 px-3 py-1 rounded-xl text-xs font-semibold">
                {Number(course.price).toLocaleString()} UZS
              </div>
              <h3 className="text-xl font-bold mb-4 pr-16">{course.name}</h3>
              <div className="space-y-3 mb-8 text-muted-foreground text-sm">
                <div className="flex items-center gap-2">
                  <Clock size={14} /> <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={14} />{" "}
                  <span>{course.students_count} students</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(course)}
                    className="flex-1 border border-input bg-secondary text-secondary-foreground py-2 rounded-xl text-xs font-bold hover:bg-secondary/80 transition-all"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("O'chirmoqchimisiz?"))
                        deleteMutation.mutate(course._id);
                    }}
                    className="flex-1 bg-destructive text-destructive-foreground py-2 rounded-xl text-xs font-bold transition-all hover:bg-destructive/90"
                  >
                    {deleteMutation.isPending &&
                    deleteMutation.variables === course._id ? (
                      <Loader2 className="animate-spin mx-auto" size={14} />
                    ) : (
                      "O'chirish"
                    )}
                  </button>
                </div>
                <button
                  onClick={() => toggleFreezeMutation.mutate(course)}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${
                    course.is_freeze
                      ? "border border-input hover:bg-accent"
                      : "bg-orange-600 text-white hover:bg-orange-700"
                  }`}
                >
                  {toggleFreezeMutation.isPending &&
                  toggleFreezeMutation.variables?._id === course._id ? (
                    <Loader2 className="animate-spin mx-auto" size={14} />
                  ) : course.is_freeze ? (
                    <span className="flex items-center justify-center gap-1">
                      <Flame size={12} /> Eritish
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-1">
                      <Snowflake size={12} /> Muzlatish
                    </span>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- ADD COURSE MODAL --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-[500px] rounded-[32px] p-8 shadow-2xl relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-6 right-6 text-muted-foreground hover:text-foreground"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-6">
              {addStep === 1 ? "Yangi Kurs Qo'shish" : "Kurs Yaratish"}
            </h2>

            {addStep === 1 ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-destructive uppercase">
                    Kurs nomi
                  </label>
                  <input
                    autoFocus
                    type="text"
                    value={newCourse.name}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, name: e.target.value })
                    }
                    className="w-full bg-muted border border-input rounded-xl px-4 py-3 text-foreground outline-none focus:ring-1 focus:ring-destructive"
                    placeholder="Frontend Dasturlash"
                  />
                  <p className="text-[10px] text-destructive italic">
                    Nom majburiy
                  </p>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handleNextStep}
                    disabled={
                      createCategoryMutation.isPending || !newCourse.name.trim()
                    }
                    className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-primary/90 transition-all"
                  >
                    {createCategoryMutation.isPending ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      "Yaratish"
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Kurs nomi
                  </label>
                  <input
                    type="text"
                    value={newCourse.name}
                    readOnly
                    className="w-full bg-muted/50 border border-input rounded-xl px-4 py-2 text-muted-foreground cursor-not-allowed outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground uppercase tracking-widest">
                    Course Details
                  </label>
                  <label className="block text-[11px] text-muted-foreground">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={newCourse.description}
                    onChange={(e) =>
                      setNewCourse({
                        ...newCourse,
                        description: e.target.value,
                      })
                    }
                    className="w-full bg-muted border border-input rounded-xl px-4 py-2 text-foreground outline-none resize-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] text-muted-foreground">
                      Duration
                    </label>
                    <input
                      type="text"
                      value={newCourse.duration}
                      onChange={(e) =>
                        setNewCourse({ ...newCourse, duration: e.target.value })
                      }
                      className="w-full bg-muted border border-input rounded-xl px-4 py-2 text-foreground outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-muted-foreground">
                      Price (UZS)
                    </label>
                    <input
                      type="number"
                      value={newCourse.price}
                      onChange={(e) =>
                        setNewCourse({ ...newCourse, price: e.target.value })
                      }
                      className="w-full bg-muted border border-input rounded-xl px-4 py-2 text-foreground outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/80 py-2.5 rounded-xl font-bold text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateFinal}
                    disabled={saveCourseMutation.isPending}
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 py-2.5 rounded-xl font-bold text-sm flex justify-center items-center transition-all"
                  >
                    {saveCourseMutation.isPending ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- EDIT MODAL --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-[400px] rounded-[32px] p-8 shadow-2xl relative">
            <button
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedCourse(null);
              }}
              className="absolute top-6 right-6 text-muted-foreground hover:text-foreground"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-6">Kursni Tahrirlash</h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Davomiylik
                </label>
                <input
                  type="text"
                  value={editData.duration}
                  onChange={(e) =>
                    setEditData({ ...editData, duration: e.target.value })
                  }
                  className="w-full bg-muted border border-input rounded-xl px-4 py-3 text-foreground outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Narx (UZS)
                </label>
                <input
                  type="number"
                  value={editData.price}
                  onChange={(e) =>
                    setEditData({ ...editData, price: e.target.value })
                  }
                  className="w-full bg-muted border border-input rounded-xl px-4 py-3 text-foreground outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedCourse(null);
                  }}
                  className="flex-1 bg-secondary text-secondary-foreground py-3 rounded-xl font-bold text-sm hover:bg-secondary/80"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={saveCourseMutation.isPending || !selectedCourse}
                  className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl font-bold text-sm flex justify-center items-center hover:bg-primary/90 transition-all"
                >
                  {saveCourseMutation.isPending ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    "Saqlash"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
