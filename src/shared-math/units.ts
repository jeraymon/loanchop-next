import BigNumber from "bignumber.js";

// ---------------------------------------------------------------------------
// Unit definitions ported from legacy-php-backup/php/units/units.php
//
// Each factor is the conversion multiplier TO the base unit for that category.
//   PHP logic: result = inputValue * fromFactor / toFactor
//   JS logic:  toBase(v, unit) = v.times(factor)
//              fromBase(v, unit) = v.div(factor)
//
// Base units:  mass → pound, volume → meter³, density → kg/m³, length → meter,
//              velocity → meter/second, time → hour, acceleration → meter/second²
// Labels follow AGENT.md §4: "Name (Symbol)"
// ---------------------------------------------------------------------------

type UnitEntry = { label: string; factor: number };

const units = {
  mass: {
    "kilogram":               { label: "Kilogram (kg)",               factor: 2.20462262185 },
    "atomic mass unit":       { label: "Atomic Mass Unit (u)",        factor: 3.66036690608e-27 },
    "attogram":               { label: "Attogram (ag)",               factor: 2.20462262185e-21 },
    "carat metric":           { label: "Carat Metric (ct)",           factor: 0.000440924524 },
    "centigram":              { label: "Centigram (cg)",              factor: 2.20462262185e-5 },
    "decigram":               { label: "Decigram (dg)",               factor: 0.000220462262 },
    "dekagram":               { label: "Dekagram (dag)",              factor: 0.0220462262 },
    "dram":                   { label: "Dram (dr)",                   factor: 0.00390625 },
    "exagram":                { label: "Exagram (Eg)",                factor: 2.20462262185e15 },
    "femtogram":              { label: "Femtogram (fg)",              factor: 2.20462262185e-18 },
    "gigagram":               { label: "Gigagram (Gg)",               factor: 2204622.62 },
    "grain":                  { label: "Grain (gr)",                  factor: 1.42857142857e-4 },
    "gram":                   { label: "Gram (g)",                    factor: 2.20462262185e-3 },
    "hundredweight long uk":  { label: "Hundredweight Long UK (cwt)", factor: 112.0 },
    "hundredweight short US": { label: "Hundredweight Short US (cwt)", factor: 100.0 },
    "megagram":               { label: "Megagram (Mg)",               factor: 2204.62262 },
    "microgram":              { label: "Microgram (\u00B5g)",         factor: 2.20462262185e-9 },
    "milligram":              { label: "Milligram (mg)",              factor: 2.20462262185e-6 },
    "nanogram":               { label: "Nanogram (ng)",               factor: 2.20462262185e-12 },
    "ounce":                  { label: "Ounce (oz)",                  factor: 0.0625 },
    "petagram":               { label: "Petagram (Pg)",               factor: 2.20462262185e12 },
    "picogram":               { label: "Picogram (pg)",               factor: 2.20462262185e-15 },
    "planck mass":            { label: "Planck Mass (m\u209A)",       factor: 4.798824107204e-8 },
    "pennyweight":            { label: "Pennyweight (dwt)",           factor: 0.00342857143 },
    "pound":                  { label: "Pound (lb)",                  factor: 1.0 },
    "slug":                   { label: "Slug (slug)",                 factor: 32.1740485564 },
    "solar mass sun":         { label: "Solar Mass (M\u2609)",        factor: 4.38521486e30 },
    "stone":                  { label: "Stone (st)",                  factor: 14.0 },
    "teragram":               { label: "Teragram (Tg)",               factor: 2.20462262185e9 },
    "ton long":               { label: "Ton Long (long tn)",          factor: 2240.0 },
    "ton metric":             { label: "Ton Metric (t)",              factor: 2204.62262185 },
    "ton short":              { label: "Ton Short (short tn)",        factor: 2000.0 },
    "tonne":                  { label: "Tonne (t)",                   factor: 2204.62262185 },
    "troy ounce":             { label: "Troy Ounce (oz t)",           factor: 0.0685714286 },
    "yoctogram":              { label: "Yoctogram (yg)",              factor: 2.20462262185e-27 },
    "yottagram":              { label: "Yottagram (Yg)",              factor: 2.20462262185e21 },
    "zeptogram":              { label: "Zeptogram (zg)",              factor: 2.20462262185e-24 },
    "zettagram":              { label: "Zettagram (Zg)",              factor: 2.20462262185e18 },
  },
  volume: {
    "meter^3":                 { label: "Meter (m\u00B3)",             factor: 1.0 },
    "barrel UK":               { label: "Barrel UK (bbl)",             factor: 0.16365924 },
    "barrel US dry":           { label: "Barrel US Dry (bbl)",         factor: 0.115627124 },
    "barrel US federal":       { label: "Barrel US Federal (bbl)",     factor: 0.117347765 },
    "barrel US liquid":        { label: "Barrel US Liquid (bbl)",      factor: 0.119240471 },
    "barrel US oil petroleum": { label: "Barrel US Oil (bbl)",         factor: 0.158987294928 },
    "bushel UK":               { label: "Bushel UK (bu)",              factor: 0.036368735 },
    "bushel US dry":           { label: "Bushel US Dry (bu)",          factor: 0.035239072 },
    "centimeter^3":            { label: "Centimeter (cm\u00B3)",       factor: 1.0e-6 },
    "cord firewood":           { label: "Cord Firewood (cd)",          factor: 3.624556416 },
    "cord foot wood":          { label: "Cord Foot Wood (cd ft)",      factor: 0.453069552 },
    "cup Canada":              { label: "Cup Canada (c)",              factor: 0.000227305 },
    "cup metric":              { label: "Cup Metric (c)",              factor: 0.00025 },
    "cup US":                  { label: "Cup US (c)",                  factor: 0.000236588238 },
    "deciliter":               { label: "Deciliter (dL)",              factor: 1.0e-4 },
    "decimeter^3":             { label: "Decimeter (dm\u00B3)",        factor: 0.001 },
    "foot^3":                  { label: "Foot (ft\u00B3)",             factor: 0.028316846592 },
    "gallon UK":               { label: "Gallon UK (gal)",             factor: 0.004546092 },
    "gallon US liquid":        { label: "Gallon US (gal)",             factor: 0.003785411784 },
    "inch^3":                  { label: "Inch (in\u00B3)",             factor: 0.000016387064 },
    "kilometer^3":             { label: "Kilometer (km\u00B3)",        factor: 1.0e9 },
    "liter":                   { label: "Liter (L)",                   factor: 0.001 },
    "milliliter":              { label: "Milliliter (mL)",             factor: 1.0e-6 },
    "millimeter^3":            { label: "Millimeter (mm\u00B3)",       factor: 1.0e-9 },
    "ounce UK fluid":          { label: "Ounce UK Fluid (fl oz)",      factor: 2.84130742e-5 },
    "ounce US fluid":          { label: "Ounce US Fluid (fl oz)",      factor: 2.95735295625e-5 },
    "pint UK":                 { label: "Pint UK (pt)",                factor: 0.000568261 },
    "pint US":                 { label: "Pint US (pt)",                factor: 0.000473176473 },
    "quart UK":                { label: "Quart UK (qt)",               factor: 0.00113652 },
    "quart US":                { label: "Quart US (qt)",               factor: 0.000946352946 },
    "stere":                   { label: "Stere (st)",                  factor: 1.0 },
    "tablespoon UK":           { label: "Tablespoon UK (tbsp)",        factor: 1.7758e-5 },
    "tablespoon US":           { label: "Tablespoon US (tbsp)",        factor: 1.47867647813e-5 },
    "teaspoon UK":             { label: "Teaspoon UK (tsp)",           factor: 5.9194e-6 },
    "teaspoon US":             { label: "Teaspoon US (tsp)",           factor: 4.92892159375e-6 },
    "yard^3":                  { label: "Yard (yd\u00B3)",             factor: 0.764554857984 },
  },
  density: {
    "kilogram/meter^3":    { label: "Kilogram / Meter (kg/m\u00B3)",     factor: 1.0 },
    "gram/centimeter^3":   { label: "Gram / Centimeter (g/cm\u00B3)",    factor: 1000.0 },
    "gram/meter^3":        { label: "Gram / Meter (g/m\u00B3)",          factor: 0.001 },
    "gram/milliliter":     { label: "Gram / Milliliter (g/mL)",          factor: 1000.0 },
    "kilogram/deciliter":  { label: "Kilogram / Deciliter (kg/dL)",      factor: 10000.0 },
    "kilogram/liter":      { label: "Kilogram / Liter (kg/L)",           factor: 1000.0 },
    "milligram/liter":     { label: "Milligram / Liter (mg/L)",          factor: 0.001 },
    "ounce/foot^3":        { label: "Ounce / Foot (oz/ft\u00B3)",       factor: 1.00115396 },
    "ounce/inch^3":        { label: "Ounce / Inch (oz/in\u00B3)",       factor: 1729.99404 },
    "pound/foot^3":        { label: "Pound / Foot (lb/ft\u00B3)",       factor: 16.018463374 },
    "pound/bushel UK":     { label: "Pound / Bushel UK (lb/bu)",         factor: 12.4720414 },
    "pound/bushel US":     { label: "Pound / Bushel US (lb/bu)",         factor: 12.8718591 },
    "pound/gallon UK":     { label: "Pound / Gallon UK (lb/gal)",        factor: 99.7763314 },
    "pound/gallon US":     { label: "Pound / Gallon US (lb/gal)",        factor: 119.826427 },
    "pound/inch^3":        { label: "Pound / Inch (lb/in\u00B3)",       factor: 27679.9047 },
    "pound/yard^3":        { label: "Pound / Yard (lb/yd\u00B3)",       factor: 0.593276421 },
    "ton metric/meter^3":  { label: "Ton Metric / Meter (t/m\u00B3)",   factor: 1000.0 },
    "slug/foot^3":         { label: "Slug / Foot (slug/ft\u00B3)",      factor: 515.378818 },
    "slug/inch^3":         { label: "Slug / Inch (slug/in\u00B3)",      factor: 890574.598 },
  },
  force: {
    "newton":                  { label: "Newton (N)",              factor: 1.0 },
    "dyne":                    { label: "Dyne (dyn)",              factor: 1.0e-5 },
    "gram force":              { label: "Gram Force (gf)",         factor: 0.00980665 },
    "kilogram-meter/second^2": { label: "Kilogram\u00B7Meter / Second\u00B2 (kg\u00B7m/s\u00B2)", factor: 1.0 },
    "kilogram force":          { label: "Kilogram Force (kgf)",    factor: 9.80665 },
    "kip":                     { label: "Kip (kip)",               factor: 4448.22161526 },
    "pound force":             { label: "Pound Force (lbf)",       factor: 4.44822162 },
    "poundal":                 { label: "Poundal (pdl)",           factor: 0.138254954376 },
  },
  acceleration: {
    "meter/second^2":      { label: "Meter / Second\u00B2 (m/s\u00B2)",       factor: 1.0 },
    "centimeter/day^2":    { label: "Centimeter / Day\u00B2 (cm/d\u00B2)",    factor: 1.33959191e-12 },
    "centimeter/hour^2":   { label: "Centimeter / Hour\u00B2 (cm/h\u00B2)",   factor: 7.71604938e-10 },
    "centimeter/minute^2": { label: "Centimeter / Minute\u00B2 (cm/min\u00B2)", factor: 2.77777778e-6 },
    "centimeter/second^2": { label: "Centimeter / Second\u00B2 (cm/s\u00B2)", factor: 0.01 },
    "foot/day^2":          { label: "Foot / Day\u00B2 (ft/d\u00B2)",          factor: 4.08307613e-11 },
    "foot/hour^2":         { label: "Foot / Hour\u00B2 (ft/h\u00B2)",         factor: 2.35185185e-8 },
    "foot/minute^2":       { label: "Foot / Minute\u00B2 (ft/min\u00B2)",     factor: 8.46666667e-5 },
    "foot/second^2":       { label: "Foot / Second\u00B2 (ft/s\u00B2)",       factor: 0.3048 },
    "inch/second^2":       { label: "Inch / Second\u00B2 (in/s\u00B2)",       factor: 0.0254 },
    "kilometer/day^2":     { label: "Kilometer / Day\u00B2 (km/d\u00B2)",     factor: 1.33959191e-7 },
    "kilometer/hour^2":    { label: "Kilometer / Hour\u00B2 (km/h\u00B2)",    factor: 7.71604938e-5 },
    "kilometer/minute^2":  { label: "Kilometer / Minute\u00B2 (km/min\u00B2)", factor: 0.277777778 },
    "kilometer/second^2":  { label: "Kilometer / Second\u00B2 (km/s\u00B2)",  factor: 1000.0 },
    "knot/second":         { label: "Knot / Second (kn/s)",                    factor: 0.51444444444 },
    "meter/day^2":         { label: "Meter / Day\u00B2 (m/d\u00B2)",          factor: 1.33959191e-10 },
    "meter/hour^2":        { label: "Meter / Hour\u00B2 (m/h\u00B2)",         factor: 7.71604938e-8 },
    "meter/minute^2":      { label: "Meter / Minute\u00B2 (m/min\u00B2)",     factor: 0.000277777778 },
    "mile/day^2":          { label: "Mile / Day\u00B2 (mi/d\u00B2)",          factor: 2.1558642e-7 },
    "mile/hour^2":         { label: "Mile / Hour\u00B2 (mi/h\u00B2)",         factor: 0.000124177778 },
    "mile/minute^2":       { label: "Mile / Minute\u00B2 (mi/min\u00B2)",     factor: 0.44704 },
    "mile/second^2":       { label: "Mile / Second\u00B2 (mi/s\u00B2)",       factor: 1609.344 },
    "millimeter/second^2": { label: "Millimeter / Second\u00B2 (mm/s\u00B2)", factor: 0.001 },
    "yard/second^2":       { label: "Yard / Second\u00B2 (yd/s\u00B2)",       factor: 0.9144 },
  },
  pressure: {
    "pascal":              { label: "Pascal (Pa)",             factor: 1.0 },
    "atmosphere":          { label: "Atmosphere (atm)",        factor: 101325.0 },
    "bar":                 { label: "Bar (bar)",               factor: 100000.0 },
    "hectopascal":         { label: "Hectopascal (hPa)",       factor: 100.0 },
    "kilopascal":          { label: "Kilopascal (kPa)",        factor: 1000.0 },
    "megapascal":          { label: "Megapascal (MPa)",        factor: 1000000.0 },
    "gigapascal":          { label: "Gigapascal (GPa)",        factor: 1000000000.0 },
    "millibar":            { label: "Millibar (mbar)",         factor: 100.0 },
    "millimeter of mercury": { label: "Millimeter of Mercury (mmHg)", factor: 133.322 },
    "inch of mercury":     { label: "Inch of Mercury (inHg)",  factor: 3386.39 },
    "pound/inch^2":        { label: "Pound / Inch\u00B2 (psi)", factor: 6894.76 },
    "torr":                { label: "Torr (Torr)",             factor: 133.322 },
    "dyne/centimeter^2":   { label: "Dyne / Centimeter\u00B2 (dyn/cm\u00B2)", factor: 0.1 },
  },
  frequency: {
    "hertz":          { label: "Hertz (Hz)",        factor: 1.0 },
    "kilohertz":      { label: "Kilohertz (kHz)",   factor: 1e3 },
    "megahertz":      { label: "Megahertz (MHz)",   factor: 1e6 },
    "gigahertz":      { label: "Gigahertz (GHz)",   factor: 1e9 },
    "cycle/second":   { label: "Cycle / Second",    factor: 1.0 },
    "rotation/second": { label: "Rotation / Second", factor: 1.0 },
    "rpm":             { label: "Revolutions per Minute (rpm)", factor: 1 / 60 },
  },
  inductance: {
    "henry":       { label: "Henry (H)",       factor: 1.0 },
    "millihenry":  { label: "Millihenry (mH)", factor: 1e-3 },
    "microhenry":  { label: "Microhenry (\u00B5H)", factor: 1e-6 },
    "nanohenry":   { label: "Nanohenry (nH)",  factor: 1e-9 },
  },
  capacitance: {
    "farad":       { label: "Farad (F)",       factor: 1.0 },
    "millifarad":  { label: "Millifarad (mF)", factor: 1e-3 },
    "microfarad":  { label: "Microfarad (\u00B5F)", factor: 1e-6 },
    "nanofarad":   { label: "Nanofarad (nF)",  factor: 1e-9 },
    "picofarad":   { label: "Picofarad (pF)",  factor: 1e-12 },
  },
  length: {
    "meter":      { label: "Meter (m)",        factor: 1.0 },
    "centimeter": { label: "Centimeter (cm)",  factor: 0.01 },
    "decimeter":  { label: "Decimeter (dm)",   factor: 0.1 },
    "dekameter":  { label: "Dekameter (dam)",  factor: 10.0 },
    "foot":       { label: "Foot (ft)",        factor: 0.3048 },
    "hectometer": { label: "Hectometer (hm)",  factor: 100.0 },
    "inch":       { label: "Inch (in)",        factor: 0.0254 },
    "kilometer":  { label: "Kilometer (km)",   factor: 1000.0 },
    "mile":       { label: "Mile (mi)",        factor: 1609.344 },
    "millimeter": { label: "Millimeter (mm)",  factor: 0.001 },
    "micrometer": { label: "Micrometer (\u00B5m)", factor: 1.0e-6 },
    "nanometer":  { label: "Nanometer (nm)",   factor: 1.0e-9 },
    "yard":       { label: "Yard (yd)",        factor: 0.9144 },
  },
  velocity: {
    "meter/second":             { label: "Meter / Second (m/s)",        factor: 1.0 },
    "centimeter/hour":          { label: "Centimeter / Hour (cm/h)",    factor: 2.7777777777e-6 },
    "centimeter/second":        { label: "Centimeter / Second (cm/s)",  factor: 0.01 },
    "foot/day":                 { label: "Foot / Day (ft/d)",           factor: 3.52777777778e-6 },
    "foot/hour":                { label: "Foot / Hour (ft/h)",          factor: 8.46666667e-5 },
    "foot/minute":              { label: "Foot / Minute (ft/min)",      factor: 0.00508 },
    "foot/second":              { label: "Foot / Second (ft/s)",        factor: 0.3048 },
    "inch/second":              { label: "Inch / Second (in/s)",        factor: 0.0254 },
    "kilometer/hour":           { label: "Kilometer / Hour (km/h)",     factor: 0.277777777777 },
    "kilometer/minute":         { label: "Kilometer / Minute (km/min)", factor: 16.6666667 },
    "kilometer/second":         { label: "Kilometer / Second (km/s)",   factor: 1000.0 },
    "knot":                     { label: "Knot (kn)",                   factor: 0.514444444 },
    "mach sea level 15 C":      { label: "Mach (sea level 15\u00B0C)",  factor: 340.3 },
    "meter/hour":               { label: "Meter / Hour (m/h)",          factor: 0.000277777778 },
    "meter/minute":             { label: "Meter / Minute (m/min)",      factor: 0.0166666667 },
    "mile/hour":                { label: "Mile / Hour (mph)",           factor: 0.44704 },
    "mile/minute":              { label: "Mile / Minute (mi/min)",      factor: 26.8224 },
    "mile/second":              { label: "Mile / Second (mi/s)",        factor: 1609.344 },
    "millimeter/second":        { label: "Millimeter / Second (mm/s)",  factor: 0.001 },
    "speed of light in vacuum": { label: "Speed of Light (c)",          factor: 299792458.0 },
    "yard/second":              { label: "Yard / Second (yd/s)",        factor: 0.9144 },
  },
  time: {
    "second":      { label: "Second (s)",          factor: 2.777777777777778e-4 },
    "millisecond": { label: "Millisecond (ms)",    factor: 2.777777777777778e-7 },
    "microsecond": { label: "Microsecond (\u00B5s)", factor: 2.777777777777778e-10 },
    "nanosecond":  { label: "Nanosecond (ns)",     factor: 2.777777777777778e-13 },
    "minute":      { label: "Minute (min)",        factor: 1.66666666667e-2 },
    "hour":        { label: "Hour (h)",            factor: 1.0 },
    "day":         { label: "Day (d)",             factor: 24.0 },
    "week":        { label: "Week (wk)",           factor: 168.0 },
    "year":        { label: "Year (yr)",           factor: 8765.81277075 },
  },
  resistance: {
    "ohm":       { label: "Ohm (\u03A9)",       factor: 1.0 },
    "kilohm":    { label: "Kilohm (k\u03A9)",   factor: 1e3 },
    "megohm":    { label: "Megohm (M\u03A9)",   factor: 1e6 },
    "milliohm":  { label: "Milliohm (m\u03A9)", factor: 1e-3 },
  },
  energy: {
    "joule":                { label: "Joule (J)",                    factor: 1.0 },
    "british thermal unit": { label: "British Thermal Unit (BTU)",   factor: 1055.05585262 },
    "calorie":              { label: "Calorie (cal)",                factor: 4.1868 },
    "electronvolt":         { label: "Electronvolt (eV)",            factor: 1.60217733e-19 },
    "erg":                  { label: "Erg (erg)",                    factor: 1.0e-7 },
    "foot-pound":           { label: "Foot-Pound (ft\u00B7lbf)",    factor: 1.35581794833 },
    "kilocalorie":          { label: "Kilocalorie (kcal)",           factor: 4186.8 },
    "kilojoule":            { label: "Kilojoule (kJ)",               factor: 1000.0 },
    "kilowatt-hour":        { label: "Kilowatt-Hour (kWh)",          factor: 3600000.0 },
    "megajoule":            { label: "Megajoule (MJ)",               factor: 1.0e6 },
    "newton-meter":         { label: "Newton-Meter (N\u00B7m)",     factor: 1.0 },
    "therm":                { label: "Therm (thm)",                  factor: 105506000.0 },
    "watt-hour":            { label: "Watt-Hour (Wh)",               factor: 3600.0 },
  },
  springConstant: {
    "newton/meter":    { label: "Newton / Meter (N/m)",       factor: 1.0 },
    "kilonewton/meter": { label: "Kilonewton / Meter (kN/m)", factor: 1000.0 },
    "newton/centimeter": { label: "Newton / Centimeter (N/cm)", factor: 100.0 },
    "newton/millimeter": { label: "Newton / Millimeter (N/mm)", factor: 1000.0 },
    "pound/inch":      { label: "Pound / Inch (lbf/in)",      factor: 175.126835 },
    "pound/foot":      { label: "Pound / Foot (lbf/ft)",      factor: 14.5939029 },
  },
  power: {
    "watt":                 { label: "Watt (W)",                    factor: 1.0 },
    "foot-pound/second":    { label: "Foot-Pound / Second (ft·lbf/s)", factor: 1.35581794833 },
    "horsepower":           { label: "Horsepower (hp)",             factor: 745.699871582 },
    "kilowatt":             { label: "Kilowatt (kW)",               factor: 1000.0 },
    "megawatt":             { label: "Megawatt (MW)",               factor: 1000000.0 },
  },
  torque: {
    "newton-meter":         { label: "Newton-Meter (N·m)",          factor: 1.0 },
    "newton-centimeter":    { label: "Newton-Centimeter (N·cm)",    factor: 0.01 },
    "newton-millimeter":    { label: "Newton-Millimeter (N·mm)",    factor: 0.001 },
    "dyne-centimeter":      { label: "Dyne-Centimeter (dyn·cm)",    factor: 0.0000001 },
    "dyne-meter":           { label: "Dyne-Meter (dyn·m)",          factor: 1.0e-5 },
    "gram-centimeter":      { label: "Gram-Centimeter (g·cm)",      factor: 0.000098066 },
    "gram-meter":           { label: "Gram-Meter (g·m)",            factor: 0.00980665 },
    "kilogram-centimeter":  { label: "Kilogram-Centimeter (kg·cm)", factor: 0.0980665 },
    "kilogram-meter":       { label: "Kilogram-Meter (kg·m)",       factor: 9.80665 },
    "kilonewton-meter":     { label: "Kilonewton-Meter (kN·m)",     factor: 1000.0 },
    "pound-foot":           { label: "Pound-Foot (lbf·ft)",         factor: 1.35581795 },
    "pound-inch":           { label: "Pound-Inch (lbf·in)",         factor: 0.112984829 },
  },
  angle: {
    "degree":               { label: "Degree (°)",                  factor: 1.0 },
    "radian":               { label: "Radian (rad)",                factor: 57.29577951308232 },
  },
  area: {
    "meter²":               { label: "Square Meter (m²)",           factor: 1.0 },
    "centimeter²":          { label: "Square Centimeter (cm²)",     factor: 0.0001 },
    "foot²":                { label: "Square Foot (ft²)",           factor: 0.09290304 },
    "inch²":                { label: "Square Inch (in²)",           factor: 0.00064516 },
    "kilometer²":           { label: "Square Kilometer (km²)",      factor: 1000000.0 },
    "hectare":              { label: "Hectare (ha)",                factor: 10000.0 },
    "acre":                 { label: "Acre (ac)",                   factor: 4046.8564224 },
    "mile²":                { label: "Square Mile (mi²)",           factor: 2589988.11034 },
    "yard²":                { label: "Square Yard (yd²)",           factor: 0.83612736 },
    "millimeter²":          { label: "Square Millimeter (mm²)",     factor: 1.0e-6 },
  },
  dynamicViscosity: {
    "kilogram/meter-second": { label: "Kilogram / Meter-Second (kg/(m·s))", factor: 1.0 },
    "gram/meter-second":     { label: "Gram / Meter-Second (g/(m·s))",      factor: 0.001 },
    "kilogram/meter-hour":   { label: "Kilogram / Meter-Hour (kg/(m·h))",   factor: 2.77777777778e-4 },
    "pascal-second":         { label: "Pascal-Second (Pa·s)",               factor: 1.0 },
    "poise":                 { label: "Poise (P)",                          factor: 0.1 },
    "centipoise":            { label: "Centipoise (cP)",                    factor: 0.001 },
  },
  timeInverse: {
    "second⁻¹":             { label: "Per Second (s⁻¹)",           factor: 1.0 },
    "day⁻¹":                { label: "Per Day (d⁻¹)",              factor: 1.15740740741e-5 },
    "hour⁻¹":               { label: "Per Hour (h⁻¹)",             factor: 0.000277777778 },
    "minute⁻¹":             { label: "Per Minute (min⁻¹)",         factor: 0.0166666667 },
    "year⁻¹":               { label: "Per Year (yr⁻¹)",            factor: 3.16887646408e-8 },
  },
  specificVolume: {
    "meter^3/kilogram":  { label: "Meter\u00B3 / Kilogram (m\u00B3/kg)",  factor: 1.0 },
    "liter/kilogram":    { label: "Liter / Kilogram (L/kg)",               factor: 0.001 },
    "foot^3/pound":      { label: "Foot\u00B3 / Pound (ft\u00B3/lb)",     factor: 0.0624279606 },
  },
  momentum: {
    "newton-second":           { label: "Newton-Second (N\u00B7s)",             factor: 1.0 },
    "kilogram-meter/second":   { label: "Kilogram-Meter / Second (kg\u00B7m/s)", factor: 1.0 },
    "pound-second":            { label: "Pound-Second (lb\u00B7s)",             factor: 4.44822 },
  },
  voltage: {
    "volt":      { label: "Volt (V)",      factor: 1.0 },
    "kilovolt":  { label: "Kilovolt (kV)", factor: 1000.0 },
    "millivolt": { label: "Millivolt (mV)", factor: 0.001 },
    "megavolt":  { label: "Megavolt (MV)", factor: 1e6 },
    "microvolt": { label: "Microvolt (\u00B5V)", factor: 1e-6 },
  },
  current: {
    "ampere":      { label: "Ampere (A)",      factor: 1.0 },
    "milliampere": { label: "Milliampere (mA)", factor: 0.001 },
    "kiloampere":  { label: "Kiloampere (kA)", factor: 1000.0 },
    "microampere": { label: "Microampere (\u00B5A)", factor: 1e-6 },
  },
  specificWeight: {
    "newton/meter^3":       { label: "Newton / Meter\u00B3 (N/m\u00B3)",           factor: 1.0 },
    "kilonewton/meter^3":   { label: "Kilonewton / Meter\u00B3 (kN/m\u00B3)",     factor: 1000.0 },
    "pound-force/foot^3":   { label: "Pound-Force / Foot\u00B3 (lbf/ft\u00B3)",   factor: 157.087 },
  },
  temperature: {
    "kelvin":     { label: "Kelvin (K)",      factor: 1.0 },
    "celsius":    { label: "Celsius (\u00B0C)",   factor: 1.0 },
    "fahrenheit": { label: "Fahrenheit (\u00B0F)", factor: 1.0 },
    "rankine":    { label: "Rankine (\u00B0R)",   factor: 1.0 },
  },
  flowRate: {
    "meter³/second":            { label: "Cubic Meter / Second (m³/s)",      factor: 1.0 },
    "liter/second":             { label: "Liter / Second (L/s)",             factor: 0.001 },
    "liter/minute":             { label: "Liter / Minute (L/min)",           factor: 1.66667e-5 },
    "gallon/minute":            { label: "Gallon / Minute (gpm)",            factor: 6.30902e-5 },
    "gallon/second":            { label: "Gallon / Second (gps)",            factor: 3.78541e-3 },
    "foot³/second":             { label: "Cubic Foot / Second (ft³/s)",      factor: 0.0283168 },
    "foot³/minute":             { label: "Cubic Foot / Minute (cfm)",        factor: 4.71947e-4 },
    "centimeter³/second":       { label: "Cubic Centimeter / Second (cm³/s)", factor: 1e-6 },
    "inch³/second":             { label: "Cubic Inch / Second (in³/s)",      factor: 1.63871e-5 },
    "barrel/day":               { label: "Barrel / Day (bbl/day)",           factor: 1.84013e-6 },
  },
  activity: {
    "becquerel":              { label: "Becquerel (Bq)",                factor: 1.0 },
    "curie":                  { label: "Curie (Ci)",                    factor: 3.7e10 },
    "millicurie":             { label: "Millicurie (mCi)",              factor: 3.7e7 },
    "microcurie":             { label: "Microcurie (\u00B5Ci)",         factor: 3.7e4 },
    "kilobecquerel":          { label: "Kilobecquerel (kBq)",           factor: 1e3 },
    "megabecquerel":          { label: "Megabecquerel (MBq)",           factor: 1e6 },
    "gigabecquerel":          { label: "Gigabecquerel (GBq)",           factor: 1e9 },
    "disintegrations/second": { label: "Disintegrations / Second (dps)", factor: 1.0 },
    "rutherford":             { label: "Rutherford (Rd)",               factor: 1e6 },
  },
  resistivity: {
    "ohm-meter":              { label: "Ohm-Meter (\u03A9\u00B7m)",    factor: 1.0 },
    "ohm-centimeter":         { label: "Ohm-Centimeter (\u03A9\u00B7cm)", factor: 0.01 },
    "ohm-foot":               { label: "Ohm-Foot (\u03A9\u00B7ft)",    factor: 0.3048 },
    "ohm-inch":               { label: "Ohm-Inch (\u03A9\u00B7in)",    factor: 0.0254 },
  },
  viscosity: {
    "pascal-second":          { label: "Pascal-Second (Pa\u00B7s)",           factor: 1.0 },
    "N-s/m^2":                { label: "Newton-Second / Meter\u00B2 (N\u00B7s/m\u00B2)", factor: 1.0 },
    "kilogram/meter-second":  { label: "Kilogram / Meter-Second (kg/m\u00B7s)", factor: 1.0 },
    "millipascal-second":     { label: "Millipascal-Second (mPa\u00B7s)",    factor: 0.001 },
    "micropascal-second":     { label: "Micropascal-Second (\u00B5Pa\u00B7s)", factor: 1.0e-6 },
    "poise":                  { label: "Poise (P)",                           factor: 0.1 },
    "centipoise":             { label: "Centipoise (cP)",                     factor: 0.001 },
    "pound/foot-second":      { label: "Pound / Foot-Second (lb/ft\u00B7s)", factor: 1.48816394 },
    "pound/foot-hour":        { label: "Pound / Foot-Hour (lb/ft\u00B7h)",   factor: 0.000413378872 },
    "pound-force-second/foot^2": { label: "Pound-Force-Second / Foot\u00B2 (lbf\u00B7s/ft\u00B2)", factor: 47.8802590 },
    "slug/foot-second":       { label: "Slug / Foot-Second (slug/ft\u00B7s)", factor: 47.8802590 },
  },
} as const;

// ---------------------------------------------------------------------------
// Public types & helpers
// ---------------------------------------------------------------------------

export type UnitCategory = keyof typeof units;

/** Returns all unit keys for a category. */
export function getUnitKeys(category: UnitCategory): string[] {
  return Object.keys(units[category]);
}

/** Returns { key, label } pairs for populating dropdowns. */
export function getUnitOptions(category: UnitCategory): { key: string; label: string }[] {
  return Object.entries(units[category]).map(([key, entry]) => ({
    key,
    label: (entry as UnitEntry).label,
  }));
}

/** Returns the display label for a single unit key. */
export function getUnitLabel(category: UnitCategory, unitKey: string): string {
  const entry = (units[category] as Record<string, UnitEntry>)[unitKey];
  return entry?.label ?? unitKey;
}

/**
 * Converts a value from one unit to another within the same category.
 * Mirrors legacy PHP: result = value * fromFactor / toFactor
 * Temperature uses offset-based conversion (not simple factor multiply).
 */
export function convertUnit(
  value: BigNumber,
  fromUnit: string,
  toUnit: string,
  category: UnitCategory
): BigNumber {
  if (category === "temperature") {
    return convertTemperature(value, fromUnit, toUnit);
  }
  const cat = units[category] as Record<string, UnitEntry>;
  const fromFactor = new BigNumber(cat[fromUnit].factor);
  const toFactor = new BigNumber(cat[toUnit].factor);
  return value.times(fromFactor).div(toFactor);
}

// ---------------------------------------------------------------------------
// Temperature conversion (offset-based, not factor-based)
// ---------------------------------------------------------------------------

function toKelvin(value: BigNumber, from: string): BigNumber {
  switch (from) {
    case "kelvin":     return value;
    case "celsius":    return value.plus(273.15);
    case "fahrenheit": return value.minus(32).times(5).div(9).plus(273.15);
    case "rankine":    return value.times(5).div(9);
    default:           return value;
  }
}

function fromKelvin(value: BigNumber, to: string): BigNumber {
  switch (to) {
    case "kelvin":     return value;
    case "celsius":    return value.minus(273.15);
    case "fahrenheit": return value.minus(273.15).times(9).div(5).plus(32);
    case "rankine":    return value.times(9).div(5);
    default:           return value;
  }
}

function convertTemperature(value: BigNumber, from: string, to: string): BigNumber {
  if (from === to) return value;
  const kelvin = toKelvin(value, from);
  return fromKelvin(kelvin, to);
}

/** Converts a value to the base unit of a category. */
export function toBaseUnit(
  value: BigNumber,
  fromUnit: string,
  category: UnitCategory
): BigNumber {
  const cat = units[category] as Record<string, UnitEntry>;
  const fromFactor = new BigNumber(cat[fromUnit].factor);
  return value.times(fromFactor);
}

/** Converts a value from the base unit to a target unit. */
export function fromBaseUnit(
  value: BigNumber,
  toUnit: string,
  category: UnitCategory
): BigNumber {
  const cat = units[category] as Record<string, UnitEntry>;
  const toFactor = new BigNumber(cat[toUnit].factor);
  return value.div(toFactor);
}
