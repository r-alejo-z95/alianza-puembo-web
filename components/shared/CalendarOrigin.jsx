"use client"

import { IntegratedEventCalendar } from "../public/calendar/event-calendar/event-calendar";

import { useAdminEventsContext } from '../providers/EventsProvider';
import { useClientEventsContext } from '../providers/ClientEventsProvider';

export function AdminCalendar() {
  const adminEvents = useAdminEventsContext();
  return (
    <IntegratedEventCalendar isAdmin={true} {...adminEvents} />
  );
}

export function UserCalendar() {
  const clientEvents = useClientEventsContext();
  return (
    <IntegratedEventCalendar isAdmin={false} {...clientEvents} />
  );
}