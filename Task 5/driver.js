"use strict";

let blindSignatures = require("blind-signatures");
let SpyAgency = require("./spyAgency.js").SpyAgency;

// Function to create a document with diplomatic credentials
function makeDocument(coverName) {
  return `The bearer of this signed document, ${coverName}, has full diplomatic immunity.`;
}

// Function to blind the document
function blind(msg, n, e) {
  return blindSignatures.blind({
    message: msg,
    N: n,
    E: e,
  });
}

// Function to unblind the signature
function unblind(blindingFactor, sig, n) {
  return blindSignatures.unblind({
    signed: sig,
    N: n,
    r: blindingFactor,
  });
}

// Create the spy agency object
let agency = new SpyAgency();

// Prepare documents and fake identities
let documents = [];
let blindDocs = [];
let blindingFactors = [];

for (let i = 0; i < 10; i++) {
  let coverName = `Agent ${i + 1}`;
  let doc = makeDocument(coverName);
  documents.push(doc);

  let { blinded, r } = blind(doc, agency.n, agency.e);
  blindDocs.push(blinded);
  blindingFactors.push(r);
}

// Sign the documents by the agency
agency.signDocument(blindDocs, (selected, verifyAndSign) => {
  console.log(`Selected document index: ${selected}`);

  // Prepare verification data, excluding the selected document
  let verifiedDocs = documents.map((doc, index) =>
    index === selected ? undefined : doc
  );
  let verifiedFactors = blindingFactors.map((factor, index) =>
    index === selected ? undefined : factor
  );

  // Call the verification and signing function
  let blindedSignature = verifyAndSign(verifiedFactors, verifiedDocs);

  // Unblind and retrieve the real signature
  let signature = unblind(
    blindingFactors[selected],
    blindedSignature,
    agency.n
  );

  // Print the required results
  console.log(`Signed document: ${documents[selected]}`);
  console.log(`Signature: ${signature}`);
});
