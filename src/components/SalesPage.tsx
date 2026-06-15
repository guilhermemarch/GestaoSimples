"use client";

import { Fragment, useCallback, useEffect, useState } from "react";
import { formatCurrency, formatDate } from "@/lib/format";

type Customer = { id: string; name: string };
type Product = { id: string; name: string; price: number; stock: number };
type Sale = {
  id: string;
  total: number;
  createdAt: string;
  customer: { name: string };
  items: { quantity: number; product: { name: string }; subtotal: number }[];
};

type LineItem = { productId: string; quantity: number };

export function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState<LineItem[]>([]);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [salesRes, customersRes, productsRes] = await Promise.all([
      fetch("/api/sales"),
      fetch("/api/customers"),
      fetch("/api/products"),
    ]);
    setSales(await salesRes.json());
    setCustomers(await customersRes.json());
    setProducts(await productsRes.json());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function addItem() {
    if (products.length === 0) return;
    setItems([...items, { productId: products[0].id, quantity: 1 }]);
  }

  function updateItem(index: number, field: keyof LineItem, value: string | number) {
    const next = [...items];
    next[index] = { ...next[index], [field]: value };
    setItems(next);
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  const previewTotal = items.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId, items }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Erro ao registrar venda");
      return;
    }

    setShowForm(false);
    setCustomerId("");
    setItems([]);
    load();
  }

  return (
    <div>
      <div className="mb-4">
        <button
          onClick={() => {
            setShowForm(true);
            setError("");
            if (items.length === 0) addItem();
          }}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Nova venda
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <h2 className="mb-3 font-semibold">Registrar venda</h2>

          <label className="block text-sm font-medium text-slate-700">Cliente *</label>
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            required
            className="mt-1 mb-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Selecione...</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Produtos</span>
            <button type="button" onClick={addItem} className="text-sm text-blue-600 hover:underline">
              + Adicionar produto
            </button>
          </div>

          {items.map((item, index) => {
            const product = products.find((p) => p.id === item.productId);
            return (
              <div key={index} className="mb-2 flex flex-wrap items-center gap-2">
                <select
                  value={item.productId}
                  onChange={(e) => updateItem(index, "productId", e.target.value)}
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {formatCurrency(p.price)} (est: {p.stock})
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
                  className="w-20 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
                <span className="text-sm text-slate-500">
                  {product ? formatCurrency(product.price * item.quantity) : "—"}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="text-sm text-red-600"
                >
                  Remover
                </button>
              </div>
            );
          })}

          <p className="mt-3 text-lg font-bold">Total: {formatCurrency(previewTotal)}</p>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

          <div className="mt-3 flex gap-2">
            <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white">
              Confirmar venda
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border px-4 py-2 text-sm"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Detalhes</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <Fragment key={sale.id}>
                <tr className="border-t border-slate-100">
                  <td className="px-4 py-3">{formatDate(sale.createdAt)}</td>
                  <td className="px-4 py-3 font-medium">{sale.customer.name}</td>
                  <td className="px-4 py-3">{formatCurrency(sale.total)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() =>
                        setExpandedId(expandedId === sale.id ? null : sale.id)
                      }
                      className="text-blue-600 hover:underline"
                    >
                      {expandedId === sale.id ? "Ocultar" : "Ver itens"}
                    </button>
                  </td>
                </tr>
                {expandedId === sale.id && (
                  <tr className="bg-slate-50">
                    <td colSpan={4} className="px-4 py-3">
                      <ul className="space-y-1 text-slate-600">
                        {sale.items.map((item, i) => (
                          <li key={i}>
                            {item.product.name} × {item.quantity} ={" "}
                            {formatCurrency(item.subtotal)}
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {sales.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                  Nenhuma venda registrada
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
