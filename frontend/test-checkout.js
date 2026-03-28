const fetch = require('node-fetch');

async function test() {
  const loginRes = await fetch('http://localhost:8080/api/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber: "12341234", password: "password" })
  });
  if (!loginRes.ok) {
     console.log("Login failed");
     return;
  }
  const user = await loginRes.json();
  const token = user.token;
  console.log("Got token!", token.substring(0, 10));

  const orderRes = await fetch('http://localhost:8080/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ itemId: 33, address: "123 St", phone: "1234567890", paymentMethod: "UPI", serviceType: "PRODUCT_PURCHASE", quantity: 1 })
  });
  const text = await orderRes.text();
  console.log("STATUS:", orderRes.status);
  console.log("RESPONSE:", text);
}
test();
