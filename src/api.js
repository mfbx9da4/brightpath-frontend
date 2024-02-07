// const BASE_URL = "http://localhost:8080";
const BASE_URL = "https://brightpath-backend.onrender.com"

export const fetchPath = async (body) => {
  const response = await fetch(`${BASE_URL}/findpath`, {
    credentials: "omit",
    headers: { "content-type": "text/plain;charset=UTF-8" },
    referrerPolicy: "no-referrer-when-downgrade",
    body: JSON.stringify(body),
    method: "POST",
    mode: "cors",
  })
  const json = await response.json()
  return json
}
