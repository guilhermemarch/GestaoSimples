"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  ScanBarcode,
  Trash2,
  MessageSquare,
  Bookmark,
  Ban,
  Banknote,
  QrCode,
  CreditCard,
  Wallet,
  Clock,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { AlertBanner } from "@/components/system/alert-banner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { MoneyValue } from "@/components/system/money-value";
import { QuantityControl } from "@/components/system/quantity-control";
import { ProductThumbnail } from "@/components/system/avatar";
import { StatusBadge } from "@/components/system/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api, ApiError } from "@/lib/api-client";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

type Customer = {
  id: string;
  name: string;
  document?: string | null;
  pendingAmount?: number;
  creditLimit?: number | null;
};
type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  sku?: string | null;
  category?: string | null;
  imageUrl?: string | null;
};
type CartItem = {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  stock: number;
  imageUrl?: string | null;
};

const PAYMENT_TILES = [
  { key: "CASH", label: "Dinheiro", shortcut: "F1", icon: Banknote },
  { key: "PIX", label: "PIX", shortcut: "F2", icon: QrCode },
  { key: "CREDIT_CARD", label: "Cartão", shortcut: "F3", icon: CreditCard },
  { key: "DEBIT_CARD", label: "Débito", shortcut: "F4", icon: Wallet },
  { key: "PENDING", label: "Fiado", shortcut: "F5", icon: Clock },
];

export function NovaVendaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preCustomerId = searchParams.get("customerId");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todos");
  const [discountInput, setDiscountInput] = useState("");
  const [discountType, setDiscountType] = useState<"fixed" | "percent">("fixed");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [cashOpen, setCashOpen] = useState(true);
  const [dueDate, setDueDate] = useState("");
  const [amountReceived, setAmountReceived] = useState("");
  const [showCashDialog, setShowCashDialog] = useState(false);
  const [saleNotes, setSaleNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get<Customer[]>("/api/customers"),
      api.get<Product[]>("/api/products"),
      api.get<{ open: boolean }>("/api/caixa/atual").catch(() => ({ open: true })),
    ])
      .then(([c, p, caixa]) => {
        setCustomers(c);
        setProducts(p);
        setCashOpen(caixa.open === true);
        if (preCustomerId && c.some((x) => x.id === preCustomerId)) {
          setCustomerId(preCustomerId);
        } else {
          const maria = c.find((x) => x.name.includes("Maria"));
          setCustomerId(maria?.id ?? c[0]?.id ?? "");
        }
      })
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Erro ao carregar dados"));
  }, [preCustomerId]);

  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category).filter(Boolean) as string[]);
    return ["Todos", ...Array.from(cats).sort()];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku?.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === "Todos" || p.category === category;
      return matchSearch && matchCat;
    });
  }, [products, search, category]);

  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const total = Math.max(0, subtotal - appliedDiscount);
  const selectedCustomer = customers.find((c) => c.id === customerId);
  const availableLimit =
    selectedCustomer?.creditLimit != null
      ? Math.max(0, selectedCustomer.creditLimit - (selectedCustomer.pendingAmount ?? 0))
      : null;

  function addToCart(product: Product) {
    if (product.stock <= 0) return;
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          toast.error("Estoque insuficiente");
          return prev;
        }
        return prev.map((i) =>
          i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          quantity: 1,
          unitPrice: product.price,
          stock: product.stock,
          imageUrl: product.imageUrl,
        },
      ];
    });
  }

  function updateQty(productId: string, qty: number) {
    setCart((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, quantity: qty } : i)).filter((i) => i.quantity > 0),
    );
  }

  function removeFromCart(productId: string) {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  }

  function applyDiscount() {
    const val = parseFloat(discountInput) || 0;
    if (discountType === "percent") {
      setAppliedDiscount(Math.min(subtotal, (subtotal * val) / 100));
    } else {
      setAppliedDiscount(Math.min(subtotal, val));
    }
  }

  function handleBarcodeSubmit(code: string) {
    const trimmed = code.trim();
    if (!trimmed) return;
    const bySku = products.find(
      (p) => p.sku?.toLowerCase() === trimmed.toLowerCase() || p.id.startsWith(trimmed),
    );
    const byName = products.find((p) => p.name.toLowerCase().includes(trimmed.toLowerCase()));
    const product = bySku ?? byName;
    if (product) {
      addToCart(product);
      setSearch("");
      toast.success(`${product.name} adicionado`);
    } else {
      toast.error("Produto não encontrado");
    }
  }

  const submitSale = useCallback(
    async (asQuote = false) => {
      if (!customerId) {
        toast.error("Selecione um cliente");
        return;
      }
      if (cart.length === 0) {
        toast.error("Adicione pelo menos um produto");
        return;
      }
      if (!asQuote && paymentMethod === "CASH" && !cashOpen) {
        toast.error("Caixa fechado — abra o caixa antes de vender em dinheiro");
        return;
      }
      if (!asQuote && paymentMethod === "CASH" && !amountReceived) {
        setShowCashDialog(true);
        return;
      }
      setLoading(true);
      try {
        await api.post("/api/sales", {
          customerId,
          items: cart.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          paymentMethod,
          discount: appliedDiscount > 0 ? appliedDiscount : undefined,
          notes: saleNotes || undefined,
          dueDate: paymentMethod === "PENDING" ? dueDate || undefined : undefined,
          amountReceived:
            paymentMethod === "CASH" && amountReceived ? Number(amountReceived) : undefined,
          status: asQuote ? "QUOTE" : "CONFIRMED",
        });
        toast.success(asQuote ? "Orçamento salvo" : "Venda registrada com sucesso");
        router.push("/dashboard");
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : "Erro ao registrar venda");
      } finally {
        setLoading(false);
      }
    },
    [
      customerId,
      cart,
      paymentMethod,
      appliedDiscount,
      saleNotes,
      dueDate,
      amountReceived,
      cashOpen,
      router,
    ],
  );

  const handleSubmit = useCallback(() => submitSale(false), [submitSale]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const map: Record<string, string> = {
        F1: "CASH",
        F2: "PIX",
        F3: "CREDIT_CARD",
        F4: "DEBIT_CARD",
        F5: "PENDING",
      };
      if (map[e.key]) {
        e.preventDefault();
        setPaymentMethod(map[e.key]);
      } else if (e.key === "F6") {
        e.preventDefault();
        document.getElementById("discount-input")?.focus();
      } else if (e.key === "F7") {
        e.preventDefault();
        setShowNotes(true);
      } else if (e.key === "F8") {
        e.preventDefault();
        setPaymentMethod("PENDING");
      } else if (e.key === "F9") {
        e.preventDefault();
        void handleSubmit();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleSubmit]);

  const discountPreview = parseFloat(discountInput) || 0;
  const discountOverLimit =
    discountType === "percent"
      ? discountPreview > 10
      : subtotal > 0 && discountPreview > subtotal * 0.1;

  return (
    <>
      {!cashOpen && (
        <AlertBanner
          variant="warning"
          title="Caixa fechado"
          description="Abra o caixa para registrar vendas em dinheiro."
          linkLabel="Abrir caixa"
          linkHref="/caixa"
          className="mb-4"
        />
      )}

      <p className="mb-4 text-sm text-muted-foreground">Registre vendas de forma rápida</p>

      <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2 [&>*]:min-w-0">
        <div className="min-w-0 space-y-3 lg:col-span-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-9 pl-9 pr-10"
              placeholder="Buscar produto por nome, código ou referência..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleBarcodeSubmit(search);
                }
              }}
            />
            <ScanBarcode className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  category === cat
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-card text-muted-foreground hover:border-primary",
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="max-h-[520px] space-y-2 overflow-y-auto pr-1">
            <p className="text-xs font-semibold text-muted-foreground">Produtos encontrados</p>
            {filteredProducts.map((p, i) => (
              <div
                key={p.id}
                className={cn(
                  "flex items-center gap-3 rounded-lg border p-2.5",
                  p.stock <= 0 ? "border-danger/20 bg-danger-soft/50" : "border-border bg-card",
                )}
              >
                <ProductThumbnail name={p.name} index={i} imageUrl={p.imageUrl} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <div className="mt-0.5 flex items-center gap-3">
                    <MoneyValue value={p.price} className="text-sm font-bold" />
                    <span className={cn("text-xs", p.stock <= 0 ? "text-danger" : "text-success")}>
                      Estoque: {p.stock} un.
                    </span>
                  </div>
                </div>
                {p.stock > 0 ? (
                  <Button size="icon" className="h-8 w-8 shrink-0 bg-primary" onClick={() => addToCart(p)}>
                    +
                  </Button>
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-danger-soft">
                    <Ban className="h-4 w-4 text-danger" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-card p-3 text-xs text-muted-foreground">
            <ScanBarcode className="h-4 w-4" />
            Passe o código de barras do produto aqui
          </div>
        </div>

        <div className="min-w-0 space-y-3 lg:col-span-1">
          <Card variant="panel" className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold">Cliente</CardTitle>
              <Link
                href={customerId ? `/clientes/${customerId}` : "#"}
                className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                <Pencil className="h-3 w-3" />
                Editar
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={customerId} onValueChange={setCustomerId}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Selecione o cliente" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedCustomer && (
                <div className="rounded-lg border border-border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{selectedCustomer.name}</p>
                      {selectedCustomer.document && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          CPF: {selectedCustomer.document}
                        </p>
                      )}
                    </div>
                    {(selectedCustomer.pendingAmount ?? 0) > 0 && (
                      <StatusBadge
                        label={`Pendência ${formatCurrency(selectedCustomer.pendingAmount!)}`}
                        variant="pendente"
                      />
                    )}
                  </div>
                  {availableLimit != null && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Limite disponível:{" "}
                      <span className="font-semibold text-foreground">
                        {formatCurrency(availableLimit)}
                      </span>
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card variant="panel" className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Itens da venda ({cart.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum item adicionado</p>
              ) : (
                <div className="min-w-0 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-xs text-muted-foreground">
                        <th className="pb-2 font-medium">Produto</th>
                        <th className="pb-2 font-medium">Qtd</th>
                        <th className="pb-2 font-medium">Unitário</th>
                        <th className="pb-2 text-right font-medium">Total</th>
                        <th className="pb-2 w-8" />
                      </tr>
                    </thead>
                    <tbody>
                      {cart.map((item, i) => (
                        <tr key={item.productId} className="border-b border-border/60 last:border-0">
                          <td className="py-2 pr-2">
                            <div className="flex items-center gap-2">
                              <ProductThumbnail
                                name={item.name}
                                index={i}
                                imageUrl={item.imageUrl}
                                size="sm"
                              />
                              <span className="max-w-[80px] truncate font-medium sm:max-w-[140px]">
                                {item.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-2">
                            <QuantityControl
                              value={item.quantity}
                              onChange={(q) => updateQty(item.productId, q)}
                              max={item.stock}
                            />
                          </td>
                          <td className="py-2">
                            <MoneyValue value={item.unitPrice} className="text-xs" />
                          </td>
                          <td className="py-2 text-right">
                            <MoneyValue
                              value={item.unitPrice * item.quantity}
                              className="font-semibold"
                            />
                          </td>
                          <td className="py-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => removeFromCart(item.productId)}
                            >
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <button
                type="button"
                className="mt-3 flex items-center gap-1 text-xs text-primary hover:underline"
                onClick={() => setShowNotes(!showNotes)}
              >
                <MessageSquare className="h-3 w-3" />
                Adicionar observação
              </button>
              {showNotes && (
                <Input
                  className="mt-2 h-9"
                  placeholder="Observação da venda..."
                  value={saleNotes}
                  onChange={(e) => setSaleNotes(e.target.value)}
                />
              )}
            </CardContent>
          </Card>

          <Card variant="panel" className="shadow-card">
            <CardContent className="space-y-3 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <MoneyValue value={subtotal} />
              </div>
              <div className="space-y-2">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="flex rounded-md border border-border p-0.5">
                    <button
                      type="button"
                      onClick={() => setDiscountType("fixed")}
                      className={cn(
                        "rounded px-2.5 py-1 text-xs font-medium",
                        discountType === "fixed" ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                      )}
                    >
                      R$
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiscountType("percent")}
                      className={cn(
                        "rounded px-2.5 py-1 text-xs font-medium",
                        discountType === "percent" ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                      )}
                    >
                      %
                    </button>
                  </div>
                  <Input
                    id="discount-input"
                    type="number"
                    placeholder="Desconto"
                    value={discountInput}
                    onChange={(e) => setDiscountInput(e.target.value)}
                    className="h-9 flex-1"
                  />
                  <Button type="button" variant="outline" size="sm" className="h-9 shrink-0" onClick={applyDiscount}>
                    Aplicar
                  </Button>
                </div>
                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-sm text-success">
                    <span>Desconto aplicado</span>
                    <span>-{formatCurrency(appliedDiscount)}</span>
                  </div>
                )}
                {discountOverLimit && (
                  <p className="text-xs text-warning">Desconto acima do limite permitido (10%)</p>
                )}
              </div>
              <div className="flex justify-between border-t border-border pt-3">
                <span className="font-semibold">Total</span>
                <MoneyValue value={total} className="text-lg font-bold text-primary" />
              </div>

              {paymentMethod === "PENDING" && (
                <div className="space-y-1">
                  <Label className="text-xs">Vencimento (fiado)</Label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="h-9"
                  />
                </div>
              )}

              <div className="grid grid-cols-5 gap-1.5">
                {PAYMENT_TILES.map((tile) => (
                  <button
                    key={tile.key}
                    type="button"
                    onClick={() => setPaymentMethod(tile.key)}
                    className={cn(
                      "rounded-md border-2 p-1.5 text-center transition-colors sm:p-2",
                      paymentMethod === tile.key
                        ? "border-primary bg-accent"
                        : "border-border hover:border-primary/50",
                    )}
                  >
                    <tile.icon className="mx-auto h-4 w-4 text-primary" />
                    <span className="mt-0.5 block text-[10px] font-medium sm:text-[11px]">{tile.label}</span>
                    <span className="block text-[9px] text-muted-foreground sm:text-[10px]">{tile.shortcut}</span>
                  </button>
                ))}
              </div>

              <Button
                variant="outline"
                className="w-full gap-2 border-primary text-primary"
                onClick={() => submitSale(true)}
                disabled={loading}
              >
                <Bookmark className="h-4 w-4" />
                Salvar como orçamento
              </Button>
              <Button
                className="h-10 w-full bg-primary text-base hover:bg-primary-hover"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Registrando..." : "Confirmar venda F9"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showCashDialog} onOpenChange={setShowCashDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Valor recebido</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Total: {formatCurrency(total)}</Label>
            <Input
              type="number"
              placeholder="Valor recebido"
              value={amountReceived}
              onChange={(e) => setAmountReceived(e.target.value)}
            />
            {amountReceived && Number(amountReceived) >= total && (
              <p className="text-sm text-success">
                Troco: {formatCurrency(Number(amountReceived) - total)}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCashDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                setShowCashDialog(false);
                void handleSubmit();
              }}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
