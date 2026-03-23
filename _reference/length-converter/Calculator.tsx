"use client";

import { useState, useMemo, useCallback } from "react";
import BigNumber from "bignumber.js";
import { formatResult } from "@/shared-math/math-config";
import {
  convertUnit,
  getUnitOptions,
  getUnitLabel,
  getUnitKeys,
} from "@/shared-math/units";

import AutoCalculatorShell from "@/components/AutoCalculatorShell";
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

const CATEGORY = "length" as const;

const unitOptions = getUnitOptions(CATEGORY);
const unitLabels = Object.fromEntries(unitOptions.map((o) => [o.key, o.label]));

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Unit Converters", href: "/#unit-converters" },
  { label: "Length Converter", href: "/length-converter" },
];

export function Calculator() {
  const [inputValue, setInputValue] = useState("1");
  const [fromUnit, setFromUnit] = useState("meter");

  const results = useMemo(() => {
    const num = Number(inputValue);
    if (!inputValue || isNaN(num)) return null;
    const value = new BigNumber(inputValue);
    return getUnitKeys(CATEGORY).map((key) => ({
      label: getUnitLabel(CATEGORY, key),
      value: formatResult(convertUnit(value, fromUnit, key, CATEGORY)),
    }));
  }, [inputValue, fromUnit]);

  const solution = useMemo(() => {
    if (!results) return null;
    const num = Number(inputValue);
    if (isNaN(num)) return null;
    return `${inputValue} ${getUnitLabel(CATEGORY, fromUnit)}`;
  }, [results, inputValue, fromUnit]);

  const scrollToCalculator = useCallback(() => {
    setTimeout(() => {
      document.getElementById("calculator")?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }, []);

  return (
    <>
      <AutoCalculatorShell
        id="calculator"
        title="Length Unit Converter"
        latexFormula={"\\text{result} = \\text{value} \\times \\frac{\\text{from factor}}{\\text{to factor}}"}
        srFormulaText="Result equals value times the ratio of conversion factors"
        solution={solution}
        breadcrumbs={breadcrumbs}
        afterSolution={
          results && (
            <div className="mt-8">
              <h2 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-4">
                All Length Conversions
              </h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Unit</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((row) => (
                    <TableRow key={row.label}>
                      <TableCell>{row.label}</TableCell>
                      <TableCell className="text-right font-mono">
                        {row.value}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )
        }
      >
        <div className="space-y-2">
          <Label htmlFor="input-value">Value</Label>
          <Input
            id="input-value"
            type="number"
            step="any"
            placeholder="Enter value"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="from-unit">From Unit</Label>
          <Select value={fromUnit} onValueChange={(v) => v && setFromUnit(v)}>
            <SelectTrigger id="from-unit">
              <SelectValue>
                {(v: string) => unitLabels[v] ?? v}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {unitOptions.map(({ key, label }) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </AutoCalculatorShell>

      <section className="max-w-3xl mx-auto mt-8 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-6 space-y-3">
          <h2 className="text-base font-semibold text-slate-600 dark:text-slate-400">How It Works</h2>
          <p>
            This converter uses a base-unit factor system where every length unit has a known ratio to the
            meter (the SI base unit). To convert, the input value is multiplied by its unit&rsquo;s factor to
            get meters, then divided by the target unit&rsquo;s factor.
          </p>
          <p>
            All arithmetic is performed with arbitrary-precision BigNumber math, so you get accurate results
            even for very large or very small quantities like nanometers or miles.
          </p>
          <Button
            variant="outline"
            className="mt-2 border-cyan-600 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950"
            onClick={() => scrollToCalculator()}
          >
            Convert Length &uarr;
          </Button>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-6 space-y-5">
          <h2 className="text-base font-semibold text-slate-600 dark:text-slate-400">Frequently Asked Questions</h2>

          <div className="space-y-1">
            <h3 className="font-medium text-foreground">How many feet are in a meter?</h3>
            <p>
              One meter equals approximately 3.28084 feet. The meter is defined as the distance light
              travels in a vacuum in 1/299,792,458 of a second, while the foot is defined as exactly
              0.3048 meters.
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="font-medium text-foreground">What is the difference between a mile and a kilometer?</h3>
            <p>
              One mile equals exactly 1.609344 kilometers. Miles are used in the United States and United Kingdom
              for road distances, while kilometers are used in most other countries and in scientific work.
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="font-medium text-foreground">How do I convert inches to centimeters?</h3>
            <p>
              Multiply the number of inches by 2.54. This factor is exact by definition &mdash; one inch is
              defined as precisely 25.4 millimeters (2.54 centimeters).
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-6 space-y-3">
          <h2 className="text-base font-semibold text-slate-600 dark:text-slate-400">Related Converters</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><a href="/area-converter" className="text-cyan-600 hover:underline">Area Converter</a> &mdash; convert between square meters, square feet, acres, and more.</li>
            <li><a href="/volume-converter" className="text-cyan-600 hover:underline">Volume Converter</a> &mdash; convert between liters, gallons, cubic meters, and more.</li>
            <li><a href="/speed-converter" className="text-cyan-600 hover:underline">Speed Converter</a> &mdash; convert between m/s, mph, km/h, and more.</li>
          </ul>
        </div>
      </section>
    </>
  );
}
