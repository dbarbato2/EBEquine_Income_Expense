/**
 * Google Apps Script for EB Equine Client Intake Form
 * 
 * This script automatically sends new form submissions to your MongoDB database
 * via your backend webhook endpoint.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1u8_r0gcfLqURBd_FlwL8B0R53KOLO-7RMeYE9FuvYxU/edit
 * 2. Go to Extensions > Apps Script
 * 3. Delete any existing code and paste this entire script
 * 4. Update the CONFIGURATION section below with your values
 * 5. Save the script (Ctrl+S or Cmd+S)
 * 6. Run the 'setupTrigger' function once to create the automatic trigger
 * 7. Authorize the script when prompted
 */

// ============ CONFIGURATION ============
// Update these values for your setup

const CONFIG = {
  // Your backend webhook URL (update with your actual server URL when deployed)
  // For local development, you'll need to use a service like ngrok to expose your localhost
  WEBHOOK_URL: 'http://localhost:5001/api/v1/webhook/google-sheets-client',
  
  // API key for security (must match the value in your backend .env file)
  API_KEY: 'your-secret-api-key',
  
  // The user ID to associate clients with (your MongoDB user ID)
  USER_ID: 'YOUR_USER_ID_HERE',
  
  // Column mapping from Google Sheet to MongoDB fields
  // Update the column numbers (1-indexed) to match your Google Sheet structure
  COLUMN_MAP: {
    Timestamp: 1,
    Name: 2,
    PhoneNumber: 3,
    Email: 4,
    MailingAddress: 5,
    TownStateZip: 6,
    BarnAddress: 7,
    BarnContact: 8,
    HorseName: 9,
    BreedType: 10,
    Age_DOB: 11,
    Gender: 12,
    Color: 13,
    Discipline: 14,
    OftenTrainedRidden: 15,
    Medications: 16,
    PriorInjuries: 17,
    ConcernsProblems: 18,
    HorseTie: 19,
    PreviousMassage: 20,
    AdditionalInformation: 21,
    VetClinicName: 22,
    PhotoVideo: 23,
    WaiverPermission: 24,
    MedicalConditionUpdate: 25,
    ReferralSource: 26,
    PeppermintSugarCubes: 27
  }
};

// ============ MAIN FUNCTIONS ============

/**
 * Run this function ONCE to set up the automatic trigger
 * Go to Run > Run function > setupTrigger
 */
function setupTrigger() {
  // Remove any existing triggers first
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'onFormSubmit') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  
  // Create new trigger for form submissions
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  ScriptApp.newTrigger('onFormSubmit')
    .forSpreadsheet(sheet)
    .onFormSubmit()
    .create();
  
  Logger.log('Trigger created successfully! New form submissions will automatically be sent to MongoDB.');
}

/**
 * This function is called automatically when a new form is submitted
 */
function onFormSubmit(e) {
  try {
    Logger.log('New form submission received');
    
    // Get the new row data
    const row = e.values;
    Logger.log('Row data: ' + JSON.stringify(row));
    
    // Build the client data object
    const clientData = {
      apiKey: CONFIG.API_KEY,
      userid: CONFIG.USER_ID,
      Timestamp: row[CONFIG.COLUMN_MAP.Timestamp - 1] || new Date().toISOString(),
      Name: row[CONFIG.COLUMN_MAP.Name - 1] || '',
      PhoneNumber: row[CONFIG.COLUMN_MAP.PhoneNumber - 1] || '',
      Email: row[CONFIG.COLUMN_MAP.Email - 1] || '',
      MailingAddress: row[CONFIG.COLUMN_MAP.MailingAddress - 1] || '',
      TownStateZip: row[CONFIG.COLUMN_MAP.TownStateZip - 1] || '',
      BarnAddress: row[CONFIG.COLUMN_MAP.BarnAddress - 1] || '',
      BarnContact: row[CONFIG.COLUMN_MAP.BarnContact - 1] || '',
      HorseName: row[CONFIG.COLUMN_MAP.HorseName - 1] || '',
      BreedType: row[CONFIG.COLUMN_MAP.BreedType - 1] || '',
      Age_DOB: row[CONFIG.COLUMN_MAP.Age_DOB - 1] || '',
      Gender: row[CONFIG.COLUMN_MAP.Gender - 1] || '',
      Color: row[CONFIG.COLUMN_MAP.Color - 1] || '',
      Discipline: row[CONFIG.COLUMN_MAP.Discipline - 1] || '',
      OftenTrainedRidden: row[CONFIG.COLUMN_MAP.OftenTrainedRidden - 1] || '',
      Medications: row[CONFIG.COLUMN_MAP.Medications - 1] || '',
      PriorInjuries: row[CONFIG.COLUMN_MAP.PriorInjuries - 1] || '',
      ConcernsProblems: row[CONFIG.COLUMN_MAP.ConcernsProblems - 1] || '',
      HorseTie: row[CONFIG.COLUMN_MAP.HorseTie - 1] || '',
      PreviousMassage: row[CONFIG.COLUMN_MAP.PreviousMassage - 1] || '',
      AdditionalInformation: row[CONFIG.COLUMN_MAP.AdditionalInformation - 1] || '',
      VetClinicName: row[CONFIG.COLUMN_MAP.VetClinicName - 1] || '',
      PhotoVideo: row[CONFIG.COLUMN_MAP.PhotoVideo - 1] || '',
      WaiverPermission: row[CONFIG.COLUMN_MAP.WaiverPermission - 1] || '',
      MedicalConditionUpdate: row[CONFIG.COLUMN_MAP.MedicalConditionUpdate - 1] || '',
      ReferralSource: row[CONFIG.COLUMN_MAP.ReferralSource - 1] || '',
      PeppermintSugarCubes: row[CONFIG.COLUMN_MAP.PeppermintSugarCubes - 1] || ''
    };
    
    Logger.log('Sending client data: ' + JSON.stringify(clientData));
    
    // Send to webhook
    const response = sendToWebhook(clientData);
    Logger.log('Webhook response: ' + response);
    
  } catch (error) {
    Logger.log('Error in onFormSubmit: ' + error.toString());
    // Optionally send an email notification on error
    // MailApp.sendEmail('your-email@example.com', 'EB Equine Form Error', error.toString());
  }
}

/**
 * Send client data to the webhook endpoint
 */
function sendToWebhook(clientData) {
  const options = {
    method: 'POST',
    contentType: 'application/json',
    payload: JSON.stringify(clientData),
    muteHttpExceptions: true
  };
  
  try {
    const response = UrlFetchApp.fetch(CONFIG.WEBHOOK_URL, options);
    const responseCode = response.getResponseCode();
    const responseBody = response.getContentText();
    
    Logger.log('Response code: ' + responseCode);
    Logger.log('Response body: ' + responseBody);
    
    if (responseCode === 200) {
      return 'Success: ' + responseBody;
    } else {
      return 'Error: ' + responseCode + ' - ' + responseBody;
    }
  } catch (error) {
    Logger.log('Fetch error: ' + error.toString());
    return 'Fetch error: ' + error.toString();
  }
}

/**
 * Manual test function - sends the last row of the sheet to test the webhook
 * Run this to test without submitting a new form
 */
function testWithLastRow() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const lastRow = sheet.getLastRow();
  const lastRowData = sheet.getRange(lastRow, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  Logger.log('Testing with last row: ' + JSON.stringify(lastRowData));
  
  // Simulate the form submit event
  const mockEvent = {
    values: lastRowData
  };
  
  onFormSubmit(mockEvent);
}

/**
 * Sync all existing rows (use this to import existing form submissions)
 * WARNING: This will attempt to add ALL rows from the sheet
 */
function syncAllRows() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();
  
  // Skip header row (row 1)
  for (let i = 1; i < data.length; i++) {
    Logger.log('Syncing row ' + (i + 1) + ' of ' + data.length);
    
    const mockEvent = {
      values: data[i]
    };
    
    onFormSubmit(mockEvent);
    
    // Add a small delay to avoid overwhelming the server
    Utilities.sleep(500);
  }
  
  Logger.log('Sync complete!');
}
