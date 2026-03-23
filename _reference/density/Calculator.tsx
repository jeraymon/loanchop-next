"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import BigNumber from "bignumber.js";
import { formatResult } from "@/shared-math/math-config";
import { solveDensity, solveMass, solveVolume } from "./calc";
import {
  convertUnit,
  getUnitOptions,
  getUnitLabel,
  getUnitKeys,
  type UnitCategory,
} from "@/shared-math/units";

import CalculatorShell from "@/components/CalculatorShell";
import ShareButtons from "@/components/ShareButtons";
import AdSlot from "@/components/AdSlot";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const positiveNum = z
  .string()
  .min(1, "Required")
  .refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Must be a positive number");

const densitySchema = z.object({ mass: positiveNum, volume: positiveNum });
const massSchema    = z.object({ density: positiveNum, volume: positiveNum });
const volumeSchema  = z.object({ mass: positiveNum, density: positiveNum });

const schemas = { density: densitySchema, mass: massSchema, volume: volumeSchema } as const;

type SolveFor = keyof typeof schemas;

// ---------------------------------------------------------------------------
// Formulas
// ---------------------------------------------------------------------------

const formulas: Record<SolveFor, string> = {
  density: "\\rho = \\frac{m}{V}",
  mass:    "m = \\rho \\times V",
  volume:  "V = \\frac{m}{\\rho}",
};

const srFormulas: Record<SolveFor, string> = {
  density: "Density equals mass divided by volume",
  mass:    "Mass equals density multiplied by volume",
  volume:  "Volume equals mass divided by density",
};

// ---------------------------------------------------------------------------
// Breadcrumbs
// ---------------------------------------------------------------------------

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Physics", href: "/#physics" },
  { label: "Density Calculator", href: "/density" },
];

// ---------------------------------------------------------------------------
// Precompute dropdown options from shared unit library
// ---------------------------------------------------------------------------

const massOptions    = getUnitOptions("mass");
const volumeOptions  = getUnitOptions("volume");
const densityOptions = getUnitOptions("density");

// Lookup maps for rendering display labels in Select triggers
const massLabels    = Object.fromEntries(massOptions.map(o => [o.key, o.label]));
const volumeLabels  = Object.fromEntries(volumeOptions.map(o => [o.key, o.label]));
const densityLabels = Object.fromEntries(densityOptions.map(o => [o.key, o.label]));

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type ResultRow = { label: string; value: string };

export function Calculator() {
  return (
    <Suspense fallback={null}>
      <CalculatorInner />
    </Suspense>
  );
}

function CalculatorInner() {
  const searchParams = useSearchParams();
  const [solveFor, setSolveFor] = useState<SolveFor>("density");
  const [solution, setSolution] = useState<string | null>(null);
  const [resultRows, setResultRows] = useState<ResultRow[]>([]);

  // Unit selections (raw unit keys)
  const [massUnit, setMassUnit]       = useState("kilogram");
  const [volumeUnit, setVolumeUnit]   = useState("meter^3");
  const [densityUnit, setDensityUnit] = useState("kilogram/meter^3");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  setValue,
  } = useForm<Record<string, string>>({ resolver: zodResolver(schemas[solveFor]) });


  // Load from URL params on mount
  const [paramsLoaded, setParamsLoaded] = useState(false);
  useEffect(() => {
    if (paramsLoaded) return;
    const sf = searchParams.get("solveFor");
    if (!sf) { setParamsLoaded(true); return; }
    setSolveFor(sf as SolveFor);
    if (searchParams.get("massUnit")) setMassUnit(searchParams.get("massUnit")!);
    if (searchParams.get("volumeUnit")) setVolumeUnit(searchParams.get("volumeUnit")!);
    if (searchParams.get("densityUnit")) setDensityUnit(searchParams.get("densityUnit")!);

    // Set form values after a tick so the form is re-rendered with the new schema
    setTimeout(() => {
      if (searchParams.get("mass")) setValue("mass", searchParams.get("mass")!);
      if (searchParams.get("volume")) setValue("volume", searchParams.get("volume")!);
      if (searchParams.get("density")) setValue("density", searchParams.get("density")!);

      // Auto-submit
      handleSubmit(onSubmit)();
    }, 100);
    setParamsLoaded(true);
  }, [searchParams, paramsLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = (data: Record<string, string>) => {
    const massVal    = new BigNumber(data.mass    ?? 0);
    const volumeVal  = new BigNumber(data.volume  ?? 0);
    const densityVal = new BigNumber(data.density ?? 0);

    // Canonical units matching PHP: kilogram, meter^3, kilogram/meter^3
    let resultInCanonical: BigNumber;
    let resultCategory: UnitCategory;
    let resultUnitKey: string;

    if (solveFor === "density") {
      const mKg = convertUnit(massVal, massUnit, "kilogram", "mass");
      const vM3 = convertUnit(volumeVal, volumeUnit, "meter^3", "volume");
      if (vM3.isZero()) return;
      resultInCanonical = solveDensity(mKg, vM3);
      resultCategory = "density";
      resultUnitKey  = densityUnit;
    } else if (solveFor === "mass") {
      const dKgM3 = convertUnit(densityVal, densityUnit, "kilogram/meter^3", "density");
      const vM3   = convertUnit(volumeVal, volumeUnit, "meter^3", "volume");
      resultInCanonical = solveMass(dKgM3, vM3);
      resultCategory = "mass";
      resultUnitKey  = massUnit;
    } else {
      const mKg   = convertUnit(massVal, massUnit, "kilogram", "mass");
      const dKgM3 = convertUnit(densityVal, densityUnit, "kilogram/meter^3", "density");
      if (dKgM3.isZero()) return;
      resultInCanonical = solveVolume(mKg, dKgM3);
      resultCategory = "volume";
      resultUnitKey  = volumeUnit;
    }

    // Convert canonical result to user-selected unit
    const canonicalUnit = resultCategory === "mass" ? "kilogram"
      : resultCategory === "volume" ? "meter^3"
      : "kilogram/meter^3";
    const resultInSelectedUnit = convertUnit(resultInCanonical, canonicalUnit, resultUnitKey, resultCategory);
    const unitLabel = getUnitLabel(resultCategory, resultUnitKey);
    setSolution(`${formatResult(resultInSelectedUnit)} ${unitLabel}`);

    // Build conversion table for all units in the result category
    const rows: ResultRow[] = getUnitKeys(resultCategory).map((key) => ({
      label: getUnitLabel(resultCategory, key),
      value: formatResult(convertUnit(resultInCanonical, canonicalUnit, key, resultCategory)),
    }));
    setResultRows(rows);
  
    // Update URL with shareable params
    const params = new URLSearchParams();
    params.set("solveFor", solveFor);
    if (data.mass) params.set("mass", data.mass);
    if (data.volume) params.set("volume", data.volume);
    if (data.density) params.set("density", data.density);
    params.set("densityUnit", densityUnit);
    params.set("massUnit", massUnit);
    params.set("volumeUnit", volumeUnit);
    window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
  };

  const handleSolveForChange = (value: string | null) => {
    if (!value) return;
    setSolveFor(value as SolveFor);
    setSolution(null);
    setResultRows([]);
    reset();
  };

  const jumpToCalculator = useCallback((sf: SolveFor) => {
    setSolveFor(sf);
    setSolution(null);
    setResultRows([]);
    reset();
    setTimeout(() => {
      document.getElementById("calculator")?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }, [reset]);

  return (
    <>
      <CalculatorShell
        id="calculator"
        title="Density Equation Calculator"
        latexFormula={formulas[solveFor]}
        srFormulaText={srFormulas[solveFor]}
        solution={solution}
        breadcrumbs={breadcrumbs}
        afterSolution={resultRows.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-4">
              Solution in Other Units
            </h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resultRows.map((row) => (
                  <TableRow key={row.label}>
                    <TableCell>{row.label}</TableCell>
                    <TableCell className="text-right font-mono">{row.value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      >
        {/* Solve-for selector */}
        <div className="space-y-2">
          <Label htmlFor="solve-for">Solve For</Label>
          <Select value={solveFor} onValueChange={handleSolveForChange}>
            <SelectTrigger id="solve-for">
              <SelectValue>
                {(v: string) => {
                  const labels: Record<string, string> = {
                    density: "Density (\u03C1)",
                    mass: "Mass (m)",
                    volume: "Volume (V)",
                  };
                  return labels[v] ?? v;
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="density">Density (&rho;)</SelectItem>
              <SelectItem value="mass">Mass (m)</SelectItem>
              <SelectItem value="volume">Volume (V)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Mass input */}
        {solveFor !== "mass" && (
          <div className="space-y-2">
            <Label htmlFor="mass">Mass (m)</Label>
            <div className="flex gap-2">
              <Input
                id="mass"
                type="number"
                step="any"
                placeholder="Enter mass"
                {...register("mass")}
              />
              <Select value={massUnit} onValueChange={(v) => v && setMassUnit(v)}>
                <SelectTrigger className="w-50">
                  <SelectValue>{(v: string) => massLabels[v] ?? v}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {massOptions.map(({ key, label }) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {errors.mass && (
              <p className="text-red-500 text-sm">{errors.mass.message?.toString()}</p>
            )}
          </div>
        )}

        {/* Volume input */}
        {solveFor !== "volume" && (
          <div className="space-y-2">
            <Label htmlFor="volume">Volume (V)</Label>
            <div className="flex gap-2">
              <Input
                id="volume"
                type="number"
                step="any"
                placeholder="Enter volume"
                {...register("volume")}
              />
              <Select value={volumeUnit} onValueChange={(v) => v && setVolumeUnit(v)}>
                <SelectTrigger className="w-50">
                  <SelectValue>{(v: string) => volumeLabels[v] ?? v}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {volumeOptions.map(({ key, label }) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {errors.volume && (
              <p className="text-red-500 text-sm">{errors.volume.message?.toString()}</p>
            )}
          </div>
        )}

        {/* Density input */}
        {solveFor !== "density" && (
          <div className="space-y-2">
            <Label htmlFor="density">Density (&rho;)</Label>
            <div className="flex gap-2">
              <Input
                id="density"
                type="number"
                step="any"
                placeholder="Enter density"
                {...register("density")}
              />
              <Select value={densityUnit} onValueChange={(v) => v && setDensityUnit(v)}>
                <SelectTrigger className="w-50">
                  <SelectValue>{(v: string) => densityLabels[v] ?? v}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {densityOptions.map(({ key, label }) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {errors.density && (
              <p className="text-red-500 text-sm">{errors.density.message?.toString()}</p>
            )}
          </div>
        )}

        <Button
          type="submit"
          className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
          onClick={handleSubmit(onSubmit)}
        >
          Calculate
        </Button>
      </CalculatorShell>

      {/* Share buttons — outside the shell */}
      <div className="max-w-3xl mx-auto">
        <ShareButtons title="Density Equation Calculator" solution={solution ?? ""} />
      </div>

      {/* Ad placement — outside the shell */}
      <div className="max-w-3xl mx-auto">
        <AdSlot />
      </div>

      {/* Educational content */}
      <section className="max-w-3xl mx-auto mt-8 space-y-8 text-sm text-muted-foreground leading-relaxed">
        {/* How It Works */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-6 space-y-3">
          <h2 className="text-base font-semibold text-slate-600 dark:text-slate-400">How It Works</h2>
          <p>
            The density equation &rho;&nbsp;=&nbsp;m&nbsp;/&nbsp;V relates how much matter is packed
            into a given space. A high density means the substance is tightly packed; a low density means
            it is spread out. You can rearrange the same equation to find mass or volume when the other
            two values are known.
          </p>
          <p>
            Common units are kg/m&sup3; (SI), g/cm&sup3; (CGS), and slugs/ft&sup3; (imperial).
            Water&apos;s density at 4&nbsp;&deg;C is 1,000&nbsp;kg/m&sup3; (1&nbsp;g/cm&sup3;), which
            serves as the reference for many comparisons.
          </p>
          <Button
            variant="outline"
            className="mt-2 border-cyan-600 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950"
            onClick={() => jumpToCalculator("density")}
          >
            Calculate Density &uarr;
          </Button>
        </div>

        {/* Example Problem */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-6 space-y-3">
          <h2 className="text-base font-semibold text-slate-600 dark:text-slate-400">Example Problem</h2>
          <p>A block of aluminum has a mass of 2,700&nbsp;g and occupies 1,000&nbsp;cm&sup3;. What is its density?</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Convert to SI: m&nbsp;=&nbsp;2.7&nbsp;kg, V&nbsp;=&nbsp;0.001&nbsp;m&sup3;</li>
            <li>&rho; = 2.7 / 0.001 = <strong>2,700&nbsp;kg/m&sup3;</strong></li>
          </ol>
          <p>This matches the known density of aluminum, confirming the sample is pure.</p>
        </div>

        {/* FAQ */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-6 space-y-5">
          <h2 className="text-base font-semibold text-slate-600 dark:text-slate-400">Frequently Asked Questions</h2>

          <div className="space-y-1">
            <h3 className="font-medium text-foreground">How do you calculate density from mass and volume?</h3>
            <p>
              Divide the mass by the volume: &rho;&nbsp;=&nbsp;m&nbsp;/&nbsp;V. For example, a
              500&nbsp;g object that occupies 200&nbsp;cm&sup3; has a density of
              500&nbsp;/&nbsp;200&nbsp;=&nbsp;2.5&nbsp;g/cm&sup3;.
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="font-medium text-foreground">What is the density of water?</h3>
            <p>
              Pure water at 4&nbsp;&deg;C has a density of 1,000&nbsp;kg/m&sup3; (1&nbsp;g/cm&sup3;).
              This value decreases slightly as temperature rises or falls from 4&nbsp;&deg;C.
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="font-medium text-foreground">Does an object float if its density is less than water?</h3>
            <p>
              Yes. An object floats in a fluid when it is less dense than that fluid. Wood
              (~600&nbsp;kg/m&sup3;) floats on water, while iron (~7,870&nbsp;kg/m&sup3;) sinks.
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="font-medium text-foreground">What is the difference between density and specific gravity?</h3>
            <p>
              Density has units (kg/m&sup3;), while specific gravity is a dimensionless ratio of a
              substance&apos;s density to the density of a reference (usually water). A specific gravity
              of 2.7 means the substance is 2.7 times denser than water.
            </p>
          </div>
        </div>

        {/* Related Calculators */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-6 space-y-3">
          <h2 className="text-base font-semibold text-slate-600 dark:text-slate-400">Related Calculators</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><a href="/specific-gravity" className="text-cyan-600 hover:underline">Specific Gravity Calculator</a> — compare a substance&apos;s density to a reference.</li>
            <li><a href="/specific-volume" className="text-cyan-600 hover:underline">Specific Volume Calculator</a> — find volume per unit mass (the reciprocal of density).</li>
            <li><a href="/fluid-pressure" className="text-cyan-600 hover:underline">Fluid Pressure Calculator</a> — calculate pressure in a fluid column using density and depth.</li>
            <li><a href="/weight" className="text-cyan-600 hover:underline">Weight Equation Calculator</a> — find gravitational force from mass.</li>
            <li><a href="/density-converter" className="text-cyan-600 hover:underline">Density Converter</a> — convert between kg/m³, g/cm³, lb/ft³, and other density units.</li>
          </ul>
        </div>

        <div className="text-xs text-muted-foreground border-t pt-4">
          <p>
            <strong>Reference:</strong> Tipler, Paul A. 1995. <em>Physics For Scientists and Engineers</em>.
            Worth Publishers. 3rd ed.
          </p>
        </div>
      </section>

    </>
  );
}
