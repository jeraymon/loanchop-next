"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import BigNumber from "bignumber.js";
import { formatResult } from "@/shared-math/math-config";
import { solveForce, solveMass as solveForceMass, solveAcceleration as solveForceAccel } from "./calc";
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

const forceSchema        = z.object({ mass: positiveNum, acceleration: positiveNum });
const massSchema         = z.object({ force: positiveNum, acceleration: positiveNum });
const accelerationSchema = z.object({ force: positiveNum, mass: positiveNum });

const schemas = {
  force: forceSchema,
  mass: massSchema,
  acceleration: accelerationSchema,
} as const;

type SolveFor = keyof typeof schemas;

// ---------------------------------------------------------------------------
// Formulas
// ---------------------------------------------------------------------------

const formulas: Record<SolveFor, string> = {
  force:        "F = m \\times a",
  mass:         "m = \\frac{F}{a}",
  acceleration: "a = \\frac{F}{m}",
};

const srFormulas: Record<SolveFor, string> = {
  force:        "Force equals mass multiplied by acceleration",
  mass:         "Mass equals force divided by acceleration",
  acceleration: "Acceleration equals force divided by mass",
};

// ---------------------------------------------------------------------------
// Breadcrumbs
// ---------------------------------------------------------------------------

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Physics", href: "/#physics" },
  { label: "Force Calculator", href: "/force" },
];

// ---------------------------------------------------------------------------
// Precompute dropdown options from shared unit library
// ---------------------------------------------------------------------------

const forceOptions        = getUnitOptions("force");
const massOptions         = getUnitOptions("mass");
const accelerationOptions = getUnitOptions("acceleration");

const forceLabels        = Object.fromEntries(forceOptions.map(o => [o.key, o.label]));
const massLabels         = Object.fromEntries(massOptions.map(o => [o.key, o.label]));
const accelerationLabels = Object.fromEntries(accelerationOptions.map(o => [o.key, o.label]));

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
  const [solveFor, setSolveFor] = useState<SolveFor>("force");
  const [solution, setSolution] = useState<string | null>(null);
  const [resultRows, setResultRows] = useState<ResultRow[]>([]);

  // Unit selections
  const [forceUnit, setForceUnit]               = useState("newton");
  const [massUnit, setMassUnit]                 = useState("kilogram");
  const [accelerationUnit, setAccelerationUnit] = useState("meter/second^2");

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
    const sf = searchParams.get("solveFor") as SolveFor | null;
    if (!sf || !schemas[sf]) { setParamsLoaded(true); return; }

    setSolveFor(sf);
    if (searchParams.get("forceUnit")) setForceUnit(searchParams.get("forceUnit")!);
    if (searchParams.get("massUnit")) setMassUnit(searchParams.get("massUnit")!);
    if (searchParams.get("accelUnit")) setAccelerationUnit(searchParams.get("accelUnit")!);

    // Set form values after a tick so the form is re-rendered with the new schema
    setTimeout(() => {
      if (searchParams.get("force")) setValue("force", searchParams.get("force")!);
      if (searchParams.get("mass")) setValue("mass", searchParams.get("mass")!);
      if (searchParams.get("acceleration")) setValue("acceleration", searchParams.get("acceleration")!);

      // Auto-submit
      handleSubmit(onSubmit)();
    }, 100);
    setParamsLoaded(true);
  }, [searchParams, paramsLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = (data: Record<string, string>) => {
    const forceVal        = new BigNumber(data.force        ?? 0);
    const massVal         = new BigNumber(data.mass         ?? 0);
    const accelerationVal = new BigNumber(data.acceleration ?? 0);

    // Canonical units: newton, kilogram, meter/second^2
    let resultInCanonical: BigNumber;
    let resultCategory: UnitCategory;
    let resultUnitKey: string;

    if (solveFor === "force") {
      const mKg  = convertUnit(massVal, massUnit, "kilogram", "mass");
      const aMs2 = convertUnit(accelerationVal, accelerationUnit, "meter/second^2", "acceleration");
      resultInCanonical = solveForce(mKg, aMs2);
      resultCategory = "force";
      resultUnitKey  = forceUnit;
    } else if (solveFor === "mass") {
      const fN   = convertUnit(forceVal, forceUnit, "newton", "force");
      const aMs2 = convertUnit(accelerationVal, accelerationUnit, "meter/second^2", "acceleration");
      if (aMs2.isZero()) return;
      resultInCanonical = solveForceMass(fN, aMs2);
      resultCategory = "mass";
      resultUnitKey  = massUnit;
    } else {
      const fN  = convertUnit(forceVal, forceUnit, "newton", "force");
      const mKg = convertUnit(massVal, massUnit, "kilogram", "mass");
      if (mKg.isZero()) return;
      resultInCanonical = solveForceAccel(fN, mKg);
      resultCategory = "acceleration";
      resultUnitKey  = accelerationUnit;
    }

    // Convert canonical result to user-selected unit
    const canonicalUnit = resultCategory === "force" ? "newton"
      : resultCategory === "mass" ? "kilogram"
      : "meter/second^2";
    const resultInSelectedUnit = convertUnit(resultInCanonical, canonicalUnit, resultUnitKey, resultCategory);
    const unitLabel = getUnitLabel(resultCategory, resultUnitKey);
    setSolution(`${formatResult(resultInSelectedUnit)} ${unitLabel}`);

    // Update URL with shareable params
    const params = new URLSearchParams();
    params.set("solveFor", solveFor);
    if (data.force) params.set("force", data.force);
    if (data.mass) params.set("mass", data.mass);
    if (data.acceleration) params.set("acceleration", data.acceleration);
    params.set("forceUnit", forceUnit);
    params.set("massUnit", massUnit);
    params.set("accelUnit", accelerationUnit);
    window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);

    // Build conversion table
    const rows: ResultRow[] = getUnitKeys(resultCategory).map((key) => ({
      label: getUnitLabel(resultCategory, key),
      value: formatResult(convertUnit(resultInCanonical, canonicalUnit, key, resultCategory)),
    }));
    setResultRows(rows);
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
        title="Force Equation Calculator"
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
                    force: "Force (F)",
                    mass: "Mass (m)",
                    acceleration: "Acceleration (a)",
                  };
                  return labels[v] ?? v;
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="force">Force (F)</SelectItem>
              <SelectItem value="mass">Mass (m)</SelectItem>
              <SelectItem value="acceleration">Acceleration (a)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Force input */}
        {solveFor !== "force" && (
          <div className="space-y-2">
            <Label htmlFor="force">Force (F)</Label>
            <div className="flex gap-2">
              <Input
                id="force"
                type="number"
                step="any"
                placeholder="Enter force"
                {...register("force")}
              />
              <Select value={forceUnit} onValueChange={(v) => v && setForceUnit(v)}>
                <SelectTrigger className="w-50">
                  <SelectValue>{(v: string) => forceLabels[v] ?? v}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {forceOptions.map(({ key, label }) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {errors.force && (
              <p className="text-red-500 text-sm">{errors.force.message?.toString()}</p>
            )}
          </div>
        )}

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

        {/* Acceleration input */}
        {solveFor !== "acceleration" && (
          <div className="space-y-2">
            <Label htmlFor="acceleration">Acceleration (a)</Label>
            <div className="flex gap-2">
              <Input
                id="acceleration"
                type="number"
                step="any"
                placeholder="Enter acceleration"
                {...register("acceleration")}
              />
              <Select value={accelerationUnit} onValueChange={(v) => v && setAccelerationUnit(v)}>
                <SelectTrigger className="w-50">
                  <SelectValue>{(v: string) => accelerationLabels[v] ?? v}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {accelerationOptions.map(({ key, label }) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {errors.acceleration && (
              <p className="text-red-500 text-sm">{errors.acceleration.message?.toString()}</p>
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
        <ShareButtons title="Force Equation Calculator" solution={solution ?? ""} />
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
            The force equation F&nbsp;=&nbsp;m&nbsp;&times;&nbsp;a (Newton&apos;s second law) tells you how much force is
            needed to accelerate an object. The heavier the object or the faster you want it to speed up, the
            more force you need. You can rearrange the same equation to solve for mass or acceleration when
            the other two values are known.
          </p>
          <p>
            The SI unit of force is the newton (N). Other common units include dyne (CGS),
            kilogram-force (kgf), pound-force (lbf), and kip (1,000&nbsp;lbf). Use the
            <strong> Solve For</strong> dropdown above to pick which variable to calculate.
          </p>
          <Button
            variant="outline"
            className="mt-2 border-cyan-600 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950"
            onClick={() => jumpToCalculator("force")}
          >
            Calculate Force &uarr;
          </Button>
        </div>

        {/* Example Problem */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-6 space-y-3">
          <h2 className="text-base font-semibold text-slate-600 dark:text-slate-400">Example Problem</h2>
          <p>
            A 1,200&nbsp;kg car accelerates from rest to 20&nbsp;m/s in 10&nbsp;seconds. What force is required?
          </p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Calculate acceleration: a = (20&nbsp;&minus;&nbsp;0) / 10 = 2&nbsp;m/s&sup2;</li>
            <li>Apply the force equation: F = 1,200&nbsp;kg &times; 2&nbsp;m/s&sup2; = <strong>2,400&nbsp;N</strong></li>
          </ol>
          <p>
            A simpler example: a 5&nbsp;kg object accelerates at 3&nbsp;m/s&sup2;.
            The force is 5&nbsp;&times;&nbsp;3&nbsp;=&nbsp;<strong>15&nbsp;N</strong>.
          </p>
        </div>

        {/* When to Use Each Variable */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-6 space-y-3">
          <h2 className="text-base font-semibold text-slate-600 dark:text-slate-400">When to Use Each Variable</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Solve for Force</strong> — when you know mass and acceleration, e.g., determining the thrust needed to accelerate a vehicle.</li>
            <li><strong>Solve for Mass</strong> — when you know force and acceleration, e.g., finding the mass of an object from its motion under a known force.</li>
            <li><strong>Solve for Acceleration</strong> — when you know force and mass, e.g., calculating how quickly a rocket speeds up given its thrust and mass.</li>
          </ul>
        </div>

        {/* FAQ */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-6 space-y-5">
          <h2 className="text-base font-semibold text-slate-600 dark:text-slate-400">Frequently Asked Questions</h2>

          <div className="space-y-1">
            <h3 className="font-medium text-foreground">What is the force equation?</h3>
            <p>
              The force equation is F&nbsp;=&nbsp;m&nbsp;&times;&nbsp;a, also known as Newton&apos;s second law. It states
              that force equals an object&apos;s mass multiplied by its acceleration. For example, pushing a 10&nbsp;kg
              cart with an acceleration of 2&nbsp;m/s&sup2; requires 20&nbsp;N of force.
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="font-medium text-foreground">What is the difference between mass and weight?</h3>
            <p>
              Mass measures the amount of matter in an object (in kilograms) and stays the same everywhere.
              Weight is the gravitational force acting on that mass (in newtons) and changes depending on
              where you are. On the Moon, your weight is about one-sixth of what it is on Earth, but your
              mass is unchanged.
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="font-medium text-foreground">How does increasing mass affect acceleration?</h3>
            <p>
              If the applied force stays the same, increasing the mass decreases the acceleration.
              This follows directly from a&nbsp;=&nbsp;F&nbsp;/&nbsp;m. Doubling the mass cuts the
              acceleration in half.
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="font-medium text-foreground">Can you use the force equation for objects moving in a circle?</h3>
            <p>
              Yes. For circular motion the centripetal force keeps the object on its curved path.
              You still apply F&nbsp;=&nbsp;m&nbsp;&times;&nbsp;a, where the acceleration is the centripetal
              acceleration directed toward the center of the circle.
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="font-medium text-foreground">What are common mistakes when using F = ma?</h3>
            <p>
              The most common errors are confusing mass with weight, using inconsistent units (e.g., grams
              instead of kilograms), and forgetting that force and acceleration are vectors with direction.
              Always convert to consistent units before calculating.
            </p>
          </div>
        </div>

        {/* Related Calculators */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-6 space-y-3">
          <h2 className="text-base font-semibold text-slate-600 dark:text-slate-400">Related Calculators</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><a href="/gravity" className="text-cyan-600 hover:underline">Gravity Equations Calculator</a> — calculate gravitational force between two masses.</li>
            <li><a href="/kinetic-energy" className="text-cyan-600 hover:underline">Kinetic Energy Calculator</a> — find the energy of a moving object from its mass and velocity.</li>
            <li><a href="/newtons-second-law" className="text-cyan-600 hover:underline">Newton&apos;s Second Law Calculator</a> — explore additional forms and applications of F&nbsp;=&nbsp;ma.</li>
            <li><a href="/impulse-momentum" className="text-cyan-600 hover:underline">Impulse &amp; Momentum Calculator</a> &mdash; relate force, time, and momentum change.</li>
            <li><a href="/friction" className="text-cyan-600 hover:underline">Friction Equations Calculator</a> &mdash; calculate friction force from the normal force and coefficient.</li>
            <li><a href="/force-converter" className="text-cyan-600 hover:underline">Force Unit Converter</a> &mdash; convert between newtons, pounds-force, dynes, and more.</li>
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
