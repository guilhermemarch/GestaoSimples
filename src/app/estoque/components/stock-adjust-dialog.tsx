"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api, ApiError } from "@/lib/api-client";

type Product = { id: string; name: string; stock: number };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultProductId?: string;
  onSuccess: () => void;
};

export function StockAdjustDialog({
  open,
  onOpenChange,
  defaultProductId,
  onSuccess,
}: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState(defaultProductId ?? "");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      api
        .get<Product[]>("/api/products")
        .then(setProducts)
        .catch(() => toast.error("Erro ao carregar produtos"));
      setProductId(defaultProductId ?? "");
    }
  }, [open, defaultProductId]);

  const selected = products.find((p) => p.id === productId);

  async function handleSubmit() {
    const qty = Number(quantity);
    if (!productId || !qty || qty === 0) {
      toast.error("Selecione o produto e informe a quantidade (+ ou −)");
      return;
    }
    if (!reason.trim()) {
      toast.error("Informe o motivo do ajuste");
      return;
    }
    setSaving(true);
    try {
      await api.post("/api/stock-movements", {
        productId,
        type: "ADJUSTMENT",
        quantity: qty,
        description: reason.trim(),
      });
      toast.success("Ajuste registrado com sucesso");
      onOpenChange(false);
      setQuantity("");
      setReason("");
      onSuccess();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Erro ao registrar ajuste");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Ajuste de estoque</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Produto</Label>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o produto" />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} ({p.stock} un.)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selected && (
            <p className="text-sm text-muted-foreground">
              Estoque atual: <strong>{selected.stock} un.</strong>
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="adj-qty">Quantidade (+ entrada / − saída)</Label>
            <Input
              id="adj-qty"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">Motivo</Label>
            <Input
              id="reason"
              placeholder="Ex.: Inventário, perda, correção..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? "Salvando..." : "Confirmar ajuste"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
