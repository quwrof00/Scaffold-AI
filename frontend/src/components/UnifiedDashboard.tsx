"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useStudentData } from "@/hooks/useStudentData";
import { apiGetStudents, type StudentListItem } from "@/lib/api";
import { Loader2, AlertCircle, BookOpen, Brain, Activity } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

export function UnifiedDashboard({ role }: { role: "Teacher" | "Parent" }) {
  const [students, setStudents] = useState<StudentListItem[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | "">("");
  const [loadingStudents, setLoadingStudents] = useState(true);

  const { data: session } = useSession();

  useEffect(() => {
    async function loadStudents() {
      try {
        const parentEmail = role === "Parent" ? session?.user?.email || undefined : undefined;
        const list = await apiGetStudents(parentEmail);
        setStudents(list);
        if (list.length > 0) {
          setSelectedStudentId(list[0].id);
        }
      } catch (e) {
        console.error("Failed to load students", e);
      } finally {
        setLoadingStudents(false);
      }
    }
    loadStudents();
  }, []);

  const { profile, concepts, misconceptions, heatmap, loading } = useStudentData(selectedStudentId || undefined);

  if (loadingStudents) {
    return (
      <AppShell headerTitle={role} headerSubtitle="Loading...">
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      </AppShell>
    );
  }

  if (students.length === 0) {
    return (
      <AppShell headerTitle={role} headerSubtitle="Overview">
        <div className="mx-auto max-w-5xl px-4 py-12 text-center">
          <h2 className="text-2xl font-semibold text-zinc-800">No students found</h2>
          <p className="mt-2 text-zinc-500">There are no students registered in the system yet.</p>
        </div>
      </AppShell>
    );
  }

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  return (
    <AppShell headerTitle={role} headerSubtitle="Overview">
      <div className="mx-auto w-full max-w-6xl px-1 py-8 sm:px-3 md:py-12 space-y-8">
        
        {/* Header & Student Selector */}
        <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between bg-white/50 backdrop-blur-sm border border-zinc-200/60 p-6 rounded-2xl shadow-sm">
          <div className="space-y-2">
            <h1 className="font-[var(--font-serif-editorial)] text-4xl font-semibold leading-[0.96] tracking-normal text-zinc-900">
              {role} Dashboard
            </h1>
            <p className="text-sm text-zinc-500">
              Select a student to view their progress, concept mastery, and current bottlenecks.
            </p>
          </div>
          
          <div className="w-full md:w-64">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">
              Viewing Student
            </label>
            <div className="relative">
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full appearance-none bg-white border border-zinc-200 text-zinc-800 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500/50 shadow-sm"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.email})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            
            {/* Stats Column */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white border border-zinc-200/60 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-inner">
                    <span className="text-xl font-bold text-white">
                      {selectedStudent?.name?.[0]?.toUpperCase() || "?"}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900 leading-none mb-1">{selectedStudent?.name || "Select a student"}</h3>
                    <p className="text-xs text-zinc-500 font-medium">{profile?.grade || "Grade N/A"} • {profile?.board || "Board N/A"}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-100 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Level</span>
                    <span className="text-3xl font-black text-purple-600">{profile ? Math.max(1, Math.floor((profile.xp || 0) / 500) + 1) : "-"}</span>
                  </div>
                  <div className="bg-orange-50/50 dark:bg-orange-950/30 rounded-xl p-4 border border-orange-100/50 dark:border-orange-800/40 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-1">Streak</span>
                    <span className="text-3xl font-black text-orange-500 flex items-center gap-1">{profile?.streak || 0}<span className="text-xl">🔥</span></span>
                  </div>
                </div>
              </div>

              {/* Misconceptions (Bottlenecks) */}
              <div className="bg-white border border-zinc-200/60 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                  <h3 className="text-sm font-bold text-zinc-800 uppercase tracking-wider">Current Bottlenecks</h3>
                </div>
                {misconceptions.length === 0 ? (
                  <p className="text-sm text-zinc-500">No active bottlenecks detected.</p>
                ) : (
                  <div className="space-y-3">
                    {misconceptions.map((m) => (
                      <div key={m.id} className="bg-orange-50/50 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-800/40 p-3 rounded-xl">
                        <p className="text-sm font-semibold text-orange-900 dark:text-orange-200">{m.concept}</p>
                        <p className="text-xs text-orange-700/80 dark:text-orange-400 mt-1">Encountered {m.frequency} time{m.frequency > 1 ? 's' : ''}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Concepts Column */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-zinc-200/60 rounded-2xl p-6 shadow-sm h-full">
                <div className="flex items-center gap-2 mb-6">
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  <h3 className="text-sm font-bold text-zinc-800 uppercase tracking-wider">Concept Mastery</h3>
                </div>
                
                {concepts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Brain className="w-12 h-12 text-zinc-200 mb-3" />
                    <p className="text-sm font-medium text-zinc-500">No concepts explored yet.</p>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {concepts.map((concept) => (
                      <div key={concept.id} className="flex flex-col justify-between p-4 rounded-xl border border-zinc-100 bg-zinc-50/50 hover:bg-white transition-colors">
                        <div>
                          <span className="text-[10px] font-bold tracking-widest uppercase text-indigo-500 mb-1 block">
                            {concept.subject || "General"}
                          </span>
                          <p className="text-sm font-semibold text-zinc-800 leading-snug">
                            {concept.concept}
                          </p>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <span className={cn(
                            "text-xs font-semibold px-2 py-1 rounded-md",
                            concept.status === "KNOWN" ? "bg-green-100 text-green-700" :
                            concept.status === "UNKNOWN" ? "bg-zinc-200 text-zinc-700" :
                            "bg-orange-100 text-orange-700"
                          )}>
                            {concept.status}
                          </span>
                          <span className="text-xs text-zinc-400 font-medium">
                            {concept.attempts} attempt{concept.attempts !== 1 && 's'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </AppShell>
  );
}
