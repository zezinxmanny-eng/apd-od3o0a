const express = require("express")
const bodyParser = require("body-parser")
const fs = require("fs")

const app = express()
app.use(bodyParser.json())

const KEYS_FILE = "./keys.json"

function loadKeys() {
  return JSON.parse(fs.readFileSync(KEYS_FILE))
}

function saveKeys(keys) {
  fs.writeFileSync(KEYS_FILE, JSON.stringify(keys, null, 2))
}

app.post("/check", (req, res) => {
  const { key, hwid } = req.body
  const keys = loadKeys()
  const data = keys[key]

  if (!data)
    return res.json({ ok: false, msg: "Key inválida" })

  const now = Math.floor(Date.now() / 1000)

  if (data.expires < now)
    return res.json({ ok: false, msg: "Key expirada" })

  if (!data.hwid) {
    data.hwid = hwid
    saveKeys(keys)
  } else if (data.hwid !== hwid) {
    return res.json({ ok: false, msg: "Key já usada em outro PC" })
  }

  const daysLeft = Math.ceil((data.expires - now) / 86400)

  res.json({
    ok: true,
    daysLeft
  })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log("Rodando na porta", PORT)
})
