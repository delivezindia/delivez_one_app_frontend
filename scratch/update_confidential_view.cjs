const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../src/pages/dashboard/components/AdminConfidentialCourierView.jsx');
let code = fs.readFileSync(filePath, 'utf8');

const targetSection3 = `            {/* SECTION 3: COMPREHENSIVE FINANCIAL BREAKDOWN */}`;

const advancedSecuritySection = `            {/* SECTION 2.5: DELIVEZ VAULT ADVANCED SECURITY & MULTI-STOP SPECIFICATIONS */}
            {((Array.isArray(selected.multipointStops) && selected.multipointStops.length > 0) || selected.security || selected.packaging || selected.verification) && (
              <div className={styles.vaultSectionCard}>
                <h4 className={styles.vaultSectionTitle}>
                  <ShieldCheck size={14} color="#DC2626" /> 2.5. Vault Advanced Security & Custody Protocols
                </h4>

                {/* MultiPoint Stops if available */}
                {Array.isArray(selected.multipointStops) && selected.multipointStops.length > 0 && (
                  <div style={{ marginBottom: 14 }}>
                    <span className={styles.vaultDataLabel} style={{ marginBottom: 6, display: 'block' }}>
                      MultiPoint Secure Route ({selected.multipointStops.length} Authorized Stops)
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {selected.multipointStops.map((st, idx) => (
                        <div key={st.id || idx} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <strong style={{ color: '#0F172A' }}>Stop {st.stopNumber || idx + 1}: {st.stopName}</strong>
                            {st.timeWindow && <span style={{ color: '#2563EB', fontWeight: 600 }}>{st.timeWindow}</span>}
                          </div>
                          <div style={{ color: '#475569', marginTop: 2 }}>{st.address}</div>
                          {st.contactPerson && <div style={{ color: '#64748B', fontSize: 11, marginTop: 2 }}>Contact: {st.contactPerson}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Packaging and Security Grid */}
                <div className={styles.vaultDataGrid}>
                  {selected.packaging && (
                    <div className={styles.vaultDataItem}>
                      <span className={styles.vaultDataLabel}>Vault Container Packaging</span>
                      <span className={styles.vaultDataValue}>
                        {selected.packaging.selectedPackage || 'Standard Box'}
                        {selected.packaging.waterproofCover ? ' • Waterproof Cover' : ''}
                        {selected.packaging.cornerGuard ? ' • Corner Guards' : ''}
                        {selected.packaging.extraBubbleWrap ? ' • Bubble Wrap' : ''}
                      </span>
                    </div>
                  )}
                  {selected.security && (
                    <div className={styles.vaultDataItem}>
                      <span className={styles.vaultDataLabel}>Armed Escort Protection</span>
                      <span className={styles.vaultDataValue} style={{ color: selected.security.armedEscort ? '#DC2626' : '#15803D', fontWeight: 700 }}>
                        {selected.security.armedEscort ? 'YES — Armed Escort Protocol Active' : 'Standard Armed Guard Protocol'}
                      </span>
                    </div>
                  )}
                  {selected.verification && (
                    <div className={styles.vaultDataItem}>
                      <span className={styles.vaultDataLabel}>Mandatory Handover Verification</span>
                      <span className={styles.vaultDataValue}>
                        {selected.verification.selectedVerification || 'OTP Verification'}
                        {selected.verification.capturePhotoOfRecipient ? ' • Recipient Photo' : ''}
                        {selected.verification.capturePhotoOfIdProof ? ' • Govt ID Verification' : ''}
                      </span>
                    </div>
                  )}
                  {selected.security?.restrictedAccess && (
                    <div className={styles.vaultDataItem}>
                      <span className={styles.vaultDataLabel}>Access Control</span>
                      <span className={styles.vaultDataValue} style={{ color: '#B45309' }}>
                        Restricted Access Hub Transit Enabled
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

`;

if (code.includes(targetSection3) && !code.includes('SECTION 2.5: DELIVEZ VAULT ADVANCED SECURITY')) {
  code = code.replace(targetSection3, advancedSecuritySection + targetSection3);
  fs.writeFileSync(filePath, code, 'utf8');
  console.log('Inserted Section 2.5 into AdminConfidentialCourierView.jsx successfully.');
} else {
  console.log('Target section already present or not found.');
}
