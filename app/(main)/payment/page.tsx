"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { Search, Plus, Filter, Calendar, CreditCard, X } from "lucide-react";

interface DebtorStudent {
  _id: string;
  student_name: string;
  student_surname: string;
  group_name: string;
  amount: number;
  month: string;
  payment_method?: string;
  date?: string;
}

const Payment = () => {
  const [debtors, setDebtors] = useState<DebtorStudent[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("2025-05");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    student: "",
    group: "",
    amount: "",
    month: "2026-02",
    method: "Naqd",
    date: new Date().toISOString().split("T")[0],
  });

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:7070";
  const token = Cookies.get("token");

  const fetchDebtors = useCallback(async () => {
    if (!token) return;
    try {
      const response = await axios.get(
        `${BASE_URL}/api/payment/get-debtors-student`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { month: selectedMonth },
        },
      );
      const data = response.data;
      setDebtors(Array.isArray(data) ? data : data?.data || []);
    } catch (error: any) {
      console.error("Qarzdorlarni yuklashda xato:", error);
      setDebtors([]);
    }
  }, [BASE_URL, selectedMonth, token]);

  const handleSearch = async (val: string) => {
    setSearchTerm(val);
    if (val.length < 3) {
      if (val.length === 0) fetchDebtors();
      return;
    }
    try {
      const response = await axios.get(
        `${BASE_URL}/api/payment/search-student`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { name: val },
        },
      );
      const data = response.data;
      setDebtors(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      console.error("Qidiruvda xato:", err);
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Yuborilayotgan ma'lumot:", formData);
    setIsModalOpen(false);
  };

  useEffect(() => {
    fetchDebtors();
  }, [fetchDebtors]);

  return (
    <div className="w-full p-4 sm:p-6 min-h-scree">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            To'lovlar
          </h1>
          <p className="text-sm mt-1 text-zinc-400">Qarzdorlar monitoringi</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
          <div className="flex items-center border border-zinc-800 rounded-xl px-3 py-2 bg-transparent">
            <Calendar size={18} className="mr-2 text-zinc-400" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent outline-none text-sm cursor-pointer w-full text-white"
            />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-white text-black hover:bg-zinc-200 transition-all active:scale-95"
          >
            <Plus size={18} /> To'lov qo'shish
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            size={18}
          />
          <input
            type="text"
            placeholder="Talaba ismi bo'yicha qidirish..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:border-zinc-500 transition-all bg-transparent text-white"
          />
        </div>
        <button className="flex items-center justify-center border border-zinc-800 p-3 rounded-xl hover: transition-all text-zinc-400">
          <Filter size={20} />
        </button>
      </div>

      <div className="border border-zinc-800 rounded-3xl overflow-hidden /10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-zinc-800 /40">
                <th className="p-4 text-xs font-semibold uppercase text-zinc-500">
                  Talaba
                </th>
                <th className="p-4 text-xs font-semibold uppercase text-zinc-500">
                  Guruh
                </th>
                <th className="p-4 text-xs font-semibold uppercase text-zinc-500">
                  Miqdor
                </th>
                <th className="p-4 text-xs font-semibold uppercase text-zinc-500">
                  Oy
                </th>
                <th className="p-4 text-xs font-semibold uppercase text-zinc-500">
                  Usul
                </th>
                <th className="p-4 text-xs font-semibold uppercase text-right text-zinc-500">
                  Amallar
                </th>
              </tr>
            </thead>
            <tbody>
              {debtors.length > 0 ? (
                debtors.map((item) => (
                  <tr
                    key={item._id}
                    className="border-b border-zinc-800/50  transition-all"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full  flex items-center justify-center font-bold uppercase border border-zinc-700 text-xs text-zinc-200">
                          {item.student_name?.[0]}
                          {item.student_surname?.[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-zinc-200 truncate">
                            {item.student_name} {item.student_surname}
                          </p>
                          <p className="text-[10px] text-zinc-500 font-mono">
                            ID: {item._id.slice(-6)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className=" px-3 py-1 rounded-lg text-xs text-zinc-300">
                        {item.group_name || "Guruhsiz"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-rose-400 font-mono font-bold">
                        {item.amount?.toLocaleString()} UZS
                      </span>
                    </td>
                    <td className="p-4 text-sm text-zinc-400">{item.month}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-zinc-400">
                        <CreditCard size={14} />
                        {item.payment_method || "Noma'lum"}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button className="text-zinc-500 hover:text-white transition-all p-1">
                        <Plus size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="p-10 text-center text-zinc-500 italic text-sm"
                  >
                    Qarzdorlar topilmadi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0  flex items-center justify-center z-[110] p-4 backdrop-blur-sm">
          <div className=" border border-zinc-800 w-full max-w-md rounded-2xl p-6 relative shadow-2xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-zinc-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold mb-6 text-white text-center">
              Yangi to'lov qo'shish
            </h2>

            <form onSubmit={handleAddPayment} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase">
                  Talaba
                </label>
                <input
                  type="text"
                  placeholder="Talaba ismi bilan qidiring..."
                  className="w-full  border border-zinc-800 rounded-xl p-3 text-sm text-white outline-none focus:border-zinc-600"
                  value={formData.student}
                  onChange={(e) =>
                    setFormData({ ...formData, student: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase">
                  Guruh
                </label>
                <input
                  type="text"
                  placeholder="Guruh nomi bilan qidiring..."
                  className="w-full  border border-zinc-800 rounded-xl p-3 text-sm text-white outline-none focus:border-zinc-600"
                  value={formData.group}
                  onChange={(e) =>
                    setFormData({ ...formData, group: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400 uppercase">
                    To'lov miqdori
                  </label>
                  <input
                    type="number"
                    placeholder="To'lov miqdori"
                    className="w-full  border border-zinc-800 rounded-xl p-3 text-sm text-white outline-none focus:border-zinc-600"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400 uppercase">
                    Oy
                  </label>
                  <input
                    type="month"
                    className="w-full  border border-zinc-800 rounded-xl p-3 text-sm text-white outline-none focus:border-zinc-600 cursor-pointer"
                    value={formData.month}
                    onChange={(e) =>
                      setFormData({ ...formData, month: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400 uppercase">
                    To'lov usuli
                  </label>
                  <select
                    className="w-full  border border-zinc-800 rounded-xl p-3 text-sm text-white outline-none focus:border-zinc-600"
                    value={formData.method}
                    onChange={(e) =>
                      setFormData({ ...formData, method: e.target.value })
                    }
                  >
                    <option value="Naqd">Naqd</option>
                    <option value="Karta">Karta</option>
                    <option value="P2P">P2P</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400 uppercase">
                    Sana
                  </label>
                  <input
                    type="date"
                    className="w-full  border border-zinc-800 rounded-xl p-3 text-sm text-white outline-none focus:border-zinc-600 cursor-pointer"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1  text-white font-semibold py-3 rounded-xl hover: transition-all"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-white text-black font-semibold py-3 rounded-xl hover:bg-zinc-200 transition-all active:scale-[0.98]"
                >
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

export default Payment;
