import React from "react";
import FinanceLayout from "./FinanceLayout";

const summaryCards = [
  { label: "Pending Requests", value: "12", tone: "text-amber-600" },
  { label: "Average Decision Time", value: "6.3 hrs", tone: "text-blue-600" },
  { label: "Approved This Week", value: "28", tone: "text-emerald-600" },
  { label: "Escalations", value: "3", tone: "text-rose-600" },
];

const workflowStages = [
  {
    title: "Submission",
    description: "Requesters submit payment or transaction packets with mandatory documentation.",
    focus: "Digital forms with validation and supporting files",
  },
  {
    title: "Initial Review",
    description: "Finance analysts verify completeness, coding, and budget alignment.",
    focus: "Automated policy checks with manual overrides",
  },
  {
    title: "Approval Routing",
    description: "Requests move through tiered approvers based on thresholds and categories.",
    focus: "Dynamic routing and reminders for overdue actions",
  },
  {
    title: "Disbursement",
    description: "Approved items flow to treasury for payment execution and posting.",
    focus: "Straight-through processing with audit trails",
  },
];

const readinessChecklist = [
  {
    title: "Governance",
    items: [
      "Define authority limits and fallback approvers",
      "Publish escalation paths for urgent payments",
      "Capture digital signatures or approval tokens",
    ],
  },
  {
    title: "Data Quality",
    items: [
      "Require vendor and GL validation at submission",
      "Enforce supporting document uploads",
      "Auto-validate amounts against budgets and PO balances",
    ],
  },
  {
    title: "Visibility",
    items: [
      "Track status by lifecycle stage",
      "Expose SLA timers and bottlenecks",
      "Provide audit-ready history with immutable logs",
    ],
  },
];

export default function FinanceApprovalsOverview() {
  return (
    <FinanceLayout title="Approvals Overview" showNavigation={false}>
      <div className="space-y-8">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <div key={card.label} className="rounded-xl border border-blue-100 bg-blue-50/60 p-5 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-slate-500">{card.label}</p>
              <p className={`mt-3 text-2xl font-semibold ${card.tone}`}>{card.value}</p>
            </div>
          ))}
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">End-to-End Workflow</h2>
          <ol className="space-y-4">
            {workflowStages.map((stage, index) => (
              <li key={stage.title} className="flex gap-4 rounded-xl border border-slate-200 bg-white/80 p-5 shadow-sm">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-lg font-semibold text-blue-700">
                  {index + 1}
                </span>
                <div className="space-y-1">
                  <p className="text-base font-semibold text-slate-900">{stage.title}</p>
                  <p className="text-sm text-slate-600">{stage.description}</p>
                  <p className="text-sm font-medium text-blue-700">Focus: {stage.focus}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">Readiness Checklist</h2>
          <div className="grid gap-4 lg:grid-cols-3">
            {readinessChecklist.map((group) => (
              <div key={group.title} className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-5 shadow-sm">
                <p className="text-base font-semibold text-emerald-700">{group.title}</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  {group.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>
    </FinanceLayout>
  );
}
