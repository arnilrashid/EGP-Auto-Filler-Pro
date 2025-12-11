# EGP-Auto-Filler-Pro
Bangladesh e-GP auto-fill tool for LTM tenders. Supports e-PW2B-2 and e-PW2B-3 forms. Saves profiles, autofills fields, reduces errors, and speeds personnel data entry.
# EGP Auto Filler Pro - Chrome Extension

**Universal Auto-Filler for Bangladesh e-GP Forms**

Version: 2.0.0  
Developer: MD. MAMUN AR RASHID

---

## 🎯 Overview

EGP Auto Filler Pro is a unified Chrome extension that intelligently detects and fills various e-GP (e-Government Procurement) forms used by the Bangladesh Government procurement system.

### Supported Forms

✅ **Personnel Information Form (e-PW2B-3)** - 23 fields  
✅ **Bidder Information Form** - 13 fields  
✅ **Generic e-GP Forms** - Auto-detects field count

---

## ✨ Features

### Core Features

- 🔍 **Automatic Form Detection** - Identifies form type on page load
- 💾 **Unlimited Profile Storage** - Save and manage multiple data profiles
- 📋 **Quick Templates** - Pre-configured templates for common forms
- 🔄 **Auto-Save** - Your current mapping auto-saves as you type
- 🎯 **Smart Field Mapping** - Intelligent cell detection and value assignment
- 🔐 **100% Local Storage** - No external servers, all data stays on your device

### Advanced Features

- Multi-frame support for embedded e-GP forms
- SELECT dropdown handling (1=Prime, 2=Alternative)
- Checkbox column detection and skipping
- Hidden field filtering
- Event simulation for React/JS validation

---

## 📥 Installation

### From Source

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (top right)
4. Click "Load unpacked"
5. Select the extension folder

### Files Structure

```
egp-auto-filler-pro/
├── manifest.json          # Extension configuration
├── popup.html            # UI interface
├── popup.css             # Styling
├── popup.js              # Main logic
├── README.md             # Documentation
└── LICENSE               # MIT License
```

---

## 🚀 Usage

### Basic Workflow

1. **Navigate** to any e-GP form page
2. **Open** the extension (click the extension icon)
3. **Detect** - The extension automatically detects the form type
4. **Load/Edit** - Choose a saved profile or use a template
5. **Fill** - Click "Fill Form Now"

### Creating Profiles

**Method 1: From Template**

1. Select template from "Quick Templates" dropdown
2. Edit the JSON values as needed
3. Enter a profile name (e.g., "John Doe - Civil Engineer")
4. Click "Save"

**Method 2: Manual Entry**

1. Write JSON mapping in the textarea
2. Format: `{"1": "value", "2": "value", ...}`
3. Enter a profile name
4. Click "Save"

### JSON Mapping Format

```json
{
  "1": "First field value",
  "2": "1",
  "3": "Third field value",
  ...
}
```

**Field Index Rules:**

- Start from 1 (not 0)
- Sequential numbering
- String values (even for numbers)
- For SELECT dropdowns, use option values (typically "1", "2", etc.)

### Personnel Form (e-PW2B-3) Example

```json
{
  "1": "John Doe",
  "2": "1",
  "3": "Civil Engineer",
  "4": "Bangladesh University",
  "5": "BSc in Civil Engineering",
  "6": "2010",
  "7": "Professional Engineer",
  "8": "Bangladesh",
  "9": "10",
  "10": "Project Manager",
  "11": "ABC Construction Ltd",
  "12": "Road Construction Project",
  "13": "2020-2023",
  "14": "Managed team of 50",
  "15": "On time delivery",
  "16": "Client satisfaction",
  "17": "1",
  "18": "Highway Construction",
  "19": "Lead Engineer",
  "20": "DEF Company",
  "21": "Bridge Project",
  "22": "2018-2020",
  "23": "Completed under budget"
}
```

### Bidder Information Example

```json
{
  "1": "Mridha Enterprise",
  "2": "mridha.ent@gmail.com",
  "3": "1",
  "4": "UTTARA BANK LTD",
  "5": "12345678",
  "6": "Branch Name",
  "7": "Account Number",
  "8": "SWIFT Code",
  "9": "1",
  "10": "Address Line 1",
  "11": "Address Line 2",
  "12": "City",
  "13": "Postal Code"
}
```

---

## 🔧 Technical Details

### Form Detection Logic

The extension uses a multi-layered detection approach:

1. **Frame Scanning** - Checks all iframes on the page
2. **Form Identification** - Looks for `form[name="frmBidSubmit"]`
3. **Table Detection** - Finds rows with `tr[id^="row"]` pattern
4. **Field Counting** - Counts visible, fillable fields
5. **Type Classification** - Matches against known patterns

### Cell Detection Priority

For each table cell (`<td>`), the extension searches in order:

1. Visible `<select>` elements (dropdowns)
2. Visible `<input>` elements (not hidden/checkbox)
3. Visible `<textarea>` elements

### Event Simulation

To trigger validation and dynamic updates, the extension fires:

- `focus` event
- `input` event
- `change` event
- `keydown` / `keyup` events
- `blur` event

---

## 🛡️ Privacy & Security

### Data Storage

- All data stored using Chrome's `storage.local` API
- Data never leaves your computer
- No external API calls
- No analytics or tracking

### Permissions Explained

- `activeTab` - Read/write to current e-GP page only
- `scripting` - Inject form-filling logic
- `storage` - Save profiles locally
- `host_permissions` - Access e-GP domains only

---

## 🐛 Troubleshooting

### Extension Not Detecting Form

**Cause:** Form structure may differ  
**Solution:** Check browser console for detection logs

### Fields Not Filling

**Cause:** Incorrect field mapping or validation  
**Solution:**

1. Check JSON syntax
2. Verify field count matches form
3. Ensure correct data types (especially for dropdowns)

### SELECT Dropdowns Not Working

**Cause:** Wrong option values  
**Solution:**

- Use "1" for first option
- Use "2" for second option
- Check actual `<option value="">` in browser DevTools

### Permission Errors

**Cause:** Missing host permissions  
**Solution:** Ensure you're on `*.eprocure.gov.bd` domain

---

## 🔄 Version History

### v2.0.0 (Current)

- ✅ Unified Personnel and Bidder form support
- ✅ Automatic form type detection
- ✅ Template system
- ✅ Enhanced UI with form indicator
- ✅ Improved SELECT handling
- ✅ Better error messages

### v1.2 (Extension 2)

- Bidder form support
- Profile management

### v1.0 (Extension 1)

- Personnel form support (e-PW2B-3)
- Basic profile system

---

## 📝 License

MIT License

Copyright (c) 2024-2025 MD. MAMUN AR RASHID

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

## 👨‍💻 Developer

**MD. MAMUN AR RASHID**

- GitHub: [@arnilrashid](https://github.com/arnilrashid)
- Email: arnilrashid@gmail.com
- Phone: +8801797772629

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

### Development Guidelines

1. Follow existing code structure
2. Test on multiple e-GP forms
3. Document new features
4. Maintain backward compatibility

---

## ⚠️ Disclaimer

This extension is provided "as is" for personal use. The developer is not responsible for:

- Data loss or corruption
- Form submission errors
- Compatibility issues with future e-GP updates

Always verify filled data before submitting forms.

---

**Built with ❤️ for the e-GP community**
