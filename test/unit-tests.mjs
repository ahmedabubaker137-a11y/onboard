import { test, describe } from "node:test";
import assert from "node:assert";
import crypto from "node:crypto";

describe("OnboardX Cryptographic Engine (AES-256-GCM & SHA-256)", () => {
  const ALGORITHM = "aes-256-gcm";
  const IV_LENGTH = 12;
  const AUTH_TAG_LENGTH = 16;
  const SECRET_KEY = crypto.createHash("sha256").update("test-pii-secret-key-enterprise-2026").digest();

  function encrypt(text) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv, { authTagLength: AUTH_TAG_LENGTH });
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    const authTag = cipher.getAuthTag();
    return { ciphertext: encrypted, iv: iv.toString("hex"), authTag: authTag.toString("hex") };
  }

  function decrypt({ ciphertext, iv, authTag }) {
    const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, Buffer.from(iv, "hex"), { authTagLength: AUTH_TAG_LENGTH });
    decipher.setAuthTag(Buffer.from(authTag, "hex"));
    let decrypted = decipher.update(ciphertext, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  }

  test("Encrypts and decrypts sensitive PII round-trip flawlessly", () => {
    const sensitiveSSN = "000-12-3456";
    const encrypted = encrypt(sensitiveSSN);

    assert.notStrictEqual(encrypted.ciphertext, sensitiveSSN);
    assert.strictEqual(encrypted.iv.length, 24); // 12 bytes = 24 hex chars
    assert.strictEqual(encrypted.authTag.length, 32); // 16 bytes = 32 hex chars

    const decrypted = decrypt(encrypted);
    assert.strictEqual(decrypted, sensitiveSSN);
  });

  test("Fails decryption if ciphertext or auth tag is tampered with (tamper-evident)", () => {
    const plain = "Confidential Banking Information";
    const encrypted = encrypt(plain);

    // Tamper with one character of ciphertext
    const tamperedCipher = (encrypted.ciphertext[0] === "a" ? "b" : "a") + encrypted.ciphertext.slice(1);
    assert.throws(() => {
      decrypt({ ciphertext: tamperedCipher, iv: encrypted.iv, authTag: encrypted.authTag });
    }, /Unsupported state or unable to authenticate data/);
  });

  test("Computes valid SHA-256 audit fingerprint", () => {
    const payload = JSON.stringify({ actor: "hr@acme.com", action: "DOCUMENT_SIGNED", timestamp: "2026-09-26T12:00:00Z" });
    const hash = crypto.createHash("sha256").update(payload).digest("hex");
    assert.strictEqual(hash.length, 64);
    assert.match(hash, /^[a-f0-9]{64}$/);
  });
});

describe("PII Masking Utilities", () => {
  function maskSsn(ssn) {
    const clean = ssn.replace(/\D/g, "");
    if (clean.length < 4) return "•••-••-••••";
    const last4 = clean.slice(-4);
    return `•••-••-${last4}`;
  }

  function maskBankAccount(accountNum) {
    const clean = accountNum.trim();
    if (clean.length <= 4) return "••••" + clean;
    const last4 = clean.slice(-4);
    return "•".repeat(Math.max(4, clean.length - 4)) + last4;
  }

  test("Correctly masks 9-digit US Social Security Numbers", () => {
    assert.strictEqual(maskSsn("123-45-6789"), "•••-••-6789");
    assert.strictEqual(maskSsn("987654321"), "•••-••-4321");
    assert.strictEqual(maskSsn(""), "•••-••-••••");
  });

  test("Correctly masks bank account routing numbers", () => {
    assert.strictEqual(maskBankAccount("1234567890"), "••••••7890");
    assert.strictEqual(maskBankAccount("4321"), "••••4321");
  });
});

describe("OnboardX Business Logic & Analytics Metrics", () => {
  test("Computes onboarding checklist completion percentage accurately", () => {
    const tasks = [
      { id: "1", status: "COMPLETED" },
      { id: "2", status: "COMPLETED" },
      { id: "3", status: "IN_PROGRESS" },
      { id: "4", status: "PENDING" },
    ];
    const completed = tasks.filter((t) => t.status === "COMPLETED").length;
    const progress = Math.round((completed / tasks.length) * 100);
    assert.strictEqual(progress, 50);
  });

  test("Computes Net Promoter Score (eNPS) per standard industry methodology", () => {
    // Ratings: 1-10
    // Promoters: 9, 10
    // Passives: 7, 8
    // Detractors: 1-6
    const responses = [10, 10, 9, 9, 8, 7, 6, 5, 10, 10]; // 10 responses: 6 promoters, 2 passives, 2 detractors
    const total = responses.length;
    const promoters = responses.filter((r) => r >= 9).length;
    const detractors = responses.filter((r) => r <= 6).length;

    const eNPS = Math.round(((promoters - detractors) / total) * 100);
    assert.strictEqual(eNPS, 40); // 60% - 20% = +40
  });

  test("Enforces multi-department role access matrices", () => {
    const ROLE_PERMISSIONS = {
      ADMIN: ["view_dashboard", "manage_templates", "manage_assets", "view_settings", "access_portal"],
      HR_MANAGER: ["view_dashboard", "manage_templates", "view_compliance"],
      IT_PROVISIONER: ["view_dashboard", "manage_assets"],
      EMPLOYEE: ["access_portal"],
    };

    assert.ok(ROLE_PERMISSIONS.ADMIN.includes("view_settings"));
    assert.strictEqual(ROLE_PERMISSIONS.EMPLOYEE.includes("view_settings"), false);
    assert.ok(ROLE_PERMISSIONS.IT_PROVISIONER.includes("manage_assets"));
    assert.strictEqual(ROLE_PERMISSIONS.IT_PROVISIONER.includes("manage_templates"), false);
  });

  test("Validates Custom Field Definition structure", () => {
    const field = {
      id: "cf_01",
      name: "tshirt_size",
      label: "Apparel T-Shirt Size",
      type: "dropdown",
      options: ["XS", "S", "M", "L", "XL", "2XL"],
      required: true,
      defaultValue: "L",
    };

    assert.ok(field.id.startsWith("cf_"));
    assert.strictEqual(field.options.includes(field.defaultValue), true);
    assert.strictEqual(typeof field.required, "boolean");
  });
});

describe("Multi-Currency Payroll & Treasury Engine", () => {
  const CURRENCY_RATES = {
    USD: { symbol: "$", rate: 1.0, label: "US Dollar (USD)" },
    EUR: { symbol: "€", rate: 0.92, label: "Euro (EUR)" },
    GBP: { symbol: "£", rate: 0.78, label: "British Pound (GBP)" },
    CAD: { symbol: "CA$", rate: 1.36, label: "Canadian Dollar (CAD)" },
    PKR: { symbol: "Rs.", rate: 278.5, label: "Pakistani Rupee (PKR)" },
    AED: { symbol: "AED", rate: 3.67, label: "UAE Dirham (AED)" },
  };

  function formatCurrency(amountInUsd, currency = "USD") {
    const config = CURRENCY_RATES[currency] || CURRENCY_RATES.USD;
    const converted = Math.round(amountInUsd * config.rate);
    const formattedNumber = converted.toLocaleString("en-US");

    if (currency === "AED") return `${config.symbol} ${formattedNumber}`;
    if (currency === "PKR") return `Rs. ${formattedNumber}`;
    if (currency === "CAD") return `CA$${formattedNumber}`;
    return `${config.symbol}${formattedNumber}`;
  }

  function convertSalaryRange(rangeString, currency = "USD") {
    if (!rangeString || currency === "USD") return rangeString;
    const numbers = rangeString.match(/(\d[\d,]*)/g);
    if (!numbers || numbers.length === 0) return rangeString;

    const convertedNumbers = numbers.map((numStr) => {
      const rawVal = parseInt(numStr.replace(/,/g, ""), 10);
      if (isNaN(rawVal)) return numStr;
      return formatCurrency(rawVal, currency);
    });

    if (convertedNumbers.length === 2) {
      return `${convertedNumbers[0]} - ${convertedNumbers[1]}`;
    }
    return convertedNumbers.join(" - ");
  }

  test("Converts USD base compensation to EUR correctly with 0.92 multiplier", () => {
    const baseUsd = 100000;
    const formatted = formatCurrency(baseUsd, "EUR");
    assert.strictEqual(formatted, "€92,000");
  });

  test("Converts USD base compensation to GBP correctly with 0.78 multiplier", () => {
    const baseUsd = 100000;
    const formatted = formatCurrency(baseUsd, "GBP");
    assert.strictEqual(formatted, "£78,000");
  });

  test("Converts USD base compensation to CAD correctly with 1.36 multiplier", () => {
    const baseUsd = 100000;
    const formatted = formatCurrency(baseUsd, "CAD");
    assert.strictEqual(formatted, "CA$136,000");
  });

  test("Converts USD base compensation to PKR correctly with 278.5 multiplier", () => {
    const baseUsd = 100000;
    const formatted = formatCurrency(baseUsd, "PKR");
    assert.strictEqual(formatted, "Rs. 27,850,000");
  });

  test("Converts USD base compensation to AED correctly with 3.67 multiplier", () => {
    const baseUsd = 100000;
    const formatted = formatCurrency(baseUsd, "AED");
    assert.strictEqual(formatted, "AED 367,000");
  });

  test("Converts salary range string seamlessly across currencies", () => {
    const range = "$150,000 - $185,000";
    assert.strictEqual(convertSalaryRange(range, "USD"), "$150,000 - $185,000");
    assert.strictEqual(convertSalaryRange(range, "EUR"), "€138,000 - €170,200");
    assert.strictEqual(convertSalaryRange(range, "GBP"), "£117,000 - £144,300");
    assert.strictEqual(convertSalaryRange(range, "CAD"), "CA$204,000 - CA$251,600");
    assert.strictEqual(convertSalaryRange(range, "AED"), "AED 550,500 - AED 678,950");
  });
});

