import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, MapPin, Plus, Timer, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { deleteItem, myItemsQuery, setItemResolved, type Item } from "@/lib/items";
import { fetchMyProfile, syncProfileFromMetadata } from "@/lib/profile";

export const Route = createFileRoute("/_authenticated/my-reports")({
  head: () => ({
    meta: [
      { title: "My reports — SMVEC Campus Lost & Found" },
      {
        name: "description",
        content:
          "See every item you posted at SMVEC, mark it as returned, or delete it once the owner has it back.",
      },
      { property: "og:title", content: "My reports — SMVEC Campus Lost & Found" },
      {
        property: "og:description",
        content: "Manage the lost and found items you posted on the SMVEC board.",
      },
    ],
  }),
  component: MyReports,
});

function MyReports() {
  const { userId, email, user } = useAuth();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    ...myItemsQuery(userId ?? ""),
    enabled: Boolean(userId),
  });

  const { data: profile } = useQuery({
    queryKey: ["profile", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      if (user) {
        await syncProfileFromMetadata(user.id, user.user_metadata ?? {});
      }
      return fetchMyProfile(userId!);
    },
  });

  const items: Item[] = data ?? [];
  const openCount = items.filter((i) => !i.is_resolved).length;
  const closedCount = items.length - openCount;
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["items"] });

  const resolveMutation = useMutation({
    mutationFn: ({ id, value }: { id: string; value: boolean }) =>
      setItemResolved(id, value),
    onSuccess: async (_d, v) => {
      toast.success(v.value ? "Marked as closed." : "Reopened.");
      await refresh();
    },
    onError: () => toast.error("Could not update this report."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteItem(id),
    onSuccess: async () => {
      toast.success("Report deleted.");
      await refresh();
    },
    onError: () => toast.error("Could not delete this report."),
  });

  return (
    <main className="mx-auto w-full max-w-4xl px-4 pb-20 pt-10 sm:px-6">
      <h1 className="text-3xl font-bold text-foreground sm:text-4xl">My dashboard</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Everything you posted{email ? ` as ${email}` : ""}. Mark an item as closed
        when it is back with its owner, or delete it from the board.
      </p>

      <section className="board-card mt-6 flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <p className="text-lg font-semibold text-foreground">
            {profile?.name ?? "Welcome"}
          </p>
          <p className="text-sm text-muted-foreground">
            {[profile?.department, profile?.year, profile?.section && `Sec ${profile.section}`]
              .filter(Boolean)
              .join(" · ")}
          </p>
          <p className="text-sm text-muted-foreground">
            {profile?.college ?? "Sri Manakula Vinayagar Engineering College"}
          </p>
          <p className="text-sm text-muted-foreground">
            {email}
            {profile?.whatsapp ? ` · WhatsApp ${profile.whatsapp}` : ""}
          </p>
          <Link
            to="/profile"
            className="mt-3 inline-flex rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted"
          >
            Edit profile
          </Link>
        </div>
        <div className="flex gap-6 text-center">
          <div>
            <p className="text-2xl font-bold text-foreground">{items.length}</p>
            <p className="text-xs text-muted-foreground">Reports</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{openCount}</p>
            <p className="text-xs text-muted-foreground">Still open</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{closedCount}</p>
            <p className="text-xs text-muted-foreground">Closed</p>
          </div>
        </div>
      </section>


      <div className="mt-8 space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="board-card h-28 animate-pulse bg-muted" aria-hidden />
          ))
        ) : items.length === 0 ? (
          <div className="board-card p-10 text-center">
            <h2 className="text-lg font-semibold text-foreground">
              You have not posted anything yet
            </h2>
            <Link
              to="/report"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              <Plus className="size-4" aria-hidden />
              Report an item
            </Link>
          </div>
        ) : (
          items.map((item) => (
            <article key={item.id} className="board-card p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={[
                    "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
                    item.type === "lost"
                      ? "bg-lost text-lost-foreground"
                      : "bg-found text-found-foreground",
                  ].join(" ")}
                >
                  {item.type}
                </span>
                <span
                  className={[
                    "rounded-full px-3 py-1 text-xs font-semibold",
                    item.is_resolved
                      ? "bg-found text-found-foreground"
                      : "bg-muted text-muted-foreground",
                  ].join(" ")}
                >
                  {item.is_resolved
                    ? item.type === "lost"
                      ? "Got it back"
                      : "Returned to owner"
                    : "Still open"}
                </span>
                <h2 className="w-full text-lg font-semibold text-foreground">
                  {item.item_name}
                </h2>
              </div>

              <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-4 text-accent" aria-hidden />
                  {item.place}
                </span>
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="size-4 text-accent" aria-hidden />
                  {new Date(item.item_date).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1.5">
                  <Timer className="size-4 text-accent" aria-hidden />
                  Auto-deletes on {new Date(item.expires_at).toLocaleDateString()}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={resolveMutation.isPending}
                  onClick={() =>
                    resolveMutation.mutate({ id: item.id, value: !item.is_resolved })
                  }
                  className="rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-60"
                >
                  {item.is_resolved ? "Reopen this report" : "Mark as closed"}
                </button>
                <button
                  type="button"
                  disabled={deleteMutation.isPending}
                  onClick={() => {
                    if (confirm("Delete this report from the board?")) {
                      deleteMutation.mutate(item.id);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-destructive px-3 py-2 text-xs font-semibold text-destructive-foreground hover:opacity-90 disabled:opacity-60"
                >
                  <Trash2 className="size-4" aria-hidden />
                  Delete
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </main>
  );
}
