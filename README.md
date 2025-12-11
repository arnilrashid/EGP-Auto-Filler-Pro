# # 🟦 **EGP Auto Filler Pro – Chrome Extension for Bangladesh e-GP LTM Tenders**

A fast, secure Chrome extension that automatically fills **e-PW2B-2** and **e-PW2B-3** Personnel Information forms in the Bangladesh **e-GP LTM** tender system.
Designed for contractors and bidders who repeatedly submit the same personnel data.

---

# ## 🚀 Features

* **Auto-fill e-PW2B-2 & e-PW2B-3** forms
* Save unlimited **profiles** for different personnel
* Works on all **LTM Personnel Information** pages
* Supports **dropdowns, text fields, table rows**
* Auto-detects form type
* Fast filling (0.1–1 second)
* Fully **offline** – no data is sent anywhere
* Secure storage using **Chrome local storage**
* Simple profile editor with templates
* Console logs for debugging

---

# ## 📌 Supported Forms

| Form Name                                         | Code         | Supported |
| ------------------------------------------------- | ------------ | --------- |
| Personnel Information                             | **e-PW2B-2** | ✅ Yes     |
| Personnel Information (Experience Table Included) | **e-PW2B-3** | ✅ Yes     |

---

# ## 🧩 How to Install (Temporary / Development Mode)

Since it’s not on Chrome Web Store:

1. Download the ZIP
2. Extract it
3. Open Chrome → `chrome://extensions/`
4. Enable **Developer Mode** (top-right)
5. Click **Load Unpacked**
6. Select the extracted folder

The extension will now appear in Chrome.

---

# ## 📘 How to Use

This extension only works on these pages:
**e-GP → Tender Submission → LTM → Personnel Information (e-PW2B-2 / e-PW2B-3)**

### **Step 1 — Open an LTM Personnel Form**

Open any e-GP LTM tender and navigate to the Personnel Information form.

### **Step 2 — Click the Extension Icon**

It will show:

* Detected form type
* Number of fields
* Selected profile

### **Step 3 — Create a Profile (One Time)**

You can create profiles in two ways:

#### **A) Using Templates**

* Select **e-PW2B-2** or **e-PW2B-3**
* Fill in the details
* Save with a name (e.g., “Engineer Rahim”)

#### **B) Using JSON Input**

Paste data like:

```json
{
  "1": "Mamun Engineering And Construction",
  "2": "mamun.engandconst@gmail.com",
  "3": "1",
  "4": "UTTARA BANK LTD",
  "5": "00000",
  "6": "See the map",
}
```

Then click **Save Profile**.

### **Step 4 — Load Profile**

Select your saved profile from the dropdown.

### **Step 5 — Click “Fill Form Now”**

The extension automatically fills:

* Text fields
* Dropdowns
* Tables
* Multi-row experience fields

### **Step 6 — Review & Submit**

Verify all values → submit your tender normally.

---

# ## 🧠 Tips for Best Results

* Create separate profiles for each account
* Keep JSON keys exactly as numbers (“1”, “2”, “3”…) (row wise)
* Check Console if a field does not fill
* Avoid commas in JSON values
* Always review before sign the form

---

# ## 🔒 Security & Privacy

* Everything runs **locally** in your browser
* No external API calls
* No data is uploaded or stored online
* Profiles remain inside **Chrome local storage**
* 100% safe for tender data

---

# ## 📦 Folder Structure

```
EGP-Auto-Filler-Pro/
│
├── manifest.json
├── background.js
├── content.js
├── popup.html
├── popup.css
├── popup.js
└── README.md
```

---

# ## 🛠 Technologies Used

* JavaScript
* Chrome Extensions API
* DOM automation
* Local Storage
* JSON-based profile storage

---

# ## 📜 License

This project is licensed under the **MIT License**.

---

# ## 🤝 Contribute

Pull requests and suggestions are welcome.

---

# ## ⭐ Support the Project

If this tool helps you submit tenders faster:

* Star the repository ⭐
* Share with other contractors
* Report issues or request features

---
