"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Bell, 
  BellDot, 
  CheckCircle2, 
  Trash2, 
  ExternalLink, 
  X, 
  MessageSquare, 
  HandHelping, 
  FileText,
  Clock
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export function NotificationBell({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const supabase = createClient();

  const fetchNotifications = useCallback(async () => {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .or(`user_id.eq.${userId},user_id.is.null`)
      .order("created_at", { ascending: false })
      .limit(15);

    if (!error) {
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.read).length);
    }
  }, [userId, supabase]);

  useEffect(() => {
    fetchNotifications();

    const channel = supabase
      .channel("realtime_notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          if (!payload.new.user_id || payload.new.user_id === userId) {
            setNotifications((prev) => [payload.new, ...prev].slice(0, 15));
            setUnreadCount((count) => count + 1);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId, supabase, fetchNotifications]);

  const markAsRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((count) => Math.max(0, count - 1));
    await supabase.from("notifications").update({ read: true }).eq("id", id);
  };

  const deleteNotification = async (e, id) => {
    e.stopPropagation();
    const wasUnread = notifications.find(n => n.id === id)?.read === false;
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (wasUnread) setUnreadCount((count) => Math.max(0, count - 1));
    await supabase.from("notifications").delete().eq("id", id);
  };

  const getIcon = (type) => {
    switch (type) {
      case "contact": return <MessageSquare className="h-4 w-4 text-orange-500" />;
      case "prayer": return <HandHelping className="h-4 w-4 text-blue-500" />;
      case "form": return <FileText className="h-4 w-4 text-purple-500" />;
      default: return <Bell className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-2xl hover:bg-white/10 text-gray-400 hover:text-white transition-all duration-300 group"
        >
          {unreadCount > 0 ? (
            <>
              <BellDot className="h-5 w-5 text-[var(--puembo-green)] group-hover:scale-110 transition-transform" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center ring-2 ring-black animate-in zoom-in duration-300">
                {unreadCount}
              </span>
            </>
          ) : (
            <Bell className="h-5 w-5 group-hover:scale-110 transition-transform" />
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent
        align="end"
        className="w-[380px] rounded-[2.5rem] bg-white border-none shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-2 z-[100] mt-2 overflow-hidden animate-in slide-in-from-top-2 duration-300"
      >
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-xl font-serif font-black text-gray-900">Actividad</h3>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--puembo-green)] bg-[var(--puembo-green)]/10 px-3 py-1 rounded-full">
              {unreadCount} nuevas
            </span>
          </div>
          <p className="text-xs text-gray-400 font-medium">Gestiona las interacciones recientes</p>
        </div>

        <div className="max-h-[450px] overflow-y-auto custom-scrollbar px-2 pb-4 space-y-1">
          {notifications.length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto opacity-50">
                <Bell className="h-8 w-8 text-gray-300" />
              </div>
              <p className="text-sm text-gray-400 font-serif italic">Todo está al día por aquí</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <DropdownMenuItem
                key={notif.id}
                onSelect={(e) => e.preventDefault()}
                className={cn(
                  "flex flex-col items-start gap-3 p-5 rounded-[1.8rem] cursor-default transition-all border-none mb-1 group relative",
                  !notif.read ? "bg-gray-50/80 hover:bg-gray-100/80" : "bg-transparent hover:bg-gray-50/50 opacity-60"
                )}
              >
                <div className="flex items-start justify-between w-full gap-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2.5 rounded-2xl shrink-0 transition-transform group-hover:scale-110 duration-300",
                      !notif.read ? "bg-white shadow-sm ring-1 ring-black/5" : "bg-gray-100"
                    )}>
                      {getIcon(notif.type)}
                    </div>
                    <div className="space-y-0.5">
                      <span className={cn(
                        "text-sm leading-tight block",
                        !notif.read ? "font-bold text-gray-900" : "font-semibold text-gray-600"
                      )}>
                        {notif.title}
                      </span>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: es })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!notif.read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => markAsRead(notif.id)}
                        className="h-8 w-8 rounded-full hover:bg-[var(--puembo-green)]/10 text-[var(--puembo-green)]"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => deleteNotification(e, notif.id)}
                      className="h-8 w-8 rounded-full hover:bg-red-50 text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed pl-1">
                  {notif.message}
                </p>
                
                {notif.link && (
                  <Link
                    href={notif.link}
                    className="mt-1 inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-[var(--puembo-green)] hover:underline"
                    onClick={() => markAsRead(notif.id)}
                  >
                    Revisar ahora <ExternalLink className="h-3 w-3" />
                  </Link>
                )}
              </DropdownMenuItem>
            ))
          )}
        </div>
        
        {notifications.length > 0 && (
          <div className="p-4 bg-gray-50/50 border-t border-gray-100 text-center">
             <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-300">Una Familia de Familias</p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}