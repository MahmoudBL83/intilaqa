import { prisma } from "@intilaqa/db";

export type NitaqatLevel = "red" | "low_green" | "medium_green" | "high_green" | "platinum";

export interface SaudizationStatus {
  saudiCount: number;
  expatCount: number;
  totalCount: number;
  saudizationPercentage: number;
  currentNitaqatLevel: NitaqatLevel;
  currentNitaqatLabelEn: string;
  currentNitaqatLabelAr: string;
  nextNitaqatLevel: NitaqatLevel | null;
  nextNitaqatLabelEn: string | null;
  nextNitaqatLabelAr: string | null;
  targetPercentage: number;
  requiredSaudiHires: number;
}

export interface SaudizedProfession {
  professionEn: string;
  professionAr: string;
  requiredPercentage: number;
  currentSaudis: number;
  currentExpats: number;
  currentPercentage: number;
  isCompliant: boolean;
  missingSaudis: number;
}

export interface SaudizationSimulationResult {
  newSaudis: number;
  newExpats: number;
  newTotal: number;
  newPercentage: number;
  newNitaqatLevel: NitaqatLevel;
  newNitaqatLabelEn: string;
  newNitaqatLabelAr: string;
  differenceFromTarget: number;
}

export interface SaudizationScenarioInput {
  name: string;
  description?: string;
  currentSaudis: number;
  currentExpats: number;
  newSaudisToHire: number;
  newExpatsToHire: number;
}

export interface SaudizationScenarioResult {
  id: string;
  name: string;
  description?: string | null;
  currentSaudis: number;
  currentExpats: number;
  newSaudisToHire: number;
  newExpatsToHire: number;
  projectedPercentage: number;
  createdAt: Date;
  updatedAt: Date;
}

const NITAQAT_THRESHOLDS: { level: NitaqatLevel; minPercentage: number; labelEn: string; labelAr: string }[] = [
  { level: "platinum", minPercentage: 25, labelEn: "Platinum", labelAr: "بلاتينيوم" },
  { level: "high_green", minPercentage: 20, labelEn: "High Green", labelAr: "أخضر عالي" },
  { level: "medium_green", minPercentage: 15, labelEn: "Medium Green", labelAr: "أخضر متوسط" },
  { level: "low_green", minPercentage: 10, labelEn: "Low Green", labelAr: "أخضر منخفض" },
  { level: "red", minPercentage: 0, labelEn: "Red", labelAr: "أحمر" },
];

const DEFAULT_TARGET_PERCENTAGE = 20; // Next level after current

export class SaudizationService {
  static determineNitaqatLevel(percentage: number): {
    level: NitaqatLevel;
    labelEn: string;
    labelAr: string;
  } {
    for (const t of NITAQAT_THRESHOLDS) {
      if (percentage >= t.minPercentage) {
        return { level: t.level, labelEn: t.labelEn, labelAr: t.labelAr };
      }
    }
    return { level: "red", labelEn: "Red", labelAr: "أحمر" };
  }

  static getNextNitaqatLevel(currentLevel: NitaqatLevel): {
    level: NitaqatLevel | null;
    labelEn: string | null;
    labelAr: string | null;
    targetPercentage: number;
  } | null {
    const idx = NITAQAT_THRESHOLDS.findIndex((t) => t.level === currentLevel);
    if (idx <= 0) return null; // Already at highest (platinum)
    const next = NITAQAT_THRESHOLDS[idx - 1]!;
    return {
      level: next.level,
      labelEn: next.labelEn,
      labelAr: next.labelAr,
      targetPercentage: next.minPercentage,
    };
  }

  static calculateRequiredHires(
    saudiCount: number,
    expatCount: number,
    targetPercentage: number
  ): number {
    // Required Saudi hires to reach target percentage
    // target = (saudi + x) / (saudi + expat + x)  =>  solve for x
    const total = saudiCount + expatCount;
    if (total === 0) return 0;
    const x = Math.ceil((targetPercentage * total - 100 * saudiCount) / (100 - targetPercentage));
    return Math.max(0, x);
  }

  static async getBatchCompanySaudizationStatus(
    companyIds: string[]
  ): Promise<Map<string, SaudizationStatus>> {
    const employees = await prisma.employee.findMany({
      where: { companyId: { in: companyIds }, isActive: true },
      select: { companyId: true, isSaudi: true },
    });

    const grouped = new Map<string, { saudi: number; total: number }>();
    for (const cid of companyIds) grouped.set(cid, { saudi: 0, total: 0 });
    for (const e of employees) {
      const g = grouped.get(e.companyId!);
      if (!g) continue;
      g.total++;
      if (e.isSaudi) g.saudi++;
    }

    const result = new Map<string, SaudizationStatus>();
    for (const [companyId, { saudi: saudiCount, total: totalCount }] of grouped) {
      const expatCount = totalCount - saudiCount;
      const saudizationPercentage = totalCount > 0 ? Math.round((saudiCount / totalCount) * 100) : 0;
      const current = this.determineNitaqatLevel(saudizationPercentage);
      const next = this.getNextNitaqatLevel(current.level);
      result.set(companyId, {
        saudiCount,
        expatCount,
        totalCount,
        saudizationPercentage,
        currentNitaqatLevel: current.level,
        currentNitaqatLabelEn: current.labelEn,
        currentNitaqatLabelAr: current.labelAr,
        nextNitaqatLevel: next?.level ?? null,
        nextNitaqatLabelEn: next?.labelEn ?? null,
        nextNitaqatLabelAr: next?.labelAr ?? null,
        targetPercentage: next?.targetPercentage ?? saudizationPercentage,
        requiredSaudiHires: next
          ? this.calculateRequiredHires(saudiCount, expatCount, next.targetPercentage)
          : 0,
      });
    }
    return result;
  }

  static async getCompanySaudizationStatus(companyId: string): Promise<SaudizationStatus> {
    const employees = await prisma.employee.findMany({
      where: { companyId, isActive: true },
      select: { isSaudi: true },
    });

    const saudiCount = employees.filter((e) => e.isSaudi).length;
    const expatCount = employees.length - saudiCount;
    const totalCount = employees.length;
    const saudizationPercentage = totalCount > 0 ? Math.round((saudiCount / totalCount) * 100) : 0;

    const current = this.determineNitaqatLevel(saudizationPercentage);
    const next = this.getNextNitaqatLevel(current.level);

    return {
      saudiCount,
      expatCount,
      totalCount,
      saudizationPercentage,
      currentNitaqatLevel: current.level,
      currentNitaqatLabelEn: current.labelEn,
      currentNitaqatLabelAr: current.labelAr,
      nextNitaqatLevel: next?.level ?? null,
      nextNitaqatLabelEn: next?.labelEn ?? null,
      nextNitaqatLabelAr: next?.labelAr ?? null,
      targetPercentage: next?.targetPercentage ?? saudizationPercentage,
      requiredSaudiHires: next
        ? this.calculateRequiredHires(saudiCount, expatCount, next.targetPercentage)
        : 0,
    };
  }

  static async getSaudizedProfessions(companyId: string): Promise<SaudizedProfession[]> {
    const employees = await prisma.employee.findMany({
      where: { companyId, isActive: true },
      select: { isSaudi: true, position: true },
    });

    const professionsData: { professionEn: string; professionAr: string; reqPct: number }[] = [
      { professionEn: "Accounting", professionAr: "المحاسبة", reqPct: 40 },
      { professionEn: "Human Resources", professionAr: "الموارد البشرية", reqPct: 50 },
      { professionEn: "Sales", professionAr: "المبيعات", reqPct: 25 },
      { professionEn: "Customer Service", professionAr: "خدمة العملاء", reqPct: 40 },
      { professionEn: "Administration", professionAr: "الإدارة", reqPct: 50 },
      { professionEn: "Engineering", professionAr: "الهندسة", reqPct: 20 },
      { professionEn: "IT", professionAr: "تقنية المعلومات", reqPct: 30 },
      { professionEn: "Marketing", professionAr: "التسويق", reqPct: 25 },
    ];

    return professionsData.map((p) => {
      const matching = employees.filter(
        (e) => e.position?.toLowerCase().includes(p.professionEn.toLowerCase())
      );
      const saudiInProf = matching.filter((e) => e.isSaudi).length;
      const expatInProf = matching.length - saudiInProf;
      const totalInProf = matching.length;
      const currentPct = totalInProf > 0 ? Math.round((saudiInProf / totalInProf) * 100) : 0;
      const isCompliant = currentPct >= p.reqPct;
      const missing = Math.max(0, Math.ceil((p.reqPct * totalInProf - 100 * saudiInProf) / 100));

      return {
        professionEn: p.professionEn,
        professionAr: p.professionAr,
        requiredPercentage: p.reqPct,
        currentSaudis: saudiInProf,
        currentExpats: expatInProf,
        currentPercentage: currentPct,
        isCompliant,
        missingSaudis: missing,
      };
    });
  }

  static simulateHiring(
    currentSaudis: number,
    currentExpats: number,
    newSaudis: number,
    newExpatsToRemoveOrAdd: number
  ): SaudizationSimulationResult {
    const newSaudiCount = currentSaudis + newSaudis;
    const newExpatCount = currentExpats + newExpatsToRemoveOrAdd;
    const newTotal = newSaudiCount + newExpatCount;
    const newPercentage = newTotal > 0 ? Math.round((newSaudiCount / newTotal) * 100) : 0;

    const level = this.determineNitaqatLevel(newPercentage);
    const next = this.getNextNitaqatLevel(level.level);

    return {
      newSaudis: newSaudiCount,
      newExpats: newExpatCount,
      newTotal,
      newPercentage,
      newNitaqatLevel: level.level,
      newNitaqatLabelEn: level.labelEn,
      newNitaqatLabelAr: level.labelAr,
      differenceFromTarget: next ? newPercentage - next.targetPercentage : 0,
    };
  }

  static calculateProjectedPercentage(scenario: SaudizationScenarioInput): number {
    const totalSaudis = scenario.currentSaudis + scenario.newSaudisToHire;
    const totalExpats = scenario.currentExpats + scenario.newExpatsToHire;
    const total = totalSaudis + totalExpats;
    if (total === 0) return 0;
    return Math.round((totalSaudis / total) * 100);
  }
}

/**
 * Qiwa Integration Placeholder
 * Will connect to Qiwa API for real-time Nitaqat data and profession validation.
 */
export class QiwaSaudizationService {
  static async syncNitaqatLevel(_companyId: string): Promise<{ level: string; percentage: number } | null> {
    // TODO: Implement Qiwa API call to fetch actual Nitaqat level
    // Endpoint: GET /api/qiwa/v1/nitaqat/{crNumber}
    return null;
  }

  static async validateProfessionSaudization(
    _professionCode: string,
    _companyCr: string
  ): Promise<{ requiredPct: number; currentPct: number; isCompliant: boolean } | null> {
    // TODO: Implement Qiwa API call for profession-level saudization check
    return null;
  }
}
