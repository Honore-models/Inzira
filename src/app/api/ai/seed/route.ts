// ============================================================
// POST /api/ai/seed
// Seeds the RAG system with initial verified documents
// for the Inzira prototype (RDB, RRA, BDF, RTB)
// ============================================================

import { NextResponse } from "next/server";
import { ingestDocument } from "@/lib/ai/ingestion";

export async function POST() {
  try {
    const results = [];

    // 1. RDB - Business Registration Guide
    const rdbResult = await ingestDocument({
      title: "Business Registration Guide",
      institution: "RDB",
      description:
        "Complete guide to registering a business name with the Rwanda Development Board",
      text: `BUSINESS NAME REGISTRATION WITH RDB

The Rwanda Development Board (RDB) is the national agency responsible for business registration, investment promotion, and private sector development.

WHO CAN REGISTER:
Any Rwandan citizen aged 18 or above can register a business name. Foreign investors can also register through RDB with additional requirements.

REQUIRED DOCUMENTS:
1. National ID (original and copy)
2. Three business name options in order of preference
3. Physical address of the business
4. Phone number and/or email address
5. Description of business activity

REGISTRATION PROCESS:
Step 1: Visit the nearest RDB office or use the RDB e-services portal online at rdb.rw
Step 2: Fill out the business name reservation form
Step 3: Pay the reservation fee (business name reservation is FREE)
Step 4: Wait for name approval (usually 1-3 business days)
Step 5: Complete full registration and receive your registration certificate

FEES:
- Business name reservation: FREE
- Business name registration: FREE
- License fees vary by business activity type

TIMELINE:
- Name reservation: 1-3 business days
- Full registration: 1-5 business days after name approval

LOCATIONS:
- RDB Main Office: Kigali City Tower, Avenue du Travail, Kigali
- Phone: +250 788 185 400
- Email: info@rdb.rw
- Hours: Monday - Friday, 8:00 AM - 5:00 PM
- Online portal: rdb.rw

IMPORTANT NOTES:
- You can register online through the RDB e-services portal
- Some district offices have RDB agents who can assist
- After registration, you will need a TIN from RRA for tax purposes
- Certain business activities require additional licenses from relevant ministries`,
      fileName: "rdb_business_registration_guide.txt",
      metadata: {
        version: "2024",
        documentType: "registration_guide",
      },
    });
    results.push(rdbResult);

    // 2. RRA - TIN Registration Guide
    const rraResult = await ingestDocument({
      title: "TIN Registration Requirements",
      institution: "RRA",
      description:
        "Guide to obtaining a Tax Identification Number from the Rwanda Revenue Authority",
      text: `TAX IDENTIFICATION NUMBER (TIN) REGISTRATION

The Rwanda Revenue Authority (RRA) is the national tax administration. It issues Tax Identification Numbers (TINs) which are mandatory for doing business in Rwanda.

WHAT IS A TIN:
A Tax Identification Number (TIN) is a unique identification number assigned to taxpayers by RRA. It is required for:
- Opening a business bank account
- Filing tax returns
- Importing and exporting goods
- Applying for government contracts
- Any business transaction requiring tax compliance

WHO NEEDS A TIN:
- All registered businesses
- Self-employed individuals
- Employees earning above the tax threshold
- Anyone conducting taxable transactions

REQUIRED DOCUMENTS:
1. National ID (original and copy)
2. Business registration certificate (if applicable)
3. Completed TIN application form (available at RRA offices)
4. Passport-size photo

REGISTRATION PROCESS:
Step 1: Visit any RRA office or use the online portal at rra.gov.rw
Step 2: Fill out the TIN application form
Step 3: Submit required documents
Step 4: Receive your TIN (same day for in-person, 1-2 days online)

FEES:
- TIN registration: FREE

LOCATIONS:
- RRA Headquarters: Boulevard de l'Umuganda, Kigali
- Phone: +250 788 180 000
- Email: info@rra.gov.rw
- Hours: Monday - Friday, 7:00 AM - 6:00 PM
- Online portal: rra.gov.rw

IMPORTANT NOTES:
- TIN is FREE to obtain
- You need a TIN before opening a business bank account
- Keep your TIN safe - it is used for all tax filings
- Update your information with RRA if your business details change
- Annual tax filing is mandatory once registered`,
      fileName: "rra_tin_registration_guide.txt",
      metadata: {
        version: "2024",
        documentType: "tax_registration",
      },
    });
    results.push(rraResult);

    // 3. BDF - Loan Guarantee Program
    const bdfResult = await ingestDocument({
      title: "Business Development Fund Loan Guarantee Program",
      institution: "BDF",
      description:
        "Guide to BDF loan guarantees for youth and small businesses",
      text: `BDF LOAN GUARANTEE PROGRAM FOR YOUTH AND SMALL BUSINESSES

The Business Development Fund (BDF) provides loan guarantees and affordable financing to small businesses and young entrepreneurs who may not qualify for traditional bank loans.

WHAT IS BDF:
BDF is a government fund that guarantees loans from commercial banks, making it easier for small businesses and youth entrepreneurs to access financing.

WHO IS ELIGIBLE:
- Rwandan youth aged 18-35
- Small and medium enterprises (SMEs)
- Startups with a viable business plan
- Existing businesses seeking growth capital
- Women entrepreneurs (priority category)

ELIGIBILITY REQUIREMENTS:
1. Must be a Rwandan citizen aged 18-35 for youth category
2. Must have a registered business (RDB registration required)
3. Must have a valid TIN from RRA
4. Must have a viable business plan
5. Must open a business bank account
6. Must demonstrate ability to repay (income projections or collateral)

REQUIRED DOCUMENTS:
1. National ID
2. Business registration certificate from RDB
3. Tax Identification Number (TIN) from RRA
4. Business plan or proposal
5. Bank statements (if existing business)
6. Quotations for equipment or supplies (if applicable)
7. District local government endorsement letter

LOAN GUARANTEE PROCESS:
Step 1: Ensure you have RDB registration and TIN
Step 2: Prepare your business plan
Step 3: Visit a BDF office or partner bank
Step 4: Submit your application with required documents
Step 5: BDF reviews your application (2-4 weeks)
Step 6: If approved, BDF guarantees your loan with a commercial bank
Step 7: Receive your loan from the partner bank

LOAN DETAILS:
- Maximum guarantee: Up to RWF 10,000,000
- Guarantee coverage: Up to 80% of the loan
- Interest rate: Subsidized rates (lower than commercial rates)
- Repayment period: Up to 5 years depending on the loan

LOCATIONS:
- BDF Main Office: KK 15 Rd, Kigali
- Phone: +250 788 180 300
- Email: info@bdf.rw
- Hours: Monday - Friday, 8:00 AM - 5:00 PM

IMPORTANT NOTES:
- You must have your business registered with RDB BEFORE applying
- You must have a TIN from RRA BEFORE applying
- You must open a business bank account BEFORE receiving the loan
- BDF provides free business advisory services
- Visit a BDF advisor before submitting your application for guidance
- The process takes 2-4 weeks from submission to disbursement`,
      fileName: "bdf_loan_guarantee_guide.txt",
      metadata: {
        version: "2024",
        documentType: "financing_guide",
      },
    });
    results.push(bdfResult);

    // 4. RTB - TVET Training Programs
    const rtbResult = await ingestDocument({
      title: "TVET Vocational Training Programs",
      institution: "RTB",
      description:
        "Guide to vocational training programs and skills certification from RTB/TVET Rwanda",
      text: `TVET VOCATIONAL TRAINING PROGRAMS

RTB / TVET Rwanda coordinates technical and vocational education and training across Rwanda. It connects young people to skills programs, national certificates, and work-based learning opportunities.

WHAT IS TVET:
Technical and Vocational Education and Training (TVET) provides practical skills for employment. Programs focus on hands-on learning in trades like carpentry, tailoring, electronics, agriculture, and more.

WHO CAN ENROLL:
- Rwandan youth aged 16 and above
- Adults seeking new skills or career changes
- Anyone without formal education requirements for university
- People with disabilities (special programs available)

AVAILABLE TRAINING AREAS:
1. Construction and building trades
2. Textile and garment making
3. Agriculture and agri-processing
4. Information and communication technology
5. Electrical and electronics
6. Automotive mechanics
7. Hospitality and tourism
8. Hairdressing and beauty
9. Food processing and nutrition
10. Renewable energy installation

ENROLLMENT REQUIREMENTS:
1. National ID
2. Primary or secondary school certificate (varies by program)
3. Age 16+ for most programs
4. Some programs have specific prerequisites
5. Application form (available at TVET centers)

TRAINING DURATION:
- Short courses: 3-6 months
- Certificate programs: 1-2 years
- Diploma programs: 2-3 years

FEES:
- Government-funded programs: Subsidized or FREE for eligible youth
- Some programs require materials fee (varies by trade)
- Financial aid available for qualifying students

CERTIFICATION:
- National TVET certificates are recognized by employers
- Competency-based assessment system
- Certificates issued by RTB
- International recognition through mutual agreements

LOCATIONS:
- TVET Headquarters: Kigali
- Regional TVET centers in all provinces
- District-level training centers
- Phone: +250 788 305 100
- Email: info@rtb.rw
- Hours: Monday - Friday, 7:30 AM - 5:00 PM

HOW TO APPLY:
Step 1: Visit your nearest TVET center or regional office
Step 2: Speak with a career guidance counselor
Step 3: Choose a program that matches your interests and goals
Step 4: Complete the application form
Step 5: Submit required documents
Step 6: Attend orientation and start training

IMPORTANT NOTES:
- TVET programs lead to direct employment or self-employment
- Many graduates start their own businesses
- Industry partnerships provide internship opportunities
- Evening and weekend classes available in some centers
- Contact your local TVET center for current program availability`,
      fileName: "rtb_vocational_training_guide.txt",
      metadata: {
        version: "2024",
        documentType: "training_guide",
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
