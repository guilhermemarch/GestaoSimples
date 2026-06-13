import { AppShell } from "@/components/AppShell";
import { CustomersPage } from "@/components/CustomersPage";

export default function Page() {
  return (
    <AppShell title="Clientes">
      <CustomersPage />
    </AppShell>
  );
}
