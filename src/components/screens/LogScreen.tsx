"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Camera, X, Check, Loader2, UtensilsCrossed, Pencil, ImageIcon } from "lucide-react";
import { useI18n } from "@/i18n";
import { useApp } from "@/components/providers/AppProvider";
import type { MealType, FoodItem, AnalyzeResponse } from "@/lib/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resizeImageToBase64(file: File, maxPx = 512): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      resolve({ base64: dataUrl.split(",")[1], mimeType: "image/jpeg" });
    };
    img.onerror = reject;
    img.src = url;
  });
}

const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

function detectMealType(): MealType {
  const h = new Date().getHours();
  if (h >= 5 && h < 11) return "breakfast";
  if (h >= 11 && h < 15) return "lunch";
  if (h >= 18) return "dinner";
  return "snack";
}

// ---------------------------------------------------------------------------
// MealCard
// ---------------------------------------------------------------------------
interface MealCardProps {
  mealType: MealType;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  foods: FoodItem[];
}

function MealCard({ mealType, calories, protein, carbs, fat, foods }: MealCardProps) {
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm"
    >
      <button
        className="w-full flex items-center justify-between"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-emerald-600">
            {t(`log.${mealType}`)}
          </span>
          <span className="text-xs text-white/50">{foods.length} items</span>
        </div>
        <span className="text-sm font-bold text-white">
          {calories} {t("log.kcal")}
        </span>
      </button>

      {expanded && (
        <div className="mt-3 space-y-1">
          {foods.map((f, i) => (
            <div key={i} className="flex justify-between text-xs text-white/60">
              <span>{f.name_ja || f.name_en}</span>
              <span>{f.calories} kcal</span>
            </div>
          ))}
          <div className="flex gap-3 mt-2 pt-2 border-t border-white/10 text-xs text-white/40">
            <span>{t("log.protein")} {protein.toFixed(1)}g</span>
            <span>{t("log.carbs")} {carbs.toFixed(1)}g</span>
            <span>{t("log.fat")} {fat.toFixed(1)}g</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// AddMealModal
// ---------------------------------------------------------------------------
type ModalStep = "select-type" | "upload" | "analyzing" | "confirm";

interface AddMealModalProps {
  authToken: string;
  onClose: () => void;
  onSaved: () => void;
}

function AddMealModal({ authToken, onClose, onSaved }: AddMealModalProps) {
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<ModalStep>("select-type");
  const [selectedType, setSelectedType] = useState<MealType>(detectMealType);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalyzeResponse | null>(null);
  const [editedCalories, setEditedCalories] = useState<number>(0);
  const [editingCalories, setEditingCalories] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setError(null);
      setStep("analyzing");

      try {
        const { base64, mimeType } = await resizeImageToBase64(file);
        setImagePreview(`data:${mimeType};base64,${base64}`);

        const res = await fetch("/api/meal/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ image_base64: base64, image_type: mimeType }),
        });

        if (!res.ok) throw new Error("analyze failed");
        const result: AnalyzeResponse = await res.json();
        setAnalysis(result);
        setEditedCalories(result.total_calories);
        setStep("confirm");
      } catch {
        setError(t("log.analysisError"));
        setStep("upload");
      }
    },
    [authToken, t]
  );

  const handleSave = useCallback(async () => {
    if (!analysis) return;
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/meal/log", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          meal_type: selectedType,
          foods_json: analysis.foods,
          total_calories: editedCalories,
          total_protein: analysis.total_protein,
          total_carbs: analysis.total_carbs,
          total_fat: analysis.total_fat,
        }),
      });

      if (!res.ok) throw new Error("save failed");
      onSaved();
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [analysis, authToken, selectedType, editedCalories, onSaved]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-md bg-[#0a1a10] rounded-t-3xl border-t border-white/10 p-6 pb-safe"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-white text-lg">{t("log.addMeal")}</h3>
          <button onClick={onClose} className="p-1 text-white/40 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step: Select meal type */}
        {step === "select-type" && (
          <div className="space-y-3">
            <p className="text-sm text-white/60">{t("log.selectMealType")}</p>
            <div className="grid grid-cols-2 gap-3">
              {MEAL_TYPES.map((type) => {
                const isAuto = type === selectedType;
                return (
                  <button
                    key={type}
                    onClick={() => { setSelectedType(type); setStep("upload"); }}
                    className={`py-4 rounded-2xl border font-medium transition-all relative ${
                      isAuto
                        ? "bg-emerald-600/20 border-emerald-500/50 text-emerald-300"
                        : "bg-white/5 border-white/10 text-white hover:bg-emerald-600/20 hover:border-emerald-500/50"
                    }`}
                  >
                    {t(`log.${type}`)}
                    {isAuto && (
                      <span className="absolute -top-1.5 -right-1.5 text-[9px] bg-emerald-500 text-white px-1.5 py-0.5 rounded-full font-bold">
                        AUTO
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step: Upload */}
        {step === "upload" && (
          <div className="space-y-4">
            <p className="text-sm text-white/60 text-center">
              {t(`log.${selectedType}`)}
            </p>
            {error && <p className="text-sm text-red-400 text-center">{error}</p>}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="py-10 rounded-2xl border-2 border-dashed border-emerald-500/30 bg-emerald-500/5 flex flex-col items-center gap-3 hover:bg-emerald-500/10 transition-all"
              >
                <Camera className="h-7 w-7 text-emerald-400" />
                <span className="text-xs text-emerald-300 font-medium">{t("log.takePhoto")}</span>
              </button>
              <button
                onClick={() => galleryInputRef.current?.click()}
                className="py-10 rounded-2xl border-2 border-dashed border-emerald-500/30 bg-emerald-500/5 flex flex-col items-center gap-3 hover:bg-emerald-500/10 transition-all"
              >
                <ImageIcon className="h-7 w-7 text-emerald-400" />
                <span className="text-xs text-emerald-300 font-medium">{t("log.choosePhoto")}</span>
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        )}

        {/* Step: Analyzing */}
        {step === "analyzing" && (
          <div className="py-12 flex flex-col items-center gap-4">
            {imagePreview && (
              <img
                src={imagePreview}
                alt="meal"
                className="w-32 h-32 object-cover rounded-2xl opacity-50"
              />
            )}
            <Loader2 className="h-8 w-8 text-emerald-400 animate-spin" />
            <p className="text-sm text-white/60">{t("log.analyzing")}</p>
          </div>
        )}

        {/* Step: Confirm */}
        {step === "confirm" && analysis && (
          <div className="space-y-4">
            {imagePreview && (
              <img
                src={imagePreview}
                alt="meal"
                className="w-full h-40 object-cover rounded-2xl"
              />
            )}

            <div className="bg-white/5 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">{t("log.analysisResult")}</span>
                <div className="flex items-center gap-2">
                  {editingCalories ? (
                    <>
                      <input
                        type="number"
                        value={editedCalories}
                        onChange={(e) => setEditedCalories(Number(e.target.value))}
                        className="w-20 text-right bg-white/10 rounded-lg px-2 py-1 text-sm text-white"
                        autoFocus
                      />
                      <button onClick={() => setEditingCalories(false)}>
                        <Check className="h-4 w-4 text-emerald-400" />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="text-lg font-bold text-emerald-300">
                        {editedCalories} kcal
                      </span>
                      <button onClick={() => setEditingCalories(true)}>
                        <Pencil className="h-3.5 w-3.5 text-white/40" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-3 text-xs text-white/40">
                <span>P {analysis.total_protein.toFixed(1)}g</span>
                <span>C {analysis.total_carbs.toFixed(1)}g</span>
                <span>F {analysis.total_fat.toFixed(1)}g</span>
              </div>

              <div className="space-y-1 mt-2 max-h-28 overflow-y-auto">
                {analysis.foods.map((f, i) => (
                  <div key={i} className="flex justify-between text-xs text-white/60">
                    <span>{f.name_ja || f.name_en} ({f.portion})</span>
                    <span>{f.calories} kcal</span>
                  </div>
                ))}
              </div>
            </div>

            {error && <p className="text-sm text-red-400 text-center">{error}</p>}

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold transition-all flex items-center justify-center gap-2"
            >
              {saving ? (
                <><Loader2 className="h-4 w-4 animate-spin" />{t("log.savingMeal")}</>
              ) : (
                <><Check className="h-4 w-4" />{t("log.save")}</>
              )}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// LogScreen
// ---------------------------------------------------------------------------

export function LogScreen() {
  const { t } = useI18n();
  const { todayLogs, userProfile, authToken, refreshTodayLogs, refreshChallenge } = useApp();
  const [showModal, setShowModal] = useState(false);

  const totalCalories = todayLogs.reduce((sum, l) => sum + l.total_calories, 0);
  const targetCalories = userProfile?.target_calories ?? 1800;
  const progressPct = Math.min(100, Math.round((totalCalories / targetCalories) * 100));

  const progressColor =
    progressPct >= 110
      ? "bg-red-500"
      : progressPct >= 90
      ? "bg-yellow-500"
      : "bg-emerald-500";

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
      {/* Calorie summary card */}
      <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm">
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">{t("log.totalCalories")}</p>
            <p className="text-3xl font-black text-gray-900 mt-0.5">
              {totalCalories}
              <span className="text-base font-normal text-gray-400 ml-1">{t("log.kcal")}</span>
            </p>
          </div>
          <p className="text-xs text-gray-400">{t("log.target").replace("{n}", String(targetCalories))}</p>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${progressColor}`}
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        <p className="text-xs text-white/30 mt-1 text-right">{progressPct}%</p>
      </div>

      {/* Challenge info card */}
      <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200">
        <p className="text-xs font-semibold text-emerald-700 mb-2">{t("challenge.howItWorks")}</p>
        <div className="space-y-1.5">
          {[t("challenge.rule1"), t("challenge.rule2"), t("challenge.rule3")].map((rule, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-gray-500">
              <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              {rule}
            </div>
          ))}
        </div>
        <p className="text-[10px] text-gray-400 mt-2">→ {t("tabs.challenge")}</p>
      </div>

      {/* Meal list */}
      {todayLogs.length === 0 ? (
        <div className="py-12 flex flex-col items-center gap-3 text-gray-300">
          <UtensilsCrossed className="h-12 w-12" />
          <p className="text-sm text-gray-400">{t("log.noMeals")}</p>
          <p className="text-xs text-gray-300">{t("log.tapToAdd")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {todayLogs.map((log) => (
            <MealCard
              key={log.id}
              mealType={log.meal_type}
              calories={log.total_calories}
              protein={log.total_protein}
              carbs={log.total_carbs}
              fat={log.total_fat}
              foods={log.foods_json}
            />
          ))}
        </div>
      )}

      {/* Add button */}
      <button
        onClick={() => setShowModal(true)}
        className="w-full py-4 rounded-2xl border-2 border-dashed border-orange-300 bg-orange-50 flex items-center justify-center gap-2 text-orange-500 font-semibold hover:bg-orange-100 transition-all active:scale-95"
      >
        <Plus className="h-5 w-5" />
        {t("log.addMeal")}
      </button>

      {/* Add meal modal */}
      <AnimatePresence>
        {showModal && authToken && (
          <AddMealModal
            authToken={authToken}
            onClose={() => setShowModal(false)}
            onSaved={async () => {
              setShowModal(false);
              await refreshTodayLogs();
              await refreshChallenge();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
