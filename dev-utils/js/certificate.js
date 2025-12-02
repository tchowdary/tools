import { showToast, copyToClipboard, downloadFile } from './utils.js';

// ASN.1 parsing utilities for X.509 certificates
class ASN1Parser {
    constructor(bytes) {
        this.bytes = bytes;
        this.pos = 0;
    }

    readByte() {
        return this.bytes[this.pos++];
    }

    readLength() {
        let length = this.readByte();
        if (length & 0x80) {
            const numBytes = length & 0x7f;
            length = 0;
            for (let i = 0; i < numBytes; i++) {
                length = (length << 8) | this.readByte();
            }
        }
        return length;
    }

    readSequence() {
        const tag = this.readByte();
        const length = this.readLength();
        const start = this.pos;
        const end = start + length;
        return { tag, length, start, end };
    }

    readInteger() {
        this.readByte(); // tag
        const length = this.readLength();
        const bytes = this.bytes.slice(this.pos, this.pos + length);
        this.pos += length;
        return bytes;
    }

    readOID() {
        this.readByte(); // tag
        const length = this.readLength();
        const bytes = this.bytes.slice(this.pos, this.pos + length);
        this.pos += length;

        let oid = '';
        let value = 0;
        for (let i = 0; i < bytes.length; i++) {
            value = (value << 7) | (bytes[i] & 0x7f);
            if (!(bytes[i] & 0x80)) {
                if (oid === '') {
                    const first = Math.floor(value / 40);
                    const second = value % 40;
                    oid = `${first}.${second}`;
                } else {
                    oid += `.${value}`;
                }
                value = 0;
            }
        }
        return oid;
    }

    readString() {
        const tag = this.readByte();
        const length = this.readLength();
        const bytes = this.bytes.slice(this.pos, this.pos + length);
        this.pos += length;

        try {
            return new TextDecoder('utf-8').decode(bytes);
        } catch {
            return Array.from(bytes).map(b => String.fromCharCode(b)).join('');
        }
    }

    readBitString() {
        this.readByte(); // tag
        const length = this.readLength();
        const unusedBits = this.readByte();
        const bytes = this.bytes.slice(this.pos, this.pos + length - 1);
        this.pos += length - 1;
        return { bytes, unusedBits };
    }
}

// OID to name mappings
const OID_NAMES = {
    '2.5.4.3': 'CN',
    '2.5.4.6': 'C',
    '2.5.4.7': 'L',
    '2.5.4.8': 'ST',
    '2.5.4.10': 'O',
    '2.5.4.11': 'OU',
    '1.2.840.113549.1.1.1': 'RSA Encryption',
    '1.2.840.113549.1.1.5': 'SHA-1 with RSA',
    '1.2.840.113549.1.1.11': 'SHA-256 with RSA',
    '1.2.840.113549.1.1.12': 'SHA-384 with RSA',
    '1.2.840.113549.1.1.13': 'SHA-512 with RSA',
    '1.2.840.10045.2.1': 'EC Public Key',
    '1.2.840.10045.4.3.2': 'ECDSA with SHA-256',
    '1.2.840.10045.4.3.3': 'ECDSA with SHA-384',
    '1.2.840.10045.4.3.4': 'ECDSA with SHA-512',
    '2.5.29.15': 'Key Usage',
    '2.5.29.17': 'Subject Alternative Name',
    '2.5.29.19': 'Basic Constraints',
    '2.5.29.35': 'Authority Key Identifier',
    '2.5.29.14': 'Subject Key Identifier',
    '2.5.29.37': 'Extended Key Usage',
    '2.5.29.31': 'CRL Distribution Points',
    '1.3.6.1.5.5.7.1.1': 'Authority Information Access',
};

function parsePEM(pem) {
    // Remove PEM headers and whitespace
    const pemContent = pem
        .replace(/-----BEGIN CERTIFICATE-----/g, '')
        .replace(/-----END CERTIFICATE-----/g, '')
        .replace(/\s+/g, '');

    // Decode base64
    const binaryString = atob(pemContent);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

function bytesToHex(bytes) {
    return Array.from(bytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join(':')
        .toUpperCase();
}

function parseDistinguishedName(parser, end) {
    const parts = [];
    while (parser.pos < end) {
        const setSeq = parser.readSequence(); // SET
        if (parser.pos >= end) break;

        const attrSeq = parser.readSequence(); // SEQUENCE
        const oid = parser.readOID();
        const value = parser.readString();

        const name = OID_NAMES[oid] || oid;
        parts.push(`${name}=${value}`);

        parser.pos = attrSeq.end;
    }
    return parts.join(', ');
}

function parseValidity(parser) {
    const validity = parser.readSequence();
    const notBeforeTag = parser.readByte();
    const notBeforeLen = parser.readLength();
    const notBeforeBytes = parser.bytes.slice(parser.pos, parser.pos + notBeforeLen);
    parser.pos += notBeforeLen;

    const notAfterTag = parser.readByte();
    const notAfterLen = parser.readLength();
    const notAfterBytes = parser.bytes.slice(parser.pos, parser.pos + notAfterLen);
    parser.pos += notAfterLen;

    const notBefore = parseASN1Time(notBeforeBytes, notBeforeTag);
    const notAfter = parseASN1Time(notAfterBytes, notAfterTag);

    return { notBefore, notAfter };
}

function parseASN1Time(bytes, tag) {
    const str = new TextDecoder('ascii').decode(bytes);

    // UTCTime: YYMMDDHHMMSSZ
    if (tag === 0x17) {
        const year = parseInt(str.substr(0, 2));
        const fullYear = year >= 50 ? 1900 + year : 2000 + year;
        const month = str.substr(2, 2);
        const day = str.substr(4, 2);
        const hour = str.substr(6, 2);
        const minute = str.substr(8, 2);
        const second = str.substr(10, 2);
        return new Date(`${fullYear}-${month}-${day}T${hour}:${minute}:${second}Z`);
    }

    // GeneralizedTime: YYYYMMDDHHMMSSZ
    if (tag === 0x18) {
        const year = str.substr(0, 4);
        const month = str.substr(4, 2);
        const day = str.substr(6, 2);
        const hour = str.substr(8, 2);
        const minute = str.substr(10, 2);
        const second = str.substr(12, 2);
        return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`);
    }

    return new Date(str);
}

function parseExtensions(parser, end) {
    const extensions = [];

    while (parser.pos < end) {
        const extSeq = parser.readSequence();
        const extOID = parser.readOID();

        let critical = false;
        let nextTag = parser.bytes[parser.pos];
        if (nextTag === 0x01) {
            parser.readByte(); // BOOLEAN tag
            const len = parser.readLength();
            critical = parser.readByte() === 0xff;
        }

        // OCTET STRING containing the extension value
        parser.readByte();
        const valueLen = parser.readLength();
        const valueBytes = parser.bytes.slice(parser.pos, parser.pos + valueLen);
        parser.pos += valueLen;

        const extName = OID_NAMES[extOID] || extOID;
        extensions.push({
            oid: extOID,
            name: extName,
            critical,
            value: bytesToHex(valueBytes)
        });
    }

    return extensions;
}

export function decodeCertificate() {
    const input = document.getElementById('certInput');
    const output = document.getElementById('certOutput');
    const error = document.getElementById('certErrorMessage');

    error.textContent = '';
    output.textContent = '';

    try {
        const pem = input.value.trim();
        if (!pem) {
            error.textContent = '⚠️ Please enter a PEM encoded certificate';
            return;
        }

        if (!pem.includes('BEGIN CERTIFICATE')) {
            error.textContent = '❌ Invalid PEM format. Must contain "BEGIN CERTIFICATE" header';
            return;
        }

        const bytes = parsePEM(pem);
        const parser = new ASN1Parser(bytes);

        // Certificate SEQUENCE
        const certSeq = parser.readSequence();

        // TBSCertificate SEQUENCE
        const tbsSeq = parser.readSequence();
        const tbsStart = parser.pos;

        let result = '📜 Certificate Information\n';
        result += '='.repeat(80) + '\n\n';

        // Version
        let version = 1;
        if (parser.bytes[parser.pos] === 0xa0) {
            parser.readByte(); // context tag
            parser.readLength();
            parser.readByte(); // INTEGER tag
            parser.readLength();
            version = parser.readByte() + 1;
        }
        result += `Version: v${version}\n`;

        // Serial Number
        const serialBytes = parser.readInteger();
        result += `Serial Number: ${bytesToHex(serialBytes)}\n\n`;

        // Signature Algorithm
        const sigAlgSeq = parser.readSequence();
        const sigAlgOID = parser.readOID();
        const sigAlgName = OID_NAMES[sigAlgOID] || sigAlgOID;
        parser.pos = sigAlgSeq.end;
        result += `Signature Algorithm: ${sigAlgName}\n`;
        result += `  OID: ${sigAlgOID}\n\n`;

        // Issuer
        const issuerSeq = parser.readSequence();
        const issuer = parseDistinguishedName(parser, issuerSeq.end);
        result += `Issuer:\n  ${issuer}\n\n`;

        // Validity
        const validity = parseValidity(parser);
        const now = new Date();
        const isValid = now >= validity.notBefore && now <= validity.notAfter;
        const statusIcon = isValid ? '✅' : '❌';

        result += `Validity: ${statusIcon}\n`;
        result += `  Not Before: ${validity.notBefore.toUTCString()}\n`;
        result += `  Not After:  ${validity.notAfter.toUTCString()}\n`;

        const daysRemaining = Math.floor((validity.notAfter - now) / (1000 * 60 * 60 * 24));
        if (isValid) {
            result += `  Status: Valid (${daysRemaining} days remaining)\n\n`;
        } else if (now < validity.notBefore) {
            result += `  Status: Not yet valid\n\n`;
        } else {
            result += `  Status: Expired\n\n`;
        }

        // Subject
        const subjectSeq = parser.readSequence();
        const subject = parseDistinguishedName(parser, subjectSeq.end);
        result += `Subject:\n  ${subject}\n\n`;

        // Subject Public Key Info
        const spkiSeq = parser.readSequence();
        const spkiStart = parser.pos;
        const keyAlgSeq = parser.readSequence();
        const keyAlgOID = parser.readOID();
        const keyAlgName = OID_NAMES[keyAlgOID] || keyAlgOID;
        parser.pos = keyAlgSeq.end;

        const publicKeyBitString = parser.readBitString();
        const publicKeySize = (publicKeyBitString.bytes.length - publicKeyBitString.unusedBits / 8) * 8;

        result += `Subject Public Key Info:\n`;
        result += `  Algorithm: ${keyAlgName}\n`;
        result += `  OID: ${keyAlgOID}\n`;
        result += `  Key Size: ${publicKeySize} bits\n\n`;

        parser.pos = spkiSeq.end;

        // Extensions (v3)
        if (version === 3 && parser.pos < tbsSeq.end) {
            // Skip issuerUniqueID and subjectUniqueID if present
            while (parser.pos < tbsSeq.end && parser.bytes[parser.pos] !== 0xa3) {
                const tag = parser.readByte();
                const length = parser.readLength();
                parser.pos += length;
            }

            if (parser.pos < tbsSeq.end && parser.bytes[parser.pos] === 0xa3) {
                parser.readByte(); // context tag [3]
                const extLen = parser.readLength();
                const extSeq = parser.readSequence();

                const extensions = parseExtensions(parser, extSeq.end);

                if (extensions.length > 0) {
                    result += `Extensions:\n`;
                    extensions.forEach((ext, idx) => {
                        result += `  [${idx + 1}] ${ext.name}${ext.critical ? ' (Critical)' : ''}\n`;
                        result += `      OID: ${ext.oid}\n`;
                        if (ext.value.length < 200) {
                            result += `      Value: ${ext.value}\n`;
                        } else {
                            result += `      Value: ${ext.value.substring(0, 100)}...\n`;
                        }
                    });
                    result += '\n';
                }
            }
        }

        // Certificate Signature Algorithm
        parser.pos = tbsSeq.end;
        const certSigAlgSeq = parser.readSequence();
        const certSigAlgOID = parser.readOID();
        const certSigAlgName = OID_NAMES[certSigAlgOID] || certSigAlgOID;
        parser.pos = certSigAlgSeq.end;

        // Certificate Signature Value
        const signatureBitString = parser.readBitString();
        const signatureHex = bytesToHex(signatureBitString.bytes);

        result += `Certificate Signature:\n`;
        result += `  Algorithm: ${certSigAlgName}\n`;
        result += `  Signature (hex):\n`;

        // Format signature in 60-char lines
        for (let i = 0; i < signatureHex.length; i += 60) {
            result += `    ${signatureHex.substring(i, i + 60)}\n`;
        }

        output.textContent = result;

    } catch (e) {
        console.error('Certificate parsing error:', e);
        error.textContent = `❌ Error parsing certificate: ${e.message}`;
    }
}

export function copyCertInput() {
    const input = document.getElementById('certInput');
    copyToClipboard(input.value, 'Certificate copied to clipboard');
}

export function copyCertOutput() {
    const output = document.getElementById('certOutput');
    if (output.textContent) {
        copyToClipboard(output.textContent, 'Certificate details copied to clipboard');
    }
}

export function clearCert() {
    document.getElementById('certInput').value = '';
    document.getElementById('certOutput').textContent = '';
    document.getElementById('certErrorMessage').textContent = '';
}

export function downloadCertOutput() {
    const output = document.getElementById('certOutput');
    if (output.textContent) {
        downloadFile(output.textContent, 'certificate-details.txt', 'text/plain');
    }
}

export function loadSampleCert() {
    const sampleCert = `-----BEGIN CERTIFICATE-----
MIIDrzCCApegAwIBAgIQCDvgVpBCRrGhdWrJWZHHSjANBgkqhkiG9w0BAQUFADBh
MQswCQYDVQQGEwJVUzEVMBMGA1UEChMMRGlnaUNlcnQgSW5jMRkwFwYDVQQLExB3
d3cuZGlnaWNlcnQuY29tMSAwHgYDVQQDExdEaWdpQ2VydCBHbG9iYWwgUm9vdCBD
QTAeFw0wNjExMTAwMDAwMDBaFw0zMTExMTAwMDAwMDBaMGExCzAJBgNVBAYTAlVT
MRUwEwYDVQQKEwxEaWdpQ2VydCBJbmMxGTAXBgNVBAsTEHd3dy5kaWdpY2VydC5j
b20xIDAeBgNVBAMTF0RpZ2lDZXJ0IEdsb2JhbCBSb290IENBMIIBIjANBgkqhkiG
9w0BAQEFAAOCAQ8AMIIBCgKCAQEA4jvhEXLeqKTTo1eqUKKPC3eQyaKl7hLOllsB
CSDMAZOnTjC3U/dDxGkAV53ijSLdhwZAAIEJzs4bg7/fzTtxRuLWZscFs3YnFo97
nh6Vfe63SKMI2tavegw5BmV/Sl0fvBf4q77uKNd0f3p4mVmFaG5cIzJLv07A6Fpt
43C/dxC//AH2hdmoRBBYMql1GNXRor5H4idq9Joz+EkIYIvUX7Q6hL+hqkpMfT7P
T19sdl6gSzeRntwi5m3OFBqOasv+zbMUZBfHWymeMr/y7vrTC0LUq7dBMtoM1O/4
gdW7jVg/tRvoSSiicNoxBN33shbyTApOB6jtSj1etX+jkMOvJwIDAQABo2MwYTAO
BgNVHQ8BAf8EBAMCAYYwDwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQUA95QNVbR
TLtm8KPiGxvDl7I90VUwHwYDVR0jBBgwFoAUA95QNVbRTLtm8KPiGxvDl7I90VUw
DQYJKoZIhvcNAQEFBQADggEBAMucN6pIExIK+t1EnE9SsPTfrgT1eXkIoyQY/Esr
hMAtudXH/vTBH1jLuG2cenTnmCmrEbXjcKChzUyImZOMkXDiqw8cvpOp/2PV5Adg
06O/nVsJ8dWO41P0jmP6P6fbtGbfYmbW0W5BjfIttep3Sp+dWOIrWcBAI+0tKIJF
PnlUkiaY4IBIqDfv8NZ5YBberOgOzW6sRBc4L0na4UU+Krk2U886UAb3LujEV0ls
YSEY1QSteDwsOoBrp+uvFRTp2InBuThs4pFsiv9kuXclVzDAGySj4dzp30d8tbQk
CAUw7C29C79Fv1C5qfPrmAESrciIxpg0X40KPMbp1ZWVbd4=
-----END CERTIFICATE-----`;

    document.getElementById('certInput').value = sampleCert;
    decodeCertificate();
}

// Make functions available globally for onclick handlers
window.decodeCertificate = decodeCertificate;
window.copyCertInput = copyCertInput;
window.copyCertOutput = copyCertOutput;
window.clearCert = clearCert;
window.downloadCertOutput = downloadCertOutput;
window.loadSampleCert = loadSampleCert;
