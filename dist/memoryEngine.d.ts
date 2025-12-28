import { MemoryDatabase } from './database';
import { Invoice, PurchaseOrder, DeliveryNote, HumanCorrection, ProcessingResult } from './types';
export declare class MemoryEngine {
    private db;
    private confidenceThreshold;
    constructor(db: MemoryDatabase);
    processInvoice(invoice: Invoice, purchaseOrders: PurchaseOrder[], deliveryNotes: DeliveryNote[]): ProcessingResult;
    private applyVendorMemory;
    private applyCorrectionMemory;
    private extractValueFromPattern;
    private matchPurchaseOrder;
    private daysBetween;
    private makeDecision;
    private applyCorrection;
    learnFromCorrection(invoice: Invoice, correction: HumanCorrection): void;
}
//# sourceMappingURL=memoryEngine.d.ts.map