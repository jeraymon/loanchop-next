"use client";

import { useState, useMemo, useEffect } from "react";
import BigNumber from "bignumber.js";
import { formatResult } from "@/shared-math/math-config";
import {
  convertUnit,
  getUnitOptions,
  getUnitLabel,
  getUnitKeys,
  type UnitCategory,
} from "@/shared-math/units";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface UnitConverterProps {
  category: UnitCategory;
  title?: string;
}

export default function UnitConverter({ category, title }: UnitConverterProps) {
  const options = useMemo(() => getUnitOptions(category), [category]);
  const labels = useMemo(
    () => Object.fromEntries(options.map((o) => [o.key, o.label])),
    [options],
  );
  const unitKeys = useMemo(() => getUnitKeys(category), [category]);

  const defaultUnit = unitKeys[0] ?? "";
  const [inputValue, setInputValue] = useState("1");
  const [fromUnit, setFromUnit] = useState(defaultUnit);

  // Reset fromUnit when category changes
  useEffect(() => {
    setFromUnit(unitKeys[0] ?? "");
    setInputValue("1");
  }, [category, unitKeys]);

  const rows = useMemo(() => {
    const num = Number(inputValue);
    if (!inputValue || isNaN(num)) return [];

    const value = new BigNumber(inputValue);
    return unitKeys.map((key) => ({
      key,
      label: getUnitLabel(category, key),
      value: formatResult(convertUnit(value, fromUnit, key, category)),
      isFrom: key === fromUnit,
    }));
  }, [inputValue, fromUnit, category, unitKeys]);

  return (
    <div className="space-y-4">
      {title && (
        <h2 className="text-lg font-bold text-slate-700 dark:text-slate-200">
          {title}
        </h2>
      )}

      <div className="space-y-2">
        <Label htmlFor="converter-value">Value</Label>
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <Input
            id="converter-value"
            type="number"
            step="any"
            placeholder="Enter value"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <Select value={fromUnit} onValueChange={(v) => v && setFromUnit(v)}>
            <SelectTrigger className="w-56">
              <SelectValue>{(v: string) => labels[v] ?? v}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {options.map(({ key, label }) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {rows.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Unit</TableHead>
              <TableHead className="text-right">Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.key}
                className={
                  row.isFrom
                    ? "bg-indigo-50 dark:bg-indigo-950 font-semibold"
                    : ""
                }
              >
                <TableCell>{row.label}</TableCell>
                <TableCell className="text-right font-mono">
                  {row.value}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
