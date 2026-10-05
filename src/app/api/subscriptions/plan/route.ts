import { NextResponse } from "next/server";
import { SKYBOOK_PLAN } from "@/lib/subscriptions/plan";

export async function GET() {
  return NextResponse.json({
    plan: {
      id: SKYBOOK_PLAN.id,
      name: SKYBOOK_PLAN.name,
      description: SKYBOOK_PLAN.description,
      priceCents: SKYBOOK_PLAN.priceCents,
      currency: SKYBOOK_PLAN.currency,
      interval: SKYBOOK_PLAN.interval,
      features: SKYBOOK_PLAN.features,
    },
  });
}
