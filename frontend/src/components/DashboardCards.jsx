import React from 'react';
import { Users, CalendarCheck, IndianRupee, Activity, TrendingUp } from 'lucide-react';

export default function DashboardCards({ data }) {
  const cards = [
    { 
      title: "Total Staff Members", 
      value: data?.total_members || 0, 
      icon: Users, 
      gradient: "from-blue-500 to-cyan-500",
      shadow: "shadow-blue-200"
    },
    { 
      title: "Total Tasks", 
      value: data?.total_tasks || 0, 
      icon: CalendarCheck, 
      gradient: "from-teal-500 to-emerald-500",
      shadow: "shadow-teal-200"
    },
    { 
      title: "Tasks Completed", 
      value: data?.tasks_done || 0, 
      icon: Activity, 
      gradient: "from-orange-500 to-amber-500",
      shadow: "shadow-orange-200"
    },
    { 
      title: "Overdue Tasks", 
      value: data?.overdue_tasks || 0, 
      icon: TrendingUp, 
      gradient: "from-red-500 to-pink-500",
      shadow: "shadow-red-200"
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.title} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg ${card.shadow}`}>
                <Icon size={22} className="text-white" />
              </div>
              <TrendingUp size={16} className="text-emerald-500" />
            </div>
            <p className="text-sm text-slate-500 mb-1">{card.title}</p>
            <h3 className="text-2xl font-bold text-slate-800">{card.value}</h3>
          </div>
        );
      })}
    </div>
  );
}
