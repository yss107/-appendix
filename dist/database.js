"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryDatabase = void 0;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path = __importStar(require("path"));
class MemoryDatabase {
    constructor(dbPath = path.join(__dirname, '../memory.db')) {
        this.db = new better_sqlite3_1.default(dbPath);
        this.initializeSchema();
    }
    initializeSchema() {
        // Vendor memory table
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS vendor_memory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vendor TEXT NOT NULL,
        pattern TEXT NOT NULL,
        fieldMapping TEXT NOT NULL,
        confidence REAL NOT NULL,
        usageCount INTEGER DEFAULT 0,
        successCount INTEGER DEFAULT 0,
        lastUsed TEXT,
        created TEXT NOT NULL
      )
    `);
        // Correction memory table
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS correction_memory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vendor TEXT NOT NULL,
        pattern TEXT NOT NULL,
        correctionType TEXT NOT NULL,
        correctionLogic TEXT NOT NULL,
        confidence REAL NOT NULL,
        usageCount INTEGER DEFAULT 0,
        successCount INTEGER DEFAULT 0,
        lastUsed TEXT,
        created TEXT NOT NULL
      )
    `);
        // Resolution memory table
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS resolution_memory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vendor TEXT NOT NULL,
        invoiceNumber TEXT NOT NULL,
        decision TEXT NOT NULL,
        corrections TEXT NOT NULL,
        timestamp TEXT NOT NULL
      )
    `);
        // Duplicate memory table
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS duplicate_memory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vendor TEXT NOT NULL,
        invoiceNumber TEXT NOT NULL,
        invoiceDate TEXT NOT NULL,
        invoiceId TEXT NOT NULL,
        timestamp TEXT NOT NULL
      )
    `);
    }
    // Vendor Memory operations
    saveVendorMemory(memory) {
        const stmt = this.db.prepare(`
      INSERT INTO vendor_memory (vendor, pattern, fieldMapping, confidence, usageCount, successCount, lastUsed, created)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
        const result = stmt.run(memory.vendor, memory.pattern, memory.fieldMapping, memory.confidence, memory.usageCount || 0, memory.successCount || 0, memory.lastUsed || null, memory.created);
        return result.lastInsertRowid;
    }
    getVendorMemories(vendor) {
        const stmt = this.db.prepare(`
      SELECT * FROM vendor_memory WHERE vendor = ? ORDER BY confidence DESC
    `);
        return stmt.all(vendor);
    }
    updateVendorMemoryUsage(id, success) {
        const memory = this.db.prepare('SELECT * FROM vendor_memory WHERE id = ?').get(id);
        if (!memory)
            return;
        const newUsageCount = memory.usageCount + 1;
        const newSuccessCount = success ? memory.successCount + 1 : memory.successCount;
        const newConfidence = newSuccessCount / newUsageCount;
        this.db.prepare(`
      UPDATE vendor_memory
      SET usageCount = ?, successCount = ?, confidence = ?, lastUsed = ?
      WHERE id = ?
    `).run(newUsageCount, newSuccessCount, newConfidence, new Date().toISOString(), id);
    }
    // Correction Memory operations
    saveCorrectionMemory(memory) {
        const stmt = this.db.prepare(`
      INSERT INTO correction_memory (vendor, pattern, correctionType, correctionLogic, confidence, usageCount, successCount, lastUsed, created)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        const result = stmt.run(memory.vendor, memory.pattern, memory.correctionType, memory.correctionLogic, memory.confidence, memory.usageCount || 0, memory.successCount || 0, memory.lastUsed || null, memory.created);
        return result.lastInsertRowid;
    }
    getCorrectionMemories(vendor) {
        const stmt = this.db.prepare(`
      SELECT * FROM correction_memory WHERE vendor = ? ORDER BY confidence DESC
    `);
        return stmt.all(vendor);
    }
    updateCorrectionMemoryUsage(id, success) {
        const memory = this.db.prepare('SELECT * FROM correction_memory WHERE id = ?').get(id);
        if (!memory)
            return;
        const newUsageCount = memory.usageCount + 1;
        const newSuccessCount = success ? memory.successCount + 1 : memory.successCount;
        const newConfidence = newSuccessCount / newUsageCount;
        this.db.prepare(`
      UPDATE correction_memory
      SET usageCount = ?, successCount = ?, confidence = ?, lastUsed = ?
      WHERE id = ?
    `).run(newUsageCount, newSuccessCount, newConfidence, new Date().toISOString(), id);
    }
    // Resolution Memory operations
    saveResolutionMemory(memory) {
        const stmt = this.db.prepare(`
      INSERT INTO resolution_memory (vendor, invoiceNumber, decision, corrections, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `);
        const result = stmt.run(memory.vendor, memory.invoiceNumber, memory.decision, memory.corrections, memory.timestamp);
        return result.lastInsertRowid;
    }
    getResolutionMemories(vendor) {
        const stmt = this.db.prepare(`
      SELECT * FROM resolution_memory WHERE vendor = ? ORDER BY timestamp DESC
    `);
        return stmt.all(vendor);
    }
    // Duplicate Memory operations
    saveDuplicateMemory(memory) {
        const stmt = this.db.prepare(`
      INSERT INTO duplicate_memory (vendor, invoiceNumber, invoiceDate, invoiceId, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `);
        const result = stmt.run(memory.vendor, memory.invoiceNumber, memory.invoiceDate, memory.invoiceId, memory.timestamp);
        return result.lastInsertRowid;
    }
    findDuplicates(vendor, invoiceNumber, invoiceDate) {
        const stmt = this.db.prepare(`
      SELECT * FROM duplicate_memory 
      WHERE vendor = ? AND invoiceNumber = ?
    `);
        const duplicates = stmt.all(vendor, invoiceNumber);
        // Helper function to parse various date formats
        const parseDate = (dateStr) => {
            // Try DD.MM.YYYY format
            const ddmmyyyyMatch = dateStr.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
            if (ddmmyyyyMatch) {
                const [, day, month, year] = ddmmyyyyMatch;
                return new Date(`${year}-${month}-${day}`);
            }
            // Try DD-MM-YYYY format
            const ddmmyyyyDashMatch = dateStr.match(/^(\d{2})-(\d{2})-(\d{4})$/);
            if (ddmmyyyyDashMatch) {
                const [, day, month, year] = ddmmyyyyDashMatch;
                return new Date(`${year}-${month}-${day}`);
            }
            // Try standard formats
            const date = new Date(dateStr);
            return isNaN(date.getTime()) ? null : date;
        };
        const currentDate = parseDate(invoiceDate);
        if (!currentDate) {
            // If we can't parse the date, just return exact matches
            return duplicates;
        }
        // Also check for dates within 7 days
        return duplicates.filter(dup => {
            const dupDate = parseDate(dup.invoiceDate);
            if (!dupDate)
                return true; // Include if we can't parse (exact match on invoice number)
            const diffDays = Math.abs((currentDate.getTime() - dupDate.getTime()) / (1000 * 60 * 60 * 24));
            return diffDays <= 7;
        });
    }
    close() {
        this.db.close();
    }
}
exports.MemoryDatabase = MemoryDatabase;
//# sourceMappingURL=database.js.map