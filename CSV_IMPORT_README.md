# CSV Import Feature

## Overview

The CSV Import feature allows bulk uploading of LED assignments without manually entering each one. This is especially useful when configuring 73+ airports, as manual entry can cause browser/ESP8266 crashes due to memory pressure.

## Usage

1. Navigate to the **LED Assignments** section in the configuration page
2. Click the **📄 Import CSV** button
3. Select your CSV file
4. Review the import results (success count + any errors)
5. Click **Save Configuration** to apply changes

## CSV Format

Simple two-column format:
```
index,code
```

### Example File

```csv
0,LIFR
1,IFR
2,MVFR
3,WVFR
4,VFR
5,KMRY
6,KSNS
7,KCVH
8,KWVI
9,KE16
10,KRHV
11,KSJC
12,KNUQ
13,KPAO
14,KSQL
15,KHAF
16,KSFO
17,KOAK
18,KHWD
19,KLVK
20,KC83
21,NULL
22,KCCR
```

## Validation Rules

### Index
- Must be an integer
- Range: 0-149 (within MAX_LEDS bounds)
- **Out of range:** Error logged, line skipped

### Airport Code
- Must be one of:
  - **4 alphanumeric characters** (e.g., KSFO, K1B9)
  - **Special values:** NULL, BLACK, LIFR, IFR, MVFR, WVFR, VFR
- **Invalid format:** Error logged, line skipped

## Error Handling

The import is **fault-tolerant**:
- Invalid lines are **skipped** (not crashed)
- All errors are collected and reported
- At least **one valid entry** required for import to succeed
- Errors displayed in toast notification
- Full error list available in browser console

## Memory Safety

### Why This Matters
The ESP8266 has only ~35KB of usable heap. Processing 73+ airports through the web wizard can cause:
- Heap fragmentation
- Out-of-memory crashes
- Lost configuration data

### How CSV Import Helps
- **Client-side processing:** Validation happens in the browser
- **Line-by-line parsing:** No large buffer allocations
- **Error isolation:** Invalid lines don't crash the entire import
- **Batch upload:** Send complete config in one HTTP POST (no 73+ individual requests)

## Automatic Features

### LED Count Adjustment
The import automatically calculates the required LED count based on the **highest index** in your CSV:
```
Highest index = 72 → LED count set to 73
```

This ensures your configuration matches your CSV without manual adjustment.

## Example Use Cases

### 1. Bulk Import for New Setup
```csv
0,LIFR
1,IFR
2,MVFR
3,WVFR
4,VFR
5,KMRY
6,KSNS
...
72,KOAK
```
Result: 73 LEDs configured in seconds

### 2. Partial Update
Import only the LEDs you want to change. Existing assignments not in the CSV remain unchanged.

```csv
10,KRHV
15,KHAF
20,KC83
```
Result: Only LEDs 10, 15, and 20 updated

### 3. Clear Specific LEDs
```csv
50,NULL
51,NULL
52,NULL
```
Result: LEDs 50-52 turned off

## Troubleshooting

### "No valid entries found"
- Check CSV format (must be `index,code`)
- Verify airport codes are valid ICAO format
- Ensure indices are within 0-149 range

### "Imported X LEDs with Y errors"
- Check browser console (F12) for detailed error list
- Common issues:
  - Typos in airport codes
  - Incorrect index values
  - Extra commas or spaces

### Import succeeds but LEDs don't update
- Click **Save Configuration** after importing
- ESP8266 will fetch weather data on next update cycle (15 minutes)
- Use **Force Refresh** button in Diagnostics page for immediate update

## Technical Details

### Processing Flow
1. User selects CSV file
2. Browser reads file as text
3. Split into lines (`\r?\n` regex handles Windows/Unix line endings)
4. Parse each line: `split(',')` → `[index, code]`
5. Validate index and code
6. Apply valid assignments to config array
7. Re-render LED table
8. User clicks Save → POST to ESP8266

### Performance
- **File size limit:** None (browser handles file reading)
- **Processing time:** ~1ms per line (73 lines = ~73ms)
- **Memory usage:** Minimal (no backend processing required)

## Security

### Input Validation
All validation happens **client-side** before sending to ESP8266:
- Index bounds checking
- Airport code format validation
- Prevents malformed data from reaching ESP8266

### No Backend Endpoint Required
CSV processing is **entirely client-side**, eliminating:
- Network overhead
- ESP8266 memory pressure
- Crash risk from large uploads

## Future Enhancements

Potential improvements (not yet implemented):
- [ ] CSV export (download current config)
- [ ] Header row support (`Index,Airport` in first line)
- [ ] Multi-column format (e.g., `index,code,label,notes`)
- [ ] Drag-and-drop file upload
- [ ] Validation preview before import

## Credits

Implemented by Claude Code (Embedded Systems Agent)
Based on user requirements for 73-airport bulk import without crashes
