"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  XCircle,
} from "lucide-react";
import { BrandLogo } from "@/components/system/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api, ApiError } from "@/lib/api-client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/api/auth/login", { email, password });
      toast.success("Login realizado com sucesso");
      window.location.assign("/dashboard");
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Erro ao fazer login";
      setError("E-mail ou senha incorretos.");
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  function handleForgotSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    toast.success("Link de recuperação enviado para seu e-mail.");
    setForgotOpen(false);
    setForgotEmail("");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-[1200px] overflow-hidden rounded-xl border border-border bg-card shadow-dialog">
        <div className="grid lg:grid-cols-2 lg:items-stretch">
          <div className="relative hidden bg-success-soft lg:block">
            <div className="relative aspect-[1122/1402] h-full w-full">
              <Image
                src="/images/login-hero.png"
                alt="GestãoSimples"
                fill
                className="object-contain"
                sizes="(min-width: 1024px) min(50vw, 600px), 100vw"
                priority
              />
            </div>
          </div>

          <div className="relative aspect-[1122/1402] w-full bg-success-soft lg:hidden">
            <Image
              src="/images/login-hero.png"
              alt="GestãoSimples"
              fill
              className="object-contain"
              sizes="(max-width: 1023px) 100vw, 1px"
              priority
            />
          </div>

          <div className="flex flex-col justify-center p-6 sm:p-10 lg:min-h-0 lg:p-14">
            <BrandLogo size="md" />
            <p className="mt-4 text-sm text-muted-foreground">
              Entre para gerenciar suas vendas, estoque e caixa.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="h-10 pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="h-10 pl-9 pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {error && (
                <div className="flex items-center gap-2 rounded-md border border-danger/20 bg-danger-soft px-3 py-2 text-sm text-danger">
                  <XCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}
              <Button
                type="submit"
                className="h-10 w-full bg-primary text-base hover:bg-primary-hover"
                disabled={loading}
              >
                {loading ? "Entrando..." : "Entrar"}
              </Button>
              <p className="text-center">
                <button
                  type="button"
                  onClick={() => setForgotOpen(true)}
                  className="text-sm text-primary hover:underline"
                >
                  Esqueci minha senha
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>

      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recuperar senha</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="forgot-email">E-mail cadastrado</Label>
              <Input
                id="forgot-email"
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="seu@email.com"
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setForgotOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Enviar link</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
