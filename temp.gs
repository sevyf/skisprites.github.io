//// When Form is submitted, generate medical information and signature pages
//function createSignatureSheets(e) {
//  Logger.log('Beginning create signature sheets function');
//  // If multiple people submit form at same time, force
//  //  one to wait to prevent collisions
//  var lock = LockService.getPublicLock();
//  var success = lock.tryLock(10000);
//  if (!success) {
//    Logger.log('Could not obtain lock after 10 seconds.');
//    // FIXME: Maybe should send an email or other notification?
//    return;
//  }
//
//  // Get name that was just submitted
//  var name = e.namedValues["Name"].toString();
//  // Get membership type that was just submitted
//  var type = e.namedValues["Membership Type"].toString();
//  // If membership type is family and done entering family is not 'yes', then we're done
//  var done = e.namedValues["Done Entering Family Members?"].toString();
//  if ((type.indexOf("Individual") < 0) && (done != "Yes")) {
//    Logger.log('Expect more family members to be entered');
//    return;
//  }
//
//  // Assume the just submitted response went into the last row of the spreadsheet
//  var ss = SpreadsheetApp.getActiveSpreadsheet();
//  var respSheet = ss.getSheets()[0];  // Forms typically go into sheet 0.
//  var respRow = respSheet.getLastRow();
//  
//  // Double check a couple items against fields that were submitted
//  var headers = respSheet.getRange(1,1,1,respSheet.getLastColumn()).getValues()[0];
//  var allValues = respSheet.getRange(respRow,1,1,respSheet.getLastColumn()).getValues()[0];
//  if ((allValues[headers.indexOf("Name")] != name) ||
//      (allValues[headers.indexOf("Email Address")] != e.namedValues["Email Address"].toString())) {
//    throw "Input data does not match final row. Need to send signature sheets manually.";
//  }
//  
//  var index = respRow;
//  // If family, find row of primary member
//  if (type.indexOf("Individual") < 0) {
//  
//
//  emailSignatureSheetsForIndex(respRow);
//  // Release lock so if multiple people submitted form at same time, the next person can 
//  //  run this function now.
//  lock.releaseLock();
//}
//
// When Form is submitted, generate medical information and signature pages
//function createSignatureSheetsForIndex(index) {
//  Logger.log('Beginning create signature sheets function');
//  // If multiple people submit form at same time, force
//  //  one to wait to prevent collisions
//  var lock = LockService.getPublicLock();
//  var success = lock.tryLock(10000);
//  if (!success) {
//    Logger.log('Could not obtain lock after 10 seconds.');
//    // FIXME: Maybe should send an email or other notification?
//    return;
//  }
//
//  // Get headers and info for this person from the spreadsheet
//  var ss = SpreadsheetApp.getActiveSpreadsheet();
//  var respSheet = ss.getSheets()[0];  // Forms typically go into sheet 0.
//  // FIXME: Improve performance by reading entire spreadsheet to local memory once instead
//  //   of individually reading lots of parts
//  var headers = respSheet.getRange(1,1,1,respSheet.getLastColumn()).getValues()[0];
//  var allValues = respSheet.getRange(index,1,1,respSheet.getLastColumn()).getValues()[0];
//  for (var i=0; i < allValues.length; ++i) {
//    Logger.log('headers[' + i + ']=' + headers[i]);
//    Logger.log('allValues[' + i + ']=' + allValues[i]);
//  }
//  var tempCol = headers.indexOf("Name"); // This is array index (starting from 0, not spreadsheet index which stars at 1)
//  var names = allValues[tempCol];
//  tempCol = headers.indexOf("Membership Type");
//  if (allValues[tempCol].toString().indexOf("Individual") < 0) {
//    tempCol = headers.indexOf("Same address/medical insurance as primary family member");
//    // Family membership, make a list of all family members
//    for (var i=1; i <= respSheet.getLastRow();  i++) {
//      // WORKING HERE
//    }
//  }
//  
//  // Create document from template
//  var nameNoSpace = names.replace(/\s+/g, '');
//  var overwrite = 1; // set to 0 if want new file every time
//  var formattedDate = Utilities.formatDate(new Date(), "CDT", "yyyy-MM-dd");
//  var inputFileName = "SignatureTemplate2015";
//  var outputFileName = nameNoSpace + formattedDate;
//  var outputFolderName = "SpritesSignaturePages2015";
//  var files = DriveApp.getFilesByName(inputFileName);
//  if (!files.hasNext()) {
//    throw "Error, can't find letter template: " + inputFileName;
//  } else {
//    var letterTemplate = files.next();
//  }
//  if (files.hasNext()) {
//    while (files.hasNext()) {
//      var file = files.next();
//      Logger.log(file.getName());
//      Logger.log(file.getId());
//    }
//    throw "Warning, more than one letter template found: " + inputFileName;
//  }
//  var folders = DriveApp.getFoldersByName(outputFolderName);
//  if (!folders.hasNext()) {
//    // If folder doesn't exist yet, create it
//    var outputFolder = DriveApp.createFolder(outputFolderName);
//  } else {
//    var outputFolder = folders.next();
//  }
//  if (overwrite && outputFolder.getFilesByName(outputFileName).hasNext()) {
//    var files = outputFolder.getFilesByName(outputFileName);
//    var newLetterFile = files.next(); // Use first match as the one to replace
//    while (files.hasNext()) { // And delete any other extras that are found
//      var file = files.next();
//      file.setTrashed(true);
//    }
//  } else {
//    var newLetterFile = letterTemplate.makeCopy(outputFileName,outputFolder);
//  }
//  var newLetterId = newLetterFile.getId();
//  var docCopy = DocumentApp.openById(newLetterId);
//  for (var i=0; i < headers.length; ++i) {
//    // get rid of special characters in header name that might confuse regexp thats part of replaceText
//    var searchString = "##" + headers[i].replace(/[^a-zA-Z 0-9,]+/g,'') +"##";
//    var replaceString = allValues[i];
//    // Fix format of birthdays
//    if (headers[i] == "Date of Birth") {
//      Logger.log(replaceString);
//      if (replaceString.toString().indexOf("GMT") > 0) {
//        replaceString = Utilities.formatDate(replaceString, "GMT", "MMM d, yyyy");
//      }
//    }
//    docCopy.getBody().replaceText(searchString, replaceString); //replace variable (from column title) with actual value
//  }
//  // Doc is done
//  docCopy.saveAndClose();
//  // Release lock so if multiple people submitted form at same time, the next person can 
//  //  run this function now.
//  lock.releaseLock();
//  return newLetterId;
//}

function emailSignatureSheets(index,newLetterId) {
  Logger.log('Beginning email signature sheets function');
  // If multiple people submit form at same time, force
  //  one to wait to prevent collisions
  var lock = LockService.getPublicLock();
  var success = lock.tryLock(10000);
  if (!success) {
    Logger.log('Could not obtain lock after 10 seconds.');
    // FIXME: Maybe should send an email or other notification?
    return;
  }

  // Send pdf in email
  // Get headers and info for this person from the spreadsheet
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var respSheet = ss.getSheets()[0];  // Forms typically go into sheet 0.
  var headers = respSheet.getRange(1,1,1,respSheet.getLastColumn()).getValues()[0];
  var allValues = respSheet.getRange(index,1,1,respSheet.getLastColumn()).getValues()[0];
  var emailAddress = allValues[headers.indexOf("Email Address")];
  if (emailAddress) {
    Logger.log('Sending email to <' + emailAddress + '>');  
    var pdf = DriveApp.getFileById(newLetterId).getAs("application/pdf");
    var subject = "Ski Sprites Signature Pages";
    var body = "Welcome to the Ski Sprites WaterSki Team!\n";
    body += "Attached are the medical information sheet(s) for you to sign and return. We keep them on file in case of emergency.\n";
    body += "If you have any questions, please feel free to call or email\n";
    body += "   Chuck Ebert - President -  rc.ebert1203@gmail.com 715-225-4960\n";
    body += "   Ben Walker - Vice-President - footer97@gmail.com 715-514-7217\	";
    body += "   Michelle Glaser - Secretary - mglaserg@yahoo.com 715-563-3611\n";
    body += "   Sevy Fischer - Treasurer - fischeradventure@gmail.com 715-456-5004\n";
    body += "   Rich LaFave Weber - Show Director - lafaves@att.net 715-579-5105\n";
    body += "Also, Remember to ensure that your USA Waterski and WWSF memberships are up to date.\n"
    body += "   USA Waterski: http://www.usawaterski.org/ membership is good for 12 months after you join/renew.\n";
    body += "   Wisconsin Waterski Federation (WWSF): http://waterski.org/ membership is on a calendar year basis.\n";
    body += "Team dues and voluteer points information can be found at https://goo.gl/Qm3dAx\n";
    body += "   and can be paid by cash, check, or credit card online (https://goo.gl/g0smto)\n";
    body += "\nThanks, and we look forward to seeing you this summer."
    // TODO: Add html formatting
    //MailApp.sendEmail(emailAddress, subject, body, {attachments: [pdf, waiver], htmlBody: html});
    MailApp.sendEmail(emailAddress, subject, body, {attachments: pdf});
  } else {
    Logger.log('Email address <' + emailAddress + '> not found');  
  }

  // Release lock so if multiple people submitted form at same time, the next person can 
  //  run this function now.
  lock.releaseLock();
  return newLetterId;
}

function emailSignatureSheetsForIndex(index) {
  emailSignatureSheets(index,createSignatureSheetsForIndex(index));
}






//////////////////////

// When Form is submitted, generate medical information and signature pages
function createSignatureSheets(e) {
  Logger.log('Beginning create signature sheets function');
  // If multiple people submit form at same time, force
  //  one to wait to prevent collisions
  var lock = LockService.getPublicLock();
  var success = lock.tryLock(10000);
  if (!success) {
    Logger.log('Could not obtain lock after 10 seconds.');
    // FIXME: Maybe should send an email or other notification?
    return;
  }

  // Get name that was just submitted
  var name = e.namedValues["Name"].toString();
  // Get membership type that was just submitted
  var type = e.namedValues["Membership Type"].toString();
  // If membership type is family and done entering family is not 'yes', then we're done
  var done = e.namedValues["Done Entering Family Members?"].toString();
  if ((type.indexOf("Individual") < 0) && (done != "Yes")) {
    Logger.log('Expect more family members to be entered');
    return;
  }
  // Get headers from the spreadsheet
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var respSheet = ss.getSheets()[0];  // Forms typically go into sheet 0.
  var headers = respSheet.getRange(1,1,1,respSheet.getLastColumn()).getValues()[0];
  // If membership type is family, get names of other family members
  var primaryName;
  var primaryIndex = 0; // Expect we'll leave primary member first in the data structure
  var allValues = [];
  if (type.indexOf("Individual") >= 0) {
    primaryName = name;
    allValues.push(e.values);
  } else {
    // First find data for primary member, then other family members
    var colTitles = [];
    colTitles[0] = "Name";
    colTitles[1] = "Same address/medical insurance as primary family member";
    primaryName = e.namedValues[colTitles[1]].toString();
    if (!primaryName) {primaryName = name}; // In case someone enters done without choosing primary
    for (j = 0; j < colTitles.length; ++j) {
      var colTitle = colTitles[j];
      var col = headers.indexOf(colTitle) + 1;
      var colValues = respSheet.getRange(2,col,respSheet.getLastRow()-1,1).getValues();
      for (i=0; i < colValues.length; ++i) {
        if (colValues[i][0].toString() == primaryName) {
          // When found, put the row with their information to the data structure
          //   (use i+2 for row because colValues[] doesn't include the top row and
          //   colValues indexes from 0, while getRange seems to index from 1
          allValues.push(respSheet.getRange(i+2,1,1,respSheet.getLastColumn()).getValues()[0]);
        }
      }
    }
  }
  for (var i=0; i < allValues.length; ++i) {
    Logger.log('allValues[' + i + '][1]=' + allValues[i][1]);
  }
  // Create document from template
  var nameNoSpace = primaryName.replace(/\s+/g, '');
  var overwrite = 0; // set to 0 if want new file every time
  var formattedDate = Utilities.formatDate(new Date(), "CDT", "yyyy-MM-dd");
  var inputFileName = "SignatureTemplate2020";
  var outputFileName = nameNoSpace + formattedDate;
  var outputFolderName = "SpritesSignaturePages2020";
  var files = DriveApp.getFilesByName(inputFileName);
  if (!files.hasNext()) {
    throw "Error, can't find letter template: " + inputFileName;
  } else {
    var letterTemplate = files.next();
  }
  if (files.hasNext()) {
    while (files.hasNext()) {
      var file = files.next();
      Logger.log(file.getName());
      Logger.log(file.getId());
    }
    throw "Warning, more than one letter template found: " + inputFileName;
  }
  var folders = DriveApp.getFoldersByName(outputFolderName);
  if (!folders.hasNext()) {
    // If folder doesn't exist yet, create it
    var outputFolder = DriveApp.createFolder(outputFolderName);
  } else {
    var outputFolder = folders.next();
  }
  if (overwrite && outputFolder.getFilesByName(outputFileName).hasNext()) {
    var files = outputFolder.getFilesByName(outputFileName);
    var newLetterFile = files.next(); // Use first match as the one to replace
    while (files.hasNext()) { // And delete any other extras that are found
      var file = files.next();
      file.setTrashed(true);
    }
  } else {
    var newLetterFile = letterTemplate.makeCopy(outputFileName,outputFolder);
  }
  var newLetterId = newLetterFile.getId();
  var docCopy = DocumentApp.openById(newLetterId);
  var totalParagraphs = docCopy.getBody().getParagraphs() ;// get the total number of paragraphs elements
  docCopy.getBody().clear();
  Logger.log(totalParagraphs);
  // For each family member, replace paragraphs with specific info
  var fieldsToReplace = [];
  fieldsToReplace[0] = "Address";
  fieldsToReplace[1] = "Medical Insurance Carrier, Plan ID Number, Group Number";
  fieldsToReplace[2] = "Emergency Contact Name and Phone Number(s)";
  fieldsToReplace[3] = "Hospital Preference";
  fieldsToReplace[4] = "Physician Name, Clinic, and Phone Number";
  for (var i=0; i < allValues.length; ++i) {
    var elements = [];
    for (var e=0;e<totalParagraphs.length;e++){
      var element = totalParagraphs[e].copy();
//      Logger.log(element.editAsText().getText())
      for(var c=0;c<headers.length;c++){
        // get rid of special characters in header name that might confuse regexp thats part of replaceText
        var searchString = "##" + headers[c].replace(/[^a-zA-Z 0-9,]+/g,'') +"##";
        var replaceString = allValues[i][c];
        // If copying info from primary member, do that
        if (!replaceString && (fieldsToReplace.indexOf(headers[c]) >=0)) {
          replaceString = allValues[primaryIndex][c];
        }
        // Fix format of birthdays
        if (headers[c] == "Date of Birth") {
          Logger.log(replaceString);
          if (replaceString.toString().indexOf("GMT") > 0) {
            replaceString = Utilities.formatDate(replaceString, "GMT", "MMM d, yyyy");
          }
        }
        // Zero pad USA Waterski numbers to 9 places
        if (headers[c] == "USA Waterski Member Number") {
          replaceString = Utilities.formatString("%09d",replaceString);
        }
        element.replaceText(searchString, replaceString); //replace variable (from column title) with actual value
      }
      elements.push(element);// store paragraphs in an array
    }
    for(var el=0;el<elements.length;el++){ 
      var paragraph = elements[el].copy();
      docCopy.getBody().appendParagraph(paragraph);
    }
    if (i != allValues.length-1) {docCopy.getBody().appendPageBreak()}
  }
  // Doc is done
  docCopy.saveAndClose();
  // Send pdf in email
  col = headers.indexOf("Email Address");
  var emailAddress = allValues[primaryIndex][col].toString(); // Primary contact should be first in allValues structure
  if (emailAddress) {
    Logger.log('Sending email to <' + emailAddress + '>');  
    var pdf = DriveApp.getFileById(newLetterId).getAs("application/pdf");
    var subject = "Ski Sprites Medical Information Signature Page";
    var body = "Welcome to the Ski Sprites WaterSki Team!\n";
    body += "Attached are the medical information sheet(s) for you to sign and return. We keep them on file in case of emergency.\n";
    body += "If you have any questions, please feel free to call or email\n";
    body += "   Chuck Ebert - President -  rc.ebert1203@gmail.com 715-225-4960\n";
    body += "   Ben Walker - Vice-President - footer97@gmail.com 715-514-7217\	";
    body += "   Michelle Glaser - Secretary - mglaserg@yahoo.com 715-563-3611\n";
    body += "   Sevy Fischer - Treasurer - fischeradventure@gmail.com 715-456-5004\n";
    body += "   Rich LaFave Weber - Show Director - lafaves@att.net 715-579-5105\n";
    body += "Also, Remember to ensure that your USA Waterski and WWSF memberships are up to date.\n"
    body += "   USA Waterski: http://www.usawaterski.org/ membership is good for 12 months after you join/renew.\n";
    body += "   Wisconsin Waterski Federation (WWSF): http://waterski.org/ membership is on a calendar year basis.\n";
    body += "Team dues and voluteer points information can be found at https://goo.gl/Qm3dAx\n";
    body += "   and can be paid by cash, check, or credit card online (https://goo.gl/g0smto)\n";
    body += "\nThanks, and we look forward to seeing you this summer."
    MailApp.sendEmail(emailAddress, subject, body, {attachments: pdf});
  } else {
    Logger.log('Email address <' + emailAddress + '> not found');  
  }
  // Release lock so if multiple people submitted form at same time, the next person can 
  //  run this function now.
  lock.releaseLock();
}

function createSignatureSheetsForName(primaryName) {
  // Get headers from the spreadsheet
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var respSheet = ss.getSheets()[0];  // Forms typically go into sheet 0.
  var headers = respSheet.getRange(1,1,1,respSheet.getLastColumn()).getValues()[0];
  var primaryIndex = 0; // Expect we'll leave primary member first in the data structure
  var allValues = [];
  // First find data for primary member, then other family members
  var colTitles = [];
  colTitles[0] = "Name";
  colTitles[1] = "Same address/medical insurance as primary family member";
  for (j = 0; j < colTitles.length; ++j) {
    var colTitle = colTitles[j];
    var col = headers.indexOf(colTitle) + 1;
    var colValues = respSheet.getRange(2,col,respSheet.getLastRow()-1,1).getValues();
    for (i=0; i < colValues.length; ++i) {
      if (colValues[i][0].toString() == primaryName) {
        // When found, put the row with their information to the data structure
        //   (use i+2 for row because colValues[] doesn't include the top row and
        //   colValues indexes from 0, while getRange seems to index from 1
        allValues.push(respSheet.getRange(i+2,1,1,respSheet.getLastColumn()).getValues()[0]);
      }
    }
  }
  for (var i=0; i < allValues.length; ++i) {
    Logger.log('allValues[' + i + '][1]=' + allValues[i][1]);
  }
  // Create document from template
  var nameNoSpace = primaryName.replace(/\s+/g, '');
  var overwrite = 0; // set to 0 if want new file every time
  var formattedDate = Utilities.formatDate(new Date(), "CDT", "yyyy-MM-dd");
  var inputFileName = "SignatureTemplate2020";
  var outputFileName = nameNoSpace + formattedDate;
  var outputFolderName = "SpritesSignaturePages2020";
  var files = DriveApp.getFilesByName(inputFileName);
  if (!files.hasNext()) {
    throw "Error, can't find letter template: " + inputFileName;
  } else {
    var letterTemplate = files.next();
  }
  if (files.hasNext()) {
    while (files.hasNext()) {
      var file = files.next();
      Logger.log(file.getName());
      Logger.log(file.getId());
    }
    throw "Warning, more than one letter template found: " + inputFileName;
  }
  var folders = DriveApp.getFoldersByName(outputFolderName);
  if (!folders.hasNext()) {
    // If folder doesn't exist yet, create it
    var outputFolder = DriveApp.createFolder(outputFolderName);
  } else {
    var outputFolder = folders.next();
  }
  if (overwrite && outputFolder.getFilesByName(outputFileName).hasNext()) {
    var files = outputFolder.getFilesByName(outputFileName);
    var newLetterFile = files.next(); // Use first match as the one to replace
    while (files.hasNext()) { // And delete any other extras that are found
      var file = files.next();
      file.setTrashed(true);
    }
  } else {
    var newLetterFile = letterTemplate.makeCopy(outputFileName,outputFolder);
  }
  var newLetterId = newLetterFile.getId();
  var docCopy = DocumentApp.openById(newLetterId);
  var totalParagraphs = docCopy.getBody().getParagraphs() ;// get the total number of paragraphs elements
  docCopy.getBody().clear();
  Logger.log(totalParagraphs);
  // For each family member, replace paragraphs with specific info
  var fieldsToReplace = [];
  fieldsToReplace[0] = "Address";
  fieldsToReplace[1] = "Medical Insurance Carrier, Plan ID Number, Group Number";
  fieldsToReplace[2] = "Emergency Contact Name and Phone Number(s)";
  fieldsToReplace[3] = "Hospital Preference";
  fieldsToReplace[4] = "Physician Name, Clinic, and Phone Number";
  for (var i=0; i < allValues.length; ++i) {
    var elements = [];
    for (var e=0;e<totalParagraphs.length;e++){
      var element = totalParagraphs[e].copy();
//      Logger.log(element.editAsText().getText())
      for(var c=0;c<headers.length;c++){
        // get rid of special characters in header name that might confuse regexp thats part of replaceText
        var searchString = "##" + headers[c].replace(/[^a-zA-Z 0-9,]+/g,'') +"##";
        var replaceString = allValues[i][c];
        // If copying info from primary member, do that
        if (!replaceString && (fieldsToReplace.indexOf(headers[c]) >=0)) {
          replaceString = allValues[primaryIndex][c];
        }
        // Fix format of birthdays
        if (headers[c] == "Date of Birth") {
          Logger.log(replaceString);
          if (replaceString.toString().indexOf("GMT") > 0) {
            replaceString = Utilities.formatDate(replaceString, "GMT", "MMM d, yyyy");
          }
        }
        // Zero pad USA Waterski numbers to 9 places
        if (headers[c] == "USA Waterski Member Number") {
          replaceString = Utilities.formatString("%09d",replaceString);
        }
        element.replaceText(searchString, replaceString); //replace variable (from column title) with actual value
      }
      elements.push(element);// store paragraphs in an array
    }
    for(var el=0;el<elements.length;el++){ 
      var paragraph = elements[el].copy();
      docCopy.getBody().appendParagraph(paragraph);
    }
    if (i != allValues.length-1) {docCopy.getBody().appendPageBreak()}
  }
  // Doc is done
  docCopy.saveAndClose();
}

// Send a doc as pdf to the given email address
function sendPDFtoEmail(docID,emailAddress) {
    Logger.log('Sending email to <' + emailAddress + '>');  
    var pdf = DriveApp.getFileById(docId).getAs("application/pdf");
    var subject = "Ski Sprites Medical Information Signature Page";
    var body = "Welcome to the Ski Sprites WaterSki Team!\n";
    body += "Attached are the medical information sheet(s) for you to sign and return. We keep them on file in case of emergency.\n";
    body += "If you have any questions, please feel free to call or email\n";
    body += "   Chuck Ebert - President -  rc.ebert1203@gmail.com 715-225-4960\n";
    body += "   Ben Walker - Vice-President - footer97@gmail.com 715-514-7217\	";
    body += "   Michelle Glaser - Secretary - mglaserg@yahoo.com 715-563-3611\n";
    body += "   Sevy Fischer - Treasurer - fischeradventure@gmail.com 715-456-5004\n";
    body += "   Rich LaFave Weber - Show Director - lafaves@att.net 715-579-5105\n";
    body += "Also, Remember to ensure that your USA Waterski and WWSF memberships are up to date.\n";
    body += "   USA Waterski: http://www.usawaterski.org/ membership is good for 12 months after you join/renew.\n";
    body += "   Wisconsin Waterski Federation (WWSF): http://waterski.org/ membership is on a calenear year basis.\n";
    body += "Team dues and voluteer points information can be found at https://goo.gl/Qm3dAx\n";
    body += "   and can be paid by cash, check, or credit card online (https://goo.gl/g0smto)\n";
    body += "\nThanks, and we look forward to seeing you this summer."
    MailApp.sendEmail(emailAddress, subject, body, {attachments: pdf});
} 

/**
 * Adds a custom menu to the active spreadsheet, containing a single menu item
 * for invoking the genTestInvoice() function specified above.
 * The onOpen() function, when defined, is automatically invoked whenever the
 * spreadsheet is opened.
 * For more information on using the Spreadsheet API, see
 * https://developers.google.com/apps-script/service_spreadsheet
 */
function onOpen() {
  SpreadsheetApp.getUi() // Or DocumentApp or FormApp.
      .createMenu('Signature Forms')
      .addItem('Create a Signature Form', 'showPrompt')
      .addToUi();
}

function generate()
{

}
function showPrompt() {
  var ui = SpreadsheetApp.getUi(); // Same variations.

  var result = ui.prompt(
      'Enter your name of person to generate forms for',
      ui.ButtonSet.OK_CANCEL);

  // Process the user's response.
  var button = result.getSelectedButton();
  var text = result.getResponseText();
  if (button == ui.Button.OK) {
    // User clicked "OK".
    createSignatureSheetsForName(text);
  } else if (button == ui.Button.CANCEL) {
    // User clicked "Cancel".
    //ui.alert('I didn\'t get your name.');
  } else if (button == ui.Button.CLOSE) {
    // User clicked X in the title bar.
    //ui.alert('You closed the dialog.');
  }
}
