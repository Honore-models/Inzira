// ============================================================
// POST /api/ai/seed
// Seeds the RAG system with verified government documents
// for the Inzira prototype
// ============================================================

import { NextResponse } from "next/server";
import { ingestDocument } from "@/lib/ai/ingestion";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    // Clear existing documents to prevent duplicates on re-seed
    const supabase = await createClient();
    await supabase.from("document_chunks").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("documents").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    const results = [];

    // 1. RDB - Enterprise (Sole Trader) Registration
    const rdbEnterpriseResult = await ingestDocument({
      title: "Registering as an Enterprise (Sole Trader)",
      institution: "RDB",
      description:
        "Guide to registering as an individual trader with RDB Office of the Registrar General",
      text: `Registering as an Enterprise (Sole Trader)
Institution: RDB (Rwanda Development Board) — Office of the Registrar General (ORG)
Title: Registering as an Enterprise (Sole Trader)

For someone starting a small business alone (like a carpentry or tailoring workshop), the simplest option is registering as an "Enterprise" (individual trader) — this applies to businesses with turnover under RWF 10,000/day. Registration is completely free of charge, whether done online or in person. It can be done online via the RDB portal (businessprocedures.rdb.rw / urs.rdb.rw), or in person at the RDB building (Office of the Registrar General, KG 220 St, Kigali). Processing typically takes a few hours. You'll need a copy of your national ID or passport. After registration, your Tax Identification Number (TIN) is issued automatically together with your registration certificate, since RDB and RRA systems are integrated.

Source: rdb.rw, org.rdb.rw, businessprocedures.rdb.rw
Verified date: 2026-08-19`,
      fileName: "rdb_enterprise_registration.txt",
      metadata: {
        version: "2026",
        documentType: "registration_guide",
        source: "rdb.rw, org.rdb.rw, businessprocedures.rdb.rw",
        verifiedDate: "2026-08-19",
      },
    });
    results.push(rdbEnterpriseResult);

    // 2. RDB - Company Registration
    const rdbCompanyResult = await ingestDocument({
      title: "Registering a Domestic Company",
      institution: "RDB",
      description:
        "Guide to registering a domestic company with RDB Office of the Registrar General",
      text: `Registering a Domestic Company
Institution: RDB — Office of the Registrar General (ORG)
Title: Registering a Domestic Company

If a business grows beyond a sole trader (e.g. hiring employees, forming a partnership), it should register as a "Domestic Company" instead. Registration is free. Requirements: copy of ID/passport for all shareholders/directors, two completed copies of the Memorandum of Association, shareholders' and directors' particulars, and a local physical registered address. Business registration services are typically delivered within 6 hours once the application meets requirements.

Source: org.rdb.rw/business-registration/
Verified date: 2026-08-19`,
      fileName: "rdb_company_registration.txt",
      metadata: {
        version: "2026",
        documentType: "registration_guide",
        source: "org.rdb.rw/business-registration/",
        verifiedDate: "2026-08-19",
      },
    });
    results.push(rdbCompanyResult);

    // 3. RRA - TIN & VAT
    const rraResult = await ingestDocument({
      title: "Tax Registration and VAT Threshold",
      institution: "RRA",
      description:
        "Guide to Tax Identification Number and VAT requirements from Rwanda Revenue Authority",
      text: `Tax Registration and VAT Threshold
Institution: RRA (Rwanda Revenue Authority)
Title: Tax Registration and VAT Threshold

A Tax Identification Number (TIN) is issued automatically when you register your business through RDB — no separate application is needed for most small businesses. A business only needs to register separately for VAT if turnover exceeds RWF 20 million in a year, or RWF 5 million in a single quarter — this does not apply to most small, newly started businesses. Businesses that do register for VAT must also acquire an Electronic Billing Machine (EBM).

Source: rra.gov.rw, tax-handbook.rra.gov.rw
Verified date: 2026-08-19`,
      fileName: "rra_tax_vat_guide.txt",
      metadata: {
        version: "2026",
        documentType: "tax_registration",
        source: "rra.gov.rw, tax-handbook.rra.gov.rw",
        verifiedDate: "2026-08-19",
      },
    });
    results.push(rraResult);

    // 4. BRD (formerly BDF) - Loan Guarantee
    const brdResult = await ingestDocument({
      title: "SME and Youth Loan Guarantee Fund",
      institution: "BRD",
      description:
        "Guide to BRD loan guarantees for youth and SMEs (formerly BDF)",
      text: `SME and Youth Loan Guarantee Fund
Institution: BRD (Development Bank of Rwanda) — formerly BDF (Business Development Fund), merged into BRD in July 2025
Title: SME and Youth Loan Guarantee Fund

BRD provides partial credit guarantees to help small business owners access bank loans even without full collateral. Under the enhanced guarantee product, BRD covers up to 50% of collateral for general SMEs, and up to 75% for special groups including women and youth-owned SMEs — meaning young entrepreneurs face a lower collateral barrier than the general population. To date, this program (as BDF) had supported over 40,000 businesses with credit guarantees before the 2025 merger into BRD.

Source: brd.rw, allafrica.com (BDF Introduces Enhanced Partial Credit Guarantee Product)
Verified date: 2026-08-19
Note: This program was known as "BDF" before July 2025; some public materials may still reference the old name.`,
      fileName: "brd_loan_guarantee_guide.txt",
      metadata: {
        version: "2026",
        documentType: "financing_guide",
        source: "brd.rw, allafrica.com",
        verifiedDate: "2026-08-19",
        previousName: "BDF",
      },
    });
    results.push(brdResult);

    // 5. Youth & Artist Loan Fund
    const youthFundResult = await ingestDocument({
      title: "Youth Fund — Single-Digit Interest Loans",
      institution: "Ministry of Youth and Arts",
      description:
        "Guide to the 2026 Youth Fund offering low-interest loans for youth and artists",
      text: `Youth Fund — Single-Digit Interest Loans
Institution: Ministry of Youth and Arts, implemented via BRD
Title: Youth Fund — Single-Digit Interest Loans

A newer fund (2026) offers youth and artists loans at 9% interest, with 90% of the required collateral guaranteed by the fund — meaning the applicant only needs to provide 10% collateral themselves, either as assets or cash. Loan amounts are capped at RWF 10 million. Applicants must submit a repayment plan and show they already work with institutions that provide business support. Youth can also group into cooperatives to meet the 10% collateral requirement together, or build savings over time to cover it. Successful, on-time repayment earns a 10% grant bonus of the loan amount. Repayment begins three months after disbursement.

Source: allafrica.com (Rwanda: New Youth Fund Targets Offering Single-Digit Loans, May 2026)
Verified date: 2026-08-19`,
      fileName: "youth_fund_loan_guide.txt",
      metadata: {
        version: "2026",
        documentType: "financing_guide",
        source: "allafrica.com",
        verifiedDate: "2026-08-19",
      },
    });
    results.push(youthFundResult);

    // 6. RTB - TVET Training
    const rtbResult = await ingestDocument({
      title: "Vocational Training Enrollment",
      institution: "RTB",
      description:
        "Guide to TVET vocational training programs from Rwanda TVET Board",
      text: `Vocational Training Enrollment
Institution: RTB (Rwanda TVET Board) — the current authority overseeing TVET, having taken over most operational functions previously under WDA
Title: Vocational Training Enrollment

RTB oversees Technical and Vocational Education and Training (TVET) from level 1 to level 5, delivered through Vocational Training Centres (VTCs), Technical Secondary Schools (TSSs), and IPRCs (Integrated Polytechnic Regional Centres — one in each province plus Kigali). RTB also runs a Skills Development Fund offering short 6-12 month vocational courses (manufacturing, transport, energy, agriculture, ICT, hospitality) specifically targeting youth not in employment, education, or training (NEET). According to RTB's own data, roughly 84% of youth completing these short courses found jobs within 9 months of graduating.

Source: rtb.gov.rw, allafrica.com (Rwanda: 84% Youth With Vocational Training Get Jobs)
Verified date: 2026-08-19`,
      fileName: "rtb_vocational_training_guide.txt",
      metadata: {
        version: "2026",
        documentType: "training_guide",
        source: "rtb.gov.rw, allafrica.com",
        verifiedDate: "2026-08-19",
      },
    });
    results.push(rtbResult);

    return NextResponse.json({
      message: "Documents seeded successfully",
      documents: results,
    });
  } catch (error) {
    console.error("Seed error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
