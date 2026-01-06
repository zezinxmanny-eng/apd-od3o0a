const express = require("express")
const fs = require("fs")
const app = express()

app.use(express.json())

const PORT = process.env.PORT || 3000
const FILE = "./keys.json"

function loadKeys() {
  if (!fs.existsSync(FILE)) {
    fs.writeFileSync(FILE, JSON.stringify({}))
  }
  return JSON.parse(fs.readFileSync(FILE))
}

function saveKeys(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2))
}

app.post("/check", (req, res) => {
  const { key, hwid } = req.body
  if (!key) return res.json({ success: false, message: "Key ausente" })

  const keys = loadKeys()
  const info = keys[key]

  if (!info) return res.json({ success: false, message: "Key inválida" })

  const now = Math.floor(Date.now() / 1000)

  if (info.expiry < now) {
    return res.json({ success: false, message: "Key expirada" })
  }

  if (!info.hwid) {
    info.hwid = hwid
    saveKeys(keys)
  } else if (info.hwid !== hwid) {
    return res.json({ success: false, message: "Key em outro dispositivo" })
  }

  const daysLeft = Math.ceil((info.expiry - now) / 86400)

  res.json({ success: true, daysLeft })
})

app.get("/", (_, res) => {
  res.send("Key system online")
})

app.listen(PORT, () => {
  console.log("Rodando na porta", PORT)
})
