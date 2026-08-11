import { useState } from "react";
import { Search, ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";
import { Screen } from "../../../data/types";
import { EMAIL_LOG } from "../../../data/mockData";
import { AdminLayout } from "../../components/AdminLayout";
import { SearchInput } from "../../components/SearchInput";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";

export function AdminEmailLog({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [search, setSearch] = useState("");

  const logs = EMAIL_LOG.filter(
    (l) => l.type.toLowerCase().includes(search.toLowerCase()) || l.sent.includes(search)
  );

  return (
    <AdminLayout>
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate?.("admin-dashboard")}
                className="p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-muted-foreground" />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">Email Delivery Log</h1>
                <p className="text-muted-foreground text-sm mt-0.5">Audit log of system notifications sent to students</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <SearchInput value={search} onChange={setSearch} placeholder="Search by email type or timestamp..." />
          </div>

          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    <th className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Recipient
                    </th>
                    <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Email Type
                    </th>
                    <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Sent Time
                    </th>
                    <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Delivery Status
                    </th>
                    <th className="text-right px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center">
                        <Search className="w-8 h-8 text-muted-foreground/20 mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">No email logs found matching filter</p>
                      </td>
                    </tr>
                  ) : (
                    logs.map((entry) => (
                      <tr key={entry.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-5 py-3.5">
                          <div>
                            <p className="text-sm font-bold text-foreground">Sarah Chen</p>
                            <p className="text-xs text-muted-foreground">sarah.chen@example.com</p>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-sm font-semibold text-foreground">{entry.type}</td>
                        <td className="px-4 py-3.5 text-sm text-muted-foreground whitespace-nowrap">{entry.sent}</td>
                        <td className="px-4 py-3.5">
                          <Badge variant={entry.status} />
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <Button variant="ghost" size="sm" onClick={() => toast.success(`Resent ${entry.type} email`)}>
                            <Send className="w-3.5 h-3.5" />
                            Resend
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </AdminLayout>
  );
}
