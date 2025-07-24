'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DialogFooter } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function PrayerRequestStatusDialog({ request, onStatusChange, onClose }) {
  const [selectedStatus, setSelectedStatus] = useState(request.status);

  const handleSave = () => {
    if (selectedStatus !== request.status) {
      onStatusChange(request.id, selectedStatus);
    } else {
      toast.info('No se realizaron cambios en el estado.');
    }
    onClose();
  };

  const statusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge>Pendiente</Badge>;
      case 'approved':
        return <Badge variant="approved">Aprobada</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rechazada</Badge>;
      default:
        return <Badge variant="secondary">Desconocido</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <p><strong>Petición:</strong> {request.request_text}</p>
      <p className="flex items-center gap-2"><strong>Estado actual:</strong> {statusBadge(request.status)}</p>

      <RadioGroup value={selectedStatus} onValueChange={setSelectedStatus} className="flex flex-col space-y-1">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="pending" id="status-pending" />
          <Label htmlFor="status-pending">Pendiente</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="approved" id="status-approved" />
          <Label htmlFor="status-approved">Aprobada</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="rejected" id="status-rejected" />
          <Label htmlFor="status-rejected">Rechazada</Label>
        </div>
      </RadioGroup>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave}>Guardar Cambios</Button>
      </DialogFooter>
    </div>
  );
}