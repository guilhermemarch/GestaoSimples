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

type Product = { id: string; name: string };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultProductId?: string;
  onSuccess: () => void;
};

export function StockPurchaseDialog({
  open,
  onOpenChange,
  defaultProductId,
  onSuccess,
}: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState(defaultProductId ?? "");
  const [quantity, setQuantity] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [supplier, setSupplier] = useState("");
  const [invoice, setInvoice] = useState("");
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

  async function handleSubmit() {
    const qty = Number(quantity);
    if (!productId || !qty || qty <= 0) {
      toast.error("Selecione o produto e informe a quantidade");
      return;
    }
    setSaving(true);
    try {
      const parts = ["Compra registrada"];
      if (supplier.trim()) parts.push(`Fornecedor: ${supplier.trim()}`);
      if (invoice.trim()) parts.push(`NF: ${invoice.trim()}`);
      if (unitCost) parts.push(`Custo unit.: R$ ${unitCost}`);

      await api.post("/api/stock-movements", {
        productId,
        type: "PURCHASE",
        quantity: qty,
        description: parts.join(" · "),
      });
      toast.success("Compra registrada com sucesso");
      onOpenChange(false);
      setQuantity("");
      setUnitCost("");
      setSupplier("");
      setInvoice("");
      onSuccess();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Erro ao registrar compra");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar compra</DialogTitle>
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
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="qty">Quantidade</Label>
              <Input
                id="qty"
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost">Custo unitário</Label>
              <Input
                id="cost"
                type="number"
                min={0}
                step="0.01"
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="supplier">Fornecedor</Label>
            <Input id="supplier" value={supplier} onChange={(e) => setSupplier(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invoice">Nota fiscal (opcional)</Label>
            <Input id="invoice" value={invoice} onChange={(e) => setInvoice(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? "Salvando..." : "Registrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
