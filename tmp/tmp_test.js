const tokenBase64 = btoa(JSON.stringify({ created_at: Date.now(), user_id: 1 }));
const res = await fetch("http://localhost:8787/api/import/confirm", {
  method: "POST",
  body: JSON.stringify({
    token: tokenBase64,
    file_name: 'test.csv',
    clean_list: [
      { phone: "13800138000", data: { name: "test" } }
    ]
  }),
  headers: { "Content-Type": "application/json" }
});
console.log(res.status, await res.text());
