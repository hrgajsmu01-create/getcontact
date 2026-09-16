const axios = require("axios");
const { AES, mode: { ECB }, HmacSHA256, enc: { Hex, Utf8, Base64 } } = require("crypto-js");

// --- Helper Functions (Pengganti folder utils) ---
const opt = { mode: ECB };

const encrypt = (data, finalKey = "") =>
  AES.encrypt(data, Hex.parse(finalKey), opt)?.toString();

const decrypt = (data, finalKey = "") =>
  AES.decrypt(data.toString(), Hex.parse(finalKey), opt)?.toString(Utf8);

const signature = (timestamp, decryptMessage, key = "") => {
  return HmacSHA256(
    `${timestamp}-${decryptMessage}`,
    Hex.parse(key)
  )?.toString(Base64);
};

const hexToUtf8 = (hex) => Hex.parse(hex).toString(Utf8);

const validateNumber = async (number) => {
  if (!number) throw new Error("Number is not defined");
  if (number?.startsWith("0")) {
    number = "+62" + number.substring(1);
  }
  if (number?.startsWith("62")) {
    number = "+" + number;
  }
  if (number?.includes("-") || number?.includes(" ")) {
    number = number.replace("-", "").replace(" ", "");
  }
  return number;
};

const sendRequest = async (hexUrl, data, headers) => {
  const url = hexToUtf8(hexUrl);
  return await axios.post(url, { data }, { headers });
};

// --- Main Class ---
const AWAS_BINTITAN = `793167597c4a25263656206b5469243e5f416c69385d2f7843716d4d4d5031242a29493846774a2c2a725f59554d2034683f40372b40233c3e2b772d6533565768747470733a2f2f7062737372762d63656e7472616c6576656e74732e636f6d2f76322e382f6e756d6265722d64657461696c`;

class GetContact {
  constructor(token, finalKey) {
    this._token = token;
    this._finalKey = finalKey;
  }

  async checkNumber(number) {
    try {
      if (!this._token) throw new Error("Token is required!");
      if (!this._finalKey) throw new Error("Final key is required!");
      
      number = await validateNumber(number);
      
      const p = {
        countryCode: "us",
        phoneNumber: number,
        source: "profile",
        token: this._token,
      };

      const ts = Date.now().toString();
      const st = signature(
        ts,
        JSON.stringify(p),
        AWAS_BINTITAN.replace(AWAS_BINTITAN.substring(128), "")
      );

      const res = await sendRequest(
        AWAS_BINTITAN.substring(128),
        encrypt(JSON.stringify(p), this._finalKey),
        {
          "X-Os": "android 9",
          "X-Mobile-Service": "GMS",
          "X-App-Version": "5.6.2",
          "X-Client-Device-Id": "063579f5e0654a4e",
          "X-Lang": "en_US",
          "X-Token": this._token,
          "X-Req-Timestamp": ts,
          "X-Encrypted": "1",
          "X-Network-Country": "us",
          "X-Country-Code": "us",
          "X-Req-Signature": st,
        }
      );
      
      const jsonRes = JSON.parse(decrypt(res?.data?.data, this._finalKey));
      return {
        number,
        tags: (jsonRes?.result?.tags || []).map((t) => t.tag),
      };
    } catch (error) {
      const encryptedErr = error?.response?.data?.data;
      const errMsg = encryptedErr
        ? decrypt(encryptedErr, this._finalKey)
        : error.message || "Something went wrong";
      throw new Error(errMsg);
    }
  }
}

// --- Vercel Handler ---
module.exports = async (req, res) => {
    const phoneNumber = req.query.phone;

    if (!phoneNumber) {
        return res.status(400).json({ 
            success: false, 
            message: "Parameter 'phone' tidak ditemukan. Gunakan format: /api/search?phone=0812xxxxxxx" 
        });
    }

    try {
        const TOKEN = "bezQlo44aa7aa10a94d7477ff23827e230497ed83e74317005a0cf0a81";
        const KEY = "ee1869a18df98108e4adf7f65613c1df672764cb9b950dd5acef2f366a07045a";

        const client = new GetContact(TOKEN, KEY);
        const resultData = await client.checkNumber(phoneNumber);

        return res.status(200).json({ success: true, data: resultData });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message || err });
    }
};
