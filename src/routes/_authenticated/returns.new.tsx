import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { z } from "zod";
import { AlertCircle, CheckCircle2, ImagePlus, PackageOpen, RotateCcw, Trash2, UploadCloud } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { inr } from "@/lib/format";

const REASONS = [
  "Wrong item received",
  "Item damaged or defective",
  "Doesn't match description",
  "Sound quality issue",
  "Connectivity / pairing issue",
  "Better price elsewhere",
  "No longer needed",
  "Other",
];

export const Route = createFileRoute("/_authenticated/returns/new")({
  validateSearch: z.object({ order: z.string() }),
  head: () => ({ meta: [{ title: "Request Return — PULSE" }, { name: "robots", content: "noindex" }] }),
  component: NewReturn,
});

function NewReturn() {
  const { order: orderId } = useSearch({ from: "/_authenticated/returns/new" });
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reason, setReason] = useState(REASONS[0]);
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [dragOver, setDragOver] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [agree, setAgree] = useState(false);

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", orderId],
    enabled: !!user && !!orderId,
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*").eq("id", orderId).single();
      if (error) throw error;
      return data;
    },
  });

  const orderItems = (order?.items ?? []) as { id?: string; name: string; qty: number; price?: number }[];

  // Default: select first item once order loads
  useEffect(() => {
    if (orderItems.length && Object.keys(selected).length === 0) {
      setSelected({ 0: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.id]);

  const onFiles = (list: FileList | File[] | null) => {
    if (!list) return;
    const incoming = Array.from(list).filter((f) => {
      if (!f.type.startsWith("image/")) {
        toast.error(`${f.name} is not an image`);
        return false;
      }
      if (f.size > 5 * 1024 * 1024) {
        toast.error(`${f.name} is over 5MB`);
        return false;
      }
      return true;
    });
    const next = [...files, ...incoming].slice(0, 5);
    setFiles(next);
  };

  const needsDescription = reason === "Other" || reason === "Item damaged or defective";
  const descTooShort = needsDescription && description.trim().length < 15;
  const noneSelected = Object.values(selected).every((v) => !v);
  const canSubmit = !noneSelected && !descTooShort && agree && !busy;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAttemptedSubmit(true);
    if (!user || !order) return;
    if (!canSubmit) {
      toast.error("Please review the highlighted fields.");
      return;
    }
    setBusy(true);
    try {
      const photoPaths: string[] = [];
      for (const f of files) {
        const path = `${user.id}/${orderId}/${Date.now()}-${f.name.replace(/[^\w.-]/g, "_")}`;
        const { error: upErr } = await supabase.storage.from("return-photos").upload(path, f);
        if (upErr) throw upErr;
        photoPaths.push(path);
      }
      const chosenItems = orderItems.filter((_, i) => selected[i]);
      const { error } = await supabase.from("returns").insert({
        user_id: user.id,
        order_id: orderId,
        items: chosenItems,
        reason,
        description: description || null,
        photos: photoPaths,
        status: "requested",
      });
      if (error) throw error;
      toast.success("Return request submitted.");
      navigate({ to: "/account" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit request");
    } finally {
      setBusy(false);
    }
  };

  if (isLoading) {
    return <div className="mx-auto max-w-2xl px-4 py-16 text-center text-sm text-muted-foreground">Loading order…</div>;
  }
  if (!order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-bold">Order not found.</h1>
        <Link to="/account" className="mt-4 inline-block text-sm text-accent">← Back to account</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <Link to="/account" className="mono text-xs text-muted-foreground hover:text-accent">← Back to account</Link>
      <div className="mt-4 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-full border border-accent/60 bg-accent/10 text-accent">
          <RotateCcw className="h-5 w-5" />
        </div>
        <div>
          <div className="mono text-accent">— Return request</div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Start a return.</h1>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border/60 bg-card p-5 text-sm">
        <div className="mono text-xs text-muted-foreground">
          ORDER #{order.id.slice(0, 8).toUpperCase()} · {new Date(order.created_at).toLocaleDateString()} · {inr(Number(order.total))}
        </div>
        <div className="mt-2 text-muted-foreground">
          {(order.items as { name: string; qty: number }[]).map((i) => `${i.name} × ${i.qty}`).join(", ")}
        </div>
      </div>

      <form onSubmit={submit} className="mt-6 space-y-6 rounded-2xl border border-border/60 bg-card p-6">
        <div>
          <label className="mono mb-2 flex items-center gap-2 text-xs text-muted-foreground">
            <PackageOpen className="h-3.5 w-3.5" /> Which items are you returning?
          </label>
          <div className="space-y-2">
            {orderItems.map((it, i) => {
              const on = !!selected[i];
              return (
                <label
                  key={i}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm transition-colors ${
                    on ? "border-accent bg-accent/5" : "border-border bg-surface-2 hover:border-accent/50"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="accent-accent"
                    checked={on}
                    onChange={(e) => setSelected({ ...selected, [i]: e.target.checked })}
                  />
                  <div className="flex-1">
                    <div className="font-semibold">{it.name}</div>
                    <div className="mono text-[10px] text-muted-foreground">QTY {it.qty}</div>
                  </div>
                  {typeof it.price === "number" && (
                    <div className="text-sm font-semibold">{inr(it.price * it.qty)}</div>
                  )}
                  {on && <CheckCircle2 className="h-4 w-4 text-accent" />}
                </label>
              );
            })}
          </div>
          {attemptedSubmit && noneSelected && (
            <div className="mono mt-2 flex items-center gap-1.5 text-[10px] text-destructive">
              <AlertCircle className="h-3 w-3" /> Select at least one item to return.
            </div>
          )}
        </div>

        <div>
          <label className="mono mb-2 block text-xs text-muted-foreground">Reason</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm focus:border-accent focus:outline-none"
          >
            {REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div>
          <label className="mono mb-2 block text-xs text-muted-foreground">
            Description {needsDescription ? "(required)" : "(optional)"}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            maxLength={500}
            placeholder={needsDescription
              ? "Please describe the issue in detail (min. 15 characters)…"
              : "Tell us a bit more so we can help faster…"}
            className={`w-full resize-none rounded-xl border bg-surface-2 px-4 py-3 text-sm focus:outline-none focus:ring-2 ${
              attemptedSubmit && descTooShort
                ? "border-destructive/70 focus:border-destructive focus:ring-destructive/30"
                : "border-border focus:border-accent focus:ring-accent/30"
            }`}
          />
          <div className="mono mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
            <span>
              {attemptedSubmit && descTooShort ? (
                <span className="text-destructive">Add at least 15 characters so support can help.</span>
              ) : needsDescription ? (
                <span>Min. 15 characters</span>
              ) : null}
            </span>
            <span>{description.length}/500</span>
          </div>
        </div>

        <div>
          <label className="mono mb-2 block text-xs text-muted-foreground">Photos (up to 5, images only, ≤5MB each)</label>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              onFiles(e.dataTransfer.files);
            }}
            className={`mb-3 flex items-center justify-center gap-3 rounded-xl border border-dashed p-4 text-xs transition-colors ${
              dragOver ? "border-accent bg-accent/10 text-accent" : "border-border bg-surface-2 text-muted-foreground"
            }`}
          >
            <UploadCloud className="h-4 w-4" />
            Drag & drop images here, or use the tile below.
          </div>
          <div className="flex flex-wrap gap-3">
            {files.map((f, i) => (
              <div key={i} className="group relative h-20 w-20 overflow-hidden rounded-lg border border-border bg-surface-2">
                <img src={URL.createObjectURL(f)} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setFiles(files.filter((_, j) => j !== i))}
                  className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-background/80 text-destructive opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
            {files.length < 5 && (
              <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border bg-surface-2 text-muted-foreground hover:border-accent hover:text-accent">
                <ImagePlus className="h-4 w-4" />
                <span className="mono text-[10px]">Add</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => onFiles(e.target.files)}
                />
              </label>
            )}
          </div>
        </div>

        <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-border bg-surface-2 p-3 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="mt-0.5 accent-accent"
          />
          <span>
            I confirm the item(s) are in original, unused condition with all accessories, and I've read the{" "}
            <Link to="/returns" className="text-accent hover:underline">return policy</Link>.
          </span>
        </label>
        {attemptedSubmit && !agree && (
          <div className="mono -mt-3 text-[10px] text-destructive">Please accept the return policy to continue.</div>
        )}

        <button
          type="submit"
          disabled={busy}
          className="btn-magnetic w-full rounded-full bg-accent py-3 text-sm font-semibold text-accent-foreground disabled:opacity-50"
        >
          {busy ? "Submitting…" : "Submit return request"}
        </button>
      </form>
    </div>
  );
}
