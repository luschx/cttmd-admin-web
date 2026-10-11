async function login(email: string, password: string) {
  const res = await $fetch('https://matiketan-api.onrender.com/api/auth/login', {
    method: 'POST',
    body: { email, password },
  })
  console.log('API response:', res)
}