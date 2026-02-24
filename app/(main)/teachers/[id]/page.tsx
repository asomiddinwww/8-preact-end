"use client";

import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";
import {
  DollarSign,
  Users,
  TrendingUp,
  Calendar,
  Phone,
  Mail,
  Briefcase,
} from "lucide-react";
import { LoadingOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";

interface TeacherDetail {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: string;
  field?: string;
  salary?: number;
  createdAt?: string;
  work_date?: string;
  work_end?: string;
  updatedAt?: string;
  groups?: any[];
}

const TeacherInfo = () => {
  const { id } = useParams();
  const router = useRouter();

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const token = Cookies.get("token");

  const { data: teacher, isLoading: loading } = useQuery({
    queryKey: ["teacher", id],
    queryFn: async () => {
      if (!token || !id) return null;
      try {
        const res = await axios.get(
          `${BASE_URL}/api/teacher/get-teacher-by-id/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        return res.data?.data || res.data;
      } catch (err) {
        const allRes = await axios.get(
          `${BASE_URL}/api/teacher/get-all-teachers`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const found = (allRes.data?.data || allRes.data).find(
          (t: any) => t._id === id,
        );
        return found || null;
      }
    },
    enabled: !!id && !!token,
  });

  if (loading)
    return (
      <div className="min-h-screen  flex items-center justify-center text-foreground transition-colors duration-300">
        <LoadingOutlined className="text-3xl text-primary" />
      </div>
    );

  if (!teacher)
    return (
      <div className="text-foreground p-10  min-h-screen transition-colors duration-300">
        <div className="max-w-md mx-auto text-center border border-border p-8 rounded-2xl bg-card">
          <p className="text-muted-foreground">
            Ma'lumot topilmadi yoki xatolik yuz berdi.
          </p>
          <button
            onClick={() => router.back()}
            className="mt-4 text-sm text-primary hover:underline"
          >
            Orqaga qaytish
          </button>
        </div>
      </div>
    );

  const groupsCount = teacher.groups?.length || 0;
  const studentsCount =
    teacher.groups?.reduce(
      (acc: number, group: any) => acc + (group.students?.length || 0),
      0,
    ) || 0;

  return (
    <div className="min-h-screen p-4 sm:p-6  text-foreground transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-[400px] border border-border rounded-[2rem] p-8 bg-card shadow-sm h-fit">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-24 h-24 bg-primary/10 text-primary border-4 border-primary/20 rounded-[2rem] flex items-center justify-center text-3xl font-bold mb-4 shadow-inner">
              {teacher.first_name?.[0]}
              {teacher.last_name?.[0]}
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 mb-1">
                <h2 className="text-2xl font-bold tracking-tight">
                  {teacher.first_name} {teacher.last_name}
                </h2>
              </div>
              <span className="inline-block bg-primary/10 text-primary text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider border border-primary/20">
                O'qituvchi
              </span>
              <p className="text-muted-foreground text-sm mt-2 font-medium">
                {teacher.email}
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <InfoItem
              icon={<Mail size={14} />}
              label="Email"
              value={teacher.email}
            />
            <InfoItem
              icon={<Phone size={14} />}
              label="Telefon"
              value={teacher.phone}
            />
            <InfoItem
              icon={<Briefcase size={14} />}
              label="Mutaxassislik"
              value={teacher.field || "Noma'lum"}
            />
            <InfoItem
              icon={
                <div
                  className={`w-2 h-2 rounded-full ${teacher.status === "faol" ? "bg-emerald-500" : "bg-destructive"}`}
                />
              }
              label="Holat"
              value={teacher.status}
              isStatus
            />
            <div className="pt-4 mt-4 border-t border-border space-y-4">
              <InfoItem
                icon={<Calendar size={14} />}
                label="Ish boshlagan"
                value={formatDate(teacher.work_date)}
              />
              <InfoItem
                icon={<Calendar size={14} />}
                label="Ro'yxatdan o'tgan"
                value={formatDate(teacher.createdAt)}
              />
            </div>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6 self-start">
          <StatCard
            icon={<DollarSign className="text-primary" />}
            label="Oylik maosh"
            value={`${teacher.salary?.toLocaleString() || 0} So'm`}
            trend="+0%"
          />
          <StatCard
            icon={<TrendingUp className="text-primary" />}
            label="Guruhlar soni"
            value={groupsCount.toString()}
            trend="0"
          />
          <StatCard
            icon={<Users className="text-primary" />}
            label="Jami o'quvchilar"
            value={studentsCount.toString()}
            trend="+0"
          />
          <StatCard
            icon={<Users className="text-primary" />}
            label="Aktiv o'quvchilar"
            value={studentsCount.toString()}
            trend="0"
          />
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ label, value, isStatus = false, icon }: any) => (
  <div className="group">
    <div className="flex items-center gap-2 mb-1.5">
      <span className="text-muted-foreground">{icon}</span>
      <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/70">
        {label}
      </p>
    </div>
    <p
      className={`text-sm font-semibold pl-6 ${isStatus ? "text-primary capitalize italic" : "text-foreground"}`}
    >
      {value || "---"}
    </p>
  </div>
);

const StatCard = ({ icon, label, value, trend }: any) => (
  <div className="bg-card border border-border rounded-[1.5rem] p-6 hover:border-primary/30 transition-all shadow-sm group">
    <div className="flex items-start justify-between mb-4">
      <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 group-hover:bg-primary/10 transition-colors">
        {icon}
      </div>
      <div className="text-right">
        <p className="text-xs text-muted-foreground font-medium mb-1 uppercase tracking-tighter">
          {label}
        </p>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
      </div>
    </div>
    <div className="flex items-center justify-between pt-4 border-t border-border/50">
      <div className="flex items-center gap-1 text-emerald-500 text-[10px] font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
        <TrendingUp size={12} /> {trend}
      </div>
      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
        Hozirgi holat
      </p>
    </div>
  </div>
);

const formatDate = (dateString?: string) => {
  if (!dateString) return "---";
  return new Date(dateString).toLocaleDateString("uz-UZ", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default TeacherInfo;
