// popup.js - EGP Auto Filler Pro (Unified)
console.log("Developer: MD. MAMUN AR RASHID");
console.log("github: https://github.com/arnilrashid");
console.log("gmail: arnilrashid@gmail.com");
console.log("phone: +8801797772629");

// Templates for different form types
const TEMPLATES = {
  personnel: {
    name: "Personnel Information (e-PW2B-3)",
    fields: 23,
    example: {
      "1": "See the map",
      "2": "1",
      "3": "See the map",
      "4": "See the map",
      "5": "See the map",
      "6": "See the map",
      "7": "See the map",
      "8": "See the map",
      "9": "See the map",
      "10": "See the map",
      "11": "See the map",
      "12": "See the map",
      "13": "See the map",
      "14": "See the map",
      "15": "See the map",
      "16": "See the map",
      "17": "1",
      "18": "See the map",
      "19": "See the map",
      "20": "See the map",
      "21": "See the map",
      "22": "See the map",
      "23": "See the map"
    }
  },
  bidder: {
    name: "Personnel Information (e-PW2B-2)",
    fields: 13,
    example: {
      "1": "Mamun Engineering And Construction",
      "2": "mamun.engandconst@gmail.com",
      "3": "1",
      "4": "UTTARA BANK LTD",
      "5": "00000",
      "6": "See the map",
      "7": "See the map",
      "8": "See the map",
      "9": "1",
      "10": "See the map",
      "11": "See the map",
      "12": "See the map",
      "13": "See the map"
    }
  }
};

// Form detection state
let currentFormType = null;

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  await detectFormType();
  await loadProfiles();
  await loadCurrentMapping();
  setupEventListeners();
});

// Detect form type from active tab
async function detectFormType() {
  const indicator = document.getElementById("formTypeIndicator");
  const text = document.getElementById("formTypeText");
  
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) {
      updateFormIndicator("unknown", "❌ No active tab");
      return;
    }

    const frameResults = await chrome.scripting.executeScript({
      target: { tabId: tab.id, allFrames: true },
      func: () => {
        const hasForm = document.querySelector('form[name="frmBidSubmit"]') !== null;
        const hasRows = document.querySelector('tr[id^="row"]') !== null;
        const hasTableNum = document.querySelector('input[name="hdnTblNum"]') !== null;
        const formTitle = document.getElementById("divFormName");
        const isPersonnelForm = formTitle && formTitle.textContent.includes("Personnel Information");
        
        // Count potential fields
        const tableInputs = document.querySelectorAll('input[name="hdnTblNum"]');
        const tableIds = Array.from(tableInputs).map(inp => inp.value).filter(Boolean);
        let fieldCount = 0;
        
        if (tableIds.length > 0) {
          tableIds.forEach(tableId => {
            const rows = document.querySelectorAll(`tr[id^="row${tableId}_"]`);
            rows.forEach(row => {
              const tds = row.querySelectorAll('td');
              tds.forEach(td => {
                const candidate = td.querySelector('input:not([type="hidden"]):not([type="checkbox"]), textarea, select');
                if (candidate && !candidate.disabled) {
                  const isVisible = candidate.offsetParent !== null || 
                                    candidate.tagName === "TEXTAREA" ||
                                    window.getComputedStyle(candidate).display !== 'none';
                  if (isVisible) fieldCount++;
                }
              });
            });
          });
        }
        
        return {
          hasForm,
          hasRows,
          hasTableNum,
          isPersonnelForm,
          fieldCount,
          url: window.location.href,
          title: document.title
        };
      }
    });

    const result = frameResults.find(r => r.result && (r.result.hasForm || r.result.hasRows))?.result;
    
    if (!result) {
      updateFormIndicator("unknown", "❌ Not an e-GP form");
      currentFormType = null;
      return;
    }

    // Determine form type
    if (result.isPersonnelForm) {
      currentFormType = "personnel";
      updateFormIndicator("personnel", `✅  e-PW2B-3 (${result.fieldCount} fields)`);
    } else if (result.fieldCount >= 10 && result.fieldCount <= 15) {
      currentFormType = "bidder";
      updateFormIndicator("bidder", `✅ e-PW2B-2 (${result.fieldCount} fields)`);
    } else if (result.hasForm || result.hasRows) {
      currentFormType = "custom";
      updateFormIndicator("detected", `✅ e-GP Form Detected (${result.fieldCount} fields)`);
    } else {
      currentFormType = null;
      updateFormIndicator("unknown", "❌ Unknown form type");
    }

  } catch (error) {
    console.error("Form detection error:", error);
    updateFormIndicator("unknown", "⚠️ Detection failed");
    currentFormType = null;
  }
}

function updateFormIndicator(type, message) {
  const indicator = document.getElementById("formTypeIndicator");
  const text = document.getElementById("formTypeText");
  
  indicator.className = `form-type-indicator ${type}`;
  text.textContent = message;
}

// Setup event listeners
function setupEventListeners() {
  document.getElementById("saveProfile").addEventListener("click", saveProfile);
  document.getElementById("profileSelect").addEventListener("change", loadProfile);
  document.getElementById("deleteProfile").addEventListener("click", deleteProfile);
  document.getElementById("templateSelect").addEventListener("change", loadTemplate);
  document.getElementById("mapping").addEventListener("input", saveCurrentMapping);
  document.getElementById("fill").addEventListener("click", fillForm);
}

// Load template
function loadTemplate(e) {
  const templateType = e.target.value;
  
  if (!templateType || templateType === "custom") return;
  
  const template = TEMPLATES[templateType];
  if (!template) return;
  
  document.getElementById("mapping").value = JSON.stringify(template.example, null, 2);
  saveCurrentMapping();
  showMessage(`Loaded ${template.name} template`, 'info');
}

// Save current mapping to storage
async function saveCurrentMapping() {
  const mapping = document.getElementById("mapping").value;
  await chrome.storage.local.set({ currentMapping: mapping });
}

// Load current mapping from storage
async function loadCurrentMapping() {
  const result = await chrome.storage.local.get('currentMapping');
  if (result.currentMapping) {
    document.getElementById("mapping").value = result.currentMapping;
  } else {
    // Load default based on detected form
    if (currentFormType && TEMPLATES[currentFormType]) {
      document.getElementById("mapping").value = JSON.stringify(TEMPLATES[currentFormType].example, null, 2);
    }
  }
}

// Load all saved profiles
async function loadProfiles() {
  const result = await chrome.storage.local.get('profiles');
  const profiles = result.profiles || {};
  
  const select = document.getElementById("profileSelect");
  select.innerHTML = '<option value="">-- Select Profile --</option>';
  
  Object.keys(profiles).forEach(name => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    select.appendChild(option);
  });
}

// Save profile
async function saveProfile() {
  const profileName = document.getElementById("profileName").value.trim();
  
  if (!profileName) {
    alert("Please enter a profile name");
    return;
  }
  
  const mappingText = document.getElementById("mapping").value.trim();
  
  try {
    JSON.parse(mappingText);
  } catch (err) {
    alert("Invalid JSON format. Please fix and try again.");
    return;
  }
  
  const result = await chrome.storage.local.get('profiles');
  const profiles = result.profiles || {};
  
  if (profiles[profileName]) {
    if (!confirm(`Profile "${profileName}" already exists. Overwrite?`)) {
      return;
    }
  }
  
  profiles[profileName] = mappingText;
  await chrome.storage.local.set({ profiles });
  
  document.getElementById("profileName").value = "";
  await loadProfiles();
  
  showMessage(`Profile "${profileName}" saved successfully!`, 'success');
}

// Load profile from dropdown
async function loadProfile(e) {
  const profileName = e.target.value;
  
  if (!profileName) return;
  
  const result = await chrome.storage.local.get('profiles');
  const profiles = result.profiles || {};
  
  if (profiles[profileName]) {
    document.getElementById("mapping").value = profiles[profileName];
    await saveCurrentMapping();
    showMessage(`Loaded profile: ${profileName}`, 'success');
  }
}

// Delete profile
async function deleteProfile() {
  const profileName = document.getElementById("profileSelect").value;
  
  if (!profileName) {
    alert("Please select a profile to delete");
    return;
  }
  
  if (!confirm(`Delete profile "${profileName}"?`)) {
    return;
  }
  
  const result = await chrome.storage.local.get('profiles');
  const profiles = result.profiles || {};
  
  delete profiles[profileName];
  await chrome.storage.local.set({ profiles });
  
  await loadProfiles();
  showMessage(`Profile "${profileName}" deleted`, 'info');
}

// Show message helper
function showMessage(text, type = 'info') {
  const messageDiv = document.getElementById("message");
  messageDiv.textContent = text;
  messageDiv.className = `message ${type}`;
  messageDiv.style.display = 'block';
  
  setTimeout(() => {
    messageDiv.style.display = 'none';
  }, 3000);
}

// Fill form
async function fillForm() {
  const raw = document.getElementById("mapping").value.trim();
  let mapping = {};
  
  try {
    mapping = JSON.parse(raw);
  } catch (err) {
    alert("Invalid JSON mapping: " + err.message);
    return;
  }

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) {
    alert("No active tab found");
    return;
  }

  try {
    // Step 1: Find the correct frame
    const frameResults = await chrome.scripting.executeScript({
      target: { tabId: tab.id, allFrames: true },
      func: () => {
        const hasForm = document.querySelector('form[name="frmBidSubmit"]') !== null;
        const hasRows = document.querySelector('tr[id^="row"]') !== null;
        const hasTableNum = document.querySelector('input[name="hdnTblNum"]') !== null;
        const formTitle = document.getElementById("divFormName");
        const isPersonnelForm = formTitle && formTitle.textContent.includes("Personnel Information");
        
        return {
          hasForm,
          hasRows,
          hasTableNum,
          isPersonnelForm,
          url: window.location.href,
          isValid: hasForm || (hasRows && hasTableNum)
        };
      }
    });

    console.log("Frame detection results:", frameResults);

    const targetFrame = frameResults.find(r => r.result && r.result.isValid);
    
    if (!targetFrame) {
      alert("Could not find e-GP form. Please ensure you're on the correct page.");
      console.error("No valid frame found. Results:", frameResults);
      return;
    }

    const targetFrameId = targetFrame.frameId;
    console.log("Target frame found:", targetFrameId, targetFrame.result);

    // Step 2: Inject and execute the filler
    const fillResults = await chrome.scripting.executeScript({
      target: { tabId: tab.id, frameIds: [targetFrameId] },
      func: (mappingData) => {
        // ========== INJECTED FILLER LOGIC ==========
        
        function setValueWithEvents(element, value) {
          if (!element) return false;
          
          try {
            element.focus();
            
            // Handle SELECT elements specially
            if (element.tagName === "SELECT") {
              element.value = value.toString();
              element.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
              element.blur();
              return true;
            }
            
            // Handle INPUT and TEXTAREA
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
              window.HTMLInputElement.prototype,
              "value"
            ).set;
            const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(
              window.HTMLTextAreaElement.prototype,
              "value"
            ).set;
            
            if (element.tagName === "INPUT") {
              nativeInputValueSetter.call(element, value);
            } else if (element.tagName === "TEXTAREA") {
              nativeTextAreaValueSetter.call(element, value);
            }
            
            const events = [
              new Event('input', { bubbles: true, cancelable: true }),
              new Event('change', { bubbles: true, cancelable: true }),
              new Event('blur', { bubbles: true, cancelable: true }),
              new KeyboardEvent('keydown', { bubbles: true, cancelable: true }),
              new KeyboardEvent('keyup', { bubbles: true, cancelable: true })
            ];
            
            events.forEach(event => {
              try {
                element.dispatchEvent(event);
              } catch (e) {
                console.warn("Event dispatch failed:", e);
              }
            });
            
            element.blur();
            
            return true;
          } catch (e) {
            console.error("Failed to set value:", e);
            return false;
          }
        }

        function findAllDataCells() {
          const cells = [];
          
          const tableInputs = document.querySelectorAll('input[name="hdnTblNum"], input[id="hdnTblNum"]');
          const tableIds = Array.from(tableInputs).map(inp => inp.value).filter(Boolean);
          
          console.log("Found table IDs:", tableIds);
          
          if (tableIds.length > 0) {
            tableIds.forEach(tableId => {
              const rows = document.querySelectorAll(`tr[id^="row${tableId}_"]`);
              console.log(`Table ${tableId}: found ${rows.length} rows`);
              
              rows.forEach(row => {
                const tds = row.querySelectorAll('td');
                tds.forEach(td => {
                  // Priority: visible SELECT first, then INPUT/TEXTAREA
                  const selectCandidate = td.querySelector('select[id^="idcombodetail"]');
                  
                  if (selectCandidate && !selectCandidate.disabled) {
                    const isVisible = selectCandidate.offsetParent !== null || 
                                      window.getComputedStyle(selectCandidate).display !== 'none';
                    
                    if (isVisible) {
                      cells.push({
                        element: selectCandidate,
                        tag: selectCandidate.tagName,
                        type: 'select',
                        name: selectCandidate.name || '',
                        id: selectCandidate.id || '',
                        rowId: row.id
                      });
                      return;
                    }
                  }
                  
                  // Otherwise, find input/textarea
                  const candidates = td.querySelectorAll('input:not([type="hidden"]):not([type="checkbox"]), textarea');
                  
                  for (let candidate of candidates) {
                    const isVisible = candidate.offsetParent !== null || 
                                      candidate.tagName === "TEXTAREA" ||
                                      window.getComputedStyle(candidate).display !== 'none';
                    
                    const isUsable = !candidate.disabled && !candidate.readOnly;
                    
                    if (isVisible && isUsable) {
                      cells.push({
                        element: candidate,
                        tag: candidate.tagName,
                        type: candidate.type || 'text',
                        name: candidate.name || '',
                        id: candidate.id || '',
                        rowId: row.id
                      });
                      break;
                    }
                  }
                });
              });
            });
          }
          
          // Fallback: scan all rows
          if (cells.length === 0) {
            console.log("Fallback: scanning all rows");
            const allRows = document.querySelectorAll('tr[id^="row"]');
            
            allRows.forEach(row => {
              const tds = row.querySelectorAll('td');
              tds.forEach(td => {
                const selectCandidate = td.querySelector('select[id^="idcombodetail"]');
                
                if (selectCandidate && !selectCandidate.disabled) {
                  const isVisible = selectCandidate.offsetParent !== null || 
                                    window.getComputedStyle(selectCandidate).display !== 'none';
                  
                  if (isVisible) {
                    cells.push({
                      element: selectCandidate,
                      tag: selectCandidate.tagName,
                      type: 'select',
                      name: selectCandidate.name || '',
                      id: selectCandidate.id || '',
                      rowId: row.id
                    });
                    return;
                  }
                }
                
                const candidates = td.querySelectorAll('input:not([type="hidden"]):not([type="checkbox"]), textarea');
                
                for (let candidate of candidates) {
                  const isVisible = candidate.offsetParent !== null || 
                                    candidate.tagName === "TEXTAREA" ||
                                    window.getComputedStyle(candidate).display !== 'none';
                  
                  if (isVisible && !candidate.disabled && !candidate.readOnly) {
                    cells.push({
                      element: candidate,
                      tag: candidate.tagName,
                      type: candidate.type || 'text',
                      name: candidate.name || '',
                      id: candidate.id || '',
                      rowId: row.id
                    });
                    break;
                  }
                }
              });
            });
          }
          
          return cells;
        }

        function fillForm(mapping) {
          const cells = findAllDataCells();
          console.log("Total fillable cells found:", cells.length);
          console.log("Cells:", cells);
          
          const results = [];
          let successCount = 0;
          
          const keys = Object.keys(mapping).map(k => parseInt(k)).filter(k => !isNaN(k)).sort((a, b) => a - b);
          console.log("Mapping keys:", keys);
          
          keys.forEach(index => {
            const cellIndex = index - 1;
            const value = mapping[String(index)];
            
            if (cellIndex >= cells.length) {
              results.push({
                index,
                status: 'no_cell',
                message: `No cell found at position ${index}`
              });
              return;
            }
            
            const cell = cells[cellIndex];
            
            try {
              const success = setValueWithEvents(cell.element, String(value));
              
              if (success) {
                successCount++;
                results.push({
                  index,
                  status: 'success',
                  element: `${cell.tag}[${cell.name || cell.id}]`,
                  value,
                  type: cell.type
                });
              } else {
                results.push({
                  index,
                  status: 'failed',
                  element: `${cell.tag}[${cell.name || cell.id}]`,
                  value,
                  type: cell.type
                });
              }
            } catch (e) {
              results.push({
                index,
                status: 'error',
                element: `${cell.tag}[${cell.name || cell.id}]`,
                error: e.message
              });
            }
          });
          
          return {
            totalCells: cells.length,
            totalMappings: keys.length,
            successCount,
            results
          };
        }

        return fillForm(mappingData);
        
        // ========== END INJECTED LOGIC ==========
      },
      args: [mapping]
    });

    const result = fillResults[0]?.result;
    
    if (!result) {
      alert("Fill operation returned no result");
      return;
    }

    console.log("Fill results:", result);
    
    showMessage(`✅ Filled ${result.successCount}/${result.totalMappings} fields`, 'success');

  } catch (error) {
    console.error("Extension error:", error);
    alert("Error: " + error.message + "\n\nCheck console for details.");
  }
}