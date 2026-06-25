/**
 * Generates the question-bank JSON files under data/questions/class-11 and
 * data/questions/class-12 — one file per chapter. Run with:
 *   npx tsx scripts/generate-questions.ts
 *
 * Each file is an array of MCQs:
 *   { question, options: [4], correctIndex, difficulty, explanation, marks }
 * The chapterId / classOf are derived from the filename at seed time, so files
 * stay small and are trivial to expand by hand later.
 *
 * This ships a curated core set per chapter (real CBSE Accountancy content);
 * extend any file by appending more objects.
 */
import * as fs from "fs";
import * as path from "path";
import { CLASS_11_CHAPTERS, CLASS_12_CHAPTERS } from "../src/lib/chapters";

type Raw = {
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  explanation: string;
  marks?: number;
};

// Curated questions keyed by chapterId.
const BANK: Record<string, Raw[]> = {
  "11-01-introduction": [
    {
      question: "Accounting is often called the:",
      options: ["Language of business", "Science of money", "Art of selling", "Law of trade"],
      correctIndex: 0,
      difficulty: "EASY",
      explanation: "Accounting communicates the financial results and position of a business, hence the 'language of business'.",
    },
    {
      question: "Which of the following is an internal user of accounting information?",
      options: ["Investors", "Tax authorities", "Management", "Creditors"],
      correctIndex: 2,
      difficulty: "EASY",
      explanation: "Management uses accounting information internally for planning and control; the others are external users.",
    },
    {
      question: "Book-keeping is mainly concerned with:",
      options: ["Recording of transactions", "Interpreting results", "Designing reports", "Auditing accounts"],
      correctIndex: 0,
      difficulty: "EASY",
      explanation: "Book-keeping is the recording of financial transactions; analysis and interpretation come later in accounting.",
    },
    {
      question: "The qualitative characteristic that requires accounting information to be free from material error is:",
      options: ["Comparability", "Reliability", "Relevance", "Timeliness"],
      correctIndex: 1,
      difficulty: "MEDIUM",
      explanation: "Reliability means the information is verifiable and free from material error and bias.",
    },
    {
      question: "Which is NOT a sub-field of accounting?",
      options: ["Financial accounting", "Cost accounting", "Management accounting", "Civil accounting"],
      correctIndex: 3,
      difficulty: "MEDIUM",
      explanation: "Civil accounting is not a recognised branch; the recognised ones are financial, cost and management accounting.",
    },
  ],
  "11-02-theory-base": [
    {
      question: "The convention that anticipates no profit but provides for all possible losses is:",
      options: ["Consistency", "Conservatism (Prudence)", "Full disclosure", "Materiality"],
      correctIndex: 1,
      difficulty: "MEDIUM",
      explanation: "Conservatism / prudence records all probable losses but recognises gains only when realised.",
    },
    {
      question: "Under the going concern assumption, a business is assumed to:",
      options: ["Close down soon", "Continue for the foreseeable future", "Sell all assets", "Merge with another"],
      correctIndex: 1,
      difficulty: "EASY",
      explanation: "Going concern assumes the enterprise will continue operating for the foreseeable future.",
    },
    {
      question: "The principle that revenue is recognised when it is earned is the:",
      options: ["Matching principle", "Revenue recognition principle", "Cost principle", "Dual aspect"],
      correctIndex: 1,
      difficulty: "EASY",
      explanation: "Revenue recognition (realisation) recognises revenue when goods/services are transferred, not when cash is received.",
    },
    {
      question: "GST is an example of which type of tax?",
      options: ["Direct tax", "Indirect tax", "Wealth tax", "Capital tax"],
      correctIndex: 1,
      difficulty: "EASY",
      explanation: "GST is an indirect tax levied on the supply of goods and services.",
    },
    {
      question: "The accounting concept that every transaction has two aspects is:",
      options: ["Money measurement", "Dual aspect", "Accrual", "Materiality"],
      correctIndex: 1,
      difficulty: "MEDIUM",
      explanation: "Dual aspect is the foundation of double-entry: every debit has an equal credit.",
    },
  ],
  "11-03-journal": [
    {
      question: "The rule for a personal account is:",
      options: ["Debit what comes in, credit what goes out", "Debit the receiver, credit the giver", "Debit all expenses, credit all incomes", "Debit losses, credit gains"],
      correctIndex: 1,
      difficulty: "EASY",
      explanation: "For personal accounts: debit the receiver, credit the giver.",
    },
    {
      question: "Goods purchased for cash are recorded by debiting:",
      options: ["Cash A/c", "Purchases A/c", "Sales A/c", "Capital A/c"],
      correctIndex: 1,
      difficulty: "EASY",
      explanation: "Purchases A/c is debited (goods come in) and Cash A/c is credited.",
    },
    {
      question: "The book of original entry is the:",
      options: ["Ledger", "Trial balance", "Journal", "Balance sheet"],
      correctIndex: 2,
      difficulty: "EASY",
      explanation: "Transactions are first recorded in the journal, the book of original entry.",
    },
    {
      question: "A short explanation written below each journal entry is called the:",
      options: ["Folio", "Narration", "Voucher", "Ledger"],
      correctIndex: 1,
      difficulty: "MEDIUM",
      explanation: "The narration briefly explains the nature of the transaction.",
    },
    {
      question: "Salary paid in cash is recorded as: debit Salary A/c, credit:",
      options: ["Capital A/c", "Cash A/c", "Bank A/c", "Drawings A/c"],
      correctIndex: 1,
      difficulty: "MEDIUM",
      explanation: "Salary is an expense (debited) and cash goes out (credited).",
    },
  ],
  "11-04-ledger-cashbook": [
    {
      question: "Posting refers to transferring entries from the journal to the:",
      options: ["Trial balance", "Ledger", "Cash book", "Balance sheet"],
      correctIndex: 1,
      difficulty: "EASY",
      explanation: "Posting is the transfer of journal entries to the relevant ledger accounts.",
    },
    {
      question: "A cash book records:",
      options: ["Only credit transactions", "Only cash and bank transactions", "All non-cash transactions", "Only purchases"],
      correctIndex: 1,
      difficulty: "EASY",
      explanation: "The cash book records all cash and bank receipts and payments.",
    },
    {
      question: "A contra entry appears in which type of cash book?",
      options: ["Single column", "Double column (cash & bank)", "Petty cash book", "Sales book"],
      correctIndex: 1,
      difficulty: "MEDIUM",
      explanation: "Contra entries (cash to bank or vice versa) appear in a two/three-column cash book affecting both cash and bank columns.",
    },
    {
      question: "The petty cash book is usually maintained under the:",
      options: ["Imprest system", "Double-entry only", "Single-entry only", "Cost system"],
      correctIndex: 0,
      difficulty: "MEDIUM",
      explanation: "Under the imprest system, the petty cashier is reimbursed for the amount spent, restoring a fixed float.",
    },
    {
      question: "The balance of the cash column of a cash book can be:",
      options: ["Debit or nil", "Always credit", "Credit or nil", "Always debit and never nil"],
      correctIndex: 0,
      difficulty: "HARD",
      explanation: "Cash on hand can never be negative, so the cash column shows a debit balance or nil.",
    },
  ],
  "11-05-brs": [
    {
      question: "A Bank Reconciliation Statement reconciles the cash book balance with the:",
      options: ["Trial balance", "Pass book / bank statement", "Profit & loss account", "Petty cash"],
      correctIndex: 1,
      difficulty: "EASY",
      explanation: "A BRS explains differences between the cash book (bank column) and the pass book balance.",
    },
    {
      question: "A cheque issued but not yet presented for payment causes the pass book balance to be:",
      options: ["Lower than cash book", "Higher than cash book", "Equal to cash book", "Zero"],
      correctIndex: 1,
      difficulty: "MEDIUM",
      explanation: "Until presented, the bank has not deducted it, so the pass book shows a higher balance than the cash book.",
    },
    {
      question: "Bank charges debited by the bank but not recorded in the cash book will make the cash book balance:",
      options: ["Higher than pass book", "Lower than pass book", "Equal", "Negative"],
      correctIndex: 0,
      difficulty: "MEDIUM",
      explanation: "The bank reduced the balance for charges; the cash book hasn't, so the cash book shows a higher balance.",
    },
    {
      question: "Interest allowed by the bank, not yet entered in the cash book, makes the pass book balance:",
      options: ["Lower", "Higher", "Equal", "Nil"],
      correctIndex: 1,
      difficulty: "HARD",
      explanation: "Interest credited by the bank increases the pass book balance relative to the cash book.",
    },
    {
      question: "BRS is prepared by the:",
      options: ["Bank", "Account holder (customer)", "Auditor", "Government"],
      correctIndex: 1,
      difficulty: "EASY",
      explanation: "The account holder prepares the BRS to reconcile their records with the bank's.",
    },
  ],
  "11-06-trial-balance": [
    {
      question: "A trial balance is prepared to check the:",
      options: ["Profit of the business", "Arithmetical accuracy of the ledger", "Cash in hand", "Market value of assets"],
      correctIndex: 1,
      difficulty: "EASY",
      explanation: "A trial balance verifies that total debits equal total credits — the arithmetical accuracy of posting.",
    },
    {
      question: "An error that does NOT affect the trial balance is:",
      options: ["Wrong total of a subsidiary book", "Error of complete omission", "Posting to the wrong side", "Wrong casting of an account"],
      correctIndex: 1,
      difficulty: "MEDIUM",
      explanation: "A complete omission leaves out both debit and credit, so the trial balance still agrees.",
    },
    {
      question: "A suspense account is opened when the trial balance:",
      options: ["Agrees", "Does not agree", "Shows profit", "Shows loss"],
      correctIndex: 1,
      difficulty: "MEDIUM",
      explanation: "When the trial balance does not tally, the difference is temporarily placed in a suspense account.",
    },
    {
      question: "Treating a revenue expenditure as capital expenditure is an error of:",
      options: ["Omission", "Commission", "Principle", "Compensating"],
      correctIndex: 2,
      difficulty: "HARD",
      explanation: "Misclassifying capital and revenue items violates an accounting principle — an error of principle.",
    },
    {
      question: "Closing stock usually appears:",
      options: ["In the trial balance only", "Outside the trial balance (as an adjustment)", "On both sides", "Never"],
      correctIndex: 1,
      difficulty: "MEDIUM",
      explanation: "Closing stock is normally given as an adjustment outside the trial balance.",
    },
  ],
  "11-07-depreciation": [
    {
      question: "Depreciation is charged on:",
      options: ["Current assets", "Fixed (tangible) assets", "Fictitious assets", "Investments"],
      correctIndex: 1,
      difficulty: "EASY",
      explanation: "Depreciation is the systematic allocation of the cost of fixed tangible assets over their useful life.",
    },
    {
      question: "Under the straight-line method, depreciation each year is:",
      options: ["Increasing", "Decreasing", "Constant", "Zero"],
      correctIndex: 2,
      difficulty: "EASY",
      explanation: "SLM charges a fixed, equal amount of depreciation every year.",
    },
    {
      question: "The written-down value method charges depreciation on the:",
      options: ["Original cost", "Book value (reducing balance)", "Scrap value", "Market value"],
      correctIndex: 1,
      difficulty: "MEDIUM",
      explanation: "WDV applies a fixed rate to the diminishing book value, so the charge reduces each year.",
    },
    {
      question: "A reserve is an appropriation of:",
      options: ["Capital", "Profit", "Liabilities", "Assets"],
      correctIndex: 1,
      difficulty: "MEDIUM",
      explanation: "A reserve is created out of profits to strengthen the financial position of the business.",
    },
    {
      question: "Provision for doubtful debts is created in anticipation of:",
      options: ["Bad debts", "Extra profit", "Tax refund", "Asset sale"],
      correctIndex: 0,
      difficulty: "HARD",
      explanation: "It is a charge against profit to cover debts that may become irrecoverable.",
    },
  ],
  "11-08-bills-of-exchange": [
    {
      question: "The person who draws a bill of exchange is the:",
      options: ["Drawee", "Drawer", "Payee", "Endorsee"],
      correctIndex: 1,
      difficulty: "EASY",
      explanation: "The drawer is the maker (creditor) who draws the bill on the debtor (drawee).",
    },
    {
      question: "The period of three extra days added to the due date of a bill is called:",
      options: ["Grace days", "Maturity gap", "Holiday", "Tenure"],
      correctIndex: 0,
      difficulty: "MEDIUM",
      explanation: "Three days of grace are added to determine the legal date of maturity.",
    },
    {
      question: "Discounting a bill with the bank means:",
      options: ["Cancelling it", "Encashing it before maturity at a deduction", "Endorsing it", "Renewing it"],
      correctIndex: 1,
      difficulty: "MEDIUM",
      explanation: "Discounting converts the bill into cash before maturity; the bank deducts a discount charge.",
    },
    {
      question: "Noting charges are incurred when a bill is:",
      options: ["Accepted", "Discounted", "Dishonoured", "Endorsed"],
      correctIndex: 2,
      difficulty: "HARD",
      explanation: "On dishonour, the bill may be noted by a notary public; the noting charges are borne ultimately by the drawee.",
    },
    {
      question: "Acceptance of a bill makes the drawee:",
      options: ["A creditor", "Liable to pay on maturity", "A guarantor only", "Free from liability"],
      correctIndex: 1,
      difficulty: "EASY",
      explanation: "By accepting, the drawee agrees to pay the amount on the due date.",
    },
  ],
  "11-09-financial-statements-1": [
    {
      question: "Gross profit is the difference between net sales and:",
      options: ["Operating expenses", "Cost of goods sold", "Net profit", "Capital"],
      correctIndex: 1,
      difficulty: "EASY",
      explanation: "Gross profit = Net sales − Cost of goods sold.",
    },
    {
      question: "Which account is prepared to ascertain net profit?",
      options: ["Trading account", "Profit & loss account", "Balance sheet", "Cash book"],
      correctIndex: 1,
      difficulty: "EASY",
      explanation: "Net profit is found in the profit & loss account after charging indirect expenses.",
    },
    {
      question: "A balance sheet shows the financial position as on a:",
      options: ["Particular date", "Period of time", "Future date", "Range of dates"],
      correctIndex: 0,
      difficulty: "EASY",
      explanation: "A balance sheet is a statement of assets and liabilities at a particular point in time.",
    },
    {
      question: "Carriage inwards is shown in the:",
      options: ["Trading account (debit)", "P&L account (credit)", "Balance sheet asset side", "Capital account"],
      correctIndex: 0,
      difficulty: "MEDIUM",
      explanation: "Carriage inwards is a direct expense and is debited in the trading account.",
    },
    {
      question: "Assets are usually arranged in a balance sheet in order of:",
      options: ["Cost", "Liquidity or permanence", "Alphabet", "Size"],
      correctIndex: 1,
      difficulty: "MEDIUM",
      explanation: "Assets may be listed in order of liquidity or permanence.",
    },
  ],
  "11-10-financial-statements-2": [
    {
      question: "Outstanding expenses are added to the related expense and shown as a:",
      options: ["Current asset", "Current liability", "Fixed asset", "Income"],
      correctIndex: 1,
      difficulty: "MEDIUM",
      explanation: "Outstanding (unpaid) expenses are a liability at the balance sheet date.",
    },
    {
      question: "Prepaid insurance is shown in the balance sheet as a:",
      options: ["Liability", "Current asset", "Capital", "Expense"],
      correctIndex: 1,
      difficulty: "MEDIUM",
      explanation: "Prepaid expenses are an asset because the benefit relates to a future period.",
    },
    {
      question: "Depreciation given in adjustments is:",
      options: ["Credited to P&L only", "Debited to P&L and deducted from the asset", "Added to the asset", "Ignored"],
      correctIndex: 1,
      difficulty: "HARD",
      explanation: "Depreciation is charged to P&L and reduces the book value of the asset in the balance sheet.",
    },
    {
      question: "Interest on capital is treated as:",
      options: ["An income of the business", "An expense (charge against profit)", "An asset", "A liability of the owner"],
      correctIndex: 1,
      difficulty: "MEDIUM",
      explanation: "Interest on capital is a business expense and is also added to the owner's capital.",
    },
    {
      question: "Closing stock appearing as an adjustment is shown:",
      options: ["Only in the trading account", "Credit of trading account and asset in balance sheet", "Only in balance sheet", "In P&L only"],
      correctIndex: 1,
      difficulty: "MEDIUM",
      explanation: "Closing stock is credited in the trading account and appears as a current asset.",
    },
  ],
  "11-11-incomplete-records": [
    {
      question: "Accounts from incomplete records are commonly called the:",
      options: ["Double-entry system", "Single-entry system", "Cost system", "Mercantile system"],
      correctIndex: 1,
      difficulty: "EASY",
      explanation: "Incomplete records / single-entry maintain only some accounts, typically cash and personal accounts.",
    },
    {
      question: "Under the statement of affairs method, profit is found by comparing:",
      options: ["Opening and closing capital", "Sales and purchases", "Assets and sales", "Cash and bank"],
      correctIndex: 0,
      difficulty: "MEDIUM",
      explanation: "Profit = Closing capital − Opening capital (+ drawings − additional capital).",
    },
    {
      question: "A statement of affairs is similar to a:",
      options: ["Trial balance", "Balance sheet", "Trading account", "Journal"],
      correctIndex: 1,
      difficulty: "MEDIUM",
      explanation: "It lists assets and liabilities to estimate capital, much like a balance sheet.",
    },
    {
      question: "Additional capital introduced during the year is _____ when computing profit:",
      options: ["Added to closing capital", "Deducted from closing capital", "Ignored", "Added to drawings"],
      correctIndex: 1,
      difficulty: "HARD",
      explanation: "Additional capital must be deducted to avoid overstating profit.",
    },
    {
      question: "Incomplete records are generally maintained by:",
      options: ["Large companies", "Small sole traders", "Banks", "Governments"],
      correctIndex: 1,
      difficulty: "EASY",
      explanation: "Small sole traders and partnerships often keep incomplete records due to limited resources.",
    },
  ],
  "11-12-computers-accounting": [
    {
      question: "Which is a component of a computer system?",
      options: ["Hardware", "Goodwill", "Capital", "Depreciation"],
      correctIndex: 0,
      difficulty: "EASY",
      explanation: "Hardware is a physical component of a computer system.",
    },
    {
      question: "In a computerised system, data is stored in a:",
      options: ["Ledger book", "Database", "Journal book", "File cabinet"],
      correctIndex: 1,
      difficulty: "EASY",
      explanation: "A database stores and manages the accounting data electronically.",
    },
    {
      question: "An advantage of computerised accounting over manual accounting is:",
      options: ["Higher arithmetic errors", "Speed and accuracy", "More paperwork", "Slower reporting"],
      correctIndex: 1,
      difficulty: "MEDIUM",
      explanation: "Computers process large volumes quickly and accurately.",
    },
    {
      question: "MIS in accounting stands for:",
      options: ["Money Information System", "Management Information System", "Manual Input System", "Market Indexing System"],
      correctIndex: 1,
      difficulty: "MEDIUM",
      explanation: "MIS = Management Information System, providing information for decision-making.",
    },
    {
      question: "A limitation of computerised accounting is:",
      options: ["Speed", "Cost of installation and training", "Accuracy", "Storage capacity"],
      correctIndex: 1,
      difficulty: "HARD",
      explanation: "High initial cost of hardware, software and training is a limitation.",
    },
  ],
  "11-13-computerised-accounting": [
    {
      question: "Readymade accounting software is suitable for:",
      options: ["Very large specialised firms", "Small organisations with standard needs", "Banks only", "Governments only"],
      correctIndex: 1,
      difficulty: "MEDIUM",
      explanation: "Readymade software fits small businesses whose requirements are common and standard.",
    },
    {
      question: "Tally is an example of:",
      options: ["Operating system", "Accounting software", "Spreadsheet", "Web browser"],
      correctIndex: 1,
      difficulty: "EASY",
      explanation: "Tally is widely used accounting software.",
    },
    {
      question: "Grouping of accounts in computerised accounting is done through:",
      options: ["Vouchers", "Ledgers and groups", "Narrations", "Folios"],
      correctIndex: 1,
      difficulty: "MEDIUM",
      explanation: "Accounts are organised into groups/ledgers for classification and reporting.",
    },
    {
      question: "Customised software is generally:",
      options: ["Cheaper than readymade", "Developed to meet specific user needs", "Free", "Standard for all"],
      correctIndex: 1,
      difficulty: "HARD",
      explanation: "Customised software is tailored to the specific requirements of the organisation.",
    },
    {
      question: "A voucher in accounting software is used to:",
      options: ["Print reports", "Record a transaction", "Backup data", "Format the screen"],
      correctIndex: 1,
      difficulty: "EASY",
      explanation: "Vouchers are used to enter and record transactions.",
    },
  ],

  // ---------------- CLASS 12 ----------------
  "12-01-partnership-basics": [
    {
      question: "In the absence of a partnership deed, profits are shared:",
      options: ["In capital ratio", "Equally", "By seniority", "As decided by court"],
      correctIndex: 1,
      difficulty: "EASY",
      explanation: "Without a deed, the Partnership Act requires profits to be shared equally.",
    },
    {
      question: "In the absence of an agreement, interest on a partner's loan to the firm is:",
      options: ["0%", "6% p.a.", "10% p.a.", "12% p.a."],
      correctIndex: 1,
      difficulty: "MEDIUM",
      explanation: "The Act allows interest on a partner's loan at 6% p.a. when the deed is silent.",
    },
    {
      question: "Interest on capital, when allowed, is:",
      options: ["A charge against profit always", "An appropriation of profit", "An asset", "Income of the firm"],
      correctIndex: 1,
      difficulty: "MEDIUM",
      explanation: "Interest on capital is generally an appropriation of profit unless the deed treats it as a charge.",
    },
    {
      question: "The Profit & Loss Appropriation Account is prepared to:",
      options: ["Find gross profit", "Distribute net profit among partners", "Record purchases", "Compute depreciation"],
      correctIndex: 1,
      difficulty: "EASY",
      explanation: "It shows how net profit is appropriated — salary, interest on capital, share of profit, etc.",
    },
    {
      question: "When capitals are fixed, the current account records:",
      options: ["Only fresh capital", "Drawings, interest, salary and share of profit", "Only losses", "Nothing"],
      correctIndex: 1,
      difficulty: "HARD",
      explanation: "Under fixed capitals, all adjustments go through the current account, leaving capital unchanged.",
    },
  ],
  "12-02-change-psr": [
    {
      question: "On a change in profit-sharing ratio, the gaining partner compensates the:",
      options: ["Bank", "Sacrificing partner", "Government", "Creditors"],
      correctIndex: 1,
      difficulty: "MEDIUM",
      explanation: "The gaining partner compensates the sacrificing partner, usually for goodwill.",
    },
    {
      question: "Sacrificing ratio = ",
      options: ["New ratio − Old ratio", "Old ratio − New ratio", "Old ratio + New ratio", "New ratio × Old ratio"],
      correctIndex: 1,
      difficulty: "MEDIUM",
      explanation: "Sacrificing ratio = Old share − New share.",
    },
    {
      question: "Accumulated profits on change of ratio are distributed in the:",
      options: ["New ratio", "Old ratio", "Gaining ratio", "Equal ratio"],
      correctIndex: 1,
      difficulty: "HARD",
      explanation: "Reserves and accumulated profits belong to the period before the change, so they go in the old ratio.",
    },
    {
      question: "A change in PSR is a form of:",
      options: ["Dissolution", "Reconstitution of partnership", "Amalgamation", "Liquidation"],
      correctIndex: 1,
      difficulty: "EASY",
      explanation: "Any change in the relationship among existing partners reconstitutes the firm.",
    },
    {
      question: "Revaluation of assets on change of ratio is recorded in the:",
      options: ["Trading account", "Revaluation account", "Bank account", "Drawings account"],
      correctIndex: 1,
      difficulty: "MEDIUM",
      explanation: "Gains/losses on revaluation are recorded in the revaluation account and shared in the old ratio.",
    },
  ],
  "12-03-admission": [
    {
      question: "On admission, a new partner brings in capital and usually:",
      options: ["Goodwill / premium", "Drawings", "Loans only", "Nothing"],
      correctIndex: 0,
      difficulty: "EASY",
      explanation: "A new partner typically brings capital and a share of goodwill (premium for goodwill).",
    },
    {
      question: "Sacrificing ratio is calculated on admission to determine:",
      options: ["New capital", "Share of goodwill given up by old partners", "Bank balance", "Drawings"],
      correctIndex: 1,
      difficulty: "MEDIUM",
      explanation: "Old partners sacrifice part of their share; goodwill is shared in the sacrificing ratio.",
    },
    {
      question: "Premium for goodwill brought in by a new partner is shared by old partners in their:",
      options: ["Old ratio", "New ratio", "Sacrificing ratio", "Capital ratio"],
      correctIndex: 2,
      difficulty: "HARD",
      explanation: "Goodwill premium compensates the sacrifice, so it is divided in the sacrificing ratio.",
    },
    {
      question: "General reserve existing at admission is distributed among old partners in the:",
      options: ["New ratio", "Old ratio", "Gaining ratio", "Sacrificing ratio"],
      correctIndex: 1,
      difficulty: "MEDIUM",
      explanation: "Pre-existing reserves belong to old partners and are shared in the old ratio.",
    },
    {
      question: "Revaluation Account is also known as the:",
      options: ["Realisation Account", "Profit and Loss Adjustment Account", "Memorandum Account", "Suspense Account"],
      correctIndex: 1,
      difficulty: "MEDIUM",
      explanation: "Revaluation Account is also called the Profit and Loss Adjustment Account.",
    },
  ],
  "12-04-retirement-death": [
    {
      question: "On retirement, the outgoing partner's share is acquired by the:",
      options: ["Bank", "Remaining (continuing) partners", "New partner only", "Creditors"],
      correctIndex: 1,
      difficulty: "EASY",
      explanation: "The continuing partners take over the retiring partner's share, hence a gaining ratio is computed.",
    },
    {
      question: "Gaining ratio = ",
      options: ["Old ratio − New ratio", "New ratio − Old ratio", "Old + New", "Equal"],
      correctIndex: 1,
      difficulty: "MEDIUM",
      explanation: "Gaining ratio = New share − Old share of the continuing partners.",
    },
    {
      question: "On the death of a partner, his share of profit till the date of death is usually based on:",
      options: ["Last year's balance sheet", "Time or sales basis", "Bank balance", "Drawings"],
      correctIndex: 1,
      difficulty: "HARD",
      explanation: "The deceased's profit share is estimated on a time basis or sales basis as per the deed.",
    },
    {
      question: "The amount due to a retiring partner, if not paid, is transferred to his:",
      options: ["Capital account only", "Loan account", "Drawings account", "Reserve"],
      correctIndex: 1,
      difficulty: "MEDIUM",
      explanation: "Unpaid balance is transferred to the retiring partner's loan account and carries interest.",
    },
    {
      question: "Goodwill of the retiring partner is borne by continuing partners in their:",
      options: ["Old ratio", "Gaining ratio", "Sacrificing ratio", "Capital ratio"],
      correctIndex: 1,
      difficulty: "MEDIUM",
      explanation: "Continuing partners compensate the retiring partner for goodwill in the gaining ratio.",
    },
  ],
  "12-05-dissolution": [
    {
      question: "On dissolution, all assets and liabilities are transferred to the:",
      options: ["Revaluation account", "Realisation account", "Capital account", "Bank account"],
      correctIndex: 1,
      difficulty: "EASY",
      explanation: "A Realisation Account is opened to record the sale of assets and settlement of liabilities.",
    },
    {
      question: "Profit or loss on realisation is shared by partners in their:",
      options: ["Capital ratio", "Profit-sharing ratio", "Gaining ratio", "Equally always"],
      correctIndex: 1,
      difficulty: "MEDIUM",
      explanation: "Realisation profit/loss is divided in the profit-sharing ratio.",
    },
    {
      question: "Garner v. Murray rule applies when a partner's capital account shows a:",
      options: ["Credit balance", "Deficiency (debit) and he is insolvent", "Nil balance", "Loan"],
      correctIndex: 1,
      difficulty: "HARD",
      explanation: "The rule deals with how an insolvent partner's deficiency is borne by solvent partners (in capital ratio).",
    },
    {
      question: "In the order of payment on dissolution, outside creditors are paid:",
      options: ["Last", "Before partners' loans and capital", "After capital", "Never"],
      correctIndex: 1,
      difficulty: "MEDIUM",
      explanation: "External liabilities are settled first, then partners' loans, then capitals.",
    },
    {
      question: "Realisation expenses are usually debited to the:",
      options: ["Capital account", "Realisation account", "Bank account", "P&L account"],
      correctIndex: 1,
      difficulty: "MEDIUM",
      explanation: "Expenses of realisation are charged to the realisation account.",
    },
  ],
  "12-06-share-capital": [
    {
      question: "The portion of authorised capital offered to the public is the:",
      options: ["Issued capital", "Reserve capital", "Paid-up capital", "Called-up capital"],
      correctIndex: 0,
      difficulty: "EASY",
      explanation: "Issued capital is the part of authorised capital offered for subscription.",
    },
    {
      question: "When shares are issued at a price above face value, the excess is credited to:",
      options: ["Capital reserve", "Securities premium", "General reserve", "P&L"],
      correctIndex: 1,
      difficulty: "MEDIUM",
      explanation: "The premium on issue is credited to the Securities Premium account.",
    },
    {
      question: "Forfeiture of shares results in:",
      options: ["Refund of full money", "Cancellation of shares for non-payment of calls", "Bonus issue", "Buy-back"],
      correctIndex: 1,
      difficulty: "MEDIUM",
      explanation: "Shares are forfeited when the allottee fails to pay calls; previously received amount is retained.",
    },
    {
      question: "Securities premium can be used for:",
      options: ["Paying dividends", "Issuing fully paid bonus shares", "Paying salaries", "Buying stock"],
      correctIndex: 1,
      difficulty: "HARD",
      explanation: "Section 52 permits using securities premium for bonus shares, writing off preliminary expenses, etc.",
    },
    {
      question: "When applications exceed shares offered, the situation is called:",
      options: ["Under-subscription", "Over-subscription", "Forfeiture", "Calls in arrears"],
      correctIndex: 1,
      difficulty: "EASY",
      explanation: "Over-subscription occurs when applications received exceed the number of shares issued.",
    },
  ],
  "12-07-debentures": [
    {
      question: "A debenture is a:",
      options: ["Share of ownership", "Acknowledgement of debt", "Type of reserve", "Bank account"],
      correctIndex: 1,
      difficulty: "EASY",
      explanation: "A debenture is a written acknowledgement of debt issued by a company, usually carrying fixed interest.",
    },
    {
      question: "Interest on debentures is a:",
      options: ["Appropriation of profit", "Charge against profit", "Dividend", "Reserve"],
      correctIndex: 1,
      difficulty: "MEDIUM",
      explanation: "Debenture interest is a charge against profit and is payable whether or not the company earns profit.",
    },
    {
      question: "Loss on issue of debentures is a:",
      options: ["Capital profit", "Capital loss to be written off", "Revenue income", "Reserve"],
      correctIndex: 1,
      difficulty: "HARD",
      explanation: "Loss on issue (e.g., issued at discount/redeemable at premium) is a capital loss written off over time.",
    },
    {
      question: "Debentures issued as collateral security are:",
      options: ["Always recorded as a liability", "A secondary/supporting security for a loan", "Equity shares", "Bonus shares"],
      correctIndex: 1,
      difficulty: "MEDIUM",
      explanation: "Collateral debentures act as additional security and become enforceable only if the main loan defaults.",
    },
    {
      question: "Debenture holders are:",
      options: ["Owners of the company", "Creditors of the company", "Employees", "Promoters"],
      correctIndex: 1,
      difficulty: "EASY",
      explanation: "Debenture holders are creditors, not owners, and have no voting rights.",
    },
  ],
  "12-08-company-financial-statements": [
    {
      question: "The format of a company balance sheet is prescribed by:",
      options: ["Schedule III of the Companies Act, 2013", "Income Tax Act", "RBI Act", "SEBI only"],
      correctIndex: 0,
      difficulty: "MEDIUM",
      explanation: "Schedule III prescribes the vertical format for the company balance sheet and statement of P&L.",
    },
    {
      question: "Under Schedule III, 'Share Capital' is shown under:",
      options: ["Current liabilities", "Shareholders' funds (Equity & Liabilities)", "Non-current assets", "Current assets"],
      correctIndex: 1,
      difficulty: "MEDIUM",
      explanation: "Share capital appears under Shareholders' Funds on the Equity and Liabilities side.",
    },
    {
      question: "Trade payables are classified as:",
      options: ["Non-current assets", "Current liabilities", "Reserves", "Fixed assets"],
      correctIndex: 1,
      difficulty: "EASY",
      explanation: "Trade payables (creditors) are current liabilities.",
    },
    {
      question: "Goodwill in a company balance sheet is shown under:",
      options: ["Current assets", "Non-current assets (intangible)", "Reserves", "Current liabilities"],
      correctIndex: 1,
      difficulty: "HARD",
      explanation: "Goodwill is an intangible asset under non-current assets.",
    },
    {
      question: "The company balance sheet is prepared in a:",
      options: ["Horizontal format", "Vertical format", "T-format", "Circular format"],
      correctIndex: 1,
      difficulty: "EASY",
      explanation: "Schedule III prescribes a vertical (statement) format.",
    },
  ],
  "12-09-analysis-financial-statements": [
    {
      question: "Comparative statements show data for:",
      options: ["One year only", "Two or more years for comparison", "Competitors", "The future"],
      correctIndex: 1,
      difficulty: "EASY",
      explanation: "Comparative statements present figures for two or more periods side by side.",
    },
    {
      question: "In a common-size income statement, each item is expressed as a percentage of:",
      options: ["Total assets", "Net sales (revenue from operations)", "Capital", "Net profit"],
      correctIndex: 1,
      difficulty: "MEDIUM",
      explanation: "Common-size income statements express items as a percentage of revenue from operations.",
    },
    {
      question: "Horizontal analysis is another name for:",
      options: ["Common-size analysis", "Comparative (trend) analysis", "Ratio analysis", "Cash flow"],
      correctIndex: 1,
      difficulty: "MEDIUM",
      explanation: "Horizontal analysis compares figures across periods — i.e., comparative/trend analysis.",
    },
    {
      question: "A limitation of financial statement analysis is that it:",
      options: ["Ignores qualitative factors", "Is always accurate", "Predicts the future perfectly", "Requires no judgement"],
      correctIndex: 0,
      difficulty: "HARD",
      explanation: "Analysis is based on historical monetary data and ignores qualitative/non-monetary factors.",
    },
    {
      question: "Common-size balance sheet expresses each item as a percentage of:",
      options: ["Net sales", "Total of balance sheet", "Net profit", "Capital"],
      correctIndex: 1,
      difficulty: "MEDIUM",
      explanation: "In a common-size balance sheet, items are shown as a percentage of total assets / total of the balance sheet.",
    },
  ],
  "12-10-accounting-ratios": [
    {
      question: "Current ratio = Current assets / ",
      options: ["Current liabilities", "Total assets", "Sales", "Capital"],
      correctIndex: 0,
      difficulty: "EASY",
      explanation: "Current ratio = Current Assets ÷ Current Liabilities.",
    },
    {
      question: "The ideal current ratio is generally considered to be:",
      options: ["1:1", "2:1", "3:2", "1:2"],
      correctIndex: 1,
      difficulty: "MEDIUM",
      explanation: "A current ratio of 2:1 is conventionally treated as satisfactory.",
    },
    {
      question: "Quick ratio excludes which item from current assets?",
      options: ["Debtors", "Cash", "Inventory and prepaid expenses", "Bank"],
      correctIndex: 2,
      difficulty: "MEDIUM",
      explanation: "Quick (liquid) assets exclude inventory and prepaid expenses, which are less liquid.",
    },
    {
      question: "Debt-equity ratio measures:",
      options: ["Liquidity", "Long-term solvency", "Profitability", "Efficiency"],
      correctIndex: 1,
      difficulty: "HARD",
      explanation: "Debt-equity compares long-term debt to shareholders' funds — a solvency measure.",
    },
    {
      question: "Gross profit ratio is calculated as (Gross profit / Net sales) ×",
      options: ["10", "100", "1000", "1"],
      correctIndex: 1,
      difficulty: "EASY",
      explanation: "Gross profit ratio = (Gross Profit ÷ Net Sales) × 100.",
    },
  ],
  "12-11-cash-flow": [
    {
      question: "A cash flow statement is prepared as per:",
      options: ["AS-3 / Ind AS-7", "AS-10", "AS-2", "AS-6"],
      correctIndex: 0,
      difficulty: "MEDIUM",
      explanation: "Cash flow statements follow AS-3 (Revised) / Ind AS-7.",
    },
    {
      question: "Purchase of fixed assets is an example of:",
      options: ["Operating activity", "Investing activity", "Financing activity", "Cash equivalent"],
      correctIndex: 1,
      difficulty: "MEDIUM",
      explanation: "Buying/selling long-term assets is an investing activity.",
    },
    {
      question: "Issue of shares for cash is classified under:",
      options: ["Operating activities", "Investing activities", "Financing activities", "None"],
      correctIndex: 2,
      difficulty: "MEDIUM",
      explanation: "Raising funds from owners/lenders is a financing activity.",
    },
    {
      question: "Under the indirect method, depreciation is _____ to net profit:",
      options: ["Subtracted", "Added back", "Ignored", "Multiplied"],
      correctIndex: 1,
      difficulty: "HARD",
      explanation: "Depreciation is a non-cash expense, so it is added back to net profit under the indirect method.",
    },
    {
      question: "Cash and cash equivalents include:",
      options: ["Fixed deposits over 1 year", "Cash, bank and short-term highly liquid investments", "Land", "Goodwill"],
      correctIndex: 1,
      difficulty: "EASY",
      explanation: "Cash equivalents are short-term, highly liquid investments readily convertible to known cash amounts.",
    },
  ],
};

function writeFiles() {
  for (const ch of [...CLASS_11_CHAPTERS, ...CLASS_12_CHAPTERS]) {
    const dir = path.join(
      process.cwd(),
      "data",
      "questions",
      ch.classOf === 11 ? "class-11" : "class-12"
    );
    fs.mkdirSync(dir, { recursive: true });
    const items = BANK[ch.id] ?? [];
    const file = path.join(dir, `${ch.id}.json`);
    fs.writeFileSync(file, JSON.stringify(items, null, 2) + "\n", "utf-8");
    // eslint-disable-next-line no-console
    console.log(`wrote ${items.length} → ${file}`);
  }
}

writeFiles();
