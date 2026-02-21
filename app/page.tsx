"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  GraduationCap,
  Banknote,
  Clock,
  ArrowUpRight,
  Zap,
  Activity,
  Globe,
} from "lucide-react";

const Asosiy = () => {
  // Dark mode muammosini hal qilish uchun mount holati
  const [mounted, setMounted] = useState(false);

  const [stats, setStats] = useState({
    totalStudents: 0,
    activeGroups: 0,
    monthlyRevenue: 0,
    debtorsCount: 0,
  });
  const [loading, setLoading] = useState(true);

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:7070";
  const token = Cookies.get("token");

  useEffect(() => {
    // Komponent brauzerda yuklanganda mounted'ni true qilamiz
    setMounted(true);

    const fetchDashboardData = async () => {
      if (!token) return;
      try {
        const [groupsRes, studentsRes, paymentsRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/group/get-all-group`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${BASE_URL}/api/student/get-all-student`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(
            `${BASE_URL}/api/payment/get-debtors-student?month=2026-02`,
            { headers: { Authorization: `Bearer ${token}` } },
          ),
        ]);

        setStats({
          activeGroups: groupsRes.data?.data?.length || 0,
          totalStudents: studentsRes.data?.data?.length || 0,
          debtorsCount:
            paymentsRes.data?.data?.length || paymentsRes.data?.length || 0,
          monthlyRevenue: 45000000,
        });
      } catch (error) {
        console.error("Dashboard xatosi:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [BASE_URL, token]);

  // Agar komponent hali brauzerda to'liq yuklanmagan bo'lsa, hech narsa qaytarmaymiz
  // Bu dark/light miltillashini 100% to'xtatadi
  if (!mounted) {
    return null;
  }

  return (
    <div className="p-6 space-y-8 min-h-screen text-foreground relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/5 blur-[150px] rounded-full pointer-events-none animate-pulse" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-8"
      >
        <div>
          <div className="flex items-center gap-3 text-primary mb-2">
            <Activity size={18} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-70">
              System Status: Active
            </span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter italic">
            DASH<span className="text-primary">BOARD</span>
          </h1>
        </div>

        <div className="flex gap-6 items-center">
          <div className="text-right border-r border-border pr-6 hidden sm:block">
            <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">
              Server Node
            </p>
            <p className="font-mono text-sm font-bold uppercase">
              Uzbekistan / Tashkent
            </p>
          </div>
          <Zap
            className="text-yellow-500 fill-yellow-500 animate-bounce"
            size={20}
          />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        {[
          {
            label: "Talabalar",
            val: stats.totalStudents,
            icon: Users,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
          },
          {
            label: "Guruhlar",
            val: stats.activeGroups,
            icon: GraduationCap,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
          },
          {
            label: "Qarzdorlar",
            val: stats.debtorsCount,
            icon: Clock,
            color: "text-rose-500",
            bg: "bg-rose-500/10",
          },
          {
            label: "Oylik Tushum",
            val: stats.monthlyRevenue.toLocaleString(),
            icon: Banknote,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
          },
        ].map((card, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.02 }}
            className="relative p-6 bg-card border border-border rounded-2xl overflow-hidden shadow-sm"
          >
            <div
              className={`p-3 w-fit rounded-xl ${card.bg} ${card.color} mb-4`}
            >
              <card.icon size={22} />
            </div>
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
              {card.label}
            </p>
            <h2 className="text-2xl font-black mt-1 tracking-tight">
              {loading ? "..." : card.val}
            </h2>
            <div className="absolute top-2 right-2 opacity-10">
              <card.icon size={60} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        <motion.div className="lg:col-span-2 p-6 bg-card border border-border rounded-3xl shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <Activity size={16} className="text-primary" /> Oqim Analitikasi
            </h3>
          </div>

          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={[
                  { n: "Du", v: 4000 },
                  { n: "Se", v: 3000 },
                  { n: "Cho", v: 5000 },
                  { n: "Pa", v: 2780 },
                  { n: "Ju", v: 1890 },
                  { n: "Sha", v: 2390 },
                ]}
              >
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  vertical={false}
                />
                <XAxis
                  dataKey="n"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={10}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <div className="p-6 bg-card border border-border rounded-3xl relative overflow-hidden flex flex-col">
          <motion.div
            animate={{ top: ["-10%", "110%"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 w-full h-[2px] bg-primary/20 shadow-[0_0_15px_hsl(var(--primary))] z-20 pointer-events-none"
          />

          <h3 className="text-sm font-bold uppercase mb-6 flex items-center gap-2">
            <Globe size={16} className="text-primary" /> Tizim Jurnali
          </h3>

          <div className="space-y-4 flex-1">
            {[
              { t: "09:41", m: "Yangi guruh yaratildi", c: "text-primary" },
              { t: "08:30", m: "To'lov qabul qilindi", c: "text-emerald-500" },
              {
                t: "07:15",
                m: "Qarzdorlik xabari yuborildi",
                c: "text-rose-500",
              },
            ].map((log, i) => (
              <div
                key={i}
                className="flex gap-3 text-[11px] font-mono border-l-2 border-muted pl-4 py-1"
              >
                <span className="text-muted-foreground">{log.t}</span>
                <span className={log.c}>{log.m}</span>
              </div>
            ))}
          </div>

          <button className="w-full mt-6 py-3 bg-secondary text-secondary-foreground rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-80 transition-all">
            To'liq Hisobot
          </button>
        </div>
      </div>
    </div>
  );
};

export default Asosiy;
