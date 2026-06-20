"use client";

import { useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import { ChevronDown, Loader2, LogOut, Menu, Package, Search, ShoppingCart, User, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AlertsDropdown } from "@/components/system/alerts-dropdown";
import { Sidebar } from "./sidebar";
import { api, type SessionUser } from "@/lib/api-client";
import { formatCurrency } from "@/lib/format";
import { toast } from "sonner";
import type { Alert } from "@/lib/alerts";
import { cn } from "@/lib/utils";

type Props = {
  user: SessionUser;
  pageTitle?: string;
  alerts: Alert[];
};

type SearchResults = {
  customers: { id: string; name: string; phone: string | null }[];
  products: { id: string; name: string; price: number; sku: string | null }[];
  sales: { id: string; total: number; createdAt: string; customer: { name: string } }[];
};

const EMPTY_RESULTS: SearchResults = { customers: [], products: [], sales: [] };

export function Topbar({ user, pageTitle, alerts }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>(EMPTY_RESULTS);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults(EMPTY_RESULTS);
      setOpen(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(() => {
      api
        .get<SearchResults>(`/api/search?q=${encodeURIComponent(trimmed)}`)
        .then((data) => {
          setResults(data);
          setOpen(true);
        })
        .catch(() => setResults(EMPTY_RESULTS))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const hasResults =
    results.customers.length > 0 || results.products.length > 0 || results.sales.length > 0;

  async function handleLogout() {
    await api.post("/api/auth/logout");
    toast.success("Sessão encerrada");
    router.push("/login");
    router.refresh();
  }

  function navigate(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <header
        className="flex items-center gap-3 border-b border-border bg-card px-4 lg:px-6"
        style={{ height: "var(--topbar-h)" }}
      >
        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMobileNavOpen(true)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-foreground hover:bg-muted lg:hidden"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {pageTitle && (
          <h2 className="hidden w-[180px] shrink-0 text-base font-bold text-foreground lg:block">
            {pageTitle}
          </h2>
        )}

        {/* Desktop search */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <div className="relative mx-auto hidden max-w-md flex-1 md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              {loading && (
                <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
              )}
              <Input
                ref={inputRef}
                className="h-9 rounded-lg border-border bg-background pl-9 pr-9 text-sm"
                placeholder="Buscar clientes, vendas, produtos..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => {
                  if (query.trim().length >= 2) setOpen(true);
                }}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent
            className="w-[var(--radix-popover-trigger-width)] p-0"
            align="start"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            {!hasResults && !loading && query.trim().length >= 2 ? (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                Nenhum resultado para &ldquo;{query.trim()}&rdquo;
              </p>
            ) : (
              <div className="max-h-80 overflow-y-auto py-1">
                {results.customers.length > 0 && (
                  <SearchGroup title="Clientes">
                    {results.customers.map((c) => (
                      <SearchItem
                        key={c.id}
                        icon={User}
                        label={c.name}
                        sublabel={c.phone ?? undefined}
                        onClick={() => navigate(`/clientes/${c.id}`)}
                      />
                    ))}
                  </SearchGroup>
                )}
                {results.products.length > 0 && (
                  <SearchGroup title="Produtos">
                    {results.products.map((p) => (
                      <SearchItem
                        key={p.id}
                        icon={Package}
                        label={p.name}
                        sublabel={p.sku ? `${p.sku} · ${formatCurrency(p.price)}` : formatCurrency(p.price)}
                        onClick={() => navigate(`/produtos/${p.id}`)}
                      />
                    ))}
                  </SearchGroup>
                )}
                {results.sales.length > 0 && (
                  <SearchGroup title="Vendas">
                    {results.sales.map((s) => (
                      <SearchItem
                        key={s.id}
                        icon={ShoppingCart}
                        label={`Venda #${s.id.slice(0, 8)}`}
                        sublabel={`${s.customer.name} · ${formatCurrency(s.total)}`}
                        onClick={() => navigate("/vendas/nova")}
                      />
                    ))}
                  </SearchGroup>
                )}
              </div>
            )}
          </PopoverContent>
        </Popover>

        {/* Mobile search button */}
        <button
          type="button"
          onClick={() => setMobileSearchOpen(true)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-foreground hover:bg-muted md:hidden"
          aria-label="Buscar"
        >
          <Search className="h-5 w-5" />
        </button>

        <div className="flex shrink-0 items-center gap-3">
          <AlertsDropdown alerts={alerts} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2 hover:bg-muted">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-accent text-sm font-semibold text-accent-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium md:inline">{user.name}</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Mobile nav drawer */}
      <Dialog open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <DialogContent
          showCloseButton={false}
          className="fixed inset-y-0 left-0 m-0 h-full w-[280px] max-w-[85vw] translate-x-0 translate-y-0 gap-0 overflow-hidden rounded-none border-r p-0 data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left"
        >
          <DialogTitle className="sr-only">Navegação</DialogTitle>
          <button
            type="button"
            onClick={() => setMobileNavOpen(false)}
            className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
            aria-label="Fechar menu"
          >
            <X className="h-4 w-4" />
          </button>
          <Sidebar user={user} onNavigate={() => setMobileNavOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Mobile search drawer */}
      <Dialog open={mobileSearchOpen} onOpenChange={setMobileSearchOpen}>
        <DialogContent
          showCloseButton={false}
          className="top-0 left-0 m-0 h-auto max-w-none translate-x-0 translate-y-0 gap-0 rounded-none border-b p-3 data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top"
        >
          <DialogTitle className="sr-only">Buscar</DialogTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={inputRef}
              autoFocus
              className="h-10 rounded-lg border-border bg-background pl-9 pr-9 text-sm"
              placeholder="Buscar clientes, vendas, produtos..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {loading && (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function SearchGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border-b border-border last:border-0">
      <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      {children}
    </div>
  );
}

function SearchItem({
  icon: Icon,
  label,
  sublabel,
  onClick,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  sublabel?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-accent",
      )}
    >
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="truncate font-medium">{label}</p>
        {sublabel && <p className="truncate text-xs text-muted-foreground">{sublabel}</p>}
      </div>
    </button>
  );
}
