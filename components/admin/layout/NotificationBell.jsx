"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, BellDot, CheckCircle2, Trash2, ExternalLink, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuHeader,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export function NotificationBell({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchNotifications = useCallback(async () => {
    // Si todos son admins, queremos ver:
    // 1. Notificaciones para todos (user_id IS NULL)
    // 2. Notificaciones para mí (user_id = userId)
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .or(`user_id.eq.${userId},user_id.is.null`)
      .order("created_at", { ascending: false })
      .limit(20);

    if (!error) {
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.read).length);
    }
    setLoading(false);
  }, [userId, supabase]);

  useEffect(() => {
    fetchNotifications();

    // Suscribirse a cambios en tiempo real
    const channel = supabase
      .channel("realtime_notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          // Verificar si la notificación es para mí o para todos
          if (!payload.new.user_id || payload.new.user_id === userId) {
            setNotifications((prev) => [payload.new, ...prev].slice(0, 20));
            setUnreadCount((count) => count + 1);
            // Sonido opcional o toast aquí
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase, fetchNotifications]);

  const markAsRead = async (id) => {
    // Optimistic update
    setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((count) => Math.max(0, count - 1));

    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id);
  };

  const markAllAsRead = async () => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);

    await supabase
      .from("notifications")
      .update({ read: true })
      .or(`user_id.eq.${userId},user_id.is.null`)
      .eq("read", false);
  };

  const deleteNotification = async (e, id) => {
    e.stopPropagation();
    // Optimistic update
    const wasUnread = notifications.find(n => n.id === id)?.read === false;
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (wasUnread) setUnreadCount((count) => Math.max(0, count - 1));

    await supabase.from("notifications").delete().eq("id", id);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-all"
        >
          {unreadCount > 0 ? (
            <>
              <BellDot className="h-5 w-5 text-[var(--puembo-green)] animate-pulse" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-black">
                {unreadCount}
              </span>
            </>
          ) : (
            <Bell className="h-5 w-5" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 md:w-96 rounded-[2rem] bg-white border-none shadow-2xl p-4 z-[100]"
      >
        <div className="flex items-center justify-between px-4 py-2 mb-2">
          <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 flex items-center gap-2">
            Notificaciones
            {unreadCount > 0 && (
              <span className="bg-green-100 text-[var(--puembo-green)] px-2 py-0.5 rounded-full text-[10px]">
                {unreadCount} nuevas
              </span>
            )}
          </h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-[10px] uppercase font-bold text-gray-400 hover:text-[var(--puembo-green)] rounded-full"
            >
              Marcar todo como leído
            </Button>
          )}
        </div>
        <DropdownMenuSeparator className="bg-gray-100 mx-4" />
        
        <div className="max-h-[400px] overflow-y-auto custom-scrollbar space-y-1 mt-2">
          {notifications.length === 0 ? (
            <div className="py-12 text-center">
              <Bell className="h-8 w-8 text-gray-100 mx-auto mb-3" />
              <p className="text-xs text-gray-400 font-medium italic">No hay notificaciones pendientes</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <DropdownMenuItem
                key={notif.id}
                onClick={() => !notif.read && markAsRead(notif.id)}
                className={cn(
                  "flex flex-col items-start gap-1 p-4 rounded-2xl cursor-default transition-all border-none focus:bg-gray-50 mb-1 relative group",
                  !notif.read ? "bg-green-50/50" : "bg-transparent"
                )}
              >
                <div className="flex items-start justify-between w-full gap-4">
                  <div className="flex items-center gap-2">
                    {!notif.read && (
                        <div className="w-2 h-2 rounded-full bg-[var(--puembo-green)] shrink-0" />
                    )}
                    <span className={cn("text-sm text-gray-900 leading-tight", !notif.read ? "font-bold" : "font-medium")}>
                      {notif.title}
                    </span>
                  </div>
                  <button
                    onClick={(e) => deleteNotification(e, notif.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                
                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed ml-4">
                  {notif.message}
                </p>
                
                <div className="flex items-center justify-between w-full mt-2 ml-4">
                  <span className="text-[9px] font-bold text-gray-400 uppercase">
                    {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: es })}
                  </span>
                  
                  {notif.link && (
                    <Link
                      href={notif.link}
                      className="text-[9px] font-black uppercase tracking-widest text-[var(--puembo-green)] flex items-center gap-1 hover:underline z-10 relative"
                      onClick={(e) => {
                          e.stopPropagation(); // Prevent item click but allow link
                          markAsRead(notif.id);
                      }}
                    >
                      Ver detalles <ExternalLink className="h-2 w-2" />
                    </Link>
                  )}
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
