"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const serviceSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  description: z
    .string()
    .min(10, "Descrição deve ter pelo menos 10 caracteres"),
  durationMin: z
    .number()
    .min(15, "Duração mínima é 15 minutos")
    .max(480, "Duração máxima é 8 horas"),
  priceCents: z.number().min(0, "Preço deve ser maior que zero"),
  active: z.boolean(),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

import { Service, formatPrice, formatDuration } from "@/types/service";

export function ServicesTab() {
  const [services, setServices] = useState<Service[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    mode: "onChange",
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      // TODO: Replace with actual API call
      const mockServices: Service[] = [
        {
          id: "1",
          name: "Consulta de Avaliação",
          slug: "consulta-avaliacao",
          description:
            "Avaliação completa da saúde bucal com plano de tratamento personalizado",
          durationMin: 60,
          priceCents: 15000,
          active: true,
        },
        {
          id: "2",
          name: "Limpeza e Profilaxia",
          slug: "limpeza-profilaxia",
          description:
            "Limpeza profissional, remoção de tártaro e polimento dos dentes",
          durationMin: 45,
          priceCents: 12000,
          active: true,
        },
        {
          id: "3",
          name: "Tratamento de Canal",
          slug: "tratamento-canal",
          description: "Tratamento endodôntico completo com anestesia local",
          durationMin: 90,
          priceCents: 80000,
          active: false,
        },
      ];
      setServices(mockServices);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching services:", error);
      setLoading(false);
    }
  };

  const onSubmit = async (data: ServiceFormData) => {
    try {
      if (editingService) {
        // Update existing service
        const updatedService = { ...editingService, ...data };
        setServices((prev) =>
          prev.map((s) => (s.id === editingService.id ? updatedService : s))
        );
        setEditingService(null);
      } else {
        // Create new service
        const newService: Service = {
          id: `service_${Date.now()}`,
          slug: data.name
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, ""),
          ...data,
        };
        setServices((prev) => [...prev, newService]);
      }

      reset();
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error("Error saving service:", error);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setValue("name", service.name);
    setValue("description", service.description);
    setValue("durationMin", service.durationMin);
    setValue("priceCents", service.priceCents);
    setValue("active", service.active);
    setIsCreateDialogOpen(true);
  };

  const handleDelete = async (serviceId: string) => {
    if (confirm("Tem certeza que deseja excluir este serviço?")) {
      setServices((prev) => prev.filter((s) => s.id !== serviceId));
    }
  };

  const handleToggleActive = async (serviceId: string) => {
    setServices((prev) =>
      prev.map((s) => (s.id === serviceId ? { ...s, active: !s.active } : s))
    );
  };

  const openCreateDialog = () => {
    setEditingService(null);
    reset();
    setIsCreateDialogOpen(true);
  };

  const closeDialog = () => {
    setIsCreateDialogOpen(false);
    setEditingService(null);
    reset();
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Carregando serviços...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Serviços</h2>
        <Button
          onClick={openCreateDialog}
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Serviço</span>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {service.description}
                  </TableCell>
                  <TableCell>{formatDuration(service.durationMin)}</TableCell>
                  <TableCell>{formatPrice(service.priceCents)}</TableCell>
                  <TableCell>
                    <Badge variant={service.active ? "default" : "secondary"}>
                      {service.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(service.id)}
                      >
                        <Switch checked={service.active} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(service)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(service.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingService ? "Editar Serviço" : "Novo Serviço"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  placeholder="Nome do serviço"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="durationMin">Duração (minutos) *</Label>
                <Input
                  id="durationMin"
                  type="number"
                  placeholder="60"
                  {...register("durationMin", { valueAsNumber: true })}
                />
                {errors.durationMin && (
                  <p className="text-sm text-destructive">
                    {errors.durationMin.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição *</Label>
              <Textarea
                id="description"
                placeholder="Descrição detalhada do serviço"
                {...register("description")}
                rows={3}
              />
              {errors.description && (
                <p className="text-sm text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priceCents">Preço (centavos) *</Label>
                <Input
                  id="priceCents"
                  type="number"
                  placeholder="15000"
                  {...register("priceCents", { valueAsNumber: true })}
                />
                {errors.priceCents && (
                  <p className="text-sm text-destructive">
                    {errors.priceCents.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Ex: 15000 = R$ 150,00
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="active">Status</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={watch("active")}
                    onCheckedChange={(checked) => setValue("active", checked)}
                  />
                  <Label htmlFor="active">Ativo</Label>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={closeDialog}>
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button type="submit" disabled={!isValid}>
                <Save className="w-4 h-4 mr-2" />
                {editingService ? "Atualizar" : "Criar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
