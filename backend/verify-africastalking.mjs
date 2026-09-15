/**
 * verify-africastalking.mjs
 * ─────────────────────────────────────────────────────────────────
 * Verifie que les credentials Africa's Talking dans le .env sont
 * valides en envoyant un SMS de test via l'API sandbox.
 *
 * Usage:
 *   node verify-africastalking.mjs
 *   node verify-africastalking.mjs +254712345678   (numero cible custom)
 * ─────────────────────────────────────────────────────────────────
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const axios   = require('axios');

// ── 1. Chargement du .env ────────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath   = resolve(__dirname, '.env');

if (!existsSync(envPath)) {
  console.error('[ERREUR] Fichier .env introuvable :', envPath);
  process.exit(1);
}

const envVars = {};
for (const line of readFileSync(envPath, 'utf-8').split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
  envVars[key] = val;
}

// ── 2. Lecture des variables ─────────────────────────────────────
const USERNAME   = envVars['AFRICASTALKING_USERNAME']?.trim();
const API_KEY    = envVars['AFRICASTALKING_API_KEY']?.trim();
const FROM       = envVars['AFRICASTALKING_FROM']?.trim();
const SANDBOX    = envVars['AFRICASTALKING_SANDBOX']?.trim() === 'true' || USERNAME === 'sandbox';
const TIMEOUT_MS = parseInt(envVars['AFRICASTALKING_TIMEOUT_MS'] || '18000', 10);

const TO = process.argv[2] || '+254700000001';

// ── 3. Affichage de la config detectee ──────────────────────────
console.log('\n===================================================');
console.log("  Verification des credentials Africa's Talking");
console.log('===================================================\n');

const maskKey = (k) => (k ? k.slice(0, 8) + '...' + k.slice(-6) : '(absent)');

console.log('  AFRICASTALKING_USERNAME  :', USERNAME || '[ABSENT]');
console.log('  AFRICASTALKING_API_KEY   :', maskKey(API_KEY));
console.log('  AFRICASTALKING_FROM      :', FROM || '(non defini - optionnel)');
console.log('  AFRICASTALKING_SANDBOX   :', SANDBOX ? 'true  --> sandbox' : 'false --> production');
console.log('  AFRICASTALKING_TIMEOUT_MS:', TIMEOUT_MS + ' ms');
console.log('  Numero de test           :', TO);
console.log();

// ── 4. Validation de base ────────────────────────────────────────
let hasError = false;

if (!USERNAME) {
  console.error('  [ERREUR] AFRICASTALKING_USERNAME est absent ou vide.');
  hasError = true;
}
if (!API_KEY) {
  console.error('  [ERREUR] AFRICASTALKING_API_KEY est absent ou vide.');
  hasError = true;
}
if (SANDBOX && USERNAME !== 'sandbox') {
  console.warn("  [AVERT]  SANDBOX=true mais USERNAME != 'sandbox' — assurez-vous d'utiliser un compte sandbox.");
}
if (API_KEY && !API_KEY.startsWith('atsk_')) {
  console.warn("  [AVERT]  La cle API ne commence pas par 'atsk_' — format inhabituel pour AT.");
}

if (hasError) {
  console.error('\n  [ECHEC] Configuration incomplete. Corrigez le .env avant de continuer.\n');
  process.exit(1);
}

console.log('  [OK] Variables de configuration presentes.\n');

// ── 5. Appel a l'API Africa's Talking via axios ──────────────────
const BASE_URL = SANDBOX
  ? 'https://api.sandbox.africastalking.com/version1'
  : 'https://api.africastalking.com/version1';

const form = new URLSearchParams({ username: USERNAME, to: TO, message: `[WapiBei] Test credentials AT -- ${new Date().toISOString()}` });
if (FROM) form.set('from', FROM);

console.log(`  Endpoint : ${BASE_URL}/messaging`);
console.log(`  TO       : ${TO}\n`);

try {
  const response = await axios.post(`${BASE_URL}/messaging`, form.toString(), {
    headers: {
      Accept:         'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      apiKey:         API_KEY,
      'User-Agent':   'WapiBei-Verify/1.0',
    },
    timeout: TIMEOUT_MS,
  });

  const raw        = JSON.stringify(response.data, null, 2);
  const recipients = response.data?.SMSMessageData?.Recipients ?? [];
  const apiMessage = response.data?.SMSMessageData?.Message    ?? '';

  console.log('===================================================');
  console.log('  Reponse HTTP :', response.status);
  console.log('  Corps        :\n', raw);
  console.log('===================================================\n');

  if (recipients.length === 0) {
    console.warn('  [AVERT] Aucun destinataire retourne dans la reponse.');
    console.warn('  Message AT  :', apiMessage || '(aucun)');
    process.exit(1);
  }

  let allOk = true;
  for (const r of recipients) {
    const ok   = ['Success', 'Sent', 'Submitted'].includes(r.status);
    const icon = ok ? '[OK]' : '[KO]';
    console.log(`  ${icon} Destinataire : ${r.number}`);
    console.log(`       Statut    : ${r.status}  (code HTTP: ${r.statusCode})`);
    console.log(`       MessageID : ${r.messageId}`);
    console.log(`       Cout      : ${r.cost}\n`);
    if (!ok) allOk = false;
  }

  if (allOk) {
    console.log('===================================================');
    console.log("  [SUCCES] Credentials VALIDES !");
    console.log("  L'API Africa's Talking a accepte le message.");
    console.log('===================================================\n');
  } else {
    console.error('  [ECHEC] Certains destinataires ont ete rejetes.\n');
    process.exit(1);
  }

} catch (err) {
  if (err.response) {
    console.error(`\n  [ECHEC HTTP] ${err.response.status}:`, JSON.stringify(err.response.data));
    if (err.response.status === 401) console.error('     -> API Key invalide ou non autorisee.');
    if (err.response.status === 400) console.error('     -> Requete malformee (USERNAME / FROM / TO invalide).');
    if (err.response.status === 403) console.error('     -> Acces refuse — verifiez les permissions sandbox.');
  } else if (err.code === 'ECONNABORTED') {
    console.error(`\n  [TIMEOUT] Aucune reponse de l'API en ${TIMEOUT_MS} ms.`);
  } else {
    console.error('\n  [ERREUR RESEAU] :', err.message);
    console.error('  Code            :', err.code || 'N/A');
  }
  process.exit(1);
}
