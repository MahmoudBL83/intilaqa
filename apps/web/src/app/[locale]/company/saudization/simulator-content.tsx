'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, RotateCcw, Save, Trash2 } from 'lucide-react';
import { SaudizationRing, FormSection } from '@intilaqa/ui';

interface SimulationScenario {
  currentSaudis: number;
  currentExpats: number;
  newSaudisToHire: number;
  newExpatsToHire: number;
}

interface SavedScenario {
  id: string;
  name: string;
  currentSaudis: number;
  currentExpats: number;
  newSaudisToHire: number;
  newExpatsToHire: number;
  projectedPercentage: number;
  createdAt: string;
}

interface SimulatorContentProps {
  companyId: string;
  savedScenarios?: SavedScenario[];
  currentSaudis?: number;
  currentExpats?: number;
}

export function SaudizationSimulatorContent({ companyId, savedScenarios = [], currentSaudis = 80, currentExpats = 120 }: SimulatorContentProps) {
  const t = useTranslations('dashboard');
  
  const [scenario, setScenario] = useState<SimulationScenario>({
    currentSaudis,
    currentExpats,
    newSaudisToHire: 0,
    newExpatsToHire: 0,
  });

  const [results, setResults] = useState<SimulationScenario | null>(null);
  const [scenarioName, setScenarioName] = useState('');
  const [scenarios, setScenarios] = useState(savedScenarios);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const calculate = () => {
    const simulatedSaudis = scenario.currentSaudis + scenario.newSaudisToHire;
    const simulatedExpats = scenario.currentExpats + scenario.newExpatsToHire;

    setResults({
      currentSaudis: simulatedSaudis,
      currentExpats: simulatedExpats,
      newSaudisToHire: scenario.newSaudisToHire,
      newExpatsToHire: scenario.newExpatsToHire,
    });
  };

  const reset = () => {
    setScenario({ currentSaudis, currentExpats, newSaudisToHire: 0, newExpatsToHire: 0 });
    setResults(null);
    setScenarioName('');
  };

  const saveScenario = async () => {
    if (!scenarioName.trim()) {
      alert(t('pleaseEnterScenarioName'));
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/v1/saudization/scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          name: scenarioName,
          currentSaudis: scenario.currentSaudis,
          currentExpats: scenario.currentExpats,
          newSaudisToHire: scenario.newSaudisToHire,
          newExpatsToHire: scenario.newExpatsToHire,
        }),
      });

      if (response.ok) {
        const saved = await response.json();
        setScenarios([saved, ...scenarios]);
        setScenarioName('');
        alert(t('scenarioSaved'));
      } else {
        alert(t('failedToSaveScenario'));
      }
    } catch (error) {
      console.error('Save error:', error);
      alert(t('error'));
    } finally {
      setIsSaving(false);
    }
  };

  const deleteScenario = async (id: string) => {
    if (!confirm(t('confirmDelete'))) return;

    setIsDeleting(id);
    try {
      const response = await fetch(`/api/v1/saudization/scenarios/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setScenarios(scenarios.filter((s) => s.id !== id));
        alert(t('scenarioDeleted'));
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert(t('error'));
    } finally {
      setIsDeleting(null);
    }
  };

  const loadScenario = (s: SavedScenario) => {
    setScenario({
      currentSaudis: s.currentSaudis,
      currentExpats: s.currentExpats,
      newSaudisToHire: s.newSaudisToHire,
      newExpatsToHire: s.newExpatsToHire,
    });
    setResults({
      currentSaudis: s.currentSaudis + s.newSaudisToHire,
      currentExpats: s.currentExpats + s.newExpatsToHire,
      newSaudisToHire: s.newSaudisToHire,
      newExpatsToHire: s.newExpatsToHire,
    });
  };

  const totalCurrent = scenario.currentSaudis + scenario.currentExpats;
  const totalAfter =
    scenario.currentSaudis +
    scenario.currentExpats +
    scenario.newSaudisToHire +
    scenario.newExpatsToHire;

  const saudizationPercentageCurrent =
    totalCurrent > 0 ? Math.round((scenario.currentSaudis / totalCurrent) * 100) : 0;
  const saudizationPercentageAfter =
    totalAfter > 0 ? Math.round(((scenario.currentSaudis + scenario.newSaudisToHire) / totalAfter) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <div className="floating-glass rounded-[2rem] p-6 lg:col-span-2">
          <h2 className="text-[18px] font-bold text-on-surface mb-6">
            {t('currentState')}
          </h2>

          <FormSection
            title={t('currentEmployees')}
            description={t('enterCurrentNumbers')}
          >
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-[12px] font-bold text-on-surface-variant mb-2 uppercase tracking-wider">
                  {t('saudiEmployees')}
                </label>
                <input
                  type="number"
                  value={scenario.currentSaudis}
                  onChange={(e) =>
                    setScenario({
                      ...scenario,
                      currentSaudis: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-white/40 border border-white/60 text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-on-surface-variant mb-2 uppercase tracking-wider">
                  {t('expatEmployees')}
                </label>
                <input
                  type="number"
                  value={scenario.currentExpats}
                  onChange={(e) =>
                    setScenario({
                      ...scenario,
                      currentExpats: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-white/40 border border-white/60 text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <p className="text-[12px] text-on-surface-variant/50">
              {t('total')}: {totalCurrent} {t('employees')} • {t('saudization')}: {saudizationPercentageCurrent}%
            </p>
          </FormSection>

          <FormSection
            title={t('hirePlan')}
            description={t('projectNewHires')}
          >
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-[12px] font-bold text-on-surface-variant mb-2 uppercase tracking-wider">
                  {t('saudiHires')}
                </label>
                <input
                  type="number"
                  value={scenario.newSaudisToHire}
                  onChange={(e) =>
                    setScenario({
                      ...scenario,
                      newSaudisToHire: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-white/40 border border-white/60 text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-on-surface-variant mb-2 uppercase tracking-wider">
                  {t('expatHires')}
                </label>
                <input
                  type="number"
                  value={scenario.newExpatsToHire}
                  onChange={(e) =>
                    setScenario({
                      ...scenario,
                      newExpatsToHire: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-white/40 border border-white/60 text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <p className="text-[12px] text-on-surface-variant/50">
              {t('totalNewHires')}: {scenario.newSaudisToHire + scenario.newExpatsToHire}
            </p>
          </FormSection>

          <div className="flex gap-3 mt-8">
            <button
              onClick={calculate}
              className="flex-1 px-4 py-3 rounded-xl bg-primary text-white text-[13px] font-bold hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {t('calculate')}
            </button>
            <button
              onClick={reset}
              className="px-4 py-3 rounded-xl bg-white/30 border border-white/60 text-on-surface text-[13px] font-bold hover:bg-white/50 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results & Save Panel */}
        <div className="space-y-4">
          {/* Results */}
          <div className="floating-glass rounded-[2rem] p-6">
            <h2 className="text-[18px] font-bold text-on-surface mb-6">
              {t('projectedOutcome')}
            </h2>

            {results ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-primary/10">
                    <p className="text-on-surface-variant/50 text-[12px] uppercase tracking-wider font-bold mb-1">
                      {t('saudiEmployees')}
                    </p>
                    <p className="text-[24px] font-bold text-primary">
                      {results.currentSaudis}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-primary/10">
                    <p className="text-on-surface-variant/50 text-[12px] uppercase tracking-wider font-bold mb-1">
                      {t('expatEmployees')}
                    </p>
                    <p className="text-[24px] font-bold text-primary">
                      {results.currentExpats}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-center py-6">
                  <SaudizationRing
                    current={results.currentSaudis}
                    target={Math.round((results.currentSaudis + results.currentExpats) * 0.5)}
                    size="md"
                  />
                </div>

                <div className="bg-primary/10 rounded-xl p-4">
                  <p className="text-[12px] text-on-surface-variant/50 uppercase tracking-wider font-bold mb-2">
                    {t('impact')}
                  </p>
                  <p className="text-[16px] font-bold text-on-surface">
                    {saudizationPercentageCurrent}% → {saudizationPercentageAfter}%
                  </p>
                  <p className="text-[12px] text-on-surface-variant/50 mt-1">
                    {saudizationPercentageAfter > saudizationPercentageCurrent
                      ? `+${saudizationPercentageAfter - saudizationPercentageCurrent}%`
                      : `${saudizationPercentageAfter - saudizationPercentageCurrent}%`}
                  </p>
                </div>

                <div className="text-center p-4 bg-white/20 rounded-xl">
                  <p className="text-[12px] text-on-surface-variant/50">
                    {t('totalForecast')}
                  </p>
                  <p className="text-[20px] font-bold text-on-surface mt-1">
                    {totalAfter} {t('employees')}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-on-surface-variant/50 text-[14px]">
                  {t('adjustInputsAboveAndClickCalculate')}
                </p>
              </div>
            )}
          </div>

          {/* Save Scenario */}
          {results && (
            <div className="floating-glass rounded-[2rem] p-6">
              <h3 className="text-[14px] font-bold text-on-surface mb-3">
                {t('saveScenario')}
              </h3>
              <input
                type="text"
                placeholder={t('scenarioName')}
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/40 border border-white/60 text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary mb-3 text-[12px]"
              />
              <button
                onClick={saveScenario}
                disabled={isSaving}
                className="w-full px-4 py-2.5 rounded-xl bg-primary text-white text-[12px] font-bold hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSaving ? t('saving') : t('save')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Saved Scenarios */}
      {scenarios.length > 0 && (
        <div className="floating-glass rounded-[2rem] p-6">
          <h2 className="text-[18px] font-bold text-on-surface mb-6">
            {t('savedScenarios')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {scenarios.map((s) => (
              <div
                key={s.id}
                className="floating-glass-inner rounded-xl p-4 hover:bg-white/30 transition-all cursor-pointer"
                onClick={() => loadScenario(s)}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1">
                    <p className="font-bold text-[13px] text-on-surface line-clamp-1">
                      {s.name}
                    </p>
                    <p className="text-[11px] text-on-surface-variant/50">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteScenario(s.id);
                    }}
                    disabled={isDeleting === s.id}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-all disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-on-surface-variant">{t('saudization')}:</span>
                    <span className="font-bold text-on-surface">{s.projectedPercentage}%</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-on-surface-variant">Total:</span>
                    <span className="font-bold text-on-surface">
                      {s.currentSaudis + s.newSaudisToHire + s.currentExpats + s.newExpatsToHire}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
