import { VendorMemory, CorrectionMemory, ResolutionMemory, DuplicateMemory } from './types';
export declare class MemoryDatabase {
    private db;
    constructor(dbPath?: string);
    private initializeSchema;
    saveVendorMemory(memory: VendorMemory): number;
    getVendorMemories(vendor: string): VendorMemory[];
    updateVendorMemoryUsage(id: number, success: boolean): void;
    saveCorrectionMemory(memory: CorrectionMemory): number;
    getCorrectionMemories(vendor: string): CorrectionMemory[];
    updateCorrectionMemoryUsage(id: number, success: boolean): void;
    saveResolutionMemory(memory: ResolutionMemory): number;
    getResolutionMemories(vendor: string): ResolutionMemory[];
    saveDuplicateMemory(memory: DuplicateMemory): number;
    findDuplicates(vendor: string, invoiceNumber: string, invoiceDate: string): DuplicateMemory[];
    close(): void;
}
//# sourceMappingURL=database.d.ts.map