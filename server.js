const express = require("express");
const fs = require("fs");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const FILE = "./keys.json";

/* ===== UTIL ===== */
function loadKeys() {
  if (!fs.existsSync(FILE)) {
    fs.writeFileSync(FILE, JSON.stringify({}, null, 2));
  }
  return JSON.parse(fs.readFileSync(FILE));
}

function saveKeys(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

/* ===== ROTAS ===== */
app.post("/check", (req, res) => {
  let { key, userId } = req.body;

  if (!key || userId === undefined || userId === null) {
    return res.json({ success: false, message: "Dados inválidos" });
  }

  // força tudo para string
  userId = String(userId);

  const keys = loadKeys();
  const keyData = keys[key];

  if (!keyData) {
    return res.json({ success: false, message: "Key inválida" });
  }

  const now = Math.floor(Date.now() / 1000);

  if (now > keyData.expiry) {
    return res.json({ success: false, message: "Key expirada" });
  }

  // aqui também garante string
  if (keyData.userId && String(keyData.userId) !== userId) {
    return res.json({ success: false, message: "Key já está vinculada a outro usuário" });
  }

  if (!keyData.userId) {
    keyData.userId = userId;
    keys[key] = keyData;
    saveKeys(keys);
  }

  const daysLeft = Math.ceil((keyData.expiry - now) / 86400);
  return res.json({ success: true, daysLeft });
});


app.get("/", (_, res) => {
  res.send("Key system online");
});

app.listen(PORT, () => {
  console.log("Rodando na porta", PORT);
});

