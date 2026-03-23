"use client";

import { useSearchParams } from "next/navigation";
import { useState, useMemo, useCallback, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import AutoChartCalculatorShell from "@/components/AutoChartCalculatorShell";
import ShareButtons from "@/components/ShareButtons";
import AdSlot from "@/components/AdSlot";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button"; // used by CTA buttons
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Lazy-load the entire chart component to avoid SSR issues with Recharts
const DogAgeChart = dynamic(() => import("./DogAgeChart"), { ssr: false });

// ---------------------------------------------------------------------------
// Breed lifespan data (from legacy ExtJS app, sourced from Wikipedia)
// ---------------------------------------------------------------------------

type Breed = { breed: string; lower: number; upper: number };

const breeds: Breed[] = [
  { breed: "Affenpinscher", lower: 12, upper: 14 },
  { breed: "Afghan Hound", lower: 12, upper: 14 },
  { breed: "Airedale Terrier", lower: 10, upper: 12 },
  { breed: "Akita", lower: 11, upper: 15 },
  { breed: "Alaskan Malamute", lower: 13, upper: 16 },
  { breed: "American Cocker Spaniel", lower: 12, upper: 15 },
  { breed: "American Eskimo Dog", lower: 13, upper: 15 },
  { breed: "American Foxhound", lower: 10, upper: 12 },
  { breed: "American Staffordshire Terrier", lower: 10, upper: 12 },
  { breed: "American Water Spaniel", lower: 13, upper: 15 },
  { breed: "Anatolian Shepherd Dog", lower: 13, upper: 15 },
  { breed: "Australian Cattle Dog", lower: 13, upper: 15 },
  { breed: "Australian Shepherd", lower: 13, upper: 15 },
  { breed: "Australian Silky Terrier", lower: 12, upper: 15 },
  { breed: "Australian Terrier", lower: 12, upper: 15 },
  { breed: "Basenji", lower: 12, upper: 16 },
  { breed: "Basset Hound", lower: 10, upper: 12 },
  { breed: "Beagle", lower: 12, upper: 15 },
  { breed: "Bearded Collie", lower: 14, upper: 15 },
  { breed: "Beauceron", lower: 10, upper: 12 },
  { breed: "Belgian Shepherd", lower: 10, upper: 14 },
  { breed: "Bedlington Terrier", lower: 12, upper: 14 },
  { breed: "Belgian Shepherd Malinois", lower: 12, upper: 14 },
  { breed: "Bernese Mountain Dog", lower: 7, upper: 8 },
  { breed: "Bichon Frise", lower: 12, upper: 15 },
  { breed: "Black and Tan Coonhound", lower: 10, upper: 12 },
  { breed: "Black Russian Terrier", lower: 10, upper: 11 },
  { breed: "Bloodhound", lower: 10, upper: 12 },
  { breed: "Bluetick Coonhound", lower: 11, upper: 12 },
  { breed: "Border Collie", lower: 13, upper: 16 },
  { breed: "Border Terrier", lower: 12, upper: 15 },
  { breed: "Borzoi", lower: 7, upper: 10 },
  { breed: "Boston Terrier", lower: 13, upper: 15 },
  { breed: "Briard", lower: 10, upper: 12 },
  { breed: "Bouvier des Flandres", lower: 10, upper: 12 },
  { breed: "Boxer", lower: 10, upper: 12 },
  { breed: "Boykin Spaniel", lower: 14, upper: 16 },
  { breed: "Brittany", lower: 14, upper: 15 },
  { breed: "Bull Terrier", lower: 11, upper: 14 },
  { breed: "Bulldog", lower: 8, upper: 12 },
  { breed: "Bullmastiff", lower: 8, upper: 10 },
  { breed: "Cairn Terrier", lower: 12, upper: 15 },
  { breed: "Canaan Dog", lower: 12, upper: 15 },
  { breed: "Cane Corso", lower: 10, upper: 11 },
  { breed: "Cavalier King Charles Spaniel", lower: 9, upper: 14 },
  { breed: "Cesky Terrier", lower: 12, upper: 15 },
  { breed: "Chesapeake Bay Retriever", lower: 10, upper: 12 },
  { breed: "Chihuahua", lower: 10, upper: 18 },
  { breed: "Chinese Crested Dog", lower: 13, upper: 15 },
  { breed: "Chow Chow", lower: 9, upper: 12 },
  { breed: "Clumber Spaniel", lower: 10, upper: 12 },
  { breed: "Curly Coated Retriever", lower: 9, upper: 14 },
  { breed: "Dachshund", lower: 14, upper: 17 },
  { breed: "Dalmatian", lower: 10, upper: 13 },
  { breed: "Dandie Dinmont Terrier", lower: 12, upper: 15 },
  { breed: "Doberman Pinscher", lower: 10, upper: 11 },
  { breed: "Dogue de Bordeaux", lower: 10, upper: 12 },
  { breed: "English Bulldog", lower: 8, upper: 12 },
  { breed: "English Cocker Spaniel", lower: 12, upper: 15 },
  { breed: "English Coonhound", lower: 11, upper: 12 },
  { breed: "English Foxhound", lower: 10, upper: 13 },
  { breed: "English Mastiff", lower: 10, upper: 12 },
  { breed: "English Setter", lower: 10, upper: 12 },
  { breed: "English Springer Spaniel", lower: 12, upper: 14 },
  { breed: "Entlebucher Mountain Dog", lower: 11, upper: 15 },
  { breed: "Field Spaniel", lower: 10, upper: 12 },
  { breed: "Finnish Lapphund", lower: 12, upper: 14 },
  { breed: "Finnish Spitz", lower: 12, upper: 14 },
  { breed: "Flat-Coated Retriever", lower: 8, upper: 10 },
  { breed: "French Bulldog", lower: 10, upper: 12 },
  { breed: "German Pinscher", lower: 12, upper: 14 },
  { breed: "German Shepherd", lower: 9, upper: 13 },
  { breed: "German Shorthaired Pointer", lower: 12, upper: 14 },
  { breed: "German Wirehaired Pointer", lower: 12, upper: 14 },
  { breed: "Giant Schnauzer", lower: 12, upper: 15 },
  { breed: "Glen of Imaal Terrier", lower: 13, upper: 14 },
  { breed: "Golden Retriever", lower: 10, upper: 12 },
  { breed: "Gordon Setter", lower: 10, upper: 12 },
  { breed: "Great Dane", lower: 6, upper: 8 },
  { breed: "Great Pyrenees", lower: 10, upper: 12 },
  { breed: "Greater Swiss Mountain Dog", lower: 10, upper: 11 },
  { breed: "Greyhound", lower: 10, upper: 12 },
  { breed: "Griffon Bruxellois", lower: 12, upper: 15 },
  { breed: "Harrier", lower: 10, upper: 12 },
  { breed: "Havanese", lower: 13, upper: 15 },
  { breed: "Ibizan Hound", lower: 10, upper: 12 },
  { breed: "Icelandic Sheepdog", lower: 12, upper: 15 },
  { breed: "Irish Red and White Setter", lower: 10, upper: 13 },
  { breed: "Irish Setter", lower: 12, upper: 15 },
  { breed: "Irish Soft-coated Wheaten Terrier", lower: 12, upper: 15 },
  { breed: "Irish Terrier", lower: 13, upper: 15 },
  { breed: "Irish Water Spaniel", lower: 10, upper: 12 },
  { breed: "Irish Wolfhound", lower: 6, upper: 10 },
  { breed: "Italian Greyhound", lower: 12, upper: 15 },
  { breed: "Jack Russell Terrier", lower: 13, upper: 16 },
  { breed: "Japanese Chin", lower: 12, upper: 14 },
  { breed: "Keeshond", lower: 13, upper: 15 },
  { breed: "Kerry Blue Terrier", lower: 13, upper: 15 },
  { breed: "King Charles Spaniel", lower: 12, upper: 14 },
  { breed: "Komondor", lower: 10, upper: 12 },
  { breed: "Kuvasz", lower: 10, upper: 12 },
  { breed: "Labrador Retriever", lower: 12, upper: 13 },
  { breed: "Lakeland Terrier", lower: 12, upper: 16 },
  { breed: "Leonberger", lower: 8, upper: 9 },
  { breed: "Lhasa Apso", lower: 12, upper: 14 },
  { breed: "Lowchen", lower: 12, upper: 14 },
  { breed: "Maltese", lower: 12, upper: 15 },
  { breed: "Manchester Terrier", lower: 14, upper: 16 },
  { breed: "Mexican Hairless Dog", lower: 12, upper: 15 },
  { breed: "Miniature Pinscher", lower: 14, upper: 15 },
  { breed: "Miniature Schnauzer", lower: 12, upper: 15 },
  { breed: "Neapolitan Mastiff", lower: 8, upper: 10 },
  { breed: "Newfoundland", lower: 8, upper: 12 },
  { breed: "Norfolk Terrier", lower: 12, upper: 15 },
  { breed: "Norwegian Buhund", lower: 13, upper: 15 },
  { breed: "Norwegian Elkhound", lower: 12, upper: 15 },
  { breed: "Norwegian Lundehund", lower: 12, upper: 14 },
  { breed: "Norwich Terrier", lower: 12, upper: 14 },
  { breed: "Nova Scotia Duck Tolling Retriever", lower: 12, upper: 14 },
  { breed: "Old English Sheepdog", lower: 10, upper: 12 },
  { breed: "Otterhound", lower: 10, upper: 13 },
  { breed: "Papillon", lower: 13, upper: 15 },
  { breed: "Parson Russell Terrier", lower: 13, upper: 15 },
  { breed: "Pekingese", lower: 12, upper: 15 },
  { breed: "Pembroke Welsh Corgi", lower: 12, upper: 14 },
  { breed: "Petit Basset Griffon Vendeen", lower: 12, upper: 14 },
  { breed: "Pharaoh Hound", lower: 11, upper: 14 },
  { breed: "Plott Hound", lower: 12, upper: 14 },
  { breed: "Pointer", lower: 12, upper: 14 },
  { breed: "Polish Lowland Sheepdog", lower: 12, upper: 15 },
  { breed: "Pomeranian", lower: 12, upper: 16 },
  { breed: "Poodle", lower: 12, upper: 15 },
  { breed: "Portuguese Water Dog", lower: 12, upper: 15 },
  { breed: "Pug", lower: 12, upper: 15 },
  { breed: "Puli", lower: 12, upper: 16 },
  { breed: "Pyrenean Shepherd", lower: 15, upper: 17 },
  { breed: "Redbone Coonhound", lower: 11, upper: 12 },
  { breed: "Rhodesian Ridgeback", lower: 10, upper: 12 },
  { breed: "Rottweiler", lower: 9, upper: 10 },
  { breed: "Rough Collie", lower: 14, upper: 16 },
  { breed: "Saluki", lower: 12, upper: 14 },
  { breed: "Samoyed", lower: 12, upper: 14 },
  { breed: "Schipperke", lower: 13, upper: 15 },
  { breed: "Scottish Deerhound", lower: 8, upper: 11 },
  { breed: "Scottish Terrier", lower: 12, upper: 15 },
  { breed: "Sealyham Terrier", lower: 12, upper: 14 },
  { breed: "Shar Pei", lower: 9, upper: 11 },
  { breed: "Shetland Sheepdog", lower: 12, upper: 13 },
  { breed: "Shiba Inu", lower: 12, upper: 15 },
  { breed: "Shih Tzu", lower: 10, upper: 16 },
  { breed: "Siberian Husky", lower: 12, upper: 15 },
  { breed: "Skye Terrier", lower: 12, upper: 15 },
  { breed: "Smooth Fox Terrier", lower: 12, upper: 15 },
  { breed: "Spinone Italiano", lower: 12, upper: 14 },
  { breed: "St. Bernard", lower: 8, upper: 10 },
  { breed: "Staffordshire Bull Terrier", lower: 12, upper: 14 },
  { breed: "Standard Schnauzer", lower: 12, upper: 14 },
  { breed: "Sussex Spaniel", lower: 12, upper: 15 },
  { breed: "Swedish Vallhund", lower: 12, upper: 14 },
  { breed: "Tibetan Mastiff", lower: 10, upper: 12 },
  { breed: "Tibetan Spaniel", lower: 12, upper: 15 },
  { breed: "Tibetan Terrier", lower: 12, upper: 15 },
  { breed: "Toy Fox Terrier", lower: 13, upper: 14 },
  { breed: "Treeing Walker Coonhound", lower: 12, upper: 13 },
  { breed: "Tervuren", lower: 12, upper: 14 },
  { breed: "Vizsla", lower: 12, upper: 15 },
  { breed: "Weimaraner", lower: 10, upper: 12 },
  { breed: "Welsh Springer Spaniel", lower: 12, upper: 15 },
  { breed: "Welsh Terrier", lower: 12, upper: 15 },
  { breed: "West Highland White Terrier", lower: 12, upper: 16 },
  { breed: "Whippet", lower: 12, upper: 15 },
  { breed: "Wire Hair Fox Terrier", lower: 13, upper: 14 },
  { breed: "Wirehaired Pointing Griffon", lower: 10, upper: 12 },
  { breed: "Xoloitzcuintle", lower: 12, upper: 15 },
  { breed: "Yorkshire Terrier", lower: 13, upper: 16 },
];

const breedLabels = Object.fromEntries(breeds.map((b) => [b.breed, b.breed]));

// ---------------------------------------------------------------------------
// Aging formula (from legacy ExtJS app) — extracted to calc-dog-age.ts for testability
// ---------------------------------------------------------------------------

import { calcDogAge } from "./calc-dog-age";
export { calcDogAge };

// ---------------------------------------------------------------------------
// Breadcrumbs
// ---------------------------------------------------------------------------

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Everyday & Health", href: "/#everyday" },
  { label: "Dog Age Calculator", href: "/dog-age" },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Calculator() {
  return (
    <Suspense fallback={null}>
      <CalculatorInner />
    </Suspense>
  );
}

function CalculatorInner() {
  const searchParams = useSearchParams();
  const [selectedBreed, setSelectedBreed] = useState(breeds[0].breed);
  const [years, setYears] = useState("3");
  const [months, setMonths] = useState("0");
  const [firstYearAging] = useState(15);
  const [secondYearAging] = useState(9);
  const [humanLifeExpectancy] = useState(68);

  // Load from URL params on mount
  const [paramsLoaded, setParamsLoaded] = useState(false);
  useEffect(() => {
    if (paramsLoaded) return;
    const breed = searchParams.get("breed");
    const y = searchParams.get("years");
    const m = searchParams.get("months");
    if (breed) setSelectedBreed(breed);
    if (y) setYears(y);
    if (m) setMonths(m);
    setParamsLoaded(true);
  }, [searchParams, paramsLoaded]);

  // Update URL when inputs change
  useEffect(() => {
    if (!paramsLoaded) return;
    const params = new URLSearchParams();
    params.set("breed", selectedBreed);
    params.set("years", years);
    params.set("months", months);
    window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
  }, [selectedBreed, years, months, paramsLoaded]);

  const breedData = useMemo(
    () => breeds.find((b) => b.breed === selectedBreed) ?? breeds[0],
    [selectedBreed],
  );

  const lifeExpectancy = (breedData.lower + breedData.upper) / 2;

  const calendarAge = Math.min(
    20,
    Math.max(0, (Number(years) || 0) + (Number(months) || 0) / 12),
  );

  const dogAge = calcDogAge(
    calendarAge,
    lifeExpectancy,
    firstYearAging,
    secondYearAging,
    humanLifeExpectancy,
  );

  // Chart data: age curve from 0–20 calendar years
  const chartData = useMemo(() => {
    const data = [];
    for (let i = 0; i <= 20; i++) {
      data.push({
        calendarAge: i,
        dogAge: Math.round(
          calcDogAge(i, lifeExpectancy, firstYearAging, secondYearAging, humanLifeExpectancy) * 10,
        ) / 10,
      });
    }
    return data;
  }, [lifeExpectancy, firstYearAging, secondYearAging, humanLifeExpectancy]);

  const solution =
    calendarAge > 0
      ? `${dogAge.toFixed(1)} human years`
      : null;

  const scrollToSolution = useCallback(() => {
    setTimeout(() => {
      document.getElementById("solution")?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }, []);

  return (
    <>
      <AutoChartCalculatorShell
        id="calculator"
        title="Dog Age Calculator"
        solution={solution}
        breadcrumbs={breadcrumbs}
        chart={
          <div className="space-y-3">
            <h2 className="text-base font-semibold text-slate-600 dark:text-slate-400">
              Age Curve &mdash; {selectedBreed}
            </h2>
            <p className="text-sm text-muted-foreground">
              Dog age in equivalent human years over the lifespan, based on a{" "}
              {breedData.lower}&ndash;{breedData.upper} year life expectancy.
            </p>
            <div className="w-full h-[300px] sm:h-[350px]">
              <DogAgeChart
                data={chartData}
                markerX={calendarAge > 0 ? Math.round(calendarAge) : undefined}
                markerY={
                  calendarAge > 0
                    ? Math.round(
                        calcDogAge(
                          Math.round(calendarAge),
                          lifeExpectancy,
                          firstYearAging,
                          secondYearAging,
                          humanLifeExpectancy,
                        ) * 10,
                      ) / 10
                    : undefined
                }
              />
            </div>
            {calendarAge > 0 && (
              <p className="text-sm text-center font-medium text-foreground">
                Your {selectedBreed} at {calendarAge.toFixed(1)} calendar years ={" "}
                <strong className="text-cyan-600">{dogAge.toFixed(1)} human years</strong>
              </p>
            )}
          </div>
        }
        table={
          solution ? (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                Age Conversion Table &mdash; {selectedBreed}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="py-2 pr-4 text-left font-semibold text-slate-700 dark:text-slate-300">Calendar Years</th>
                      <th className="py-2 text-left font-semibold text-slate-700 dark:text-slate-300">Human Years</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 20].map((yr) => (
                      <tr
                        key={yr}
                        className={
                          Math.round(calendarAge) === yr
                            ? "bg-cyan-50 dark:bg-cyan-950 font-semibold"
                            : ""
                        }
                      >
                        <td className="py-1.5 pr-4">{yr}</td>
                        <td className="py-1.5">
                          {calcDogAge(yr, lifeExpectancy, firstYearAging, secondYearAging, humanLifeExpectancy).toFixed(1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null
        }
      >
        {/* Breed selector */}
        <div className="space-y-2">
          <Label htmlFor="breed">Dog Breed</Label>
          <Select value={selectedBreed} onValueChange={(v: string | null) => v && setSelectedBreed(v)}>
            <SelectTrigger id="breed">
              <SelectValue>{(v: string) => breedLabels[v] ?? v}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {breeds.map((b) => (
                <SelectItem key={b.breed} value={b.breed}>
                  {b.breed}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Life expectancy: {breedData.lower}&ndash;{breedData.upper} years
          </p>
        </div>

        {/* Age inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="years">Years</Label>
            <Input
              id="years"
              type="number"
              min="0"
              max="20"
              step="1"
              value={years}
              onChange={(e) => setYears(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="months">Months</Label>
            <Input
              id="months"
              type="number"
              min="0"
              max="11"
              step="1"
              value={months}
              onChange={(e) => setMonths(e.target.value)}
            />
          </div>
        </div>

      </AutoChartCalculatorShell>

      {/* Share buttons — outside the shell */}
      <div className="max-w-3xl mx-auto">
        <ShareButtons title="Dog Age Calculator" solution={solution ?? ""} />
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
            Dogs age rapidly in their first two years and then slow to a breed-dependent rate. This
            calculator uses a three-phase model: 15 human years for year&nbsp;1, 9 more for year&nbsp;2
            (reaching 24), then a linear rate calibrated to the breed&rsquo;s average lifespan. Larger
            breeds age faster per year than smaller ones.
          </p>
          <Button
            variant="outline"
            className="mt-2 border-cyan-600 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950"
            onClick={scrollToSolution}
          >
            Calculate Dog Age &uarr;
          </Button>
        </div>

        {/* Example Problem */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-6 space-y-3">
          <h2 className="text-base font-semibold text-slate-600 dark:text-slate-400">Example Problem</h2>
          <p>A 5-year-old Labrador Retriever (life expectancy 12&ndash;13&nbsp;years, avg 12.5). What is the human-equivalent age?</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Year 1: 15 human years</li>
            <li>Year 2: +9 = 24 human years</li>
            <li>Rate after 2: (68 &minus; 24) / (12.5 &minus; 2) = 4.19 per year</li>
            <li>Years 3&ndash;5: 3 &times; 4.19 = 12.57</li>
            <li>Total: 24 + 12.57 &asymp; <strong>36.6 human years</strong></li>
          </ol>
        </div>

        {/* FAQ */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-6 space-y-5">
          <h2 className="text-base font-semibold text-slate-600 dark:text-slate-400">Frequently Asked Questions</h2>

          <div className="space-y-1">
            <h3 className="font-medium text-foreground">Is the multiply by 7 rule accurate for dogs?</h3>
            <p>
              No. A 1-year-old dog is closer to 15 in human years, not 7. The &ldquo;times 7&rdquo; rule
              ignores the rapid maturation in the first two years and the large variation between breeds.
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="font-medium text-foreground">Why do small dogs live longer than large dogs?</h3>
            <p>
              Researchers believe larger dogs age faster at the cellular level. A Great Dane (6&ndash;8 year
              lifespan) ages roughly twice as fast per year as a Chihuahua (10&ndash;18 years) after age 2.
              The exact biological mechanisms are still being studied.
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="font-medium text-foreground">At what age is a dog considered senior?</h3>
            <p>
              It depends on breed size. Small dogs are considered senior around 10&ndash;12 years, medium
              dogs around 8&ndash;10, and large or giant breeds as early as 5&ndash;6 years. Senior dogs
              benefit from twice-yearly vet visits.
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="font-medium text-foreground">How old is a 10 year old dog in human years?</h3>
            <p>
              It varies by breed. A 10-year-old Beagle (avg lifespan 13.5 years) is about 57 human years,
              while a 10-year-old Great Dane (avg lifespan 7 years) would be roughly 78 human years.
            </p>
          </div>
        </div>

        {/* Related Calculators */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-6 space-y-3">
          <h2 className="text-base font-semibold text-slate-600 dark:text-slate-400">Related Calculators</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><a href="/cat-age" className="text-cyan-600 hover:underline">Cat Age Calculator</a> &mdash; convert cat years to human years using the LeBeau method.</li>
            <li><a href="/weight-loss" className="text-cyan-600 hover:underline">Weight Loss Calculator</a> &mdash; calculate BMI, BMR, and daily calorie needs.</li>
            <li><a href="/heart-rate" className="text-cyan-600 hover:underline">Heart Rate Calculator</a> &mdash; find target heart rate zones for exercise.</li>
            <li><a href="/days-between-dates" className="text-cyan-600 hover:underline">Days Between Dates Calculator</a> &mdash; count days between vet visits or milestones.</li>
            <li><a href="/time-converter" className="text-cyan-600 hover:underline">Time Converter</a> &mdash; convert between seconds, minutes, hours, days, and years.</li>
          </ul>
        </div>
      </section>
    </>
  );
}
