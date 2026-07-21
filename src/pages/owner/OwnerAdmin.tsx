import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lock, AlertTriangle, Download, RefreshCw, MessageCircle } from "lucide-react";
import { SUBMISSION_STATUSES } from "@/lib/owner-config";

interface Submission {
  id: string;
  created_at: string;
  owner_name: string;
  phone: string;
  email: string | null;
  city: string;
  area: string | null;
  property_type: string;
  bedrooms: string | null;
  plot_size: string | null;
  asking_price: string;
  title_status: string | null;
  is_tenanted: boolean | null;
  can_inspect_this_week: boolean | null;
  notes: string | null;
  status: string;
  admin_notes: string | null;
}

export default function OwnerAdmin() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [storedPw, setStoredPw] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selected, setSelected] = useState<Submission | null>(null);
  const [notesDraft, setNotesDraft] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    const pw = sessionStorage.getItem("owner_admin_pw");
    if (pw) { setStoredPw(pw); setAuthed(true); }
    const lockout = sessionStorage.getItem("owner_admin_lockout");
    if (lockout && Date.now() - parseInt(lockout) < 15 * 60 * 1000) setLocked(true);
  }, []);

  const login = async () => {
    if (locked || loading) return;
    setLoading(true); setError("");
    try {
      const { data } = await supabase.functions.invoke("owner-auth", {
        body: { password, type: "admin" },
      });
      if (data?.valid) {
        sessionStorage.setItem("owner_admin_pw", password);
        setStoredPw(password);
        setAuthed(true);
      } else {
        const n = attempts + 1;
        setAttempts(n);
        if (n >= 5) {
          sessionStorage.setItem("owner_admin_lockout", Date.now().toString());
          setLocked(true);
          setError("Locked out. Try again in 15 minutes.");
        } else setError("Incorrect password.");
      }
    } catch { setError("Error validating."); }
    setLoading(false);
  };

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("owner-admin-api", {
        method: "GET",
        headers: { "x-admin-password": storedPw },
      });
      if (error) throw error;
      setSubmissions(data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [storedPw]);

  useEffect(() => { if (authed && storedPw) fetchSubmissions(); }, [authed, storedPw, fetchSubmissions]);

  const updateSubmission = async (id: string, updates: { status?: string; admin_notes?: string }) => {
    try {
      await supabase.functions.invoke("owner-admin-api", {
        method: "POST",
        headers: { "x-admin-password": storedPw },
        body: { id, ...updates },
      });
      fetchSubmissions();
    } catch (e) { console.error(e); }
  };

  const exportCSV = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("owner-admin-api", {
        method: "GET",
        headers: { "x-admin-password": storedPw, "Accept": "text/csv" },
      });
      if (error) throw error;
      // Re-fetch as CSV via direct URL
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/owner-admin-api?format=csv`;
      const res = await fetch(url, {
        headers: {
          "x-admin-password": storedPw,
          "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
      });
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "property_submissions.csv";
      a.click();
    } catch (e) { console.error(e); }
  };

  if (!authed) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#0E1626] px-4">
        <div className="w-full max-w-md space-y-6 text-center">
          <Lock className="mx-auto h-10 w-10 text-[#C8A24A]" />
          <h1 className="font-display text-2xl font-bold text-white">Admin Access</h1>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
            <Input
              type="password" placeholder="Admin password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && login()}
              disabled={locked}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-[#C8A24A]"
            />
            {error && <p className="text-red-400 text-sm flex items-center gap-1.5 justify-center"><AlertTriangle className="h-4 w-4" />{error}</p>}
            <Button onClick={login} disabled={locked || loading || !password} className="w-full bg-[#C8A24A] text-[#0E1626] hover:bg-[#b8923a] font-semibold">
              {loading ? "Verifying..." : "Login"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const statusColor = (s: string) => {
    const map: Record<string, string> = {
      New: "bg-blue-100 text-blue-700", Contacted: "bg-yellow-100 text-yellow-700",
      Inspection: "bg-purple-100 text-purple-700", Offer: "bg-green-100 text-green-700",
      Closed: "bg-emerald-100 text-emerald-800", "Not Fit": "bg-red-100 text-red-700",
    };
    return map[s] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="min-h-dvh bg-[#F7F3EA]">
      <header className="bg-white border-b border-[#D8D1C5]/50 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="font-display text-lg font-bold text-[#0E1626]">Property Submissions</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchSubmissions} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} /> Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={exportCSV}>
              <Download className="h-4 w-4 mr-1" /> Export CSV
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
        {/* List */}
        <div className="flex-1 space-y-3">
          {submissions.length === 0 && (
            <p className="text-center text-[#9CA3AF] py-12">No submissions yet.</p>
          )}
          {submissions.map((s) => (
            <button
              key={s.id}
              onClick={() => { setSelected(s); setNotesDraft(s.admin_notes || ""); }}
              className={`w-full text-left bg-white border rounded-lg p-4 hover:shadow-md transition ${selected?.id === s.id ? "border-[#C8A24A] shadow-md" : "border-[#D8D1C5]/60"}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-[#0E1626]">{s.owner_name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(s.status)}`}>{s.status}</span>
              </div>
              <p className="text-sm text-[#6B7280]">{s.city} • {s.property_type} • ₦{s.asking_price}</p>
              <p className="text-xs text-[#9CA3AF] mt-1">{new Date(s.created_at).toLocaleDateString()}</p>
            </button>
          ))}
        </div>

        {/* Detail */}
        {selected && (
          <div className="w-full lg:w-[420px] bg-white border border-[#D8D1C5]/60 rounded-xl p-6 space-y-4 self-start sticky top-20">
            <h2 className="font-display text-xl font-bold text-[#0E1626]">{selected.owner_name}</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Info label="Phone" value={selected.phone} />
              <Info label="Email" value={selected.email} />
              <Info label="City" value={selected.city} />
              <Info label="Area" value={selected.area} />
              <Info label="Type" value={selected.property_type} />
              <Info label="Bedrooms" value={selected.bedrooms} />
              <Info label="Size" value={selected.plot_size} />
              <Info label="Price" value={`₦${selected.asking_price}`} />
              <Info label="Title" value={selected.title_status} />
              <Info label="Tenanted" value={selected.is_tenanted === true ? "Yes" : selected.is_tenanted === false ? "No" : "—"} />
              <Info label="Inspect?" value={selected.can_inspect_this_week === true ? "Yes" : selected.can_inspect_this_week === false ? "No" : "—"} />
            </div>
            {selected.notes && (
              <div>
                <p className="text-xs font-semibold text-[#9CA3AF] uppercase mb-1">Owner Notes</p>
                <p className="text-sm text-[#374151] bg-[#F7F3EA] rounded p-3">{selected.notes}</p>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-xs font-semibold text-[#9CA3AF] uppercase">Status</p>
              <Select value={selected.status} onValueChange={(v) => { updateSubmission(selected.id, { status: v }); setSelected({ ...selected, status: v }); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SUBMISSION_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-[#9CA3AF] uppercase">Admin Notes</p>
              <Textarea value={notesDraft} onChange={(e) => setNotesDraft(e.target.value)} rows={3} placeholder="Internal notes..." />
              <Button size="sm" onClick={() => updateSubmission(selected.id, { admin_notes: notesDraft })} className="bg-[#0E1626] text-white hover:bg-[#1a2a40]">
                Save Notes
              </Button>
            </div>

            <a
              href={`https://wa.me/${selected.phone.replace(/[^0-9]/g, "")}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-[#25D366] hover:underline"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp {selected.owner_name}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-xs text-[#9CA3AF]">{label}</p>
      <p className="text-[#0E1626] font-medium">{value || "—"}</p>
    </div>
  );
}
